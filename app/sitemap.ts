import { MetadataRoute } from 'next';
import { getProducts, getCollections, getPolicies } from '@/lib/shopify';
import { getBlogPosts } from '@/lib/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use the environment variable if available, otherwise fallback to production URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '') 
    : 'https://www.naazbook.in';

  // 1. Static and Core Routes
  const staticRoutes = [
    '',
    '/about',
    '/search',
    '/cart',
    '/login',
    '/register',
    '/contact',
    '/faq',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Fetch all dynamic data in parallel with robust fallbacks
  const [products, collections, policies, blogPosts] = await Promise.all([
    getProducts({ first: 250 }).catch((error) => {
      console.error('Error fetching products for sitemap:', error);
      return [];
    }),
    getCollections().catch((error) => {
      console.error('Error fetching collections for sitemap:', error);
      return [];
    }),
    getPolicies().catch((error) => {
      console.error('Error fetching policies for sitemap:', error);
      return [];
    }),
    Promise.resolve().then(() => getBlogPosts()).catch((error) => {
      console.error('Error fetching blog posts for sitemap:', error);
      return [];
    }),
  ]);

  // 2. Dynamic Product Routes
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/products/${product.handle}`,
    lastModified: product.updatedAt 
      ? new Date(product.updatedAt).toISOString() 
      : new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 3. Dynamic Collection Routes
  const collectionRoutes = collections.map((collection) => ({
    url: `${baseUrl}/collections/${collection.handle}`,
    lastModified: collection.updatedAt
      ? new Date(collection.updatedAt).toISOString()
      : new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // 4. Dynamic Policy Routes
  const policyRoutes = policies.map((policy) => ({
    url: `${baseUrl}/policies/${policy.handle}`,
    lastModified: new Date().toISOString(), // Policies do not have updatedAt directly on standard Policy type
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  // 5. Dynamic Blog Post Routes (Local Markdown)
  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.lastModified 
      ? new Date(post.lastModified).toISOString() 
      : new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...productRoutes,
    ...collectionRoutes,
    ...policyRoutes,
    ...blogRoutes,
  ];
}

