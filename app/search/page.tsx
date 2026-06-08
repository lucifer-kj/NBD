import { Metadata } from 'next';
import SearchClient from './SearchClient';

export const metadata: Metadata = {
  title: 'Search Products | Naaz Book Depot',
  description: 'Search for authentic Quran editions, Islamic books, and premium fragrance blends on Naaz Book Depot.',
  robots: {
    index: false,
    follow: true, // Allow following links in search results, but do not index this query results page
  },
};

export default function SearchPage() {
  return <SearchClient />;
}