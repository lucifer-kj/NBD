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
  const debug = createDebug('getOrCreateShopifyCustomer');
  debug.step('start', 'getOrCreateShopifyCustomer initiated', { email, firstName });
  
  const password = generateDeterministicPassword(email);

  // Try to login first
  debug.step('login_attempt_1', 'Attempting first storefront customer login');
  let tokenObj = await loginShopifyCustomer(email, password);
  if (tokenObj) {
    debug.step('login_success_1', 'First login attempt succeeded (customer already existed with deterministic password)');
    await debug.commit(email);
    return tokenObj;
  }
  debug.step('login_failed_1', 'First login attempt failed (customer may not exist or has different password)');

  // Create the customer and retry
  try {
    debug.step('create_customer_attempt', 'Attempting storefront customer creation via mutations');
    const result = await createShopifyCustomer({ email, firstName, password });
    if (result && 'errors' in result) {
      debug.step('create_customer_errors', 'Storefront customer creation returned user errors', result.errors);
    } else {
      debug.step('create_customer_success', 'Storefront customer created successfully', { result });
    }
  } catch (e) {
    debug.error('create_customer_exception', e);
    await debug.commit(email);
    return null;
  }

  // Retry login after creation
  debug.step('login_attempt_2', 'Attempting second storefront customer login after creation');
  tokenObj = await loginShopifyCustomer(email, password);
  if (tokenObj) {
    debug.step('login_success_2', 'Second login attempt succeeded');
  } else {
    debug.step('login_failed_2', 'Second login attempt failed');
  }
  
  await debug.commit(email);
  return tokenObj;
}
