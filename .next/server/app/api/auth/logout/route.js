(()=>{var e={};e.id=489,e.ids=[489],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},13324:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>g,routeModule:()=>l,serverHooks:()=>y,workAsyncStorage:()=>m,workUnitAsyncStorage:()=>p});var s={};r.r(s),r.d(s,{POST:()=>d});var o=r(72025),a=r(96198),n=r(73885),c=r(55416),u=r(93334),i=r(69797);async function d(){try{let e=await (0,i.UL)(),t=e.get("customerAccessToken")?.value;return t&&await (0,u.bc)(t),(await (0,i.UL)()).delete("customerAccessToken"),c.NextResponse.json({success:!0})}catch(e){return console.error("Logout error:",e),c.NextResponse.json({error:"Internal server error"},{status:500})}}let l=new o.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/auth/logout/route",pathname:"/api/auth/logout",filename:"route",bundlePath:"app/api/auth/logout/route"},resolvedPagePath:"C:\\Users\\lenovo\\Documents\\Builds\\ndb\\app\\api\\auth\\logout\\route.ts",nextConfigOutput:"",userland:s}),{workAsyncStorage:m,workUnitAsyncStorage:p,serverHooks:y}=l;function g(){return(0,n.patchFetch)({workAsyncStorage:m,workUnitAsyncStorage:p})}},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31321:()=>{},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},67769:()=>{},93334:(e,t,r)=>{"use strict";r.d(t,{ff:()=>b,tr:()=>k,oo:()=>A,d$:()=>S,Sh:()=>I,bc:()=>C,Xe:()=>O});let s=`
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
`,o=`
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
`,a=`
  query getProduct($handle: String!) {
    product(handle: $handle) {
      ...product
    }
  }
  ${s}
`,n=`
  query getProducts($sortKey: ProductSortKeys, $reverse: Boolean, $query: String, $first: Int) {
    products(sortKey: $sortKey, reverse: $reverse, query: $query, first: $first) {
      edges {
        node {
          ...product
        }
      }
    }
  }
  ${s}
`,c=`
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
`,u=`
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
`,i=`
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
`,d=`
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
`,l=`
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
  ${o}
`,m=process.env.SHOPIFY_STORE_DOMAIN?process.env.SHOPIFY_STORE_DOMAIN.includes("://")?process.env.SHOPIFY_STORE_DOMAIN.replace(/\/$/,""):`https://${process.env.SHOPIFY_STORE_DOMAIN.replace(/\/$/,"")}`:null;m||console.warn("SHOPIFY_STORE_DOMAIN is not defined in environment variables.");let p=m?`${m}/api/2026-04/graphql.json`:"",y=process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN||"";async function g({cache:e="no-store",headers:t,query:r,tags:s,variables:o}){try{let a=await fetch(p,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Storefront-Access-Token":y,...t},body:JSON.stringify({...r&&{query:r},...o&&{variables:o}}),cache:e,...s&&{next:{tags:s}}}),n=await a.json();if(n.errors){let e=n.errors[0];throw Error(e.message||"Shopify API Error",{cause:e})}return{status:a.status,body:n}}catch(e){if(e instanceof Error)throw e;throw Error("Error fetching from Shopify",{cause:{error:e,query:r}})}}y||console.warn("SHOPIFY_STOREFRONT_ACCESS_TOKEN is not defined in environment variables.");let h=e=>e.edges.map(e=>e?.node),f=e=>{if(!e)return e;let{images:t,variants:r,...s}=e;return{...s,images:h(t),variants:h(r)}},v=e=>{let t=[];for(let r of e)if(r){let e=f(r);e&&t.push(e)}return t},T=e=>e?{...e,lines:h(e.lines)}:e;async function A(e){return f((await g({query:a,tags:["products",`product-${e}`],variables:{handle:e}})).body.data.product)}async function S({query:e,reverse:t,sortKey:r,first:s=100}){return v(h((await g({query:n,tags:["products"],variables:{query:e,reverse:t,sortKey:r,first:s}})).body.data.products))}async function I(e){let t=(await g({query:u,variables:{input:e},cache:"no-store"})).body.data.customerAccessTokenCreate;return t.customerUserErrors&&t.customerUserErrors.length>0?{errors:t.customerUserErrors}:t.customerAccessToken}async function C(e){return!(await g({query:i,variables:{customerAccessToken:e},cache:"no-store"})).body.data.customerAccessTokenDelete.userErrors.length}async function b(e){let t=(await g({query:d,variables:{input:e},cache:"no-store"})).body.data.customerCreate;return t.customerUserErrors&&t.customerUserErrors.length>0?{errors:t.customerUserErrors}:t.customer}async function k(e){return(await g({query:c,variables:{customerAccessToken:e},cache:"no-store"})).body.data.customer||null}async function O(e,t,r){return T((await g({query:l,variables:{cartId:e,buyerIdentity:{customerAccessToken:t,email:r}},cache:"no-store"})).body.data.cartBuyerIdentityUpdate.cart)}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[907,754,797],()=>r(13324));module.exports=s})();