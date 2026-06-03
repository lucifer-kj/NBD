import { loginCustomer, createCustomer } from './index';
import { createDebug } from '@/lib/auth-debug';
import type { CustomerAccessToken } from '../../types/shopify';

export async function loginShopifyCustomer(email: string, password: string): Promise<CustomerAccessToken | null> {
  const debug = createDebug('loginShopifyCustomer');
  try {
    debug.step('start', 'Calling loginCustomer');
    const res = await loginCustomer({ email, password });
    debug.step('response', 'Received response from loginCustomer', { hasErrors: 'errors' in res });
    if ('errors' in res) {
      debug.step('user_errors', 'Shopify returned user errors', res.errors);
      return null;
    }
    if ('accessToken' in res) {
      debug.step('done', 'loginShopifyCustomer completed', { hasToken: true });
      return res as CustomerAccessToken;
    }
    return null;
  } catch (e) {
    debug.error('exception', e);
    return null;
  }
}

export async function createShopifyCustomer({ email, firstName, password }: { email: string; firstName?: string; password: string }) {
  const debug = createDebug('createShopifyCustomer');
  try {
    debug.step('start', 'Creating Shopify customer');
    const result = await createCustomer({ email, firstName, password });
    debug.step('created', 'createCustomer result', { result });
    return result;
  } catch (e) {
    debug.error('exception', e);
    throw e;
  }
}

export function generateDeterministicPassword(email: string) {
  const salt = process.env.SHOPIFY_OAUTH_SALT;
  if (!salt) {
    throw new Error('SHOPIFY_OAUTH_SALT is required in environment variables.');
  }
  return `${salt}_${Buffer.from(email).toString('base64')}`;
}

export async function getOrCreateShopifyCustomer({ email, firstName }: { email: string; firstName?: string }): Promise<CustomerAccessToken | null> {
  const password = generateDeterministicPassword(email);

  // Try to login first
  let tokenObj = await loginShopifyCustomer(email, password);
  if (tokenObj) return tokenObj;

  // Create the customer and retry
  try {
    await createShopifyCustomer({ email, firstName, password });
  } catch (e) {
    console.error('Failed to create Shopify customer during OAuth bridge:', e);
    return null;
  }

  // Retry login after creation
  tokenObj = await loginShopifyCustomer(email, password);
  return tokenObj;
}
