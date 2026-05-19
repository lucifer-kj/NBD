export interface OfflinePolicy {
  title: string;
  handle: string;
  body: string;
}

export const OFFLINE_POLICIES: Record<string, OfflinePolicy> = {
  'privacy-policy': {
    title: 'Privacy Policy',
    handle: 'privacy-policy',
    body: `
      <h2>1. Introduction</h2>
      <p>Welcome to <strong>Naaz Book Depot</strong>. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at <strong>contact@naazbook.in</strong> or visit us at <strong>1, Ismail Madani Lane, Kolkata, 700073</strong>.</p>
      
      <h2>2. Information We Collect</h2>
      <p>We collect personal information that you voluntarily provide to us when registering on the website, expressing an interest in obtaining information about us or our products and services, or otherwise contacting us.</p>
      <ul>
        <li><strong>Personal Data:</strong> Name, shipping address, billing address, phone number, email address, and payment preferences.</li>
        <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used, such as IP addresses, browser types, and page views.</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use personal information collected via our website for a variety of business purposes described below:</p>
      <ul>
        <li>To facilitate account creation and logon process.</li>
        <li>To fulfill and manage your orders, payments, returns, and exchanges.</li>
        <li>To send you administrative information, product updates, and promotional communications (if opted in).</li>
        <li>To protect our services from fraud and abuse.</li>
      </ul>

      <h2>4. Sharing Your Information</h2>
      <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. This includes trusted third parties like payment gateways (UPI, Instamojo) and delivery partners.</p>

      <h2>5. Security of Your Information</h2>
      <p>We use administrative, technical, and physical security measures to help protect your personal information. Since 1967, maintaining our customers' trust has been our core principle, and we strive to protect your data with the highest industry standards.</p>

      <h2>6. Contact Us</h2>
      <p>If you have questions or comments about this policy, you may contact us at:</p>
      <p><strong>Naaz Book Depot</strong><br />
      1, Ismail Madani Lane<br />
      Kolkata, West Bengal, 700073<br />
      India<br />
      Phone: +91-91634-31395<br />
      Email: support@naazbook.in</p>
    `
  },
  'refund-policy': {
    title: 'Refund Policy',
    handle: 'refund-policy',
    body: `
      <h2>1. Returns & Exchange</h2>
      <p>At <strong>Naaz Book Depot</strong>, customer satisfaction is our top priority. If you are not entirely satisfied with your purchase, we are here to help.</p>
      <p>We offer returns or exchanges within <strong>7 days</strong> of delivery. To be eligible for a return, the item must be unused, in the same condition that you received it, and in its original packaging.</p>

      <h2>2. Eligible Items for Return</h2>
      <ul>
        <li>Books with printing defects, missing pages, or severe transit damage.</li>
        <li>Incorrect product delivered (different book title, edition, or Attar scent).</li>
        <li>Unopened and unused premium Attar bottles with seal intact.</li>
      </ul>

      <h2>3. Non-Returnable Items</h2>
      <ul>
        <li>Items showing visible signs of wear, usage, or damage post-delivery.</li>
        <li>Products purchased during special clearance or promotional sales.</li>
      </ul>

      <h2>4. Refund Process</h2>
      <p>Once we receive your returned item, we will inspect it and notify you of the receipt. If your return is approved, we will initiate a refund to your original method of payment (or via UPI/Bank transfer for convenience) within <strong>5 to 7 working days</strong>.</p>

      <h2>5. Shipping Costs</h2>
      <p>You will be responsible for paying your own shipping costs for returning your item unless the return is due to our error (defective book, incorrect item). Shipping costs are non-refundable.</p>

      <h2>6. Contact Us</h2>
      <p>For any refund or return inquiries, please reach out to our support team on WhatsApp at <strong>+91-91634-31395</strong> or call us at <strong>033-2235-0051</strong>.</p>
    `
  },
  'shipping-policy': {
    title: 'Shipping Policy',
    handle: 'shipping-policy',
    body: `
      <h2>1. Shipping Locations & Delivery</h2>
      <p><strong>Naaz Book Depot</strong> ships authentic Islamic books, Qur'ans, and premium Attar across all states and Union Territories in <strong>India</strong>. We partner with reliable national courier services to ensure your orders reach you safely and promptly.</p>

      <h2>2. Shipping & Handling Time</h2>
      <ul>
        <li><strong>Processing Time:</strong> Orders are typically processed, verified, and dispatched within <strong>24 to 48 hours</strong> (excluding Sundays and public holidays).</li>
        <li><strong>Delivery Time:</strong> Standard delivery takes <strong>3 to 5 business days</strong> for metro cities, and <strong>5 to 7 business days</strong> for other regions. Remote areas may take up to 10 days.</li>
      </ul>

      <h2>3. Shipping Charges</h2>
      <p>Shipping charges are calculated at checkout based on the total weight of the books and products in your cart and your delivery pincode. We offer <strong>free shipping on orders above ₹1,000</strong> across India.</p>

      <h2>4. Tracking Your Order</h2>
      <p>Once your order is shipped, a shipping confirmation email containing your tracking ID and a tracking link will be sent to your registered email address or phone number. You can also track your order directly via WhatsApp support.</p>

      <h2>5. Damaged or Lost Shipments</h2>
      <p>If your package arrives damaged in transit, please take a photo of the package before opening it and contact us immediately. We will initiate a replacement shipment at no extra cost to you.</p>
    `
  },
  'terms-of-service': {
    title: 'Terms of Service',
    handle: 'terms-of-service',
    body: `
      <h2>1. Terms of Use</h2>
      <p>By accessing our website at <strong>www.naazbook.in</strong>, you agree to comply with and be bound by the following terms and conditions of use, which govern Naaz Book Depot's relationship with you in relation to this website.</p>

      <h2>2. Intellectual Property</h2>
      <p>All content, branding, logo designs, book cover designs, text, graphics, and layout on this website are the intellectual property of <strong>Naaz Book Depot</strong> (or respective authors/publishers) and are protected by applicable copyright and trademark laws. Reproducing any content without written permission is strictly prohibited.</p>

      <h2>3. Accuracy of Content & Product Details</h2>
      <p>We make every effort to display the colors, specifications, and details of our books and Attar as accurately as possible. However, we do not warrant that product descriptions, editions, cover designs, or other content are completely error-free or up-to-date. In case of discrepancies, please contact our support.</p>

      <h2>4. Pricing & Availability</h2>
      <p>Prices and availability of products on our storefront are subject to change without notice. We reserve the right to modify or discontinue any product, book title, or service at any time.</p>

      <h2>5. User Accounts & Security</h2>
      <p>When you create an account or verify your session via Shopify's New Customer Accounts (passwordless OTP), you are responsible for maintaining the confidentiality of your session and account details. You agree to accept responsibility for all activities that occur under your account.</p>

      <h2>6. Governing Law</h2>
      <p>These terms and conditions are governed by and construed in accordance with the laws of India, and any disputes will be subject to the exclusive jurisdiction of the courts in Kolkata, West Bengal.</p>
    `
  }
};
