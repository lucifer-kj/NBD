import { productFragment, cartFragment } from './fragments';

export const getProductQuery = `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      ...product
    }
  }
  ${productFragment}
`;

export const getProductsQuery = `
  query getProducts($sortKey: ProductSortKeys, $reverse: Boolean, $query: String, $first: Int) {
    products(sortKey: $sortKey, reverse: $reverse, query: $query, first: $first) {
      edges {
        node {
          ...product
        }
      }
    }
  }
  ${productFragment}
`;

export const getCartQuery = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ...cart
    }
  }
  ${cartFragment}
`;

export const getCustomerQuery = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      acceptsMarketing
      orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            currentTotalPrice {
              amount
              currencyCode
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
      wishlist: metafield(namespace: "wishlist", key: "items") {
        value
      }
      cart_id: metafield(namespace: "custom", key: "cart_id") {
        value
      }
    }
  }
`;

export const predictiveSearchQuery = `
  query predictiveSearch($query: String!) {
    predictiveSearch(query: $query, types: [PRODUCT, COLLECTION, ARTICLE], limit: 5) {
      products {
        id
        title
        handle
        featuredImage {
          url
          altText
        }
      }
      collections {
        id
        title
        handle
      }
      articles {
        id
        title
        handle
      }
    }
  }
`;
export const getOrderQuery = `
  query getOrder($customerAccessToken: String!, $orderId: ID!) {
    customer(customerAccessToken: $customerAccessToken) {
      orders(first: 1, query: $orderId) {
        edges {
          node {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            totalPrice {
              amount
              currencyCode
            }
            totalShippingPrice {
              amount
              currencyCode
            }
            totalTax {
              amount
              currencyCode
            }
            subtotalPrice {
              amount
              currencyCode
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
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      handle
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const getProductsByIdsQuery = `
  query getProductsByIds($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        ...product
      }
    }
  }
  ${productFragment}
`;

export const getCollectionsQuery = `
  query getCollections($first: Int) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          updatedAt
        }
      }
    }
  }
`;

export const getPoliciesQuery = `
  query getPolicies {
    shop {
      privacyPolicy {
        title
        handle
        body
      }
      refundPolicy {
        title
        handle
        body
      }
      shippingPolicy {
        title
        handle
        body
      }
      termsOfService {
        title
        handle
        body
      }
    }
  }
`;

export const getCollectionQuery = `
  query getCollection($handle: String!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
        width
        height
      }
      products(first: 100) {
        edges {
          node {
            ...product
          }
        }
      }
    }
  }
  ${productFragment}
`;


