import { SHOPIFY_GRAPHQL_API_ENDPOINT, fetchWithRetry } from './utils';
import { getProductQuery, getProductsQuery, getCartQuery, getCustomerQuery } from './queries';
import {
  createCartMutation,
  addToCartMutation,
  removeFromCartMutation,
  updateCartMutation,
  customerAccessTokenCreateMutation,
  customerAccessTokenDeleteMutation,
  customerCreateMutation,
  cartBuyerIdentityUpdateMutation
} from './mutations';
import {
  Product,
  ReshapedProduct,
  Cart,
  ReshapedCart,
  Connection,
  Edge,
  Customer,
  CustomerAccessToken
} from '../../types/shopify';

const domain = process.env.SHOPIFY_STORE_DOMAIN
  ? process.env.SHOPIFY_STORE_DOMAIN.includes('://')
    ? process.env.SHOPIFY_STORE_DOMAIN.replace(/\/$/, '')
    : `https://${process.env.SHOPIFY_STORE_DOMAIN.replace(/\/$/, '')}`
  : 'https://naaz-book-depot.myshopify.com';

const endpoint = `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}`;
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

export async function shopifyFetch<T>({
  cache = 'force-cache',
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
      throw body.errors[0];
    }

    return {
      status: result.status,
      body
    };
  } catch (e) {
    console.error('Error fetching from Shopify:', e);
    throw {
      error: e,
      query
    };
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

const reshapeCart = (cart: Cart): ReshapedCart => {
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
    tags: ['products'],
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
): Promise<ReshapedCart> {
  const res = await shopifyFetch<{ data: { cartLinesAdd: { cart: Cart } } }>({
    query: addToCartMutation,
    variables: {
      cartId,
      lines
    },
    cache: 'no-store'
  });

  return reshapeCart(res.body.data.cartLinesAdd.cart);
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<ReshapedCart> {
  const res = await shopifyFetch<{ data: { cartLinesRemove: { cart: Cart } } }>({
    query: removeFromCartMutation,
    variables: {
      cartId,
      lineIds
    },
    cache: 'no-store'
  });

  return reshapeCart(res.body.data.cartLinesRemove.cart);
}

export async function updateCart(
  cartId: string,
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<ReshapedCart> {
  const res = await shopifyFetch<{ data: { cartLinesUpdate: { cart: Cart } } }>({
    query: updateCartMutation,
    variables: {
      cartId,
      lines
    },
    cache: 'no-store'
  });

  return reshapeCart(res.body.data.cartLinesUpdate.cart);
}

// --- Customer Auth & Management ---

export async function loginCustomer(input: any): Promise<{ accessToken: string; expiresAt: string } | { errors: any[] }> {
  const res = await shopifyFetch<any>({
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
  const res = await shopifyFetch<any>({
    query: customerAccessTokenDeleteMutation,
    variables: { customerAccessToken },
    cache: 'no-store'
  });
  return !res.body.data.customerAccessTokenDelete.userErrors.length;
}

export async function createCustomer(input: any): Promise<Customer | { errors: any[] }> {
  const res = await shopifyFetch<any>({
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
  const res = await shopifyFetch<any>({
    query: getCustomerQuery,
    variables: { customerAccessToken },
    cache: 'no-store'
  });

  return res.body.data.customer || null;
}

export async function updateCartBuyerIdentity(cartId: string, customerAccessToken: string, email: string): Promise<ReshapedCart> {
  const res = await shopifyFetch<any>({
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
