import { Customer, ShopifyUserError, Money, Metafield, Connection, Image, MailingAddress, Order } from '../../types/shopify';
import { Redis } from '@upstash/redis';
import { SHOPIFY_ADMIN_API_VERSION } from './utils';

type AdminCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  acceptsMarketing: boolean;
  orders: Connection<AdminOrder>;
  metafields: Connection<Metafield>;
  addresses: Connection<MailingAddress>;
  defaultAddress?: MailingAddress;
  wishlist?: Metafield;
  cart_id?: Metafield;
};

type AdminOrder = {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  displayFulfillmentStatus: string;
  totalPriceSet?: { shopMoney: Money };
  totalShippingPriceSet?: { shopMoney: Money };
  totalTaxSet?: { shopMoney: Money };
  subtotalPriceSet?: { shopMoney: Money };
  currentTotalPriceSet?: { shopMoney: Money };
  shippingAddress?: MailingAddress;
  lineItems: Connection<AdminLineItem>;
};

type ReshapedAdminOrder = Omit<Order, 'lineItems'> & {
  lineItems: Connection<{
    title: string;
    quantity: number;
    variant: {
      id: string;
      price: Money;
      image: Image | undefined;
      product: {
        handle: string;
      };
    } | undefined;
  }>;
};

type ReshapedAdminCustomer = Omit<AdminCustomer, 'orders'> & {
  orders: Connection<ReshapedAdminOrder>;
};

type AdminLineItem = {
  title: string;
  quantity: number;
  variant: {
    image: Image;
    price: string;
    product: {
      handle: string;
    };
  };
};

const domain = process.env.SHOPIFY_STORE_DOMAIN
  ? process.env.SHOPIFY_STORE_DOMAIN.includes('://')
    ? process.env.SHOPIFY_STORE_DOMAIN.replace(/\/$/, '')
    : `https://${process.env.SHOPIFY_STORE_DOMAIN.replace(/\/$/, '')}`
  : null;

const endpoint = domain ? `${domain}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/graphql.json` : '';

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
      console.warn('Shopify Admin Access Token returned 401. Invalidating from Redis...');
      await redis.del('shopify:admin_access_token');

      // Check if there is a backup standby token
      const backupToken = await redis.get<string>('shopify:admin_access_token:backup');
      if (backupToken && backupToken !== failedToken) {
        console.info('Standby backup token found! Promoting to active...');
        await redis.set('shopify:admin_access_token', backupToken);
        await redis.set('shopify:admin_access_token:status', 'ROTATED_TO_BACKUP');
        await redis.set('shopify:admin_access_token:last_rotation', Date.now().toString());
        return true; // Successfully rotated
      }

      // No backup token exists or the backup is the same as the failed token
      console.error('No valid standby backup token found in Redis.');
      await redis.set('shopify:admin_access_token:status', 'REVOKED');
      await redis.set('shopify:admin_access_token:revocation_time', Date.now().toString());
    }
  } catch (e) {
    console.error('Failed to handle Shopify Admin Token failure in Redis:', e);
  }
  return false; // Did not rotate/recover
}

async function getAdminAccessToken(): Promise<string> {
  // 1. Try to load from Redis dynamic vault first to support seamless key rotation
  try {
    const redis = getRedisClient();
    if (redis) {
      const dynamicToken = await redis.get<string>('shopify:admin_access_token');
      if (dynamicToken) {
        return dynamicToken;
      }
    }
  } catch (e) {
    console.error('Failed to retrieve dynamic Shopify Admin Access Token from Redis:', e);
  }

  // 2. Fall back to the environment variable
  return process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';
}

export async function shopifyAdminFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<{ status: number; body: T } | never> {
  const token = await getAdminAccessToken();

  if (!token) {
    throw new Error('SHOPIFY_ADMIN_ACCESS_TOKEN is missing');
  }

  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables }),
      }),
      cache: 'no-store',
    });

    if (result.status === 401) {
      const didRotate = await handleTokenFailure(token);
      if (didRotate) {
        console.info('Retrying shopifyAdminFetch after successful token rotation...');
        return shopifyAdminFetch<T>({ query, variables });
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
          return shopifyAdminFetch<T>({ query, variables });
        }
        throw new ShopifyUnauthorizedError(error.message || 'Shopify Admin access token is invalid or expired.');
      }
      throw new Error(error.message || 'Shopify Admin API Error', { cause: error });
    }

    return {
      status: result.status,
      body,
    };
  } catch (e: unknown) {
    if (e instanceof ShopifyUnauthorizedError || e instanceof Error) throw e;

    throw new Error('Error fetching from Shopify Admin', {
      cause: {
        error: e,
        query,
      },
    });
  }
}

export async function getCustomerByEmail(email: string) {
  const query = `
    query getCustomerByEmail($query: String!) {
      customers(first: 1, query: $query) {
        edges {
          node {
            id
            email
            firstName
            lastName
          }
        }
      }
    }
  `;
  const res = await shopifyAdminFetch<{
    data: { customers: { edges: { node: Customer }[] } };
  }>({
    query,
    variables: { query: `email:${email}` },
  });

  return res.body.data.customers.edges[0]?.node || null;
}

export async function getCustomerById(id: string) {
  const query = `
    query getCustomerById($id: ID!) {
      customer(id: $id) {
        id
        email
        firstName
        lastName
      }
    }
  `;
  const res = await shopifyAdminFetch<{
    data: { customer: Customer };
  }>({
    query,
    variables: { id },
  });

  return res.body.data.customer || null;
}

export async function resolveCustomerGid(id: string): Promise<string> {
  if (!id.startsWith('gid://shopify/Customer/')) {
    if (id.includes('@')) {
      const customer = await getCustomerByEmail(id);
      if (customer) {
        return customer.id;
      }
    } else {
      return `gid://shopify/Customer/${id}`;
    }
  }
  return id;
}

export async function getCustomerDetailsById(id: string): Promise<ReshapedAdminCustomer | null> {
  const resolvedId = await resolveCustomerGid(id);
  const query = `
    query getCustomerDetailsById($id: ID!) {
      customer(id: $id) {
        id
        firstName
        lastName
        email
        phone
        acceptsMarketing
        orders(first: 20, reverse: true) {
          edges {
            node {
              id
              orderNumber
              processedAt
              financialStatus
              fulfillmentStatus: displayFulfillmentStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              totalShippingPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              totalTaxSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              subtotalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              currentTotalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                  }
                }
              }
            }
          }
        }
        metafields(first: 10) {
          edges {
            node {
              namespace
              key
              value
            }
          }
        }
        addresses(first: 10) {
          edges {
            node {
              id
              firstName
              lastName
              address1
              address2
              city
              province
              zip
              country
              phone
            }
          }
        }
        defaultAddress {
          id
          firstName
          lastName
          address1
          address2
          city
          province
          zip
          country
          phone
        }
      }
    }
  `;
  const res = await shopifyAdminFetch<{
    data: { customer: AdminCustomer };
  }>({
    query,
    variables: { id: resolvedId },
  });

  const customer = res.body.data.customer;
  if (!customer) return null;

  // Reshape to match Storefront API structure as much as possible for compatibility
  return {
    ...customer,
    wishlist: (customer.metafields?.edges || []).filter(Boolean).find((e) => e.node?.namespace === 'wishlist' && e.node?.key === 'items')?.node,
    cart_id: (customer.metafields?.edges || []).filter(Boolean).find((e) => e.node?.namespace === 'custom' && e.node?.key === 'cart_id')?.node,
    addresses: customer.addresses || { edges: [] },
    defaultAddress: customer.defaultAddress || undefined,
    orders: {
      edges: (customer.orders?.edges || []).filter(Boolean).map((edge: { node: AdminOrder }) => ({
        node: {
          ...edge.node,
          fulfillmentStatus: edge.node.displayFulfillmentStatus || 'UNFULFILLED',
          currentTotalPrice: edge.node.currentTotalPriceSet?.shopMoney || { amount: '0', currencyCode: 'INR' },
          totalPrice: edge.node.totalPriceSet?.shopMoney || edge.node.currentTotalPriceSet?.shopMoney || { amount: '0', currencyCode: 'INR' },
          totalShippingPrice: edge.node.totalShippingPriceSet?.shopMoney || { amount: '0', currencyCode: 'INR' },
          totalTax: edge.node.totalTaxSet?.shopMoney || { amount: '0', currencyCode: 'INR' },
          subtotalPrice: edge.node.subtotalPriceSet?.shopMoney || { amount: '0', currencyCode: 'INR' },
          shippingAddress: edge.node.shippingAddress || undefined,
          lineItems: {
            edges: (edge.node.lineItems?.edges || []).filter(Boolean).map((lineEdge) => ({
              node: {
                ...lineEdge.node,
                variant: lineEdge.node.variant ? {
                  ...lineEdge.node.variant,
                  image: lineEdge.node.variant.image || undefined,
                  price: {
                    amount: lineEdge.node.variant.price,
                    currencyCode: edge.node.totalPriceSet?.shopMoney?.currencyCode || edge.node.currentTotalPriceSet?.shopMoney?.currencyCode || 'INR'
                  }
                } : undefined
              }
            }))
          }
        }
      }))
    }
  } as ReshapedAdminCustomer;
}

export async function getOrderById(orderId: string): Promise<ReshapedAdminOrder | null> {
  // Order ID in Admin API can be a long GID or just the numeric ID.
  // Storefront API uses a different GID format.
  const gid = orderId.startsWith('gid://') ? orderId : `gid://shopify/Order/${orderId}`;
  
  const query = `
    query getOrderById($id: ID!) {
      order(id: $id) {
        id
        orderNumber
        processedAt
        financialStatus
        displayFulfillmentStatus
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        totalShippingPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        totalTaxSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        subtotalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        shippingAddress {
          firstName
          lastName
          address1
          address2
          city
          zip
          province
          country
        }
        lineItems(first: 50) {
          edges {
            node {
              title
              quantity
              variant {
                image {
                  url
                  altText
                }
                price
                product {
                  handle
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await shopifyAdminFetch<{
    data: { order: AdminOrder };
  }>({
    query,
    variables: { id: gid },
  });

  const order = res.body.data.order;
  if (!order) return null;

  // Reshape to match Storefront API structure
  return {
    ...order,
    fulfillmentStatus: order.displayFulfillmentStatus,
    currentTotalPrice: order.currentTotalPriceSet?.shopMoney || { amount: '0', currencyCode: 'INR' },
    totalPrice: order.totalPriceSet?.shopMoney || order.currentTotalPriceSet?.shopMoney || { amount: '0', currencyCode: 'INR' },
    totalShippingPrice: order.totalShippingPriceSet?.shopMoney || { amount: '0', currencyCode: 'INR' },
    totalTax: order.totalTaxSet?.shopMoney || { amount: '0', currencyCode: 'INR' },
    subtotalPrice: order.subtotalPriceSet?.shopMoney || { amount: '0', currencyCode: 'INR' },
    shippingAddress: order.shippingAddress || undefined,
    lineItems: {
      edges: (order.lineItems?.edges || []).filter(Boolean).map((edge: { node: AdminLineItem }) => ({
        node: {
          ...edge.node,
          variant: edge.node.variant ? {
            ...edge.node.variant,
            image: edge.node.variant.image || undefined,
            price: {
              amount: edge.node.variant.price,
              currencyCode: order.totalPriceSet?.shopMoney?.currencyCode || order.currentTotalPriceSet?.shopMoney?.currencyCode || 'INR'
            }
          } : undefined
        }
      }))
    }
  } as ReshapedAdminOrder;
}

export async function createCustomerViaAdmin(input: { email: string; firstName: string; lastName: string; password?: string }) {
  const query = `
    mutation customerCreate($input: CustomerInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
          firstName
          lastName
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const res = await shopifyAdminFetch<{
    data: {
      customerCreate: {
        customer: Customer;
        userErrors: ShopifyUserError[];
      };
    };
  }>({
    query,
    variables: {
      input: {
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        tags: ['GoogleOAuth'],
      },
    },
  });

  return res.body.data.customerCreate.customer;
}

export async function createCustomerAddressAdmin(customerId: string, address: unknown) {
  const resolvedId = await resolveCustomerGid(customerId);
  const query = `
    mutation customerAddressCreate($customerId: ID!, $address: MailingAddressInput!) {
      customerAddressCreate(customerId: $customerId, address: $address) {
        customerAddress {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const res = await shopifyAdminFetch<{
    data: { customerAddressCreate: { customerAddress: { id: string }, userErrors: ShopifyUserError[] } }
  }>({
    query,
    variables: { customerId: resolvedId, address }
  });

  return res.body.data.customerAddressCreate;
}

export async function updateCustomerAddressAdmin(customerId: string, addressId: string, address: unknown) {
  const query = `
    mutation customerAddressUpdate($id: ID!, $address: MailingAddressInput!) {
      customerAddressUpdate(id: $id, address: $address) {
        customerAddress {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const res = await shopifyAdminFetch<{
    data: { customerAddressUpdate: { customerAddress: { id: string }, userErrors: ShopifyUserError[] } }
  }>({
    query,
    variables: { id: addressId, address }
  });

  return res.body.data.customerAddressUpdate;
}

export async function deleteCustomerAddressAdmin(customerId: string, addressId: string) {
  const resolvedId = await resolveCustomerGid(customerId);
  const query = `
    mutation customerAddressDelete($id: ID!, $customerId: ID!) {
      customerAddressDelete(id: $id, customerId: $customerId) {
        deletedCustomerAddressId
        userErrors {
          field
          message
        }
      }
    }
  `;

  const res = await shopifyAdminFetch<{
    data: { customerAddressDelete: { deletedCustomerAddressId: string, userErrors: ShopifyUserError[] } }
  }>({
    query,
    variables: { id: addressId, customerId: resolvedId }
  });

  return res.body.data.customerAddressDelete;
}

export async function updateDefaultAddressAdmin(customerId: string, addressId: string) {
  const resolvedId = await resolveCustomerGid(customerId);
  const query = `
    mutation customerDefaultAddressUpdate($addressId: ID!, $customerId: ID!) {
      customerDefaultAddressUpdate(addressId: $addressId, customerId: $customerId) {
        customer {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const res = await shopifyAdminFetch<{
    data: { customerDefaultAddressUpdate: { customer: { id: string }, userErrors: ShopifyUserError[] } }
  }>({
    query,
    variables: { addressId, customerId: resolvedId }
  });

  return res.body.data.customerDefaultAddressUpdate;
}

export async function setCustomerCart(customerId: string, cartId: string) {
  const resolvedId = await resolveCustomerGid(customerId);
  const query = `
    mutation customerUpdate($input: CustomerInput!) {
      customerUpdate(input: $input) {
        customer {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const res = await shopifyAdminFetch<{
    data: { customerUpdate: { customer: { id: string }, userErrors: ShopifyUserError[] } }
  }>({
    query,
    variables: {
      input: {
        id: resolvedId,
        metafields: [
          {
            namespace: 'custom',
            key: 'cart_id',
            value: cartId,
            type: 'single_line_text_field'
          }
        ]
      }
    }
  });

  return res.body.data.customerUpdate;
}
