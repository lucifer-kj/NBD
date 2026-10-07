import { SHOPIFY_GRAPHQL_API_ENDPOINT, fetchWithRetry, SHOPIFY_ADMIN_API_VERSION } from './utils';
import { Redis } from '@upstash/redis';
import { getProductQuery, getProductsQuery, getCartQuery, getCustomerQuery, predictiveSearchQuery, getOrderQuery, getProductsByIdsQuery, getCollectionsQuery, getPoliciesQuery, getCollectionQuery } from './queries';
import {
  createCartMutation,
  addToCartMutation,
  removeFromCartMutation,
  updateCartMutation,
  customerAccessTokenCreateMutation,
  customerAccessTokenDeleteMutation,
  customerCreateMutation,
  cartBuyerIdentityUpdateMutation,
  updateCartDiscountMutation,
  customerAddressCreateMutation,
  customerAddressUpdateMutation,
  customerAddressDeleteMutation,
  customerDefaultAddressUpdateMutation,
  customerRecoverMutation,
  customerResetByUrlMutation,
  setMetafieldsMutation,
  checkoutCustomerAssociateV2Mutation,
  customerAccessTokenRenewMutation
} from './mutations';
import {
  Product,
  ReshapedProduct,
  Cart,
  ReshapedCart,
  Connection,
  Customer,
  Order,
  CustomerAccessToken,
  ShopifyUserError,
  Collection,
  Policy,
  ProductOption,
  Money,
  Image as ShopifyImage,
  SEO
} from '../../types/shopify';

const domain = process.env.SHOPIFY_STORE_DOMAIN
  ? process.env.SHOPIFY_STORE_DOMAIN.includes('://')
    ? process.env.SHOPIFY_STORE_DOMAIN.replace(/\/$/, '')
    : `https://${process.env.SHOPIFY_STORE_DOMAIN.replace(/\/$/, '')}`
  : null;

if (!domain) {
  console.warn('SHOPIFY_STORE_DOMAIN is not defined in environment variables.');
}

const endpoint = domain ? `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}` : '';
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';

if (!key) {
  console.warn('SHOPIFY_STOREFRONT_ACCESS_TOKEN is not defined in environment variables.');
}

let redisClient: Redis | null = null;
function getRedisClient() {
  if (!redisClient && (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL)) {
    redisClient = new Redis({
      url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redisClient;
}

export class ShopifyUnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ShopifyUnauthorizedError';
  }
}

async function handleTokenFailure(failedToken: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    if (!redis) return false;

    // Retrieve what is currently active in Redis
    const activeToken = await redis.get<string>('shopify:admin_access_token');

    // Only proceed if the token that failed is actually the one currently stored as active
    // This avoids double-invalidation if concurrent requests fail on the same token
    if (activeToken === failedToken) {
      console.warn('Shopify Admin Access Token returned 401 in storefront fetch. Invalidating from Redis...');
      await redis.del('shopify:admin_access_token');

      // Check if there is a backup standby token
      const backupToken = await redis.get<string>('shopify:admin_access_token:backup');
      if (backupToken && backupToken !== failedToken) {
        console.info('Standby backup token found in storefront fetch! Promoting to active...');
        await redis.set('shopify:admin_access_token', backupToken);
        await redis.set('shopify:admin_access_token:status', 'ROTATED_TO_BACKUP');
        await redis.set('shopify:admin_access_token:last_rotation', Date.now().toString());
        return true; // Successfully rotated
      }

      // No backup token exists or the backup is the same as the failed token
      console.error('No valid standby backup token found in Redis in storefront fetch.');
      await redis.set('shopify:admin_access_token:status', 'REVOKED');
      await redis.set('shopify:admin_access_token:revocation_time', Date.now().toString());
    }
  } catch (e) {
    console.error('Failed to handle Shopify Admin Token failure in Redis:', e);
  }
  return false; // Did not rotate/recover
}

async function getAdminAccessToken(): Promise<string> {
  // 1. Try to load from Redis dynamic vault first (skip during static build to avoid DYNAMIC_SERVER_USAGE)
  const isBuilding = process.env.NEXT_PHASE === 'phase-production-build';
  if (!isBuilding) {
    try {
      const redis = getRedisClient();
      if (redis) {
        const dynamicToken = await redis.get<string>('shopify:admin_access_token');
        if (dynamicToken) {
          return dynamicToken;
        }
      }
    } catch {
      // ignore Redis retrieval error
    }
  }

  // 2. Fall back to the environment variable if present and not a placeholder
  const envToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';
  if (envToken && !envToken.startsWith('shpat_your_')) {
    return envToken;
  }

  // 3. Fall back to OAuth client credentials from environment
  try {
    const clientId = process.env.SHOPIFY_CLIENT_ID || process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET || process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET;
    if (clientId && clientSecret && domain) {
      const res = await fetch(`${domain}/admin/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials'
        })
      });
      const data = await res.json();
      if (data.access_token) {
        try {
          const redis = getRedisClient();
          if (redis) {
            await redis.set('shopify:admin_access_token', data.access_token, { ex: 86400 });
          }
        } catch {
          // ignore redis cache errors
        }
        return data.access_token;
      }
    }
  } catch (e) {
    console.error('Failed to obtain Shopify Admin Access Token via client credentials:', e);
  }

  return envToken;
}

const adminEndpoint = domain ? `${domain}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/graphql.json` : '';

export async function shopifyFetch<T>({
  cache = 'force-cache',
  headers,
  query,
  tags,
  variables,
  revalidate = 3600,
  retries = 0
}: {
  cache?: RequestCache;
  headers?: HeadersInit;
  query: string;
  tags?: string[];
  variables?: Record<string, unknown>;
  revalidate?: number | false;
  /** Number of retries for transient failures. Use 3 for mutations, 0 for cached queries. */
  retries?: number;
}): Promise<{ status: number; body: T } | never> {
  try {
    if (!endpoint) {
      throw new Error(
        'Shopify Storefront API endpoint is not configured. Ensure SHOPIFY_STORE_DOMAIN is set in your environment variables.'
      );
    }
    const customHeaders = headers ? (headers as Record<string, string>) : {};
    const storefrontHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    // Only supply Storefront Access Token if it is a real storefront token (not Admin shpat_ or placeholder)
    // and this is not a cart query/mutation (the private custom app token is scoped to legacy products and rejects newly added variants)
    const isCartOperation = query.includes('cartCreate') || 
                            query.includes('cartLines') || 
                            query.includes('cart(') || 
                            query.includes('cartDiscount') || 
                            query.includes('cartBuyerIdentity');

    if (!isCartOperation && key && !key.startsWith('shpat_') && !key.startsWith('your_')) {
      storefrontHeaders['X-Shopify-Storefront-Access-Token'] = key;
    }

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: storefrontHeaders,
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables })
      }),
      cache,
      next: { 
        tags,
        revalidate
      }
    } as RequestInit;

    // Use retry-capable fetch for mutations (retries > 0), standard fetch for cached queries
    const result = retries > 0
      ? await fetchWithRetry(endpoint, fetchOptions, retries)
      : await fetch(endpoint, fetchOptions);

    const body = await result.json();

    if (body.errors) {
      const error = body.errors[0];
      throw new Error(error.message || 'Shopify API Error', { cause: error });
    }

    // If a storefront token was passed and Shopify returned null product, empty predictive search, or cart merchandise error,
    // the token is likely scoped to an older private app publication. Fall back to querying without the header.
    const typedBody = body as { 
      data?: { 
        product?: unknown; 
        predictiveSearch?: { products?: unknown[] };
        cartCreate?: { cart?: unknown; userErrors?: Array<{ message?: string; code?: string }> };
        cartLinesAdd?: { cart?: unknown; userErrors?: Array<{ message?: string; code?: string }> };
        cartLinesUpdate?: { cart?: unknown; userErrors?: Array<{ message?: string; code?: string }> };
      } 
    };
    const hadToken = !!storefrontHeaders['X-Shopify-Storefront-Access-Token'];
    const hasCartMerchandiseError = !!(
      typedBody.data?.cartCreate?.userErrors?.some(e => e.message?.toLowerCase().includes('not exist') || e.code === 'INVALID') ||
      typedBody.data?.cartLinesAdd?.userErrors?.some(e => e.message?.toLowerCase().includes('not exist') || e.code === 'INVALID') ||
      typedBody.data?.cartLinesUpdate?.userErrors?.some(e => e.message?.toLowerCase().includes('not exist') || e.code === 'INVALID')
    );

    if (hadToken && (
      typedBody.data?.product === null || 
      (typedBody.data?.predictiveSearch && typedBody.data.predictiveSearch.products?.length === 0) ||
      hasCartMerchandiseError
    )) {
      try {
        const fallbackHeaders = { ...storefrontHeaders };
        delete fallbackHeaders['X-Shopify-Storefront-Access-Token'];
        const fallbackRes = retries > 0
          ? await fetchWithRetry(endpoint, { ...fetchOptions, headers: fallbackHeaders }, retries)
          : await fetch(endpoint, { ...fetchOptions, headers: fallbackHeaders });
        const fallbackBody = await fallbackRes.json();
        const fallbackTyped = fallbackBody as { 
          data?: { 
            product?: unknown; 
            predictiveSearch?: { products?: unknown[] }; 
            cartLinesAdd?: { cart?: unknown; userErrors?: Array<{ message?: string }> }; 
            cartCreate?: { cart?: unknown; userErrors?: Array<{ message?: string }> } 
          } 
        };
        if (
          fallbackTyped.data?.product || 
          ((fallbackTyped.data?.predictiveSearch?.products?.length ?? 0) > 0) ||
          (fallbackTyped.data?.cartLinesAdd?.cart && (!fallbackTyped.data.cartLinesAdd.userErrors || fallbackTyped.data.cartLinesAdd.userErrors.length === 0)) ||
          (fallbackTyped.data?.cartCreate?.cart && (!fallbackTyped.data.cartCreate.userErrors || fallbackTyped.data.cartCreate.userErrors.length === 0))
        ) {
          return {
            status: fallbackRes.status,
            body: fallbackBody as T
          };
        }
      } catch {
        // Continue with original body if fallback fails
      }
    }

    return {
      status: result.status,
      body
    };
  } catch (e: unknown) {
    console.warn('[Shopify Fetch Resilient Fallback Activated]:', e instanceof Error ? e.message : String(e));
    return {
      status: 500,
      body: {
        data: {
          products: { edges: [] },
          product: null,
          collections: { edges: [] },
          menu: { items: [] },
          cart: null,
          cartCreate: { cart: null }
        }
      } as unknown as T
    };
  }
}

export async function shopifyAdminFetch<T>({
  query,
  variables,
  retries = 3,
  cache = 'default'
}: {
  query: string;
  variables?: Record<string, unknown>;
  retries?: number;
  cache?: RequestCache;
}): Promise<{ status: number; body: T } | never> {
  const token = await getAdminAccessToken();

  if (!token) {
    throw new Error('SHOPIFY_ADMIN_ACCESS_TOKEN is missing');
  }

  try {
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables })
      }),
      cache
    };

    const result = await fetchWithRetry(adminEndpoint, fetchOptions, retries);

    if (result.status === 401) {
      const didRotate = await handleTokenFailure(token);
      if (didRotate) {
        console.info('Retrying shopifyAdminFetch after successful token rotation...');
        return shopifyAdminFetch<T>({ query, variables, retries });
      }
      throw new ShopifyUnauthorizedError('Shopify Admin access token is invalid or expired, and no active backup exists.');
    }

    const body = await result.json();

    if (body.errors) {
      const error = body.errors[0];
      const isTokenError = error.message?.includes('Invalid API key') || 
                           error.message?.includes('access token') ||
                           error.message?.includes('Unauthorized');
      if (isTokenError) {
        const didRotate = await handleTokenFailure(token);
        if (didRotate) {
          console.info('Retrying shopifyAdminFetch after successful token rotation...');
          return shopifyAdminFetch<T>({ query, variables, retries });
        }
        throw new ShopifyUnauthorizedError(error.message || 'Shopify Admin access token is invalid or expired.');
      }
      throw new Error(error.message || 'Shopify Admin API Error', { cause: error });
    }

    return {
      status: result.status,
      body
    };
  } catch (e: unknown) {
    if (e instanceof ShopifyUnauthorizedError || e instanceof Error) throw e;
    throw new Error('Error fetching from Shopify Admin API', { cause: e });
  }
}

const removeEdgesAndNodes = <T>(array: Connection<T>): T[] => {
  return array.edges.map((edge) => edge?.node);
};

const reshapeProduct = (product: Product): ReshapedProduct => {
  if (!product) {
    return product as unknown as ReshapedProduct;
  }

  const { images, variants, ...rest } = product;

  return {
    ...rest,
    images: removeEdgesAndNodes(images),
    variants: removeEdgesAndNodes(variants)
  };
};

const reshapeProducts = (products: Product[]) => {
  const reshapedProducts = [];
  for (const product of products) {
    if (product) {
      const reshapedProduct = reshapeProduct(product);
      if (reshapedProduct) {
        reshapedProducts.push(reshapedProduct);
      }
    }
  }
  return reshapedProducts;
};

export const reshapeCart = (cart: Cart): ReshapedCart => {
  if (!cart) {
    return cart as unknown as ReshapedCart;
  }
  
  return {
    ...cart,
    lines: removeEdgesAndNodes(cart.lines)
  };
};

async function getProductFromAdmin(handle: string): Promise<ReshapedProduct | undefined> {
  try {
    const query = `
      query getProductByHandle($q: String!) {
        products(first: 1, query: $q) {
          edges {
            node {
              id
              title
              handle
              description
              descriptionHtml
              vendor
              tags
              updatedAt
              options {
                id
                name
                values
              }
              priceRangeV2 {
                maxVariantPrice {
                  amount
                  currencyCode
                }
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 20) {
                edges {
                  node {
                    url
                    altText
                    width
                    height
                  }
                }
              }
              variants(first: 250) {
                edges {
                  node {
                    id
                    title
                    sku
                    barcode
                    availableForSale
                    selectedOptions {
                      name
                      value
                    }
                    price
                    compareAtPrice
                    image {
                      url
                      altText
                      width
                      height
                    }
                  }
                }
              }
              seo {
                title
                description
              }
            }
          }
        }
      }
    `;
    const res = await shopifyAdminFetch<{
      data?: {
        products?: {
          edges?: {
            node?: {
              id: string;
              title: string;
              handle: string;
              description?: string;
              descriptionHtml?: string;
              vendor?: string;
              tags?: string[];
              updatedAt?: string;
              options?: ProductOption[];
              priceRangeV2?: {
                maxVariantPrice: Money;
                minVariantPrice: Money;
              };
              images?: {
                edges: { node: ShopifyImage }[];
              };
              variants?: {
                edges: {
                  node: {
                    id: string;
                    title: string;
                    sku?: string;
                    barcode?: string;
                    availableForSale?: boolean;
                    selectedOptions: { name: string; value: string }[];
                    price: string;
                    compareAtPrice?: string | null;
                    image?: ShopifyImage;
                  };
                }[];
              };
              seo?: SEO;
            };
          }[];
        };
      };
    }>({
      query,
      variables: { q: `handle:${handle}` },
      retries: 2
    });

    const node = res.body?.data?.products?.edges?.[0]?.node;
    if (!node) return undefined;

    return {
      id: node.id,
      handle: node.handle,
      availableForSale: true,
      title: node.title,
      vendor: node.vendor || 'Naaz Book Depot',
      description: node.description || '',
      descriptionHtml: node.descriptionHtml || '',
      options: node.options || [],
      priceRange: {
        maxVariantPrice: node.priceRangeV2?.maxVariantPrice || { amount: '0', currencyCode: 'INR' },
        minVariantPrice: node.priceRangeV2?.minVariantPrice || { amount: '0', currencyCode: 'INR' }
      },
      featuredImage: node.images?.edges?.[0]?.node || null,
      images: node.images?.edges?.map((e) => e.node) || [],
      variants: node.variants?.edges?.map((e) => ({
        id: e.node.id,
        title: e.node.title,
        sku: e.node.sku,
        barcode: e.node.barcode,
        availableForSale: e.node.availableForSale ?? true,
        selectedOptions: e.node.selectedOptions || [],
        price: {
          amount: e.node.price || '0',
          currencyCode: 'INR'
        },
        compareAtPrice: e.node.compareAtPrice ? {
          amount: e.node.compareAtPrice,
          currencyCode: 'INR'
        } : null,
        image: e.node.image
      })) || [],
      seo: node.seo || { title: node.title, description: node.description || '' },
      tags: node.tags || [],
      updatedAt: node.updatedAt || new Date().toISOString()
    };
  } catch (err) {
    console.warn('[Admin Fallback Error for getProduct]:', err instanceof Error ? err.message : String(err));
    return undefined;
  }
}

export async function getProduct(handle: string): Promise<ReshapedProduct | undefined> {
  const decodedHandle = decodeURIComponent(handle);
  const res = await shopifyFetch<{ data: { product: Product } }>({
    query: getProductQuery,
    tags: ['products', `product-${decodedHandle}`],
    variables: { handle: decodedHandle }
  });

  const reshaped = reshapeProduct(res.body.data.product);
  if (reshaped) {
    return reshaped;
  }

  // Fallback to Shopify Admin API if Storefront API returned null
  return getProductFromAdmin(decodedHandle);
}

export async function getProducts({
  query,
  reverse,
  sortKey,
  first = 100
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
  first?: number;
} = {}): Promise<ReshapedProduct[]> {
  const res = await shopifyFetch<{ data: { products: Connection<Product> } }>({
    query: getProductsQuery,
    tags: ['products'],
    variables: { query, reverse, sortKey, first }
  });

  let products = reshapeProducts(removeEdgesAndNodes(res.body.data.products));

  // If query is for books and private app token scoped results out, retry without token to ensure all products appear
  if (query?.includes('tag:Books') && products.length < 12) {
    try {
      const fallbackRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: getProductsQuery,
          variables: { query, reverse, sortKey, first }
        }),
        next: { tags: ['products'], revalidate: 3600 }
      });
      const fallbackBody = await fallbackRes.json();
      const fallbackProducts = reshapeProducts(removeEdgesAndNodes(fallbackBody?.data?.products));
      if (fallbackProducts.length > products.length) {
        products = fallbackProducts;
      }
    } catch {
      // ignore
    }
  }

  return products;
}

export async function createCart(): Promise<ReshapedCart> {
  const res = await shopifyFetch<{ data: { cartCreate: { cart: Cart } } }>({
    query: createCartMutation,
    cache: 'no-store',
    retries: 3
  });

  return reshapeCart(res.body.data.cartCreate.cart);
}

export async function getCart(cartId: string): Promise<ReshapedCart | null> {
  const res = await shopifyFetch<{ data: { cart: Cart } }>({
    query: getCartQuery,
    variables: { cartId },
    cache: 'no-store'
  });

  if (!res.body.data.cart) {
    return null;
  }

  return reshapeCart(res.body.data.cart);
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<{ cart: ReshapedCart; userErrors: ShopifyUserError[] }> {
  const res = await shopifyFetch<{ 
    data: { 
      cartLinesAdd: { 
        cart: Cart;
        userErrors: ShopifyUserError[];
      } 
    } 
  }>({
    query: addToCartMutation,
    variables: {
      cartId,
      lines
    },
    cache: 'no-store',
    retries: 3
  });

  return {
    cart: reshapeCart(res.body.data.cartLinesAdd.cart),
    userErrors: res.body.data.cartLinesAdd.userErrors || []
  };
}

export async function removeFromCart(
  cartId: string, 
  lineIds: string[]
): Promise<{ cart: ReshapedCart; userErrors: ShopifyUserError[] }> {
  const res = await shopifyFetch<{ 
    data: { 
      cartLinesRemove: { 
        cart: Cart;
        userErrors: ShopifyUserError[];
      } 
    } 
  }>({
    query: removeFromCartMutation,
    variables: {
      cartId,
      lineIds
    },
    cache: 'no-store',
    retries: 3
  });

  return {
    cart: reshapeCart(res.body.data.cartLinesRemove.cart),
    userErrors: res.body.data.cartLinesRemove.userErrors || []
  };
}

export async function updateCart(
  cartId: string,
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<{ cart: ReshapedCart; userErrors: ShopifyUserError[] }> {
  const res = await shopifyFetch<{ 
    data: { 
      cartLinesUpdate: { 
        cart: Cart;
        userErrors: ShopifyUserError[];
      } 
    } 
  }>({
    query: updateCartMutation,
    variables: {
      cartId,
      lines
    },
    cache: 'no-store',
    retries: 3
  });

  return {
    cart: reshapeCart(res.body.data.cartLinesUpdate.cart),
    userErrors: res.body.data.cartLinesUpdate.userErrors || []
  };
}

// --- Customer Auth & Management ---

export async function loginCustomer(input: Record<string, unknown>): Promise<CustomerAccessToken | { errors: string[] }> {
  const res = await shopifyFetch<{
    data: {
      customerAccessTokenCreate: {
        customerAccessToken: CustomerAccessToken;
        customerUserErrors: { message: string }[];
      };
    };
  }>({
    query: customerAccessTokenCreateMutation,
    variables: { input },
    cache: 'no-store'
  });

  const payload = res.body.data.customerAccessTokenCreate;
  if (payload.customerUserErrors && payload.customerUserErrors.length > 0) {
    return { errors: payload.customerUserErrors.map((e: { message: string }) => e.message) };
  }
  return payload.customerAccessToken;
}

export async function logoutCustomer(customerAccessToken: string): Promise<boolean> {
  const res = await shopifyFetch<{
    data: {
      customerAccessTokenDelete: {
        userErrors: ShopifyUserError[];
      };
    };
  }>({
    query: customerAccessTokenDeleteMutation,
    variables: { customerAccessToken },
    cache: 'no-store'
  });
  return !res.body.data.customerAccessTokenDelete.userErrors.length;
}

export async function renewCustomerToken(customerAccessToken: string): Promise<CustomerAccessToken | { errors: string[] }> {
  const res = await shopifyFetch<{
    data: {
      customerAccessTokenRenew: {
        customerAccessToken: CustomerAccessToken;
        userErrors: { message: string }[];
      };
    };
  }>({
    query: customerAccessTokenRenewMutation,
    variables: { customerAccessToken },
    cache: 'no-store'
  });

  const payload = res.body.data.customerAccessTokenRenew;
  if (!payload) {
    return { errors: ['Failed to renew customer token'] };
  }
  if (payload.userErrors && payload.userErrors.length > 0) {
    return { errors: payload.userErrors.map((e: { message: string }) => e.message) };
  }
  return payload.customerAccessToken;
}

export async function createCustomer(input: Record<string, unknown>): Promise<Customer | { errors: string[] }> {
  const res = await shopifyFetch<{
    data: {
      customerCreate: {
        customer: Customer;
        customerUserErrors: { message: string }[];
      };
    };
  }>({
    query: customerCreateMutation,
    variables: { input },
    cache: 'no-store'
  });

  const payload = res.body.data.customerCreate;
  if (payload.customerUserErrors && payload.customerUserErrors.length > 0) {
    return { errors: payload.customerUserErrors.map((e: { message: string }) => e.message) };
  }
  return payload.customer;
}

export async function getCustomerDetails(customerAccessToken: string): Promise<Customer | null> {
  try {
    const res = await shopifyFetch<{
      data: {
        customer: Customer;
      };
    }>({
      query: getCustomerQuery,
      variables: { customerAccessToken },
      cache: 'no-store'
    });

    return res.body.data.customer || null;
  } catch (error) {
    console.error('Error fetching customer details via Storefront API:', error);
    return null;
  }
}

export async function updateCartBuyerIdentity(cartId: string, buyerIdentity: { email?: string; customerAccessToken?: string }): Promise<ReshapedCart> {
  const res = await shopifyFetch<{
    data: {
      cartBuyerIdentityUpdate: {
        cart: Cart;
      };
    };
  }>({
    query: cartBuyerIdentityUpdateMutation,
    variables: {
      cartId,
      buyerIdentity
    },
    cache: 'no-store',
    retries: 3
  });

  return reshapeCart(res.body.data.cartBuyerIdentityUpdate.cart);
}
export async function getOrder(customerAccessToken: string, orderId: string): Promise<Order | null> {
  const res = await shopifyFetch<{
    data: {
      customer: {
        orders: {
          edges: Array<{ node: Order }>;
        };
      };
    };
  }>({
    query: getOrderQuery,
    variables: { customerAccessToken, orderId },
    cache: 'no-store'
  });
  return res.body.data.customer?.orders.edges[0]?.node || null;
}

export async function getProductsByIds(ids: string[]): Promise<ReshapedProduct[]> {
  const res = await shopifyFetch<{
    data: {
      nodes: (Product | null)[];
    };
  }>({
    query: getProductsByIdsQuery,
    variables: { ids },
    cache: 'no-store'
  });

  return (res.body.data.nodes || [])
    .filter((node): node is Product => node !== null)
    .map((product) => reshapeProduct(product));
}

export async function updateCartDiscount(cartId: string, discountCodes: string[]): Promise<Cart> {
  const res = await shopifyFetch<{
    data: {
      cartDiscountCodesUpdate: {
        cart: Cart;
      };
    };
  }>({
    query: updateCartDiscountMutation,
    variables: {
      cartId,
      discountCodes
    },
    cache: 'no-store',
    retries: 3
  });

  return res.body.data.cartDiscountCodesUpdate.cart;
}

export async function predictiveSearch(query: string) {
  const res = await shopifyFetch<{
    data: {
      predictiveSearch: {
        products: unknown[];
        collections: unknown[];
        articles: unknown[];
      };
    };
  }>({
    query: predictiveSearchQuery,
    variables: { query },
    cache: 'no-store' // Predictive search should not be cached as it's query-specific
  });

  return res.body.data.predictiveSearch;
}

export async function createCustomerAddress(customerAccessToken: string, address: unknown) {
  const res = await shopifyFetch<{ data: { customerAddressCreate: unknown } }>({
    query: customerAddressCreateMutation,
    variables: { customerAccessToken, address },
    cache: 'no-store'
  });

  return res.body.data.customerAddressCreate;
}

export async function updateCustomerAddress(customerAccessToken: string, id: string, address: unknown) {
  const res = await shopifyFetch<{ data: { customerAddressUpdate: unknown } }>({
    query: customerAddressUpdateMutation,
    variables: { customerAccessToken, id, address },
    cache: 'no-store'
  });

  return res.body.data.customerAddressUpdate;
}

export async function deleteCustomerAddress(customerAccessToken: string, id: string) {
  const res = await shopifyFetch<{ data: { customerAddressDelete: unknown } }>({
    query: customerAddressDeleteMutation,
    variables: { customerAccessToken, id },
    cache: 'no-store'
  });

  return res.body.data.customerAddressDelete;
}

export async function updateDefaultAddress(customerAccessToken: string, addressId: string) {
  const res = await shopifyFetch<{ data: { customerDefaultAddressUpdate: unknown } }>({
    query: customerDefaultAddressUpdateMutation,
    variables: { customerAccessToken, addressId },
    cache: 'no-store'
  });

  return res.body.data.customerDefaultAddressUpdate;
}

export async function recoverCustomerPassword(email: string): Promise<{ errors?: string[] }> {
  const res = await shopifyFetch<{
    data: {
      customerRecover: {
        customerUserErrors: { message: string }[];
      };
    };
  }>({
    query: customerRecoverMutation,
    variables: { email },
    cache: 'no-store'
  });

  const errors = res.body.data.customerRecover?.customerUserErrors || [];
  if (errors.length > 0) {
    return { errors: errors.map((e) => e.message) };
  }
  return {};
}

export async function resetCustomerPassword(resetUrl: string, password: string): Promise<{ customer?: Customer, customerAccessToken?: CustomerAccessToken, errors?: string[] }> {
  const res = await shopifyFetch<{
    data: {
      customerResetByUrl: {
        customer: Customer;
        customerAccessToken: CustomerAccessToken;
        customerUserErrors: { message: string }[];
      };
    };
  }>({
    query: customerResetByUrlMutation,
    variables: { resetUrl, password },
    cache: 'no-store'
  });

  const payload = res.body.data.customerResetByUrl;
  const errors = payload?.customerUserErrors || [];
  if (errors.length > 0) {
    return { errors: errors.map((e) => e.message) };
  }
  return { 
    customer: payload.customer, 
    customerAccessToken: payload.customerAccessToken 
  };
}

export async function setCustomerCart(customerId: string, cartId: string): Promise<boolean> {
  const res = await shopifyAdminFetch<{
    data: {
      metafieldsSet: {
        metafields: unknown[];
        userErrors: ShopifyUserError[];
      };
    };
  }>({
    query: setMetafieldsMutation,
    variables: {
      metafields: [
        {
          ownerId: customerId,
          namespace: 'custom',
          key: 'cart_id',
          value: cartId,
          type: 'single_line_text_field'
        }
      ]
    }
  });

  return !res.body.data.metafieldsSet.userErrors.length;
}

export async function getCollections(): Promise<Collection[]> {
  try {
    const res = await shopifyFetch<{ data: { collections: Connection<Collection> } }>({
      query: getCollectionsQuery,
      tags: ['collections'],
      variables: { first: 250 }
    });

    if (!res.body?.data?.collections) return [];
    return removeEdgesAndNodes(res.body.data.collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export async function getPolicies(): Promise<Policy[]> {
  try {
    const res = await shopifyFetch<{
      data: {
        shop: {
          privacyPolicy: Policy | null;
          refundPolicy: Policy | null;
          shippingPolicy: Policy | null;
          termsOfService: Policy | null;
        };
      };
    }>({
      query: getPoliciesQuery,
      tags: ['policies'],
      cache: 'force-cache'
    });

    const shop = res.body?.data?.shop;
    if (!shop) return [];
    
    const policies: Policy[] = [];
    if (shop.privacyPolicy) policies.push(shop.privacyPolicy);
    if (shop.refundPolicy) policies.push(shop.refundPolicy);
    if (shop.shippingPolicy) policies.push(shop.shippingPolicy);
    if (shop.termsOfService) policies.push(shop.termsOfService);

    return policies;
  } catch (error) {
    console.error('Error fetching policies:', error);
    return [];
  }
}

export type CollectionWithProducts = Collection & {
  description: string;
  image: {
    url: string;
    altText: string;
    width: number;
    height: number;
  } | null;
  products: ReshapedProduct[];
};

export async function getCollectionByHandle(handle: string): Promise<CollectionWithProducts | null> {
  try {
    const res = await shopifyFetch<{
      data: {
        collection: {
          id: string;
          handle: string;
          title: string;
          description: string;
          image: {
            url: string;
            altText: string;
            width: number;
            height: number;
          } | null;
          products: Connection<Product>;
        } | null;
      };
    }>({
      query: getCollectionQuery,
      tags: ['collections', `collection-${handle}`],
      variables: { handle }
    });

    const collection = res.body?.data?.collection;
    if (!collection) return null;

    return {
      id: collection.id,
      handle: collection.handle,
      title: collection.title,
      updatedAt: '', // Standard Collection type requires updatedAt, default to empty
      description: collection.description || '',
      image: collection.image,
      products: reshapeProducts(removeEdgesAndNodes(collection.products))
    };
  } catch (error) {
    console.error(`Error fetching collection ${handle}:`, error);
    return null;
  }
}

export async function associateCustomerWithCheckout(
  checkoutId: string,
  customerAccessToken: string
): Promise<{ success: boolean; webUrl?: string; errors?: string[] }> {
  try {
    const res = await shopifyFetch<{
      data: {
        checkoutCustomerAssociateV2: {
          checkout: {
            id: string;
            webUrl: string;
          };
          checkoutUserErrors: Array<{
            code: string;
            field: string[];
            message: string;
          }>;
        };
      };
    }>({
      query: checkoutCustomerAssociateV2Mutation,
      variables: { checkoutId, customerAccessToken },
      cache: 'no-store',
      retries: 3
    });

    const payload = res.body?.data?.checkoutCustomerAssociateV2;
    if (!payload) {
      return { success: false, errors: ['No response from checkout association'] };
    }

    const errors = payload.checkoutUserErrors || [];
    if (errors.length > 0) {
      return { success: false, errors: errors.map((e) => e.message) };
    }

    return {
      success: true,
      webUrl: payload.checkout?.webUrl
    };
  } catch (error) {
    console.error('Error associating customer with checkout:', error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Failed to associate checkout with customer']
    };
  }
}

