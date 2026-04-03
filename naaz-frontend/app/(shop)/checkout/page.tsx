"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createAddress,
  createCheckout,
  getAddresses,
  initiatePayment,
  validateCheckout,
} from "@/lib/api-client";
import { useCartStore } from "@/store/cart-store";
import { useAuth } from "@/components/providers/session-provider";

export default function CheckoutPage() {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
    country: "India",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [addresses, setAddresses] = useState<
    { id: string; street: string; city: string; pin_code: string; state: string }[]
  >([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [addNewAddress, setAddNewAddress] = useState(false);
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getTotal());
  const loadFromStorage = useCartStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const fmt = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
      }),
    []
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    getAddresses()
      .then((data) =>
        setAddresses(
          data.map((a) => ({
            id: String(a.id),
            street: a.street,
            city: a.city,
            pin_code: a.pin_code,
            state: a.state,
          }))
        )
      )
      .catch(() => setAddresses([]));
  }, [isAuthenticated]);

  useEffect(() => {
    if (addresses.length === 0) setAddNewAddress(true);
  }, [addresses.length]);

  const handleSelectAddress = (id: string) => {
    setSelectedAddress(id);
    setAddNewAddress(false);
    const addr = addresses.find((a) => a.id === id);
    if (addr) {
      setForm((f) => ({
        ...f,
        address: addr.street,
        city: addr.city,
        pincode: addr.pin_code,
        state: addr.state,
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const buildPayload = (shippingId: number) => ({
    shipping_address_id: shippingId,
    items: items.map((i) => ({
      item_type: i.id.startsWith("book-") ? "BOOK" : "ATAR",
      item_id: Number(i.id.split("-")[1]),
      quantity: i.quantity,
    })),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isAuthenticated) {
      setError("Please sign in to continue.");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!form.name?.trim() || !form.phone?.trim() || !form.address?.trim() || !form.city?.trim() || !form.pincode?.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!addNewAddress && addresses.length > 0 && !selectedAddress) {
      setError("Select a saved address or choose “New address”.");
      return;
    }

    setBusy(true);
    try {
      let shippingId: number | null = null;
      if (!addNewAddress && selectedAddress) {
        shippingId = Number(selectedAddress);
      } else {
        const created = await createAddress({
          label: "Home",
          street: form.address.trim(),
          city: form.city.trim(),
          state: (form.state || "").trim() || "—",
          pin_code: form.pincode.trim(),
          is_default: addresses.length === 0,
        });
        shippingId = created.id;
        setAddresses((prev) => [
          ...prev,
          {
            id: String(created.id),
            street: created.street,
            city: created.city,
            pin_code: created.pin_code,
            state: created.state,
          },
        ]);
        setSelectedAddress(String(created.id));
        setAddNewAddress(false);
      }

      if (!shippingId) {
        setError("Could not resolve shipping address.");
        setBusy(false);
        return;
      }

      const payload = buildPayload(shippingId);
      await validateCheckout(payload);
      const order = await createCheckout(payload);
      
      // COD Bypass 
      if (typeof window !== "undefined") {
        sessionStorage.setItem("naaz_last_order_id", String(order.id));
        window.location.href = `/payment/success?order_id=${order.id}&payment_status=cod`;
      }
    } catch {
      setError("Checkout failed. Please verify login, stock, address details.");
    } finally {
      setBusy(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 py-16 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow p-8 text-center">
          <h1 className="text-xl font-bold text-[var(--islamic-green)] mb-2">Sign in required</h1>
          <p className="text-gray-600 mb-6">Sign in from the header to complete your purchase.</p>
          <Link href="/cart" className="text-[#C7A536] font-medium underline">
            Back to cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 md:hidden">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <span className="text-xs font-medium text-orange-600">Details</span>
              </div>
              <div className="w-4 h-0.5 bg-gray-300 mx-2" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <span className="text-xs font-medium text-orange-600">Pay</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-0 shadow-xl border-0 rounded-xl overflow-hidden">
            <div className="flex-1 p-6 md:p-8 bg-white">
              <div className="hidden md:flex items-center justify-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                      1
                    </div>
                    <span className="text-xs mt-1 font-medium text-orange-600">Shipping</span>
                  </div>
                  <div className="w-8 h-0.5 bg-orange-300" />
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                      2
                    </div>
                    <span className="text-xs mt-1 font-medium text-orange-600">Confirmation</span>
                  </div>
                </div>
              </div>

              <h1 className="text-xl md:text-2xl font-bold mb-6 text-center">Checkout</h1>

              <form onSubmit={handleSubmit} className="space-y-4">
                {addresses.length > 0 && (
                  <div className="mb-4 flex flex-col gap-2">
                    <label className="block text-sm font-medium">Saved address</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2 text-sm md:text-base"
                      value={addNewAddress ? "" : selectedAddress}
                      onChange={(e) => {
                        if (e.target.value === "__new__") {
                          setAddNewAddress(true);
                          setSelectedAddress("");
                        } else if (e.target.value) {
                          handleSelectAddress(e.target.value);
                        }
                      }}
                    >
                      <option value="">— Select or add new —</option>
                      {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.street}, {addr.city}
                        </option>
                      ))}
                      <option value="__new__">+ New address</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full name *</label>
                    <Input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Full name"
                      required
                      className="text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone (for payment SMS) *</label>
                    <Input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile"
                      required
                      className="text-sm md:text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Street address *</label>
                  <Input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Street address"
                    required
                    disabled={!addNewAddress && !!selectedAddress}
                    className="text-sm md:text-base"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <Input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                      required
                      disabled={!addNewAddress && !!selectedAddress}
                      className="text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Pincode *</label>
                    <Input
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="Pincode"
                      required
                      disabled={!addNewAddress && !!selectedAddress}
                      className="text-sm md:text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <Input
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="State"
                      disabled={!addNewAddress && !!selectedAddress}
                      className="text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <Input
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      placeholder="Country"
                      className="text-sm md:text-base"
                    />
                  </div>
                </div>

                {error && <div className="text-red-600 text-sm">{error}</div>}

                <Button
                  type="submit"
                  disabled={busy || items.length === 0}
                  className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white text-sm md:text-base font-semibold py-3 rounded-md shadow-md mt-6"
                >
                  {busy ? "Placing Order..." : "Place order (Cash on Delivery)"}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Your order will be approved for Cash on Delivery.
                </p>
              </form>
            </div>

            <div className="w-full lg:w-80 bg-gray-50 p-6 md:p-8 border-t lg:border-l lg:border-t-0">
              <h2 className="text-lg md:text-xl font-bold mb-4">Order summary</h2>
              <ul className="space-y-2 text-sm text-gray-700 mb-4 max-h-48 overflow-y-auto">
                {items.map((i) => (
                  <li key={i.id} className="flex justify-between gap-2">
                    <span className="truncate">
                      {i.name} × {i.quantity}
                    </span>
                    <span>{fmt.format(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-4 flex-1 border-t pt-4">
                <div className="flex items-center justify-between text-sm md:text-base font-semibold">
                  <span>Subtotal</span>
                  <span>{fmt.format(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs md:text-sm text-gray-500">
                  <span>Shipping</span>
                  <span>Calculated at dispatch</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-base md:text-lg font-bold">
                    <span>Total</span>
                    <span>{fmt.format(subtotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
