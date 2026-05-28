import React from 'react';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/blog';
import { getProduct } from '@/lib/shopify';
import { ReshapedProduct } from '@/types/shopify';
import { BlogLayout } from '@/components/blog/blog-layout';

interface BlogPostPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug.split('/'),
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const slugPath = slug.join('/');
  const post = getBlogPostBySlug(slugPath);
  
  if (!post) return { title: 'Post Not Found' };

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!siteUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is required to generate blog metadata');
  }

  return {
    metadataBase: new URL(siteUrl),
    title: `${post.title} | Naaz Book Depot`,
    description: post.excerpt,
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`,
    },
    openGraph: {
      images: post.image ? [post.image] : [],
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.lastModified,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const slugPath = slug.join('/');
  const post = getBlogPostBySlug(slugPath);

  if (!post) {
    notFound();
  }

  // Fetch all posts for the "Recent Articles" widget
  const allPosts = getBlogPosts();
  const recentPosts = allPosts.filter((p) => p.slug !== slugPath).slice(0, 3);

  // Extract all unique product handles embedded via shortcodes in the article content
  const shortcodeRegex = /\[\[product:([a-zA-Z0-9-_]+):(card|inline)\]\]/g;
  const inlineHandles: string[] = [];
  let match;
  while ((match = shortcodeRegex.exec(post.content)) !== null) {
    inlineHandles.push(match[1]);
  }

  // Combine recommended and inline handles, then deduplicate
  const allHandles = Array.from(new Set([
    ...(post.recommendedProducts || []),
    ...inlineHandles
  ]));

  // Fetch all products in parallel
  let fetchedProducts: ReshapedProduct[] = [];
  if (allHandles.length > 0) {
    try {
      const fetched = await Promise.all(
        allHandles.map(handle => getProduct(handle))
      );
      fetchedProducts = fetched.filter(Boolean) as ReshapedProduct[];
    } catch (err) {
      console.error('Error loading products for blog post:', err);
    }
  }

  // Build productMap lookup for instant rendering lookups
  const productMap = new Map<string, ReshapedProduct>();
  fetchedProducts.forEach(prod => {
    productMap.set(prod.handle, prod);
  });

  // Extract list of recommended products to show in the bottom section
  const recommendedProductsList = (post.recommendedProducts || [])
    .map(handle => productMap.get(handle))
    .filter(Boolean) as ReshapedProduct[];

  // Calculate article stats
  const wordCount = post.content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  // Generate Table of Contents items
  const headingLines = post.content.split('\n').filter(line => line.startsWith('#') || line.startsWith('##') || line.startsWith('###'));
  const headings = headingLines.map(line => {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim().replace(/\*\*|\[|\]\(.+?\)/g, ''); // strip markdown bold/links
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return { id, text, level };
    }
    return null;
  }).filter(Boolean) as { id: string; text: string; level: number }[];

  interface SchemaItem {
    "@type": string;
    "@id": string;
    about?: unknown[];
    [key: string]: unknown;
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!siteUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is required for blog schema generation');
  }

  // Graph Schema.org implementation (combining Breadcrumb + Article for search crawler optimization)
  const graphSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${siteUrl}/blog/${post.slug}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": siteUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": `${siteUrl}/blog`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": post.title,
            "item": `${siteUrl}/blog/${post.slug}`
          }
        ]
      },
      {
        "@type": "BlogPosting",
        "@id": `${siteUrl}/blog/${post.slug}#article`,
        "isPartOf": {
          "@type": "WebPage",
          "@id": `${siteUrl}/blog/${post.slug}`
        },
        "headline": post.title,
        "description": post.excerpt,
        "image": post.image ? `${siteUrl}${post.image}` : `${siteUrl}/Images/Books.jpeg`,
        "datePublished": post.publishedAt,
        "dateModified": post.lastModified,
        "author": {
          "@type": "Person",
          "name": post.author
        },
        "publisher": {
          "@type": "Organization",
          "name": "Naaz Book Depot",
          "url": siteUrl,
          "logo": {
            "@type": "ImageObject",
            "url": `${siteUrl}/Images/Logo.png`
          }
        },
        "mainEntityOfPage": `${siteUrl}/blog/${post.slug}`,
        "wordCount": wordCount,
        "timeRequired": `PT${readingTime}M`
      }
    ]
  } as {
    "@context": string;
    "@graph": SchemaItem[];
  };

  // Link product recommendations to Article schema mentions
  if (recommendedProductsList.length > 0) {
    const articleEntity = graphSchema["@graph"].find((item) => item["@type"] === "BlogPosting");
    if (articleEntity) {
      articleEntity.about = recommendedProductsList.map((prod) => ({
        "@type": "Product",
        "name": prod.title,
        "url": `${siteUrl}/products/${prod.handle}`,
        "image": prod.images?.[0]?.url || `${siteUrl}/Images/Books.jpeg`,
        "description": prod.description
      }));
    }
  }

  // Pushing dynamic FAQ Page schema for advanced search listing snippets
  if (post.faqs && post.faqs.length > 0) {
    graphSchema["@graph"].push({
      "@type": "FAQPage",
      "@id": `${siteUrl}/blog/${post.slug}#faq`,
      "mainEntity": post.faqs.map((faq) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    });
  }

  return (
    <BlogLayout
      post={post}
      recentPosts={recentPosts}
      headings={headings}
      productMap={productMap}
      recommendedProductsList={recommendedProductsList}
      wordCount={wordCount}
      readingTime={readingTime}
      graphSchema={graphSchema}
    />
  );
}
