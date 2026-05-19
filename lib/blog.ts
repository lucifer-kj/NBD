import fs from 'fs';
import path from 'path';

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  author: string;
  image?: string | null;
  tags?: string[];
  content: string;
  lastModified: string;
  tldr?: string;
  faqs?: { question: string; answer: string }[];
  recommendedProducts?: string[];
}

const postsDirectory = path.join(process.cwd(), 'content/blog');

export function getBlogPosts(): BlogPost[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      return getBlogPostData(fullPath, slug);
    });

  // Sort posts by date descending
  return allPostsData.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    if (fs.existsSync(fullPath)) {
      return getBlogPostData(fullPath, slug);
    }
    const fullPathMdx = path.join(postsDirectory, `${slug}.mdx`);
    if (fs.existsSync(fullPathMdx)) {
      return getBlogPostData(fullPathMdx, slug);
    }
    return null;
  } catch {
    return null;
  }
}

function getBlogPostData(fullPath: string, slug: string): BlogPost {
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const stat = fs.statSync(fullPath);
  const match = fileContents.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  interface RawMetadata {
    title?: string;
    excerpt?: string;
    publishedAt?: string;
    author?: string;
    image?: string | null;
    tags?: string[];
    tldr?: string;
    faqs?: string;
    recommendedProducts?: string[];
    [key: string]: string | string[] | null | undefined;
  }
  const metadata: RawMetadata = {};
  let content = fileContents;

  if (match) {
    const frontmatter = match[1];
    content = match[2];
    const lines = frontmatter.split('\n');
    lines.forEach((line) => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(':').trim().replace(/^['"]|['"]$/g, '');
        if (key === 'tags' || key === 'recommendedProducts') {
          try {
            metadata[key] = JSON.parse(value);
          } catch {
            metadata[key] = value.replace(/[\[\]]/g, '').split(',').map((t) => t.trim().replace(/^['"]|['"]$/g, ''));
          }
        } else {
          metadata[key] = value;
        }
      }
    });
  }

  // Parse FAQs if present in metadata as serialized JSON
  let faqsList: { question: string; answer: string }[] = [];
  if (metadata.faqs) {
    try {
      const parsed = JSON.parse(metadata.faqs);
      if (Array.isArray(parsed)) {
        faqsList = parsed.map((item: unknown) => {
          const faqItem = item as { question?: string; q?: string; answer?: string; a?: string };
          return {
            question: faqItem.question || faqItem.q || '',
            answer: faqItem.answer || faqItem.a || ''
          };
        }).filter(item => item.question && item.answer);
      }
    } catch {
      // Fail silently if metadata.faqs is not valid JSON
    }
  }

  return {
    slug,
    title: metadata.title || slug.replace(/-/g, ' '),
    excerpt: metadata.excerpt || '',
    publishedAt: metadata.publishedAt || stat.birthtime.toISOString(),
    author: metadata.author || 'Naaz Staff',
    image: metadata.image || null,
    tags: metadata.tags || [],
    content: content.trim(),
    lastModified: stat.mtime.toISOString(),
    tldr: metadata.tldr || metadata.excerpt || "Curated spiritual guidance and classic Islamic literature, authenticated and cataloged by Naaz Book Depot's editorial team since 1967.",
    faqs: faqsList.length > 0 ? faqsList : undefined,
    recommendedProducts: Array.isArray(metadata.recommendedProducts)
      ? metadata.recommendedProducts
      : (typeof metadata.recommendedProducts === 'string' && metadata.recommendedProducts
          ? (metadata.recommendedProducts as string).replace(/[\[\]]/g, '').split(',').map((t) => t.trim().replace(/^['"]|['"]$/g, ''))
          : undefined),
  };
}

