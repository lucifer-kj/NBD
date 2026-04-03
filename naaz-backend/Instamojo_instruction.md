# AI Agent Instruction Protocol: Instamojo Integration

## 1. System Context & Environment
Your objective is to integrate the Instamojo Payment Gateway between a Next.js frontend and a Python Django REST Framework backend. 
- **Currency & Time:** All transactions should default to `INR`. Ensure the Django backend `settings.py` is configured with `TIME_ZONE = 'Asia/Kolkata'` to ensure local payment timestamps align correctly in the database.
- **Environment Variables:** Require the developer to provide `INSTAMOJO_API_KEY`, `INSTAMOJO_AUTH_TOKEN`, `INSTAMOJO_SALT`, and `INSTAMOJO_ENV` (Sandbox vs. Production) in the backend `.env` file. The same keys are often named `CONSUMER_KEY` / `CONSUMER_SECRET` in the Instamojo dashboard — this project accepts either naming (see `.env.example`).

## 2. Phase 1: Django Backend Configuration (Python)
### Step 2.1: Payment Generation Endpoint
- **Route:** Create a secure endpoint (`POST /api/payments/create/`).
- **Logic:**
  1. Receive the checkout payload (cart total, buyer name, email, phone) from Next.js.
  2. Send a POST request to Instamojo's `/api/1.1/payment-requests/` endpoint using the `requests` library.
  3. **Required Fields:** `amount`, `purpose`, `buyer_name`, `email`, `phone`, `redirect_url` (the Next.js success page), and `webhook` (the Django server webhook URL).
  4. **Headers:** Pass `X-Api-Key` and `X-Auth-Token`.
  5. **Response:** Extract the `payment_request.longurl` from the Instamojo response and return it to the Next.js frontend.

### Step 2.2: The Webhook Endpoint (Critical for Security)
- **Route:** Create a public, CSRF-exempt endpoint (`POST /api/payments/webhook/`).
- **Security Protocol:** Instamojo will ping this URL when a payment completes. You must verify the authenticity of this ping.
  1. Instamojo includes a `mac` field in the `POST` data.
  2. Extract all POST fields except `mac`.
  3. Sort the keys alphabetically, join their corresponding values with a pipe (`|`), and generate an HMAC-SHA1 signature using the `INSTAMOJO_SALT`.
  4. Compare the generated signature with the received `mac`. 
  5. If valid and `status == "Credit"`, update the order in the Django database to "Paid". Return a `200 OK` status to Instamojo.

## 3. Phase 2: Next.js Frontend Configuration
### Step 3.1: The Checkout Component
- **Logic:**
  1. Collect the user's cart details.
  2. Trigger a fetch request to the Django `/api/payments/create/` endpoint.
  3. Await the response containing the Instamojo `longurl`.
  4. Execute a standard browser redirect (`window.location.href = longurl`) to send the user to Instamojo's secure checkout environment.

### Step 3.2: The Redirection & Success Page
- **Route:** Create a specific route matching the backend's `redirect_url` (e.g., `/payment/success`).
- **Logic:**
  1. When Instamojo redirects the user back, it appends `payment_id`, `payment_status`, and `payment_request_id` as URL search parameters.
  2. Use Next.js `useSearchParams()` to extract these values.
  3. Render the UI based on `payment_status` (e.g., display a success checkmark if "Credit").
  4. Silently trigger a verification GET request to the Django backend using the `payment_request_id` to ensure the frontend state perfectly matches the database state before clearing the local cart.