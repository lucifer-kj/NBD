import { Customer, ShopifyUserError, Money, Metafield, Connection, Image, MailingAddress, Order } from '../../types/shopify';

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

const endpoint = domain ? `${domain}/admin/api/2024-04/graphql.json` : '';
const key = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';

export async function shopifyAdminFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<{ status: number; body: T } | never> {
  if (!key) {
    throw new Error('SHOPIFY_ADMIN_ACCESS_TOKEN is missing');
  }

  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': key,
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables }),
      }),
      cache: 'no-store',
    });

    const body = await result.json();

    if (body.errors) {
      const error = body.errors[0];
      throw new Error(error.message || 'Shopify Admin API Error', { cause: error });
    }

    return {
      status: result.status,
      body,
    };
  } catch (e: unknown) {
    if (e instanceof Error) throw e;

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

export async function getCustomerDetailsById(id: string): Promise<ReshapedAdminCustomer | null> {
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
    variables: { id },
  });

  const customer = res.body.data.customer;
  if (!customer) return null;

  // Reshape to match Storefront API structure as much as possible for compatibility
  return {
    ...customer,
    wishlist: customer.metafields.edges.find((e) => e.node.namespace === 'wishlist' && e.node.key === 'items')?.node,
    cart_id: customer.metafields.edges.find((e) => e.node.namespace === 'custom' && e.node.key === 'cart_id')?.node,
    addresses: customer.addresses,
    defaultAddress: customer.defaultAddress || undefined,
    orders: {
      edges: customer.orders.edges.map((edge: { node: AdminOrder }) => ({
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
            edges: edge.node.lineItems.edges.map((lineEdge) => ({
              node: {
                ...lineEdge.node,
                variant: lineEdge.node.variant ? {
                  ...lineEdge.node.variant,
                  image: lineEdge.node.variant.image || undefined,
                  price: {
                    amount: lineEdge.node.variant.price,
                    currencyCode: edge.node.totalPriceSet?.shopMoney.currencyCode || 'INR'
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
      edges: order.lineItems.edges.map((edge: { node: AdminLineItem }) => ({
        node: {
          ...edge.node,
          variant: edge.node.variant ? {
            ...edge.node.variant,
            image: edge.node.variant.image || undefined,
            price: {
              amount: edge.node.variant.price,
              currencyCode: order.totalPriceSet?.shopMoney.currencyCode || 'INR'
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
    variables: { customerId, address }
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
    variables: { id: addressId, customerId }
  });

  return res.body.data.customerAddressDelete;
}

export async function updateDefaultAddressAdmin(customerId: string, addressId: string) {
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
    variables: { addressId, customerId }
  });

  return res.body.data.customerDefaultAddressUpdate;
}

export async function setCustomerCart(customerId: string, cartId: string) {
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
        id: customerId,
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
