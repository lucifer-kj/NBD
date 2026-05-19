/**
 * Utility functions for Google Analytics 4 (GA4) event tracking.
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

// Log page views
export const pageview = (url: string) => {
  const gtag = getGtag();
  if (gtag) {
    gtag('config', GA_MEASUREMENT_ID || '', {
      page_path: url,
    });
  }
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
 * Ecommerce Events (Standard GA4)
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
  event({
    action: 'view_item',
    category: 'ecommerce',
    items: [item],
  });
};

export const trackAddToCart = (item: GA4Item) => {
  event({
    action: 'add_to_cart',
    category: 'ecommerce',
    items: [item],
  });
};

export const trackBeginCheckout = (items: GA4Item[]) => {
  event({
    action: 'begin_checkout',
    category: 'ecommerce',
    items,
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
  event({
    action: 'purchase',
    category: 'ecommerce',
    transaction_id,
    value,
    currency,
    items,
  });
};

export const trackSearch = (search_term: string) => {
  event({
    action: 'search',
    category: 'engagement',
    search_term,
  });
};

export const trackLogin = (method: string = 'shopify') => {
  event({
    action: 'login',
    category: 'engagement',
    method,
  });
};

export const trackSignUp = (method: string = 'shopify') => {
  event({
    action: 'sign_up',
    category: 'engagement',
    method,
  });
};
