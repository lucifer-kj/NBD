"use client";

import React, { useState } from 'react';
import { Plus, Pencil, Trash2, MapPin, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  createAddressAction, 
  updateAddressAction, 
  deleteAddressAction, 
  updateDefaultAddressAction 
} from '@/lib/shopify/actions';
import { useRouter } from 'next/navigation';

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone: string;
}

interface AddressBookProps {
  addresses: Address[];
  defaultAddressId?: string;
}

export default function AddressBook({ addresses: initialAddresses, defaultAddressId: initialDefaultId }: AddressBookProps) {
  const [addresses] = useState(initialAddresses);
  const [defaultId, setDefaultId] = useState(initialDefaultId);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    province: '',
    zip: '',
    country: 'India',
    phone: ''
  });

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      address1: '',
      address2: '',
      city: '',
      province: '',
      zip: '',
      country: 'India',
      phone: ''
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleEdit = (address: Address) => {
    setFormData({
      firstName: address.firstName,
      lastName: address.lastName,
      address1: address.address1,
      address2: address.address2 || '',
      city: address.city,
      province: address.province,
      zip: address.zip,
      country: address.country,
      phone: address.phone || ''
    });
    setEditingId(address.id);
    setIsAdding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingId) {
        await updateAddressAction(editingId, formData);
      } else {
        await createAddressAction(formData);
      }
      router.refresh();
      resetForm();
    } catch (error) {
      console.error('Failed to save address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    setIsLoading(true);
    try {
      await deleteAddressAction(id);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    setIsLoading(true);
    try {
      await updateDefaultAddressAction(id);
      setDefaultId(id);
      router.refresh();
    } catch (error) {
      console.error('Failed to set default address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAdding || editingId) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={resetForm}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--islamic-green)] transition-colors"
        >
          <ChevronLeft size={16} /> Back to addresses
        </button>

        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <h2 className="text-2xl font-headings font-bold text-[var(--islamic-green)] mb-8">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">First Name</label>
                <Input 
                  required
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  className="rounded-xl border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Last Name</label>
                <Input 
                  required
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="rounded-xl border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Address Line 1</label>
              <Input 
                required
                value={formData.address1}
                onChange={e => setFormData({...formData, address1: e.target.value})}
                className="rounded-xl border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Address Line 2 (Optional)</label>
              <Input 
                value={formData.address2}
                onChange={e => setFormData({...formData, address2: e.target.value})}
                className="rounded-xl border-gray-200"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">City</label>
                <Input 
                  required
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  className="rounded-xl border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">State / Province</label>
                <Input 
                  required
                  value={formData.province}
                  onChange={e => setFormData({...formData, province: e.target.value})}
                  className="rounded-xl border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">PIN Code</label>
                <Input 
                  required
                  value={formData.zip}
                  onChange={e => setFormData({...formData, zip: e.target.value})}
                  className="rounded-xl border-gray-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Country</label>
                <Input 
                  required
                  value={formData.country}
                  onChange={e => setFormData({...formData, country: e.target.value})}
                  className="rounded-xl border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Phone Number</label>
                <Input 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="rounded-xl border-gray-200"
                  placeholder="+91 ..."
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-[var(--islamic-green)] text-white px-8 h-12 rounded-xl flex-1 md:flex-none"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? 'Update Address' : 'Save Address'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetForm}
                className="px-8 h-12 rounded-xl border-gray-200"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-headings font-bold text-[var(--islamic-green)]">Address Book</h1>
          <p className="text-gray-500 mt-1">Manage your shipping and billing addresses.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          className="bg-[var(--islamic-gold)] hover:bg-[var(--islamic-gold-dark)] text-white gap-2 rounded-xl h-12 px-6"
        >
          <Plus size={18} /> Add New Address
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <div 
            key={address.id} 
            className={`p-8 rounded-3xl border-2 transition-all bg-white flex flex-col justify-between ${
              address.id === defaultId 
                ? 'border-[var(--islamic-green)] shadow-lg shadow-[var(--islamic-green)]/5' 
                : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className={address.id === defaultId ? 'text-[var(--islamic-green)]' : 'text-gray-400'} />
                  <span className="font-bold text-lg text-gray-900">{address.firstName} {address.lastName}</span>
                </div>
                {address.id === defaultId && (
                  <Badge className="bg-[var(--islamic-green)]/10 text-[var(--islamic-green)] border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Default
                  </Badge>
                )}
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p>{address.address1}</p>
                {address.address2 && <p>{address.address2}</p>}
                <p>{address.city}, {address.province}, {address.zip}</p>
                <p>{address.country}</p>
                {address.phone && <p className="mt-2 text-gray-400 font-medium">{address.phone}</p>}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEdit(address)}
                  className="p-2 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-[var(--islamic-green)] transition-colors"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(address.id)}
                  className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {address.id !== defaultId && (
                <button 
                  onClick={() => handleSetDefault(address.id)}
                  className="text-xs font-bold text-gray-400 hover:text-[var(--islamic-green)] transition-colors flex items-center gap-1"
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="md:col-span-2 bg-gray-50 rounded-3xl p-16 text-center border border-dashed border-gray-200">
            <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm">You haven&apos;t added any addresses yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
