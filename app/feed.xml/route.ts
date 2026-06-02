import { NextResponse } from 'next/server';
import { getBlogPosts } from '@/lib/blog';
import { getProducts, getCollections } from '@/lib/shopify';
import { getProductUrl } from '@/lib/url-helper';

export const revalidate = 3600; // Cache the feed for 1 hour

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.naazbook.in';

  try {
    // Fetch posts, products, and collections in parallel with robust fallbacks
    const [posts, products, collections] = await Promise.all([
      Promise.resolve().then(() => getBlogPosts()).catch((err) => {
        console.error('Error fetching blog posts for RSS:', err);
        return [];
      }),
      getProducts({ first: 100 }).catch((err) => {
        console.error('Error fetching products for RSS:', err);
        return [];
      }),
      getCollections().catch((err) => {
        console.error('Error fetching collections for RSS:', err);
        return [];
      }),
    ]);

    // Interface for unified feed items
    interface FeedItem {
      title: string;
      link: string;
      description: string;
      pubDate: string;
      author?: string;
      category: string;
    }

    const feedItems: FeedItem[] = [];

    // 1. Map Blog Posts
    posts.forEach((post) => {
      feedItems.push({
        title: post.title,
        link: `${baseUrl}/blog/${post.slug}`,
        description: post.excerpt || post.tldr || '',
        pubDate: new Date(post.publishedAt || post.lastModified).toUTCString(),
        author: post.author || 'Naaz Editorial',
        category: 'Blog / Article',
      });
    });

    // 2. Map Products (Books and Attar)
    products.forEach((product) => {
      const isBook = product.tags?.some(tag => tag.toLowerCase().includes('book') || tag.toLowerCase().includes('quran'));
      const category = isBook ? 'Books' : 'Attar / Accessories';
      const formattedPrice = `₹${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}`;
      
      feedItems.push({
        title: `${product.title} (${formattedPrice})`,
        link: `${baseUrl}${getProductUrl(product)}`,
        description: product.description || `Buy authentic ${product.title} from Naaz Book Depot Kolkata. Price: ${formattedPrice}.`,
        pubDate: new Date(product.updatedAt || new Date()).toUTCString(),
        author: 'Naaz Book Depot',
        category: `Products / ${category}`,
      });
    });

    // 3. Map Collections
    collections.forEach((collection) => {
      feedItems.push({
        title: `${collection.title} Collection`,
        link: `${baseUrl}/collections/${collection.handle}`,
        description: `Explore the dynamic ${collection.title} collection at Naaz Book Depot, featuring traditional scholastic works and premium scents.`,
        pubDate: new Date(collection.updatedAt || new Date()).toUTCString(),
        author: 'Naaz Book Depot',
        category: 'Collections',
      });
    });

    // Sort feed items by pubDate descending (newest first)
    feedItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    // Generate RSS 2.0 XML
    const xmlItems = feedItems
      .map((item) => {
        return `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <description><![CDATA[${item.description}]]></description>
      <pubDate>${item.pubDate}</pubDate>
      <category><![CDATA[${item.category}]]></category>
      ${item.author ? `<author>${item.author}</author>` : ''}
    </item>`;
      })
      .join('');

    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Naaz Book Depot — Spiritual Insights & Premium Collections</title>
    <link>${baseUrl}</link>
    <description>Authentic Islamic books, translations (Kanzul Imaan), Quran editions, Tafsir commentary, Riyadh as-Salihin, premium non-alcoholic Attars, and handcrafted stands since 1967.</description>
    <language>en-US</language>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${xmlItems}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    // Return graceful minimal XML on failure
    const errorXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Naaz Book Depot</title>
    <link>${baseUrl}</link>
    <description>Feeds temporarily unavailable</description>
  </channel>
</rss>`;
    return new NextResponse(errorXml, {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
