/**
 * Utility functions for Google Analytics 4 (GA4) and Meta Pixel + Conversions API (CAPI) event tracking.
 * This ensures consistent event naming and structure for better reporting.
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

type GTagFunction = (
  command: 'config' | 'event' | 'js',
  targetOrAction: string,
  params?: Record<string, unknown>
) => void;

const getGtag = (): GTagFunction | undefined => {
  if (typeof window !== 'undefined') {
    return (window as unknown as { gtag?: GTagFunction }).gtag;
  }
  return undefined;
};

// Get or create a persistent anonymous sessionId for Meta event matching
const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'server';
  let sid = sessionStorage.getItem('naaz_sid');
  if (!sid) {
    sid = `sid_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    sessionStorage.setItem('naaz_sid', sid);
  }
  return sid;
};

// Helper to track Meta Pixel and Conversions API (CAPI) events
export const trackMetaEvent = async (
  eventName: string,
  eventId: string,
  customData: Record<string, unknown> = {},
  userData: Record<string, unknown> = {}
) => {
  // 1. Client-side browser Meta Pixel
  if (typeof window !== 'undefined') {
    const fbq = (window as unknown as { fbq?: (action: string, eventName: string, customData?: Record<string, unknown>, options?: { eventID: string }) => void }).fbq;
    if (fbq) {
      fbq('track', eventName, customData, { eventID: eventId });
    }
  }

  // 2. Server-side Meta Conversions API (CAPI) proxy
  try {
    fetch('/api/capi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName,
        eventId,
        eventSourceUrl: typeof window !== 'undefined' ? window.location.href : '',
        customData,
        userData,
      }),
    });
  } catch (error) {
    console.error('Error sending Meta CAPI event:', error);
  }
};

// Log page views
export const pageview = (url: string) => {
  // GA4 PageView
  const gtag = getGtag();
  if (gtag) {
    gtag('config', GA_MEASUREMENT_ID || '', {
      page_path: url,
    });
  }

  // Meta Pixel & CAPI PageView
  const eventId = `PageView_${getSessionId()}_${Date.now()}`;
  trackMetaEvent('PageView', eventId);
};

export interface GTagEventParams {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}

// Log specific events
export const event = ({ action, category, label, value, ...rest }: GTagEventParams) => {
  const gtag = getGtag();
  if (gtag) {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...rest,
    });
  }
};

/**
 * Ecommerce Events (Standard GA4 & Meta Pixel / CAPI mapping)
 */

export interface GA4Item {
  item_id: string;
  item_name: string;
  price?: number;
  quantity?: number;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
  [key: string]: unknown;
}

export const trackViewItem = (item: GA4Item) => {
  // GA4
  event({
    action: 'view_item',
    category: 'ecommerce',
    items: [item],
  });

  // Meta
  const eventId = `ViewContent_${item.item_id}_${getSessionId()}_${Date.now()}`;
  trackMetaEvent('ViewContent', eventId, {
    content_ids: [item.item_id],
    content_type: 'product',
    value: item.price || 0,
    currency: 'INR',
    content_name: item.item_name,
    content_category: item.item_category,
  });
};

export const trackAddToCart = (item: GA4Item) => {
  // GA4
  event({
    action: 'add_to_cart',
    category: 'ecommerce',
    items: [item],
  });

  // Meta
  const eventId = `AddToCart_${item.item_id}_${getSessionId()}_${Date.now()}`;
  trackMetaEvent('AddToCart', eventId, {
    content_ids: [item.item_id],
    content_type: 'product',
    value: (item.price || 0) * (item.quantity || 1),
    currency: 'INR',
    content_name: item.item_name,
    contents: [{ id: item.item_id, quantity: item.quantity || 1 }],
  });
};

export const trackBeginCheckout = (items: GA4Item[]) => {
  // GA4
  event({
    action: 'begin_checkout',
    category: 'ecommerce',
    items,
  });

  // Meta
  const eventId = `InitiateCheckout_${getSessionId()}_${Date.now()}`;
  const totalValue = items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  trackMetaEvent('InitiateCheckout', eventId, {
    content_ids: items.map(item => item.item_id),
    content_type: 'product',
    value: totalValue,
    currency: 'INR',
    num_items: items.length,
    contents: items.map(item => ({ id: item.item_id, quantity: item.quantity || 1 })),
  });
};

export const trackPurchase = ({
  transaction_id,
  value,
  currency = 'INR',
  items,
}: {
  transaction_id: string;
  value: number;
  currency?: string;
  items: GA4Item[];
}) => {
  // GA4
  event({
    action: 'purchase',
    category: 'ecommerce',
    transaction_id,
    value,
    currency,
    items,
  });

  // Meta
  const eventId = `Purchase_${transaction_id}_${getSessionId()}_${Date.now()}`;
  trackMetaEvent('Purchase', eventId, {
    content_ids: items.map(item => item.item_id),
    content_type: 'product',
    value: value,
    currency: currency,
    num_items: items.length,
    contents: items.map(item => ({ id: item.item_id, quantity: item.quantity || 1 })),
  });
};

export const trackSearch = (search_term: string) => {
  // GA4
  event({
    action: 'search',
    category: 'engagement',
    search_term,
  });

  // Meta
  const eventId = `Search_${getSessionId()}_${Date.now()}`;
  trackMetaEvent('Search', eventId, {
    search_string: search_term,
  });
};

export const trackLogin = (method: string = 'shopify') => {
  // GA4
  event({
    action: 'login',
    category: 'engagement',
    method,
  });
};

export const trackSignUp = (method: string = 'shopify') => {
  // GA4
  event({
    action: 'sign_up',
    category: 'engagement',
    method,
  });

  // Meta
  const eventId = `CompleteRegistration_${getSessionId()}_${Date.now()}`;
  trackMetaEvent('CompleteRegistration', eventId, {
    status: true,
  });
};
