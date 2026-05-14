import { Customer, ShopifyUserError } from '../../types/shopify';

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
        // Optionally pass a generated password to allow them to reset later, or let it be null.
        // If password isn't provided, it creates an unverified account (or depends on store settings)
      },
    },
  });

  const payload = res.body.data.customerCreate;
  if (payload.userErrors && payload.userErrors.length > 0) {
    throw new Error(payload.userErrors.map((e: ShopifyUserError) => e.message).join(', '));
  }

  return payload.customer;
}
