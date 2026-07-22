# Naazbook.in — Shopify → n8n → Shiprocket Automated Fulfillment
## Node-by-Node Build Guide (n8n Self-Hosted)

> Validated against live docs in July 2026: Shopify Admin API (2025-10/2026-04), Shiprocket API v1, and self-hosted n8n v2.x behavior.

---

## 0. Read This First — 2026 Platform Changes That Affect This Build

**1. Shopify killed admin-created custom apps on Jan 1, 2026.**
You can no longer generate a permanent Admin API access token from *Settings → Apps → Develop apps* the old way. All new custom apps must be created through the **Shopify Dev Dashboard**. 

> ⚠️ **CRITICAL AUTH NOTE (2026):** Dev Dashboard custom apps use the OAuth 2.0 Client Credentials Grant. The generated access tokens are **short-lived (~24 hours)**. If your store token expires daily, you must implement a Token Refresh sub-workflow in n8n (similar to the Shiprocket Auth flow) to exchange your `client_id` and `client_secret` for a fresh token automatically, rather than hardcoding a static token. If your app is an older legacy custom app created before Jan 1, 2026, it retains its permanent `shpat_` token.

**2. Shopify REST Admin API is legacy.** GraphQL is required for all new integrations. This guide uses **GraphQL for all Shopify operations**, including order re-fetching, inventory checks, and fulfillment creation.

**3. `fulfillmentCreateV2` is deprecated.** In the modern GraphQL Admin API (2024-10 and newer), the `V2` suffix has been removed. Use **`fulfillmentCreate`** instead.

---

## 1. Prerequisites & Account Setup

### 1.1 Shopify App Configuration
1. Go to your Shopify Dev Dashboard (`partners.shopify.com`).
2. Create a new custom app tied to your store (`naazbook.myshopify.com`).
3. Under **Admin API Scopes**, select:
   - `read_orders`, `write_orders`
   - `read_fulfillments`, `write_fulfillments`
   - `read_inventory`, `write_inventory`
   - `read_products`
   - `read_customers`
4. Install the app on your store and copy the credentials:
   - **Client ID** and **Client Secret** (for token rotation if rotating)
   - **Admin Access Token** (starts with `shpat_` if using a legacy permanent token)
   - **Client Secret** (used as the Webhook signature key for HMAC verification)

### 1.2 Shopify Webhook Registration
Webhooks should be registered to point to your self-hosted n8n production webhook URL (e.g. `https://YOUR-N8N-DOMAIN/webhook/shopify-order-created`).
Required topics:
- `orders/create` (Triggers fulfillment flow)
- `orders/cancelled` (Triggers cancellation handler)
- `refunds/create` (Triggers refund handler)

---

## 2. n8n Instance Configuration

Ensure the following environment variables are set on your self-hosted instance (Oracle Cloud `.env` or container settings):
- `SHOPIFY_SHOP_DOMAIN` (e.g. `naazbook`)
- `SHOPIFY_CLIENT_SECRET` (Shopify webhook client secret for HMAC validation)
- `SHIPROCKET_EMAIL` (Shiprocket API user email)
- `SHIPROCKET_PASSWORD` (Shiprocket API user password)
- `SHIPROCKET_PICKUP_LOCATION` (Confirmed warehouse nickname)
- `FULFILLMENT_DELAY_MINUTES` (`15` - wait hold time)
- `DEFAULT_PARCEL_LENGTH_CM` (`20`)
- `DEFAULT_PARCEL_BREADTH_CM` (`15`)
- `DEFAULT_PARCEL_HEIGHT_CM` (`5`)
- `DEFAULT_PARCEL_WEIGHT_KG` (`0.5`)

---

## 3. Workflow 1: WF1-Order-Fulfillment

This is the main automation workflow. Build this on a single canvas using the following structure:

### 🟦 STAGE 1: Intake & HMAC Validation

#### Node 1: Webhook (Order Created)
- **Path:** `shopify-order-created`
- **HTTP Method:** `POST`
- **Response Mode:** `onReceived` (Acknowledge with 200 immediately)
- **Options:** Enable **Raw Body** (necessary for binary HMAC verification)

#### Node 1b: Webhook (Order Cancelled/Refunded)
- **Path:** `shopify-order-cancelled`
- **HTTP Method:** `POST`
- **Response Mode:** `onReceived`
- **Options:** Enable **Raw Body**

#### Node 2: Code (Verify HMAC)
- **Mode:** `Run Once for All Items`
- **Code:**
```javascript
const crypto = require('crypto');
const items = $input.all();
const secret = $env.SHOPIFY_CLIENT_SECRET;

if (!secret) {
  throw new Error('SHOPIFY_CLIENT_SECRET env variable is missing');
}

for (const item of items) {
  const headers = item.json.headers || {};
  const hmacHeader = headers['x-shopify-hmac-sha256'];
  
  if (!hmacHeader) {
    throw new Error('Missing x-shopify-hmac-sha256 header');
  }

  let rawBody = '';
  if (item.binary?.body) {
    // Correct binary body path in n8n Webhook raw mode
    rawBody = Buffer.from(item.binary.body.data, 'base64').toString();
  } else {
    rawBody = JSON.stringify(item.json.body);
  }

  const computed = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');

  const providedBuf = Buffer.from(hmacHeader, 'utf8');
  const computedBuf = Buffer.from(computed, 'utf8');

  const valid = providedBuf.length === computedBuf.length &&
    crypto.timingSafeEqual(providedBuf, computedBuf);

  if (!valid) {
    throw new Error('HMAC verification failed — unauthorized origin');
  }
}

return items;
```

#### Node 3: Code (Idempotency Check)
Prevents duplicate runs using n8n workflow static data with an automatic 7-day TTL cleanup to avoid memory leaks.
- **Mode:** `Run Once for All Items`
- **Code:**
```javascript
const staticData = $getWorkflowStaticData('global');
const orderId = $json.body?.id;
if (!orderId) return $input.all();

const key = `processed_${orderId}`;
const now = Date.now();
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days

// TTL cleanup of expired keys
for (const k of Object.keys(staticData)) {
  if (k.startsWith('processed_') && staticData[k].seenAt) {
    if (now - new Date(staticData[k].seenAt).getTime() > RETENTION_MS) {
      delete staticData[k];
    }
  }
}

if (staticData[key]) {
  return []; // Stop execution quietly (already processed)
}

staticData[key] = { seenAt: new Date().toISOString(), status: 'received' };
return $input.all();
```

#### Node 4: Set (Set Correlation ID)
- **Assignments:**
  - `correlation_id` (String): `={{ $json.body.order_number }}-{{ $execution.id }}`
  - `order_number` (String): `={{ $json.body.order_number }}`
  - `admin_graphql_api_id` (String): `={{ $json.body.admin_graphql_api_id }}`

#### Node 5: Google Sheets (Log Order Received)
- **Operation:** Append Row
- **Spreadsheet:** Select your spreadsheet
- **Sheet:** `OrderLog`
- **Columns:** Map `execution_id`, `order_number`, `stage` ("received"), `timestamp`, and `correlation_id`.

---

### 🟦 STAGE 2: 15-Minute Hold

#### Node 6: Wait
- **Amount:** `={{ $env.FULFILLMENT_DELAY_MINUTES || 15 }}`
- **Unit:** Minutes

#### Node 7: HTTP Request (Re-fetch Order)
GraphQL query to get fresh order state (cancellations, gateway names, line items unit price).
- **Method:** `POST`
- **URL:** `https://{{ $env.SHOPIFY_SHOP_DOMAIN }}.myshopify.com/admin/api/2025-10/graphql.json`
- **Authentication:** Predefined Credential Type (`shopifyApi`)
- **Body:**
```json
{
  "query": "query getOrder($id: ID!) { order(id: $id) { id name displayFinancialStatus displayFulfillmentStatus cancelledAt cancelReason paymentGatewayNames subtotalPriceSet { shopMoney { amount } } customer { firstName lastName email } shippingAddress { address1 address2 city province zip country phone } lineItems(first: 50) { nodes { id title quantity sku originalUnitPriceSet { shopMoney { amount } } variant { id price inventoryItem { id } } } } } }",
  "variables": { "id": "{{ $node[\"Set Correlation ID\"].json.admin_graphql_api_id }}" }
}
```

#### Node 8: Set (Extract Order Data)
Unwraps the GraphQL response wrapper immediately to avoid deep path complexity down the line.
- **Assignments:**
  - `order` (Object): `={{ $json.data.order }}`

---

### 🟦 STAGE 3: Validation

#### Node 9: IF (Cancelled or Refunded?)
- **Condition (OR):**
  - `{{ $json.order.cancelledAt }}` is not empty
  - `{{ $json.order.displayFinancialStatus }}` equals `REFUNDED`
- **True:** Connect to `Call WF2 Exception Handler` (Reason: "Order Cancelled/Refunded")
- **False:** Proceed

#### Node 10: IF (Shipping Address Complete?)
- **Condition (AND):** Verify `address1`, `city`, `zip`, and `country` are not empty.
- **False:** Connect to `Call WF2 Exception Handler` (Reason: "Invalid Shipping Address")
- **True:** Proceed

#### Node 11: Code (Validate PIN Code Format)
Checks for standard 6-digit Indian PIN codes.
- **Code:**
```javascript
const zip = $json.order.shippingAddress?.zip || '';
const valid = /^[1-9][0-9]{5}$/.test(zip.trim());
return [{
  json: {
    ...$json,
    pin_valid: valid
  }
}];
```

#### Node 12: IF (PIN Valid?)
- **Condition:** `{{ $json.pin_valid }}` is true.
- **False:** Connect to `Call WF2 Exception Handler` (Reason: "Invalid Pin Code")
- **True:** Proceed

#### Node 13: Code (Detect Payment Method)
Checks `paymentGatewayNames` for "cash on delivery" / "cod" or `displayFinancialStatus` for payment state.
- **Code:**
```javascript
const order = $json.order;
const gateways = order.paymentGatewayNames || [];
const isCOD = gateways.some(g => /cod|cash on delivery|manual/i.test(g));
const status = order.displayFinancialStatus;

let paymentMethod = 'Prepaid';
if (isCOD || status === 'PENDING') {
  paymentMethod = 'COD';
} else if (status === 'PAID') {
  paymentMethod = 'Prepaid';
} else {
  paymentMethod = 'Requires Review';
}

return [{
  json: {
    ...$json,
    payment_method: paymentMethod
  }
}];
```

#### Node 14: IF (Payment Status Allowed?)
- **Condition:** `{{ $json.payment_method }}` does not equal `Requires Review`.
- **False:** Connect to `Call WF2 Exception Handler` (Reason: "Payment Status Requires Review")
- **True:** Proceed

---

### 🟦 STAGE 4: Inventory & Partial Fulfillments

#### Node 15: Split Out (Split Out Line Items)
- **Field:** `order.lineItems.nodes`

#### Node 16: HTTP Request (Get Inventory Level)
- **Method:** `POST`
- **URL:** `https://{{ $env.SHOPIFY_SHOP_DOMAIN }}.myshopify.com/admin/api/2025-10/graphql.json`
- **Authentication:** Predefined Credential Type (`shopifyApi`)
- **Body:**
```json
{
  "query": "query getInventory($id: ID!) { inventoryItem(id: $id) { id inventoryLevels(first: 5) { nodes { location { id name } quantities(names: [\"available\"]) { name quantity } } } } }",
  "variables": { "id": "{{ $json.variant.inventoryItem.id }}" }
}
```

#### Node 17: Code (Determine Fulfillable Qty)
Reads paired items back from the Split Out node to verify stock against requested quantity.
- **Code:**
```javascript
const items = $input.all();
const processed = [];

for (let i = 0; i < items.length; i++) {
  const inventoryResponse = items[i].json;
  const lineItem = $('Split Out Line Items').all()[i].json;

  const available = inventoryResponse.data?.inventoryItem?.inventoryLevels?.nodes[0]?.quantities[0]?.quantity ?? 0;
  const requested = lineItem.quantity;
  const fulfillable = Math.min(available, requested);

  processed.push({
    json: {
      ...lineItem,
      available_qty: available,
      requested_qty: requested,
      fulfillable_qty: fulfillable,
      is_fully_available: available >= requested,
      is_partially_available: available > 0 && available < requested,
      is_unavailable: available <= 0
    }
  });
}

return processed;
```

#### Node 18: Aggregate (Aggregate Line Items)
Recombines split items back into a single array.
- **Aggregate How:** `allRows`
- **Destination Field Name:** `line_items`

#### Node 19: Code (Separate Fulfillable & Pending)
- **Code:**
```javascript
const aggregated = $input.first().json;
const items = aggregated.line_items || [];
const order = $('Extract Order').first().json.order;
const paymentMethod = $('Detect Payment Method').first().json.payment_method;

const fulfillable = [];
const pending = [];

for (const item of items) {
  if (item.fulfillable_qty > 0) {
    fulfillable.push(item);
  }
  if (item.fulfillable_qty < item.requested_qty) {
    pending.push({
      ...item,
      backorder_qty: item.requested_qty - item.fulfillable_qty
    });
  }
}

return [{
  json: {
    order,
    fulfillable_line_items: fulfillable,
    pending_line_items: pending,
    payment_method: paymentMethod
  }
}];
```

#### Node 20: IF (Any Fulfillable Items?)
- **Condition:** `{{ $json.fulfillable_line_items.length }}` is larger than 0.
- **False:** Connect to `Call WF2 Exception Handler` (Reason: "No Stock Available")
- **True:** Proceed. (If `pending_line_items.length > 0`, also call the sub-workflow in parallel with `waitForSubWorkflow: false` to log "Partial Fulfillment" without stopping execution).

---

### 🟦 STAGE 5: Shiprocket Shipping API

#### Node 21: Code (Check Cached Token)
- **Code:**
```javascript
const staticData = $getWorkflowStaticData('global');
const cached = staticData.shiprocket_token;
const now = Date.now();

if (cached && cached.expiresAt > now) {
  return [{ json: { ...$json, shiprocket_token: cached.token, needsTokenRefresh: false } }];
}
return [{ json: { ...$json, needsTokenRefresh: true } }];
```

#### Node 22: IF (Needs Refresh?)
- **Condition:** `{{ $json.needsTokenRefresh }}` is true.
- **True:** Proceed to login.
- **False:** Skip to Node 25.

#### Node 23: HTTP Request (Shiprocket Login)
- **Method:** `POST`
- **URL:** `https://apiv2.shiprocket.in/v1/external/auth/login`
- **Body:** `{ "email": "{{ $env.SHIPROCKET_EMAIL }}", "password": "{{ $env.SHIPROCKET_PASSWORD }}" }`

#### Node 24: Code (Cache Token)
- **Code:**
```javascript
const staticData = $getWorkflowStaticData('global');
staticData.shiprocket_token = {
  token: $json.token,
  expiresAt: Date.now() + (9 * 24 * 60 * 60 * 1000) // 9 Days (Expires in 10)
};
return [{ json: { ...$json, shiprocket_token: $json.token } }];
```

#### Node 25: Code (Duplicate Shipment Check)
Checks for pre-existing Shiprocket shipment IDs in global static data.
- **Code:**
```javascript
const staticData = $getWorkflowStaticData('global');
const orderName = $json.order.name;
const key = `shiprocket_shipment_${orderName}`;
const now = Date.now();
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

// TTL cleanup
for (const k of Object.keys(staticData)) {
  if (k.startsWith('shiprocket_shipment_') && staticData[k].createdAt) {
    if (now - new Date(staticData[k].createdAt).getTime() > RETENTION_MS) {
      delete staticData[k];
    }
  }
}

if (staticData[key]) {
  return [{ json: { ...$json, existing_shipment: staticData[key] } }];
}
return [{ json: { ...$json, existing_shipment: null } }];
```

#### Node 26: IF (Has Existing Shipment?)
- **Condition:** `{{ $json.existing_shipment }}` is not empty.
- **True:** Skip creation, map variables from `existing_shipment`, and proceed straight to AWB assignment.
- **False:** Proceed to phone normalization.

#### Node 27: Code (Normalize Phone Number)
Sanitizes phone input to meet Shiprocket's strict 10-digit requirements.
- **Code:**
```javascript
let phone = $json.order.shippingAddress?.phone || '';
phone = phone.replace(/[\s\-\(\)\+]/g, ''); // strip symbols
if (phone.startsWith('91') && phone.length === 12) {
  phone = phone.slice(2);
}

const valid = /^[6-9]\d{9}$/.test(phone);
return [{
  json: {
    ...$json,
    normalized_phone: phone,
    phone_valid: valid
  }
}];
```

#### Node 28: IF (Phone Valid?)
- **Condition:** `{{ $json.phone_valid }}` is true.
- **False:** Connect to `Call WF2 Exception Handler` (Reason: "Invalid Phone Number")
- **True:** Proceed

#### Node 29: HTTP Request (Create Shiprocket Order)
- **Method:** `POST`
- **URL:** `https://apiv2.shiprocket.in/v1/external/orders/create/adhoc`
- **Headers:** `Authorization: Bearer {{ $json.shiprocket_token }}`
- **Body:**
```json
{
  "order_id": "{{ $json.order.name }}",
  "order_date": "{{ $now.toFormat('yyyy-LL-dd HH:mm') }}",
  "pickup_location": "{{ $env.SHIPROCKET_PICKUP_LOCATION }}",
  "billing_customer_name": "{{ $json.order.customer.firstName }}",
  "billing_last_name": "{{ $json.order.customer.lastName }}",
  "billing_address": "{{ $json.order.shippingAddress.address1 }}",
  "billing_address_2": "{{ $json.order.shippingAddress.address2 }}",
  "billing_city": "{{ $json.order.shippingAddress.city }}",
  "billing_pincode": "{{ $json.order.shippingAddress.zip }}",
  "billing_state": "{{ $json.order.shippingAddress.province }}",
  "billing_country": "{{ $json.order.shippingAddress.country }}",
  "billing_email": "{{ $json.order.customer.email }}",
  "billing_phone": "{{ $json.normalized_phone }}",
  "shipping_is_billing": true,
  "order_items": "={{ $json.fulfillable_line_items.map(li => ({ name: li.title, sku: li.sku, units: li.fulfillable_qty, selling_price: li.variant?.price || li.originalUnitPriceSet?.shopMoney?.amount || 0 })) }}",
  "payment_method": "={{ $json.payment_method === 'COD' ? 'COD' : 'Prepaid' }}",
  "sub_total": "{{ $json.order.subtotalPriceSet.shopMoney.amount }}",
  "length": "{{ $env.DEFAULT_PARCEL_LENGTH_CM }}",
  "breadth": "{{ $env.DEFAULT_PARCEL_BREADTH_CM }}",
  "height": "{{ $env.DEFAULT_PARCEL_HEIGHT_CM }}",
  "weight": "{{ $env.DEFAULT_PARCEL_WEIGHT_KG }}"
}
```
- **Error Settings:** Enable `retryOnFail: true`, `maxTries: 3`, `waitBetweenTries: 5000`. Set `onError: "continueErrorOutput"`, connect error output to `Err: Shiprocket Order`.

#### Node 30: Code (Cache Shipment ID)
- **Code:**
```javascript
const staticData = $getWorkflowStaticData('global');
const key = `shiprocket_shipment_${$json.order_id}`;
staticData[key] = {
  shiprocket_order_id: $json.order_id,
  shipment_id: $json.shipment_id,
  createdAt: new Date().toISOString()
};
return [{ json: { ...$json, shipment_id: $json.shipment_id } }];
```

#### Node 31: HTTP Request (Assign Courier)
- **Method:** `POST`
- **URL:** `https://apiv2.shiprocket.in/v1/external/courier/assign/awb`
- **Headers:** `Authorization: Bearer {{ $json.shiprocket_token }}`
- **Body:** `{ "shipment_id": {{ $json.shipment_id }} }`
- **Error Settings:** Enable `retryOnFail: true`, `maxTries: 3`, `waitBetweenTries: 5000`. Set `onError: "continueErrorOutput"`, connect error output to `Err: Assign Courier`.

#### Node 32: HTTP Request (Generate Pickup)
- **Method:** `POST`
- **URL:** `https://apiv2.shiprocket.in/v1/external/courier/generate/pickup`
- **Headers:** `Authorization: Bearer {{ $json.shiprocket_token }}`
- **Body:** `{ "shipment_id": [{{ $json.shipment_id }}] }`
- **Error Settings:** Enable `retryOnFail: true`, `maxTries: 3`, `waitBetweenTries: 5000`. Set `onError: "continueErrorOutput"`, connect error output to `Err: Generate Pickup`.

---

### 🟦 STAGE 6: Shopify Fulfillment Sync

#### Node 33: HTTP Request (Get Fulfillment Order ID)
GraphQL fetch to locate the `OPEN` or `IN_PROGRESS` fulfillment order matching our Shopify order.
- **Method:** `POST`
- **URL:** `https://{{ $env.SHOPIFY_SHOP_DOMAIN }}.myshopify.com/admin/api/2025-10/graphql.json`
- **Authentication:** Predefined Credential Type (`shopifyApi`)
- **Body:**
```json
{
  "query": "query getFO($id: ID!) { order(id: $id) { fulfillmentOrders(first: 5) { nodes { id status lineItems(first: 50) { nodes { id sku totalQuantity } } } } } }",
  "variables": { "id": "{{ $json.order.id }}" }
}
```
- **Error Settings:** Enable `retryOnFail: true`, `maxTries: 3`, `waitBetweenTries: 5000`. Set `onError: "continueErrorOutput"`, connect error output to `Err: Get FO ID`.

#### Node 34: Code (Prepare Shopify Fulfillment)
Maps inventory item matches and resolves line items mapping between Shopify Order SKU and Fulfillment Order line items.
- **Code:**
```javascript
const foResponse = $json.data.order.fulfillmentOrders.nodes;
const fo = foResponse.find(n => n.status === 'OPEN' || n.status === 'IN_PROGRESS');

if (!fo) {
  throw new Error('No open fulfillment order found for this Shopify Order');
}

const foLineItems = fo.lineItems.nodes;
const fulfillable = $json.fulfillable_line_items || [];
const pending = $json.pending_line_items || [];

const lineItemsByFulfillmentOrder = {
  fulfillmentOrderId: fo.id
};

// Handle partial fulfillment mapping
if (pending.length > 0) {
  lineItemsByFulfillmentOrder.fulfillmentOrderLineItems = fulfillable.map(li => {
    const matchingFoLi = foLineItems.find(foLi => foLi.sku === li.sku);
    if (!matchingFoLi) {
      throw new Error(`Could not find SKU ${li.sku} in FulfillmentOrder`);
    }
    return {
      id: matchingFoLi.id,
      quantity: li.fulfillable_qty
    };
  });
}

return [{
  json: {
    ...$json,
    lineItemsByFulfillmentOrder: [lineItemsByFulfillmentOrder]
  }
}];
```

#### Node 35: HTTP Request (Create Shopify Fulfillment)
Uses the modern `fulfillmentCreate` mutation (no `V2` suffix).
- **Method:** `POST`
- **URL:** `https://{{ $env.SHOPIFY_SHOP_DOMAIN }}.myshopify.com/admin/api/2025-10/graphql.json`
- **Authentication:** Predefined Credential Type (`shopifyApi`)
- **Body:**
```json
{
  "query": "mutation fulfillmentCreate($fulfillment: FulfillmentInput!) { fulfillmentCreate(fulfillment: $fulfillment) { fulfillment { id status } userErrors { field message } } }",
  "variables": {
    "fulfillment": {
      "lineItemsByFulfillmentOrder": "{{ $json.lineItemsByFulfillmentOrder }}",
      "notifyCustomer": true,
      "trackingInfo": {
        "company": "{{ $json.response.body.response.data.courier_name || 'Shiprocket' }}",
        "number": "{{ $json.response.body.response.data.awb_code }}",
        "url": "https://naazbook.in/tracking?awb={{ $json.response.body.response.data.awb_code }}"
      }
    }
  }
}
```
- **Error Settings:** Enable `retryOnFail: true`, `maxTries: 3`, `waitBetweenTries: 5000`. Set `onError: "continueErrorOutput"`, connect error output to `Err: Create Fulfillment`.

#### Node 36: Code (Check UserErrors)
- **Code:**
```javascript
const errors = $json.data?.fulfillmentCreate?.userErrors || [];
if (errors.length > 0) {
  throw new Error(`Shopify fulfillment failed: ${errors.map(e => e.message).join(', ')}`);
}
return $input.all();
```
- **Error Settings:** Set `onError: "continueErrorOutput"`, connect error output to `Err: Check Fulfillment Errors`.

#### Node 37: Google Sheets (Log Success)
- **Operation:** Append Row
- **Spreadsheet:** Select your spreadsheet
- **Sheet:** `OrderLog`
- **Columns:** Map `order_number`, `awb_code`, `status` ("fulfilled"), `duration_ms`, `correlation_id`, `timestamp`.

---

## 4. Workflow 2: WF2-Retry-and-Exceptions

WF2 serves as the shared error sink and notifier. Because network nodes in WF1 have native retry enabled (`retryOnFail`), WF2 is only called for logic errors (e.g. invalid phone, malformed address, duplicate order) or persistent API crashes.

### Nodes

#### Node 1: Execute Workflow Trigger
Uses **Define Below** with these typed inputs:
- `reason` (String)
- `retryable` (Boolean)
- `severity` (String - info / warning / critical)
- `order_number` (String)
- `correlation_id` (String)
- `failed_node` (String)

#### Node 2: Google Sheets (Append to Manual Review Queue)
- **Operation:** Append Row
- **Sheet:** `ManualReviewQueue`
- **Columns:** `Order Number`, `Failure Reason`, `Node`, `Severity`, `Timestamp`, `Resolution Status` ("Open").

#### Node 3: Switch (Route by Severity)
- **dataType:** string
- **value1:** `={{ $json.severity }}`
- **Rules:**
  - `warning`
  - `critical`

#### Node 4a: Slack Node (Warning Alerts)
- **Channel:** `#ops-fulfillment`
- **Text:** `⚠️ *Fulfillment Exception Logged* | Order: #{{ $json.order_number }} | Node: {{ $json.failed_node }} | Reason: {{ $json.reason }}`

#### Node 4b: Slack + Email Nodes (Critical Alerts)
- **Slack Message:** `🚨 *CRITICAL FULFILLMENT ERROR* | Order: #{{ $json.order_number }} | Node: {{ $json.failed_node }} | Reason: {{ $json.reason }} | Escalation required immediately.`
- **Email Subject:** `[CRITICAL] Naazbook Fulfillment Failure - Order #{{ $json.order_number }}`
- **Email Message:** Full debug details containing correlation ID and stack details.
