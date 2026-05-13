(()=>{var e={};e.id=673,e.ids=[673],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31321:()=>{},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},67769:()=>{},86600:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>f,routeModule:()=>l,serverHooks:()=>y,workAsyncStorage:()=>m,workUnitAsyncStorage:()=>p});var s={};t.r(s),t.d(s,{GET:()=>d});var o=t(72025),n=t(96198),a=t(73885),u=t(55416),c=t(93334),i=t(69797);async function d(){try{let e=await (0,i.UL)(),r=e.get("customerAccessToken")?.value;if(!r)return u.NextResponse.json({user:null},{status:200});let t=await (0,c.tr)(r);if(!t){let e=u.NextResponse.json({user:null},{status:200});return e.cookies.delete("customerAccessToken"),e}return u.NextResponse.json({user:t})}catch(e){return console.error("Get current user error:",e),u.NextResponse.json({error:"Internal server error"},{status:500})}}let l=new o.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/auth/me/route",pathname:"/api/auth/me",filename:"route",bundlePath:"app/api/auth/me/route"},resolvedPagePath:"C:\\Users\\lenovo\\Documents\\Builds\\ndb\\app\\api\\auth\\me\\route.ts",nextConfigOutput:"",userland:s}),{workAsyncStorage:m,workUnitAsyncStorage:p,serverHooks:y}=l;function f(){return(0,a.patchFetch)({workAsyncStorage:m,workUnitAsyncStorage:p})}},93334:(e,r,t)=>{"use strict";t.d(r,{ff:()=>k,tr:()=>E,oo:()=>A,d$:()=>S,Sh:()=>I,bc:()=>C,Xe:()=>$});let s=`
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
`,n=`
  query getProduct($handle: String!) {
    product(handle: $handle) {
      ...product
    }
  }
  ${s}
`,a=`
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
`,u=`
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
`,c=`
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
`,m=process.env.SHOPIFY_STORE_DOMAIN?process.env.SHOPIFY_STORE_DOMAIN.includes("://")?process.env.SHOPIFY_STORE_DOMAIN.replace(/\/$/,""):`https://${process.env.SHOPIFY_STORE_DOMAIN.replace(/\/$/,"")}`:null;m||console.warn("SHOPIFY_STORE_DOMAIN is not defined in environment variables.");let p=m?`${m}/api/2026-04/graphql.json`:"",y=process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN||"";async function f({cache:e="no-store",headers:r,query:t,tags:s,variables:o}){try{let n=await fetch(p,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Storefront-Access-Token":y,...r},body:JSON.stringify({...t&&{query:t},...o&&{variables:o}}),cache:e,...s&&{next:{tags:s}}}),a=await n.json();if(a.errors){let e=a.errors[0];throw Error(e.message||"Shopify API Error",{cause:e})}return{status:n.status,body:a}}catch(e){if(e instanceof Error)throw e;throw Error("Error fetching from Shopify",{cause:{error:e,query:t}})}}y||console.warn("SHOPIFY_STOREFRONT_ACCESS_TOKEN is not defined in environment variables.");let h=e=>e.edges.map(e=>e?.node),g=e=>{if(!e)return e;let{images:r,variants:t,...s}=e;return{...s,images:h(r),variants:h(t)}},v=e=>{let r=[];for(let t of e)if(t){let e=g(t);e&&r.push(e)}return r},T=e=>e?{...e,lines:h(e.lines)}:e;async function A(e){return g((await f({query:n,tags:["products",`product-${e}`],variables:{handle:e}})).body.data.product)}async function S({query:e,reverse:r,sortKey:t,first:s=100}){return v(h((await f({query:a,tags:["products"],variables:{query:e,reverse:r,sortKey:t,first:s}})).body.data.products))}async function I(e){let r=(await f({query:c,variables:{input:e},cache:"no-store"})).body.data.customerAccessTokenCreate;return r.customerUserErrors&&r.customerUserErrors.length>0?{errors:r.customerUserErrors}:r.customerAccessToken}async function C(e){return!(await f({query:i,variables:{customerAccessToken:e},cache:"no-store"})).body.data.customerAccessTokenDelete.userErrors.length}async function k(e){let r=(await f({query:d,variables:{input:e},cache:"no-store"})).body.data.customerCreate;return r.customerUserErrors&&r.customerUserErrors.length>0?{errors:r.customerUserErrors}:r.customer}async function E(e){return(await f({query:u,variables:{customerAccessToken:e},cache:"no-store"})).body.data.customer||null}async function $(e,r,t){return T((await f({query:l,variables:{cartId:e,buyerIdentity:{customerAccessToken:r,email:t}},cache:"no-store"})).body.data.cartBuyerIdentityUpdate.cart)}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[907,754,797],()=>t(86600));module.exports=s})();