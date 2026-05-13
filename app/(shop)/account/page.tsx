import { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCustomerDetails } from '@/lib/shopify';
import { Package, Heart, User, ChevronRight, ShoppingBag, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LogoutButton from './logout-button';

export const metadata: Metadata = {
  title: 'My Account | Naaz Book Depot',
  description: 'Manage your profile and orders.',
};

export default async function AccountPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('customerAccessToken')?.value;

  if (!accessToken) {
    redirect('/'); // Or to a login page if you have one, but currently we use a modal
  }

  const customer = await getCustomerDetails(accessToken);

  if (!customer) {
    redirect('/');
  }

  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
    }).format(parseFloat(amount));
  };

  const orders = customer.orders?.edges?.map((edge: any) => edge.node) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-6">
          <div className="p-6 rounded-3xl bg-[var(--islamic-green)] text-white shadow-xl shadow-[var(--islamic-green)]/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl uppercase">
                {customer.firstName[0]}{customer.lastName[0]}
              </div>
              <div>
                <p className="font-bold">{customer.firstName} {customer.lastName}</p>
                <p className="text-xs text-white/70 truncate">{customer.email}</p>
              </div>
            </div>
            <hr className="border-white/10 my-4" />
            <div className="space-y-1">
              <Link href="/account" className="flex items-center gap-3 p-2 rounded-xl bg-white/10 font-medium">
                <User size={18} /> Account Overview
              </Link>
              <Link href="/wishlist" className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors">
                <Heart size={18} /> My Wishlist
              </Link>
              <Link href="/account/addresses" className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors">
                <MapPin size={18} /> Address Book
              </Link>
              <LogoutButton />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
            <h3 className="font-bold text-[var(--islamic-green)] mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/books" className="text-gray-600 hover:text-[var(--islamic-gold)] transition-colors">Browse Books</Link></li>
              <li><Link href="/atar" className="text-gray-600 hover:text-[var(--islamic-gold)] transition-colors">Premium Atars</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-[var(--islamic-gold)] transition-colors">Support</Link></li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-10">
          <header>
            <h1 className="text-4xl font-headings font-bold text-[var(--islamic-green)]">Ahlan, {customer.firstName}!</h1>
            <p className="text-gray-500 mt-2">Welcome to your personal dashboard. Track your spiritual journey and orders here.</p>
          </header>

          {/* Statistics / Summary */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
                <ShoppingBag size={20} />
              </div>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-black">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <div className="p-6 rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-4">
                <Heart size={20} />
              </div>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-black">Wishlist Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {customer.wishlist ? JSON.parse(customer.wishlist.value).length : 0}
              </p>
            </div>
            <div className="p-6 rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                <User size={20} />
              </div>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-black">Member Status</p>
              <p className="text-2xl font-bold text-gray-900">Active</p>
            </div>
          </section>

          {/* Recent Orders */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-headings font-bold text-[var(--islamic-green)] flex items-center gap-2">
                <Package className="text-[var(--islamic-gold)]" /> Recent Orders
              </h2>
            </div>

            {orders.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {orders.map((order: any) => (
                  <Link 
                    key={order.id} 
                    href={`/account/orders/${order.id.split('/').pop()}`}
                    className="group p-6 rounded-3xl border border-gray-100 bg-white hover:border-[var(--islamic-gold)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-lg text-gray-900 group-hover:text-[var(--islamic-green)] transition-colors">Order #{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">Placed on {new Date(order.processedAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatPrice(order.currentTotalPrice.amount, order.currentTotalPrice.currencyCode)}</p>
                        <p className="text-xs text-gray-500">{order.lineItems.edges.length} items</p>
                      </div>
                      
                      <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                        {order.fulfillmentStatus.replace(/_/g, ' ')}
                      </div>
                      
                      <ChevronRight className="text-gray-300 group-hover:text-[var(--islamic-gold)] group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-3xl p-20 text-center border border-dashed border-gray-200">
                <p className="text-gray-500 italic mb-6">You haven&apos;t placed any orders yet.</p>
                <Button asChild className="bg-[var(--islamic-green)] text-white">
                  <Link href="/products">Start Shopping</Link>
                </Button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
