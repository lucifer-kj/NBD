import { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getOrder } from '@/lib/shopify';
import { ChevronLeft, Package, MapPin, CreditCard, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Order Details | Naaz Book Depot',
};

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('customerAccessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }

  const order = await getOrder(accessToken, id);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
        <Button asChild>
          <Link href="/account">Back to Account</Link>
        </Button>
      </div>
    );
  }

  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
    }).format(parseFloat(amount));
  };

  const statusColors: Record<string, string> = {
    FULFILLED: 'bg-emerald-100 text-emerald-700',
    UNFULFILLED: 'bg-amber-100 text-amber-700',
    PARTIALLY_FULFILLED: 'bg-blue-100 text-blue-700',
    PAID: 'bg-emerald-100 text-emerald-700',
    PENDING: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <Link href="/account" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--islamic-green)] mb-8 transition-colors">
        <ChevronLeft size={16} /> Back to Account
      </Link>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-headings font-bold text-[var(--islamic-green)]">Order #{order.orderNumber}</h1>
          <p className="text-gray-500 flex items-center gap-2 mt-1">
            <Clock size={14} /> Placed on {new Date(order.processedAt).toLocaleDateString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>
        <div className="flex gap-3">
          <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[order.fulfillmentStatus || ''] || 'bg-gray-100'}`}>
            Fulfillment: {(order.fulfillmentStatus || 'UNFULFILLED').replace(/_/g, ' ')}
          </div>
          <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[order.financialStatus || ''] || 'bg-gray-100'}`}>
            Payment: {order.financialStatus || 'PENDING'}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--islamic-green)] mb-6 flex items-center gap-2">
              <Package size={20} className="text-[var(--islamic-gold)]" /> Items Ordered
            </h2>
            <div className="divide-y divide-gray-100">
              {order.lineItems.edges.map((edge: any, idx: number) => {
                const item = edge.node;
                return (
                  <div key={idx} className="py-6 flex gap-6 group">
                    <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                      <Image 
                        src={item.variant?.image?.url || '/Images/p1.jpg'} 
                        alt={item.variant?.image?.altText || item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.variant?.product?.handle}`} className="font-bold text-gray-900 hover:text-[var(--islamic-green)] transition-colors line-clamp-2">
                        {item.title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatPrice(item.variant?.price.amount, item.variant?.price.currencyCode)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary & Address */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--islamic-green)] mb-6 flex items-center gap-2">
              <CreditCard size={20} className="text-[var(--islamic-gold)]" /> Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{order.subtotalPrice ? formatPrice(order.subtotalPrice.amount, order.subtotalPrice.currencyCode) : 'N/A'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{order.totalShippingPrice ? formatPrice(order.totalShippingPrice.amount, order.totalShippingPrice.currencyCode) : 'N/A'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{order.totalTax ? formatPrice(order.totalTax.amount, order.totalTax.currencyCode) : 'N/A'}</span>
              </div>
              <hr className="border-gray-50 my-2" />
              <div className="flex justify-between text-lg font-bold text-[var(--islamic-green)]">
                <span>Total</span>
                <span>{order.totalPrice ? formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode) : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--islamic-green)] mb-6 flex items-center gap-2">
              <MapPin size={20} className="text-[var(--islamic-gold)]" /> Shipping Address
            </h2>
            {order.shippingAddress ? (
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-bold text-gray-900">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.zip}</p>
                <p>{order.shippingAddress.province}, {order.shippingAddress.country}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No shipping address provided.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
