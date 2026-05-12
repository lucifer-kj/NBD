module.exports = {

"[project]/.next-internal/server/app/api/auth/me/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/lib/shopify/utils.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "SHOPIFY_GRAPHQL_API_ENDPOINT": (()=>SHOPIFY_GRAPHQL_API_ENDPOINT),
    "fetchWithRetry": (()=>fetchWithRetry)
});
const SHOPIFY_GRAPHQL_API_ENDPOINT = '/api/2024-01/graphql.json';
async function fetchWithRetry(url, options, retries = 3) {
    let attempt = 0;
    while(attempt < retries){
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
        } catch (error) {
            attempt++;
            if (attempt === retries) throw error;
            // Wait for 1s before retrying
            await new Promise((resolve)=>setTimeout(resolve, 1000));
        }
    }
    throw new Error('Max retries reached');
}
}}),
"[project]/lib/shopify/fragments.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "cartFragment": (()=>cartFragment),
    "productFragment": (()=>productFragment)
});
const productFragment = `
  fragment product on Product {
    id
    handle
    availableForSale
    title
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
  }
`;
const cartFragment = `
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
              }
            }
          }
        }
      }
    }
    totalQuantity
  }
`;
}}),
"[project]/lib/shopify/queries.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "getCartQuery": (()=>getCartQuery),
    "getCustomerQuery": (()=>getCustomerQuery),
    "getProductQuery": (()=>getProductQuery),
    "getProductsQuery": (()=>getProductsQuery)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$fragments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/shopify/fragments.ts [app-route] (ecmascript)");
;
const getProductQuery = `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      ...product
    }
  }
  ${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$fragments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["productFragment"]}
`;
const getProductsQuery = `
  query getProducts($sortKey: ProductSortKeys, $reverse: Boolean, $query: String, $first: Int) {
    products(sortKey: $sortKey, reverse: $reverse, query: $query, first: $first) {
      edges {
        node {
          ...product
        }
      }
    }
  }
  ${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$fragments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["productFragment"]}
`;
const getCartQuery = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ...cart
    }
  }
  ${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$fragments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cartFragment"]}
`;
const getCustomerQuery = `
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
    }
  }
`;
}}),
"[project]/lib/shopify/mutations.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "addToCartMutation": (()=>addToCartMutation),
    "cartBuyerIdentityUpdateMutation": (()=>cartBuyerIdentityUpdateMutation),
    "createCartMutation": (()=>createCartMutation),
    "customerAccessTokenCreateMutation": (()=>customerAccessTokenCreateMutation),
    "customerAccessTokenDeleteMutation": (()=>customerAccessTokenDeleteMutation),
    "customerCreateMutation": (()=>customerCreateMutation),
    "removeFromCartMutation": (()=>removeFromCartMutation),
    "updateCartMutation": (()=>updateCartMutation)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$fragments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/shopify/fragments.ts [app-route] (ecmascript)");
;
const createCartMutation = `
  mutation createCart($lineItems: [CartLineInput!]) {
    cartCreate(input: { lines: $lineItems }) {
      cart {
        ...cart
      }
    }
  }
  ${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$fragments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cartFragment"]}
`;
const addToCartMutation = `
  mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...cart
      }
    }
  }
  ${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$fragments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cartFragment"]}
`;
const removeFromCartMutation = `
  mutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...cart
      }
    }
  }
  ${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$fragments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cartFragment"]}
`;
const updateCartMutation = `
  mutation updateCart($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...cart
      }
    }
  }
  ${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$fragments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cartFragment"]}
`;
const customerAccessTokenCreateMutation = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
const customerAccessTokenDeleteMutation = `
  mutation customerAccessTokenDelete($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
      deletedAccessToken
      deletedCustomerAccessTokenId
      userErrors {
        field
        message
      }
    }
  }
`;
const customerCreateMutation = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        firstName
        lastName
        email
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
const cartBuyerIdentityUpdateMutation = `
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        ...cart
      }
      userErrors {
        field
        message
      }
    }
  }
  \${cartFragment}
`;
}}),
"[project]/lib/shopify/index.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "addToCart": (()=>addToCart),
    "createCart": (()=>createCart),
    "createCustomer": (()=>createCustomer),
    "getCustomerDetails": (()=>getCustomerDetails),
    "getProduct": (()=>getProduct),
    "getProducts": (()=>getProducts),
    "loginCustomer": (()=>loginCustomer),
    "logoutCustomer": (()=>logoutCustomer),
    "removeFromCart": (()=>removeFromCart),
    "shopifyFetch": (()=>shopifyFetch),
    "updateCart": (()=>updateCart),
    "updateCartBuyerIdentity": (()=>updateCartBuyerIdentity)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/shopify/utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$queries$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/shopify/queries.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$mutations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/shopify/mutations.ts [app-route] (ecmascript)");
;
;
;
const domain = process.env.SHOPIFY_STORE_DOMAIN ? process.env.SHOPIFY_STORE_DOMAIN.includes('://') ? process.env.SHOPIFY_STORE_DOMAIN : `https://${process.env.SHOPIFY_STORE_DOMAIN}` : '';
const endpoint = `${domain}${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SHOPIFY_GRAPHQL_API_ENDPOINT"]}`;
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
async function shopifyFetch({ cache = 'force-cache', headers, query, tags, variables }) {
    try {
        const result = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': key,
                ...headers
            },
            body: JSON.stringify({
                ...query && {
                    query
                },
                ...variables && {
                    variables
                }
            }),
            cache,
            ...tags && {
                next: {
                    tags
                }
            }
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
const removeEdgesAndNodes = (array)=>{
    return array.edges.map((edge)=>edge?.node);
};
const reshapeProduct = (product)=>{
    if (!product) {
        return product;
    }
    const { images, variants, ...rest } = product;
    return {
        ...rest,
        images: removeEdgesAndNodes(images),
        variants: removeEdgesAndNodes(variants)
    };
};
const reshapeProducts = (products)=>{
    const reshapedProducts = [];
    for (const product of products){
        if (product) {
            const reshapedProduct = reshapeProduct(product);
            if (reshapedProduct) {
                reshapedProducts.push(reshapedProduct);
            }
        }
    }
    return reshapedProducts;
};
const reshapeCart = (cart)=>{
    if (!cart) {
        return cart;
    }
    return {
        ...cart,
        lines: removeEdgesAndNodes(cart.lines)
    };
};
async function getProduct(handle) {
    const res = await shopifyFetch({
        query: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$queries$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getProductQuery"],
        tags: [
            'products'
        ],
        variables: {
            handle
        }
    });
    return reshapeProduct(res.body.data.product);
}
async function getProducts({ query, reverse, sortKey, first = 100 }) {
    const res = await shopifyFetch({
        query: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$queries$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getProductsQuery"],
        tags: [
            'products'
        ],
        variables: {
            query,
            reverse,
            sortKey,
            first
        }
    });
    return reshapeProducts(removeEdgesAndNodes(res.body.data.products));
}
async function createCart() {
    const res = await shopifyFetch({
        query: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$mutations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCartMutation"],
        cache: 'no-store'
    });
    return reshapeCart(res.body.data.cartCreate.cart);
}
async function addToCart(cartId, lines) {
    const res = await shopifyFetch({
        query: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$mutations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addToCartMutation"],
        variables: {
            cartId,
            lines
        },
        cache: 'no-store'
    });
    return reshapeCart(res.body.data.cartLinesAdd.cart);
}
async function removeFromCart(cartId, lineIds) {
    const res = await shopifyFetch({
        query: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$mutations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["removeFromCartMutation"],
        variables: {
            cartId,
            lineIds
        },
        cache: 'no-store'
    });
    return reshapeCart(res.body.data.cartLinesRemove.cart);
}
async function updateCart(cartId, lines) {
    const res = await shopifyFetch({
        query: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$mutations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateCartMutation"],
        variables: {
            cartId,
            lines
        },
        cache: 'no-store'
    });
    return reshapeCart(res.body.data.cartLinesUpdate.cart);
}
async function loginCustomer(input) {
    const res = await shopifyFetch({
        query: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$mutations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["customerAccessTokenCreateMutation"],
        variables: {
            input
        },
        cache: 'no-store'
    });
    const payload = res.body.data.customerAccessTokenCreate;
    if (payload.customerUserErrors && payload.customerUserErrors.length > 0) {
        return {
            errors: payload.customerUserErrors
        };
    }
    return payload.customerAccessToken;
}
async function logoutCustomer(customerAccessToken) {
    const res = await shopifyFetch({
        query: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$mutations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["customerAccessTokenDeleteMutation"],
        variables: {
            customerAccessToken
        },
        cache: 'no-store'
    });
    return !res.body.data.customerAccessTokenDelete.userErrors.length;
}
async function createCustomer(input) {
    const res = await shopifyFetch({
        query: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$mutations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["customerCreateMutation"],
        variables: {
            input
        },
        cache: 'no-store'
    });
    const payload = res.body.data.customerCreate;
    if (payload.customerUserErrors && payload.customerUserErrors.length > 0) {
        return {
            errors: payload.customerUserErrors
        };
    }
    return payload.customer;
}
async function getCustomerDetails(customerAccessToken) {
    const res = await shopifyFetch({
        query: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$queries$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCustomerQuery"],
        variables: {
            customerAccessToken
        },
        cache: 'no-store'
    });
    return res.body.data.customer || null;
}
async function updateCartBuyerIdentity(cartId, customerAccessToken, email) {
    const res = await shopifyFetch({
        query: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$mutations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cartBuyerIdentityUpdateMutation"],
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
}}),
"[project]/app/api/auth/me/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "GET": (()=>GET)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$6_react$2d$dom$40$19$2e$2$2e$6_react$40$19$2e$2$2e$6_$5f$react$40$19$2e$2$2e$6$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.6_react-dom@19.2.6_react@19.2.6__react@19.2.6/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/shopify/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$6_react$2d$dom$40$19$2e$2$2e$6_react$40$19$2e$2$2e$6_$5f$react$40$19$2e$2$2e$6$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.3.6_react-dom@19.2.6_react@19.2.6__react@19.2.6/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
;
async function GET(req) {
    try {
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$6_react$2d$dom$40$19$2e$2$2e$6_react$40$19$2e$2$2e$6_$5f$react$40$19$2e$2$2e$6$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        const accessToken = cookieStore.get('customerAccessToken')?.value;
        if (!accessToken) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$6_react$2d$dom$40$19$2e$2$2e$6_react$40$19$2e$2$2e$6_$5f$react$40$19$2e$2$2e$6$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                user: null
            }, {
                status: 200
            });
        }
        const customer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$shopify$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCustomerDetails"])(accessToken);
        if (!customer) {
            // Token might be expired or invalid
            (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$6_react$2d$dom$40$19$2e$2$2e$6_react$40$19$2e$2$2e$6_$5f$react$40$19$2e$2$2e$6$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])()).delete('customerAccessToken');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$6_react$2d$dom$40$19$2e$2$2e$6_react$40$19$2e$2$2e$6_$5f$react$40$19$2e$2$2e$6$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                user: null
            }, {
                status: 200
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$6_react$2d$dom$40$19$2e$2$2e$6_react$40$19$2e$2$2e$6_$5f$react$40$19$2e$2$2e$6$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            user: customer
        });
    } catch (error) {
        console.error('Get current user error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$3$2e$6_react$2d$dom$40$19$2e$2$2e$6_react$40$19$2e$2$2e$6_$5f$react$40$19$2e$2$2e$6$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__6e17f871._.js.map