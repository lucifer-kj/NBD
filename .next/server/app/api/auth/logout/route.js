(()=>{var e={};e.id=489,e.ids=[489],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},13324:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>g,routeModule:()=>l,serverHooks:()=>y,workAsyncStorage:()=>p,workUnitAsyncStorage:()=>m});var s={};t.r(s),t.d(s,{POST:()=>d});var o=t(72025),n=t(96198),a=t(73885),c=t(55416),u=t(93334),i=t(69797);async function d(){try{let e=await (0,i.UL)(),r=e.get("customerAccessToken")?.value;return r&&await (0,u.bc)(r),(await (0,i.UL)()).delete("customerAccessToken"),c.NextResponse.json({success:!0})}catch(e){return console.error("Logout error:",e),c.NextResponse.json({error:"Internal server error"},{status:500})}}let l=new o.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/auth/logout/route",pathname:"/api/auth/logout",filename:"route",bundlePath:"app/api/auth/logout/route"},resolvedPagePath:"C:\\Users\\lenovo\\Documents\\Builds\\ndb\\app\\api\\auth\\logout\\route.ts",nextConfigOutput:"",userland:s}),{workAsyncStorage:p,workUnitAsyncStorage:m,serverHooks:y}=l;function g(){return(0,a.patchFetch)({workAsyncStorage:p,workUnitAsyncStorage:m})}},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31321:()=>{},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},67769:()=>{},93334:(e,r,t)=>{"use strict";t.d(r,{ff:()=>A,tr:()=>I,d$:()=>T,Sh:()=>v,bc:()=>S,Xe:()=>k});let s=`
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
`,n=`
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
`,a=`
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
`,c=`
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
`,u=`
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
`,i=`
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
`,d=process.env.SHOPIFY_STORE_DOMAIN?process.env.SHOPIFY_STORE_DOMAIN.includes("://")?process.env.SHOPIFY_STORE_DOMAIN.replace(/\/$/,""):`https://${process.env.SHOPIFY_STORE_DOMAIN.replace(/\/$/,"")}`:null;d||console.warn("SHOPIFY_STORE_DOMAIN is not defined in environment variables.");let l=d?`${d}/api/2026-04/graphql.json`:"",p=process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN||"";async function m({cache:e="no-store",headers:r,query:t,tags:s,variables:o}){try{let n=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Storefront-Access-Token":p,...r},body:JSON.stringify({...t&&{query:t},...o&&{variables:o}}),cache:e,...s&&{next:{tags:s}}}),a=await n.json();if(a.errors)throw a.errors[0];return{status:n.status,body:a}}catch(e){throw console.error("Error fetching from Shopify:",e),{error:e,query:t}}}p||console.warn("SHOPIFY_STOREFRONT_ACCESS_TOKEN is not defined in environment variables.");let y=e=>e.edges.map(e=>e?.node),g=e=>{if(!e)return e;let{images:r,variants:t,...s}=e;return{...s,images:y(r),variants:y(t)}},f=e=>{let r=[];for(let t of e)if(t){let e=g(t);e&&r.push(e)}return r},h=e=>e?{...e,lines:y(e.lines)}:e;async function T({query:e,reverse:r,sortKey:t,first:s=100}){return f(y((await m({query:o,tags:["products"],variables:{query:e,reverse:r,sortKey:t,first:s}})).body.data.products))}async function v(e){let r=(await m({query:a,variables:{input:e},cache:"no-store"})).body.data.customerAccessTokenCreate;return r.customerUserErrors&&r.customerUserErrors.length>0?{errors:r.customerUserErrors}:r.customerAccessToken}async function S(e){return!(await m({query:c,variables:{customerAccessToken:e},cache:"no-store"})).body.data.customerAccessTokenDelete.userErrors.length}async function A(e){let r=(await m({query:u,variables:{input:e},cache:"no-store"})).body.data.customerCreate;return r.customerUserErrors&&r.customerUserErrors.length>0?{errors:r.customerUserErrors}:r.customer}async function I(e){return(await m({query:n,variables:{customerAccessToken:e},cache:"no-store"})).body.data.customer||null}async function k(e,r,t){return h((await m({query:i,variables:{cartId:e,buyerIdentity:{customerAccessToken:r,email:t}},cache:"no-store"})).body.data.cartBuyerIdentityUpdate.cart)}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[907,754,797],()=>t(13324));module.exports=s})();