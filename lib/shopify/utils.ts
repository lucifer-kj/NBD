export const SHOPIFY_GRAPHQL_API_ENDPOINT = '/api/2026-04/graphql.json';

/**
 * Status codes that are safe to retry (transient failures).
 * 429 = rate limited, 5xx = server errors.
 * Never retry 4xx (client errors) — those won't resolve on retry.
 */
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

/**
 * Fetch with exponential backoff and jitter.
 * Only retries on network errors or retryable HTTP status codes.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  baseDelayMs = 1000
): Promise<Response> {
  let attempt = 0;

  while (attempt < retries) {
    try {
      const response = await fetch(url, options);

      // Don't retry on non-retryable HTTP errors (e.g., 400, 401, 404)
      if (!response.ok && !RETRYABLE_STATUS_CODES.has(response.status)) {
        return response; // Let the caller handle the error body
      }

      if (response.ok) {
        return response;
      }

      // Retryable status code — fall through to retry logic
      throw new Error(`HTTP ${response.status}: retryable`);
    } catch (error) {
      attempt++;
      if (attempt >= retries) throw error;

      // Exponential backoff with jitter: 1s, 2s, 4s + random 0-500ms
      const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 500;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries reached');
}
