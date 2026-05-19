import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCustomerDetailsById } from '@/lib/shopify/admin';
import { getSession } from '@/lib/session';
import { MailingAddress } from '@/types/shopify';
import { ChevronLeft } from 'lucide-react';
import AddressBook from '@/components/account/address-book';

export const metadata: Metadata = {
  title: 'Address Book | Naaz Book Depot',
  description: 'Manage your shipping and billing addresses.',
};

export default async function AddressesPage() {
  const session = await getSession();

  if (!session) {
    redirect('/');
  }

  const { customerId } = session as { customerId: string };

  let customer = null;
  if (customerId) {
    customer = await getCustomerDetailsById(customerId);
  }

  if (!customer) {
    redirect('/');
  }

  const addresses = (customer.addresses?.edges || []).map((edge: { node: MailingAddress }) => edge.node);
  const defaultAddressId = customer.defaultAddress?.id;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-6 hidden md:block">
           <Link href="/account" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--islamic-green)] mb-4 transition-colors">
            <ChevronLeft size={16} /> Back to Dashboard
          </Link>
          <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
            <h3 className="font-bold text-[var(--islamic-green)] mb-4">Account Settings</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/account" className="text-gray-600 hover:text-[var(--islamic-gold)] transition-colors">Profile Overview</Link></li>
              <li><Link href="/account/addresses" className="text-[var(--islamic-green)] font-bold">Address Book</Link></li>
              <li><Link href="/wishlist" className="text-gray-600 hover:text-[var(--islamic-gold)] transition-colors">My Wishlist</Link></li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <AddressBook 
            addresses={addresses} 
            defaultAddressId={defaultAddressId} 
          />
        </main>
      </div>
    </div>
  );
}
