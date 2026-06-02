export const productFragment = `
  fragment product on Product {
    id
    handle
    availableForSale
    title
    vendor
    description
    descriptionHtml
    options {
      id
      name
      values
    }
    priceRange {
      maxVariantPrice {
        amount
        currencyCode
      }
      minVariantPrice {
        amount
        currencyCode
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
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
    featuredImage {
      url
      altText
      width
      height
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
    seo {
      title
      description
    }
    tags
    updatedAt
    metafields(identifiers: [
      { namespace: "custom", key: "care_instructions" },
      { namespace: "custom", key: "technical_specs" },
      { namespace: "reviews", key: "rating" }
    ]) {
      key
      value
      namespace
    }
  }
`;

export const cartFragment = `
  fragment cart on Cart {
    id
    checkoutUrl
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              availableForSale
              selectedOptions {
                name
                value
              }
              price {
                amount
                currencyCode
              }
              product {
                id
                handle
                title
                featuredImage {
                  url
                  altText
                  width
                  height
                }
                tags
              }
            }
          }
        }
      }
    }
    totalQuantity
    discountCodes {
      applicable
      code
    }
  }
`;

export const articleFragment = `
  fragment article on Article {
    id
    title
    handle
    content
    contentHtml
    excerpt
    excerptHtml
    publishedAt
    authorV2 {
      name
    }
    image {
      url
      altText
      width
      height
    }
    blog {
      handle
      title
    }
    seo {
      title
      description
    }
  }
`;
