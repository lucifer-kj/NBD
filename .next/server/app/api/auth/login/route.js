(()=>{var e={};e.id=758,e.ids=[758],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31321:()=>{},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},67769:()=>{},93059:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>h,routeModule:()=>l,serverHooks:()=>y,workAsyncStorage:()=>p,workUnitAsyncStorage:()=>m});var s={};t.r(s),t.d(s,{POST:()=>d});var o=t(72025),a=t(96198),n=t(73885),c=t(55416),i=t(93334),u=t(69797);async function d(e){try{let{email:r,password:t,cartId:s}=await e.json();if(!r||!t)return c.NextResponse.json({error:"Email and password are required"},{status:400});let o=await (0,i.Sh)({email:r,password:t});if("errors"in o)return c.NextResponse.json({error:o.errors[0]?.message||"Invalid credentials"},{status:401});let{accessToken:a,expiresAt:n}=o;if((await (0,u.UL)()).set("customerAccessToken",a,{httpOnly:!0,secure:!0,sameSite:"lax",path:"/",expires:new Date(n)}),s)try{await (0,i.Xe)(s,a,r)}catch(e){console.error("Failed to link cart identity:",e)}return c.NextResponse.json({success:!0})}catch(e){return console.error("Login error:",e),c.NextResponse.json({error:"Internal server error"},{status:500})}}let l=new o.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/auth/login/route",pathname:"/api/auth/login",filename:"route",bundlePath:"app/api/auth/login/route"},resolvedPagePath:"C:\\Users\\lenovo\\Documents\\Builds\\ndb\\app\\api\\auth\\login\\route.ts",nextConfigOutput:"",userland:s}),{workAsyncStorage:p,workUnitAsyncStorage:m,serverHooks:y}=l;function h(){return(0,n.patchFetch)({workAsyncStorage:p,workUnitAsyncStorage:m})}},93334:(e,r,t)=>{"use strict";t.d(r,{ff:()=>O,tr:()=>k,oo:()=>T,d$:()=>A,Sh:()=>I,bc:()=>C,Xe:()=>x});let s=`
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
`,i=`
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
`,u=`
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
`,p=process.env.SHOPIFY_STORE_DOMAIN?process.env.SHOPIFY_STORE_DOMAIN.includes("://")?process.env.SHOPIFY_STORE_DOMAIN.replace(/\/$/,""):`https://${process.env.SHOPIFY_STORE_DOMAIN.replace(/\/$/,"")}`:null;p||console.warn("SHOPIFY_STORE_DOMAIN is not defined in environment variables.");let m=p?`${p}/api/2026-04/graphql.json`:"",y=process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN||"";async function h({cache:e="no-store",headers:r,query:t,tags:s,variables:o}){try{let a=await fetch(m,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Storefront-Access-Token":y,...r},body:JSON.stringify({...t&&{query:t},...o&&{variables:o}}),cache:e,...s&&{next:{tags:s}}}),n=await a.json();if(n.errors){let e=n.errors[0];throw Error(e.message||"Shopify API Error",{cause:e})}return{status:a.status,body:n}}catch(e){if(e instanceof Error)throw e;throw Error("Error fetching from Shopify",{cause:{error:e,query:t}})}}y||console.warn("SHOPIFY_STOREFRONT_ACCESS_TOKEN is not defined in environment variables.");let f=e=>e.edges.map(e=>e?.node),g=e=>{if(!e)return e;let{images:r,variants:t,...s}=e;return{...s,images:f(r),variants:f(t)}},v=e=>{let r=[];for(let t of e)if(t){let e=g(t);e&&r.push(e)}return r},S=e=>e?{...e,lines:f(e.lines)}:e;async function T(e){return g((await h({query:a,tags:["products",`product-${e}`],variables:{handle:e}})).body.data.product)}async function A({query:e,reverse:r,sortKey:t,first:s=100}){return v(f((await h({query:n,tags:["products"],variables:{query:e,reverse:r,sortKey:t,first:s}})).body.data.products))}async function I(e){let r=(await h({query:i,variables:{input:e},cache:"no-store"})).body.data.customerAccessTokenCreate;return r.customerUserErrors&&r.customerUserErrors.length>0?{errors:r.customerUserErrors}:r.customerAccessToken}async function C(e){return!(await h({query:u,variables:{customerAccessToken:e},cache:"no-store"})).body.data.customerAccessTokenDelete.userErrors.length}async function O(e){let r=(await h({query:d,variables:{input:e},cache:"no-store"})).body.data.customerCreate;return r.customerUserErrors&&r.customerUserErrors.length>0?{errors:r.customerUserErrors}:r.customer}async function k(e){return(await h({query:c,variables:{customerAccessToken:e},cache:"no-store"})).body.data.customer||null}async function x(e,r,t){return S((await h({query:l,variables:{cartId:e,buyerIdentity:{customerAccessToken:r,email:t}},cache:"no-store"})).body.data.cartBuyerIdentityUpdate.cart)}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[907,754,797],()=>t(93059));module.exports=s})();