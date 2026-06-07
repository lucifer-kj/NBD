interface ProductUrlInput {
  tags?: string[];
  handle: string;
}

/**
 * Dynamically resolves the standard category route for a product based on its tags.
 */
export function getProductUrl(product: ProductUrlInput): string {
  const tags = product.tags?.map((t) => t.toLowerCase()) || [];
  
  if (tags.includes('books') || tags.includes('islamic books') || tags.includes('book')) {
    return `/books/${product.handle}`;
  }
  
  if (tags.includes('atar') || tags.includes('fragrance') || tags.includes('attar') || tags.includes('perfume') || tags.includes('perfumes')) {
    return `/atar/${product.handle}`;
  }
  
  return `/products/${product.handle}`;
}

export interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
  reviewer?: {
    name: string;
  };
}

/**
 * Fetches product reviews server-side directly from Judge.me API for SSR schema injection.
 */
export async function getProductReviewsServer(productId: string): Promise<Review[]> {
  const JUDGE_ME_API_TOKEN = process.env.JUDGE_ME_API_TOKEN;
  const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;

  if (!JUDGE_ME_API_TOKEN || !SHOP_DOMAIN) {
    return [];
  }

  const cleanShopDomain = SHOP_DOMAIN.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const numericalId = productId.includes('gid://') ? productId.split('/').pop() : productId;

  if (!numericalId) return [];

  try {
    const response = await fetch(
      `https://judge.me/api/v1/reviews?api_token=${JUDGE_ME_API_TOKEN}&shop_domain=${cleanShopDomain}&per_page=100`,
      {
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return (data.reviews || []).filter((review: { product_external_id?: number | string }) => 
      review.product_external_id?.toString() === numericalId.toString()
    );
  } catch (error) {
    console.error('Error fetching reviews server-side:', error);
    return [];
  }
}
