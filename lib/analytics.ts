/**
 * Utility functions for Google Analytics 4 (GA4) event tracking.
 * This ensures consistent event naming and structure for better reporting.
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Log page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Log specific events
export const event = ({ action, category, label, value, ...rest }: any) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
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

export const trackViewItem = (item: any) => {
  event({
    action: 'view_item',
    category: 'ecommerce',
    items: [item],
  });
};

export const trackAddToCart = (item: any) => {
  event({
    action: 'add_to_cart',
    category: 'ecommerce',
    items: [item],
  });
};

export const trackBeginCheckout = (items: any[]) => {
  event({
    action: 'begin_checkout',
    category: 'ecommerce',
    items,
  });
};

export const trackPurchase = ({ transaction_id, value, currency = 'INR', items }: { transaction_id: string, value: number, currency?: string, items: any[] }) => {
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
