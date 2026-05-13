import { SHOPIFY_GRAPHQL_API_ENDPOINT } from './utils';
import { getProductQuery, getProductsQuery, getCustomerQuery, predictiveSearchQuery, getOrderQuery, getProductsByIdsQuery, getBlogArticlesQuery, getArticleQuery } from './queries';
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
  customerDefaultAddressUpdateMutation
} from './mutations';
import {
  Product,
  ReshapedProduct,
  Cart,
  ReshapedCart,
  Connection,
  Customer
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

export async function shopifyFetch<T>({
  cache = 'no-store',
  headers,
  query,
  tags,
  variables
}: {
  cache?: RequestCache;
  headers?: HeadersInit;
  query: string;
  tags?: string[];
  variables?: Record<string, unknown>;
}): Promise<{ status: number; body: T } | never> {
  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': key,
        ...headers
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables })
      }),
      cache,
      ...(tags && { next: { tags } })
    });

    const body = await result.json();

    if (body.errors) {
      const error = body.errors[0];
      throw new Error(error.message || 'Shopify API Error', { cause: error });
    }

    return {
      status: result.status,
      body
    };
  } catch (e: any) {
    if (e instanceof Error) throw e;
    
    throw new Error('Error fetching from Shopify', { 
      cause: {
        error: e,
        query 
      }
    });
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

export async function getProduct(handle: string): Promise<ReshapedProduct | undefined> {
  const res = await shopifyFetch<{ data: { product: Product } }>({
    query: getProductQuery,
    tags: ['products', `product-${handle}`],
    variables: { handle }
  });

  return reshapeProduct(res.body.data.product);
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
}): Promise<ReshapedProduct[]> {
  const res = await shopifyFetch<{ data: { products: Connection<Product> } }>({
    query: getProductsQuery,
    tags: ['products'],
    variables: { query, reverse, sortKey, first }
  });

  return reshapeProducts(removeEdgesAndNodes(res.body.data.products));
}

export async function createCart(): Promise<ReshapedCart> {
  const res = await shopifyFetch<{ data: { cartCreate: { cart: Cart } } }>({
    query: createCartMutation,
    cache: 'no-store'
  });

  return reshapeCart(res.body.data.cartCreate.cart);
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<{ cart: ReshapedCart; userErrors: any[] }> {
  const res = await shopifyFetch<{ 
    data: { 
      cartLinesAdd: { 
        cart: Cart;
        userErrors: any[];
      } 
    } 
  }>({
    query: addToCartMutation,
    variables: {
      cartId,
      lines
    },
    cache: 'no-store'
  });

  return {
    cart: reshapeCart(res.body.data.cartLinesAdd.cart),
    userErrors: res.body.data.cartLinesAdd.userErrors || []
  };
}

export async function removeFromCart(
  cartId: string, 
  lineIds: string[]
): Promise<{ cart: ReshapedCart; userErrors: any[] }> {
  const res = await shopifyFetch<{ 
    data: { 
      cartLinesRemove: { 
        cart: Cart;
        userErrors: any[];
      } 
    } 
  }>({
    query: removeFromCartMutation,
    variables: {
      cartId,
      lineIds
    },
    cache: 'no-store'
  });

  return {
    cart: reshapeCart(res.body.data.cartLinesRemove.cart),
    userErrors: res.body.data.cartLinesRemove.userErrors || []
  };
}

export async function updateCart(
  cartId: string,
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<{ cart: ReshapedCart; userErrors: any[] }> {
  const res = await shopifyFetch<{ 
    data: { 
      cartLinesUpdate: { 
        cart: Cart;
        userErrors: any[];
      } 
    } 
  }>({
    query: updateCartMutation,
    variables: {
      cartId,
      lines
    },
    cache: 'no-store'
  });

  return {
    cart: reshapeCart(res.body.data.cartLinesUpdate.cart),
    userErrors: res.body.data.cartLinesUpdate.userErrors || []
  };
}

// --- Customer Auth & Management ---

export async function loginCustomer(input: Record<string, unknown>): Promise<{ accessToken: string; expiresAt: string } | { errors: any[] }> {
  const res = await shopifyFetch<{
    data: {
      customerAccessTokenCreate: {
        customerAccessToken: { accessToken: string; expiresAt: string };
        customerUserErrors: any[];
      };
    };
  }>({
    query: customerAccessTokenCreateMutation,
    variables: { input },
    cache: 'no-store'
  });

  const payload = res.body.data.customerAccessTokenCreate;
  if (payload.customerUserErrors && payload.customerUserErrors.length > 0) {
    return { errors: payload.customerUserErrors };
  }
  return payload.customerAccessToken;
}

export async function logoutCustomer(customerAccessToken: string): Promise<boolean> {
  const res = await shopifyFetch<{
    data: {
      customerAccessTokenDelete: {
        userErrors: any[];
      };
    };
  }>({
    query: customerAccessTokenDeleteMutation,
    variables: { customerAccessToken },
    cache: 'no-store'
  });
  return !res.body.data.customerAccessTokenDelete.userErrors.length;
}

export async function createCustomer(input: Record<string, unknown>): Promise<Customer | { errors: any[] }> {
  const res = await shopifyFetch<{
    data: {
      customerCreate: {
        customer: Customer;
        customerUserErrors: any[];
      };
    };
  }>({
    query: customerCreateMutation,
    variables: { input },
    cache: 'no-store'
  });

  const payload = res.body.data.customerCreate;
  if (payload.customerUserErrors && payload.customerUserErrors.length > 0) {
    return { errors: payload.customerUserErrors };
  }
  return payload.customer;
}

export async function getCustomerDetails(customerAccessToken: string): Promise<Customer | null> {
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
}

export async function updateCartBuyerIdentity(cartId: string, customerAccessToken: string, email: string): Promise<ReshapedCart> {
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
      buyerIdentity: {
        customerAccessToken,
        email
      }
    },
    cache: 'no-store'
  });

  return reshapeCart(res.body.data.cartBuyerIdentityUpdate.cart);
}
export async function getOrder(customerAccessToken: string, orderId: string): Promise<any | null> {
  const res = await shopifyFetch<{
    data: {
      customer: {
        orders: {
          edges: Array<{ node: any }>;
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
    cache: 'no-store'
  });

  return res.body.data.cartDiscountCodesUpdate.cart;
}

export async function getBlogArticles(blogHandle: string, first: number = 20) {
  const res = await shopifyFetch<{
    data: {
      blog: {
        title: string;
        articles: Connection<any>;
      };
    };
  }>({
    query: getBlogArticlesQuery,
    variables: { blogHandle, first },
    cache: 'force-cache',
    tags: ['articles']
  });

  if (!res.body.data.blog) return null;

  return {
    title: res.body.data.blog.title,
    articles: removeEdgesAndNodes(res.body.data.blog.articles)
  };
}

export async function getArticle(blogHandle: string, articleHandle: string) {
  const res = await shopifyFetch<{
    data: {
      blog: {
        articleByHandle: any;
      };
    };
  }>({
    query: getArticleQuery,
    variables: { blogHandle, articleHandle },
    cache: 'force-cache',
    tags: ['articles']
  });

  return res.body.data.blog?.articleByHandle || null;
}

export async function predictiveSearch(query: string) {
  const res = await shopifyFetch<{
    data: {
      predictiveSearch: {
        products: any[];
        collections: any[];
        articles: any[];
      };
    };
  }>({
    query: predictiveSearchQuery,
    variables: { query },
    cache: 'no-store' // Predictive search should not be cached as it's query-specific
  });

  return res.body.data.predictiveSearch;
}

export async function createCustomerAddress(customerAccessToken: string, address: any) {
  const res = await shopifyFetch<any>({
    query: customerAddressCreateMutation,
    variables: { customerAccessToken, address },
    cache: 'no-store'
  });

  return res.body.data.customerAddressCreate;
}

export async function updateCustomerAddress(customerAccessToken: string, id: string, address: any) {
  const res = await shopifyFetch<any>({
    query: customerAddressUpdateMutation,
    variables: { customerAccessToken, id, address },
    cache: 'no-store'
  });

  return res.body.data.customerAddressUpdate;
}

export async function deleteCustomerAddress(customerAccessToken: string, id: string) {
  const res = await shopifyFetch<any>({
    query: customerAddressDeleteMutation,
    variables: { customerAccessToken, id },
    cache: 'no-store'
  });

  return res.body.data.customerAddressDelete;
}

export async function updateDefaultAddress(customerAccessToken: string, addressId: string) {
  const res = await shopifyFetch<any>({
    query: customerDefaultAddressUpdateMutation,
    variables: { customerAccessToken, addressId },
    cache: 'no-store'
  });

  return res.body.data.customerDefaultAddressUpdate;
}
