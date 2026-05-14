/**
 * Cross-tab cart synchronization using BroadcastChannel API
 * with localStorage `storage` event fallback for older browsers.
 *
 * When a cart mutation succeeds in one tab, this broadcasts the event
 * so other tabs can rehydrate their cart state from Shopify.
 */

const CHANNEL_NAME = 'naaz-cart-sync';
const STORAGE_KEY = 'naaz-cart-sync-event';

type CartSyncMessage = {
  type: 'CART_UPDATED' | 'CART_CLEARED';
  cartId: string | null;
  timestamp: number;
};

type CartSyncListener = (message: CartSyncMessage) => void;

let channel: BroadcastChannel | null = null;
let listeners: CartSyncListener[] = [];
let initialized = false;

/**
 * Initialize the sync broadcaster. Safe to call multiple times —
 * only the first call sets up the channel.
 */
export function initCartSync() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  // Prefer BroadcastChannel (modern browsers)
  if ('BroadcastChannel' in window) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event: MessageEvent<CartSyncMessage>) => {
        listeners.forEach((fn) => fn(event.data));
      };
    } catch {
      // Fallback if BroadcastChannel throws (e.g., opaque origins)
      channel = null;
    }
  }

  // Fallback: listen for localStorage `storage` events
  // This fires in OTHER tabs when localStorage is written
  if (!channel) {
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const message: CartSyncMessage = JSON.parse(event.newValue);
        listeners.forEach((fn) => fn(message));
      } catch {
        // Ignore malformed messages
      }
    });
  }
}

/**
 * Broadcast a cart update to other tabs.
 * Call this after any successful cart mutation.
 */
export function broadcastCartUpdate(cartId: string | null, type: CartSyncMessage['type'] = 'CART_UPDATED') {
  const message: CartSyncMessage = {
    type,
    cartId,
    timestamp: Date.now(),
  };

  if (channel) {
    channel.postMessage(message);
  } else if (typeof window !== 'undefined') {
    // localStorage fallback — write triggers `storage` in other tabs
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(message));
    } catch {
      // Quota exceeded or private browsing — silently ignore
    }
  }
}

/**
 * Register a listener for cart sync events from other tabs.
 * Returns an unsubscribe function.
 */
export function onCartSync(listener: CartSyncListener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((fn) => fn !== listener);
  };
}

/**
 * Tear down the sync channel. Call on unmount if needed.
 */
export function destroyCartSync() {
  if (channel) {
    channel.close();
    channel = null;
  }
  listeners = [];
  initialized = false;
}
