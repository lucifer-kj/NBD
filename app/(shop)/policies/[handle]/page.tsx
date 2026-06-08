import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPolicies } from '@/lib/shopify';
import { Shield, ArrowLeft } from 'lucide-react';
import { OFFLINE_POLICIES } from '@/lib/offline-policies';
import { Policy } from '@/types/shopify';

interface PolicyPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export const revalidate = 86400; // Policies change rarely, cache for 24h

export async function generateStaticParams() {
  let policies: Policy[] = [];
  try {
    policies = await getPolicies();
  } catch (error) {
    console.error('Failed to fetch Shopify policies for static params, using fallbacks', error);
  }

  if (!policies || policies.length === 0) {
    return Object.keys(OFFLINE_POLICIES).map((handle) => ({
      handle,
    }));
  }

  return policies.map((policy) => ({
    handle: policy.handle,
  }));
}

export async function generateMetadata({ params }: PolicyPageProps) {
  const { handle } = await params;
  let policy;
  try {
    const policies = await getPolicies();
    policy = policies.find((p) => p.handle === handle);
  } catch (error) {
    console.error('Error fetching policies for metadata, using fallback', error);
  }
  
  if (!policy) {
    policy = OFFLINE_POLICIES[handle];
  }
  
  if (!policy) return { title: 'Policy Not Found' };

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!siteUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is required to generate policy metadata');
  }

  return {
    metadataBase: new URL(siteUrl),
    title: `${policy.title} | Naaz Book Depot`,
    description: `Read the official ${policy.title} of Naaz Book Depot, established 1967.`,
    alternates: {
      canonical: `/policies/${handle}`,
    },
  };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { handle } = await params;
  let policy;
  try {
    const policies = await getPolicies();
    policy = policies.find((p) => p.handle === handle);
  } catch (error) {
    console.error('Error fetching policies for page, using fallback', error);
  }

  if (!policy) {
    policy = OFFLINE_POLICIES[handle];
  }

  if (!policy) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!siteUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is required for policy schema generation');
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
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
        "name": policy.title,
        "item": `${siteUrl}/policies/${handle}`
      }
    ]
  };

  return (
    <div className="bg-[#FDFCFB] min-h-screen pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header Banner */}
      <section className="bg-[var(--islamic-green)] py-16 text-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl text-[var(--islamic-gold)]">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-headings font-bold">{policy.title}</h1>
              <p className="text-sm opacity-80 mt-1">Official store policy for Naaz Book Depot</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 mt-12 max-w-4xl">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <div 
            className="prose prose-lg prose-stone max-w-none 
              prose-headings:font-headings prose-headings:text-[var(--islamic-green)] prose-headings:font-bold
              prose-p:text-gray-600 prose-p:leading-relaxed
              prose-strong:text-[var(--islamic-green)]
              prose-ul:list-disc prose-ul:pl-6
              prose-ol:list-decimal prose-ol:pl-6"
            dangerouslySetInnerHTML={{ __html: policy.body }}
          />
        </div>
      </main>
    </div>
  );
}
