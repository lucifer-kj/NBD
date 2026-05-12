export const SHOPIFY_GRAPHQL_API_ENDPOINT = '/api/2026-04/graphql.json';

export async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      attempt++;
      if (attempt === retries) throw error;
      // Wait for 1s before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Max retries reached');
}
