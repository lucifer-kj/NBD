"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function CheckoutPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
    country: "India"
  })
  const [error, setError] = useState("")
  const [addresses, setAddresses] = useState<{ id: string; name: string; phone: string; address: string; city: string; pincode: string; state: string; country: string }[]>([])
  const [selectedAddress, setSelectedAddress] = useState("")

  useEffect(() => {
    fetch("/api/user/addresses", { credentials: "include" })
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setAddresses(data) : setAddresses([]))
  }, [])

  const handleSelectAddress = (id: string) => {
    setSelectedAddress(id)
    const addr = addresses.find(a => a.id === id)
    if (addr) {
      setForm({
        name: addr.name,
        phone: addr.phone,
        address: addr.address,
        city: addr.city,
        pincode: addr.pincode,
        state: addr.state,
        country: addr.country
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.address || !form.city || !form.pincode) {
      setError("Please fill in all required fields.")
      return
    }
    setError("")
    sessionStorage.setItem("checkout_shipping", JSON.stringify(form))
    router.push("/order-review")
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Mobile Stepper */}
          <div className="mb-8 md:hidden">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">1</div>
                <span className="text-xs font-medium text-orange-600">Billing</span>
              </div>
              <div className="w-4 h-0.5 bg-gray-300 mx-2" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">2</div>
                <span className="text-xs font-medium text-gray-400">Review</span>
              </div>
              <div className="w-4 h-0.5 bg-gray-300 mx-2" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">3</div>
                <span className="text-xs font-medium text-gray-400">Payment</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-0 shadow-xl border-0 rounded-xl overflow-hidden">
            {/* Form Section */}
            <div className="flex-1 p-6 md:p-8 bg-white">
              {/* Desktop Stepper */}
              <div className="hidden md:flex items-center justify-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">1</div>
                    <span className="text-xs mt-1 font-medium text-orange-600">Billing Address</span>
                  </div>
                  <div className="w-8 h-0.5 bg-gray-300" />
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">2</div>
                    <span className="text-xs mt-1 font-medium text-gray-400">Review</span>
                  </div>
                  <div className="w-8 h-0.5 bg-gray-300" />
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">3</div>
                    <span className="text-xs mt-1 font-medium text-gray-400">Payment</span>
                  </div>
                </div>
              </div>

              <h1 className="text-xl md:text-2xl font-bold mb-6 text-center">Checkout</h1>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Address Select Dropdown */}
                {addresses.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Choose Saved Address</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2 text-sm md:text-base"
                      value={selectedAddress}
                      onChange={e => handleSelectAddress(e.target.value)}
                    >
                      <option value="">-- Select an address --</option>
                      {addresses.map(addr => (
                        <option key={addr.id} value={addr.id}>
                          {addr.name}, {addr.address}, {addr.city}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <Input 
                      name="name" 
                      value={form.name} 
                      onChange={handleChange} 
                      placeholder="Full Name" 
                      required 
                      aria-invalid={!!error && !form.name}
                      className="text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number *</label>
                    <Input 
                      name="phone" 
                      value={form.phone} 
                      onChange={handleChange} 
                      placeholder="Phone Number" 
                      required 
                      aria-invalid={!!error && !form.phone}
                      className="text-sm md:text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address *</label>
                  <Input 
                    name="address" 
                    value={form.address} 
                    onChange={handleChange} 
                    placeholder="Street Address" 
                    required 
                    aria-invalid={!!error && !form.address}
                    className="text-sm md:text-base"
                  />
                  {(!form.address && error) && <div className="text-red-500 text-xs mt-1">This field is required</div>}
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
                      aria-invalid={!!error && !form.city}
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
                      aria-invalid={!!error && !form.pincode}
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

                {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                
                <Button 
                  type="submit" 
                  className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white text-sm md:text-base font-semibold py-3 rounded-md shadow-md mt-6"
                >
                  Continue to Review
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-80 bg-gray-50 p-6 md:p-8 border-t lg:border-l lg:border-t-0">
              <h2 className="text-lg md:text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between text-sm md:text-base font-semibold">
                  <span>Subtotal</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex items-center justify-between text-xs md:text-sm text-gray-500">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-base md:text-lg font-bold">
                    <span>Total</span>
                    <span>₹0.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
} 