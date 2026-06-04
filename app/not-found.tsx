import Link from 'next/link';
import { Search, Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-2xl w-full text-center space-y-12">
        <div className="relative inline-block">
          <span className="text-[120px] md:text-[200px] font-black text-gray-50 leading-none select-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white shadow-2xl flex items-center justify-center text-[var(--islamic-gold)]">
                <Search size={48} className="md:w-16 md:h-16" />
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-headings font-bold text-[var(--islamic-green)]">Lost in Translation</h1>
          <p className="text-lg text-gray-500 max-w-md mx-auto">
            The page you are looking for has either moved or never existed in our library.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Button 
            asChild
            className="bg-[var(--islamic-green)] hover:bg-[var(--islamic-green-dark)] text-white h-14 px-8 rounded-2xl text-lg font-bold gap-3 shadow-xl shadow-[var(--islamic-green)]/20"
          >
            <Link href="/">
              <Home size={20} />
              Return Home
            </Link>
          </Button>
          <Button 
            asChild
            variant="ghost"
            className="text-[var(--islamic-green)] h-14 px-8 rounded-2xl text-lg font-bold gap-2 hover:bg-[var(--islamic-green)]/5 group"
          >
            <Link href="/products">
              Explore Library
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
              <h3 className="font-bold text-[var(--islamic-green)] mb-2">Islamic Books</h3>
              <Link href="/books" className="text-sm text-gray-500 hover:text-[var(--islamic-gold)] transition-colors">Browse Collection →</Link>
           </div>
           <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
              <h3 className="font-bold text-[var(--islamic-green)] mb-2">Quran Stands</h3>
              <Link href="/products?search=rehal" className="text-sm text-gray-500 hover:text-[var(--islamic-gold)] transition-colors">Shop stands →</Link>
           </div>
           <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
              <h3 className="font-bold text-[var(--islamic-green)] mb-2">Spiritual Blog</h3>
              <Link href="/blog" className="text-sm text-gray-500 hover:text-[var(--islamic-gold)] transition-colors">Read Insights →</Link>
           </div>
        </div>
      </div>
    </div>
  );
}
