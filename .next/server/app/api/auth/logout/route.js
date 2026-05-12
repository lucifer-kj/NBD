(()=>{var e={};e.id=489,e.ids=[489],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},13324:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>g,routeModule:()=>l,serverHooks:()=>y,workAsyncStorage:()=>p,workUnitAsyncStorage:()=>m});var s={};t.r(s),t.d(s,{POST:()=>d});var o=t(72025),a=t(96198),n=t(73885),c=t(55416),u=t(93334),i=t(69797);async function d(e){try{let e=await (0,i.UL)(),r=e.get("customerAccessToken")?.value;return r&&await (0,u.bc)(r),(await (0,i.UL)()).delete("customerAccessToken"),c.NextResponse.json({success:!0})}catch(e){return console.error("Logout error:",e),c.NextResponse.json({error:"Internal server error"},{status:500})}}let l=new o.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/auth/logout/route",pathname:"/api/auth/logout",filename:"route",bundlePath:"app/api/auth/logout/route"},resolvedPagePath:"C:\\Users\\lenovo\\Documents\\Builds\\ndb\\app\\api\\auth\\logout\\route.ts",nextConfigOutput:"",userland:s}),{workAsyncStorage:p,workUnitAsyncStorage:m,serverHooks:y}=l;function g(){return(0,n.patchFetch)({workAsyncStorage:p,workUnitAsyncStorage:m})}},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31321:()=>{},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},67769:()=>{},93334:(e,r,t)=>{"use strict";t.d(r,{tr:()=>A,d$:()=>f,Sh:()=>T,bc:()=>v,Xe:()=>S});let s=`
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
`,a=`
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
`,n=`
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
`,i=process.env.SHOPIFY_STORE_DOMAIN?process.env.SHOPIFY_STORE_DOMAIN.includes("://")?process.env.SHOPIFY_STORE_DOMAIN:`https://${process.env.SHOPIFY_STORE_DOMAIN}`:"",d=`${i}/api/2024-01/graphql.json`,l=process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;async function p({cache:e="force-cache",headers:r,query:t,tags:s,variables:o}){try{let a=await fetch(d,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Storefront-Access-Token":l,...r},body:JSON.stringify({...t&&{query:t},...o&&{variables:o}}),cache:e,...s&&{next:{tags:s}}}),n=await a.json();if(n.errors)throw n.errors[0];return{status:a.status,body:n}}catch(e){throw console.error("Error fetching from Shopify:",e),{error:e,query:t}}}let m=e=>e.edges.map(e=>e?.node),y=e=>{if(!e)return e;let{images:r,variants:t,...s}=e;return{...s,images:m(r),variants:m(t)}},g=e=>{let r=[];for(let t of e)if(t){let e=y(t);e&&r.push(e)}return r},h=e=>e?{...e,lines:m(e.lines)}:e;async function f({query:e,reverse:r,sortKey:t,first:s=100}){return g(m((await p({query:o,tags:["products"],variables:{query:e,reverse:r,sortKey:t,first:s}})).body.data.products))}async function T(e){let r=(await p({query:n,variables:{input:e},cache:"no-store"})).body.data.customerAccessTokenCreate;return r.customerUserErrors&&r.customerUserErrors.length>0?{errors:r.customerUserErrors}:r.customerAccessToken}async function v(e){return!(await p({query:c,variables:{customerAccessToken:e},cache:"no-store"})).body.data.customerAccessTokenDelete.userErrors.length}async function A(e){return(await p({query:a,variables:{customerAccessToken:e},cache:"no-store"})).body.data.customer||null}async function S(e,r,t){return h((await p({query:u,variables:{cartId:e,buyerIdentity:{customerAccessToken:r,email:t}},cache:"no-store"})).body.data.cartBuyerIdentityUpdate.cart)}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[907,754,797],()=>t(13324));module.exports=s})();