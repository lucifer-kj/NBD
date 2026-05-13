(()=>{var e={};e.id=758,e.ids=[758],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31321:()=>{},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},67769:()=>{},93059:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>f,routeModule:()=>l,serverHooks:()=>y,workAsyncStorage:()=>p,workUnitAsyncStorage:()=>m});var s={};t.r(s),t.d(s,{POST:()=>d});var o=t(72025),n=t(96198),a=t(73885),i=t(55416),c=t(93334),u=t(69797);async function d(e){try{let{email:r,password:t,cartId:s}=await e.json();if(!r||!t)return i.NextResponse.json({error:"Email and password are required"},{status:400});let o=await (0,c.Sh)({email:r,password:t});if("errors"in o)return i.NextResponse.json({error:o.errors[0]?.message||"Invalid credentials"},{status:401});let{accessToken:n,expiresAt:a}=o;if((await (0,u.UL)()).set("customerAccessToken",n,{httpOnly:!0,secure:!0,sameSite:"lax",path:"/",expires:new Date(a)}),s)try{await (0,c.Xe)(s,n,r)}catch(e){console.error("Failed to link cart identity:",e)}return i.NextResponse.json({success:!0})}catch(e){return console.error("Login error:",e),i.NextResponse.json({error:"Internal server error"},{status:500})}}let l=new o.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/auth/login/route",pathname:"/api/auth/login",filename:"route",bundlePath:"app/api/auth/login/route"},resolvedPagePath:"C:\\Users\\lenovo\\Documents\\Builds\\ndb\\app\\api\\auth\\login\\route.ts",nextConfigOutput:"",userland:s}),{workAsyncStorage:p,workUnitAsyncStorage:m,serverHooks:y}=l;function f(){return(0,a.patchFetch)({workAsyncStorage:p,workUnitAsyncStorage:m})}},93334:(e,r,t)=>{"use strict";t.d(r,{ff:()=>A,tr:()=>I,d$:()=>v,Sh:()=>T,bc:()=>S,Xe:()=>O});let s=`
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
`,c=`
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
`,d=process.env.SHOPIFY_STORE_DOMAIN?process.env.SHOPIFY_STORE_DOMAIN.includes("://")?process.env.SHOPIFY_STORE_DOMAIN.replace(/\/$/,""):`https://${process.env.SHOPIFY_STORE_DOMAIN.replace(/\/$/,"")}`:null;d||console.warn("SHOPIFY_STORE_DOMAIN is not defined in environment variables.");let l=d?`${d}/api/2026-04/graphql.json`:"",p=process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN||"";async function m({cache:e="no-store",headers:r,query:t,tags:s,variables:o}){try{let n=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Storefront-Access-Token":p,...r},body:JSON.stringify({...t&&{query:t},...o&&{variables:o}}),cache:e,...s&&{next:{tags:s}}}),a=await n.json();if(a.errors)throw a.errors[0];return{status:n.status,body:a}}catch(e){throw console.error("Error fetching from Shopify:",e),{error:e,query:t}}}p||console.warn("SHOPIFY_STOREFRONT_ACCESS_TOKEN is not defined in environment variables.");let y=e=>e.edges.map(e=>e?.node),f=e=>{if(!e)return e;let{images:r,variants:t,...s}=e;return{...s,images:y(r),variants:y(t)}},g=e=>{let r=[];for(let t of e)if(t){let e=f(t);e&&r.push(e)}return r},h=e=>e?{...e,lines:y(e.lines)}:e;async function v({query:e,reverse:r,sortKey:t,first:s=100}){return g(y((await m({query:o,tags:["products"],variables:{query:e,reverse:r,sortKey:t,first:s}})).body.data.products))}async function T(e){let r=(await m({query:a,variables:{input:e},cache:"no-store"})).body.data.customerAccessTokenCreate;return r.customerUserErrors&&r.customerUserErrors.length>0?{errors:r.customerUserErrors}:r.customerAccessToken}async function S(e){return!(await m({query:i,variables:{customerAccessToken:e},cache:"no-store"})).body.data.customerAccessTokenDelete.userErrors.length}async function A(e){let r=(await m({query:c,variables:{input:e},cache:"no-store"})).body.data.customerCreate;return r.customerUserErrors&&r.customerUserErrors.length>0?{errors:r.customerUserErrors}:r.customer}async function I(e){return(await m({query:n,variables:{customerAccessToken:e},cache:"no-store"})).body.data.customer||null}async function O(e,r,t){return h((await m({query:u,variables:{cartId:e,buyerIdentity:{customerAccessToken:r,email:t}},cache:"no-store"})).body.data.cartBuyerIdentityUpdate.cart)}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[907,754,797],()=>t(93059));module.exports=s})();