const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export type AuthUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
};

export type Address = {
  id: number;
  label: string;
  street: string;
  city: string;
  state: string;
  pin_code: string;
  is_default: boolean;
};

type Book = {
  id: number;
  title: string;
  slug: string;
  price: number;
  stock_quantity: number;
};

type AtarVariant = {
  id: number;
  volume_ml: number;
  price: number;
  stock_quantity: number;
};

type Atar = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  variants: AtarVariant[];
};

export type ProductCardView = {
  id: string;
  name: string;
  price: number;
  images: string[];
  slug: string;
  categoryId: string;
  stock: number;
};

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined" || typeof window.localStorage.getItem !== "function") return {};
  try {
    const token = window.localStorage.getItem("naaz_access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    throw new Error(`API error ${res.status} for ${path}`);
  }
  return (await res.json()) as T;
}

export function mapBookToProduct(book: Book): ProductCardView {
  return {
    id: `book-${book.id}`,
    name: book.title,
    price: Number(book.price),
    images: [],
    slug: book.slug,
    categoryId: "books",
    stock: book.stock_quantity,
  };
}

export function mapAtarToProduct(atar: Atar): ProductCardView {
  const firstVariant = atar.variants?.[0];
  return {
    id: `atar-${atar.id}`,
    name: atar.name,
    price: Number(firstVariant?.price || 0),
    images: [],
    slug: atar.slug,
    categoryId: "atar",
    stock: firstVariant?.stock_quantity || 0,
  };
}

export async function getBooks() {
  const data = await fetchJson<{ items: Book[] }>("/api/books/");
  return data.items || [];
}

export async function getAtarList() {
  const data = await fetchJson<{ items: Atar[] }>("/api/atar/");
  return data.items || [];
}

export async function login(email: string, password: string) {
  return fetchJson<{ access: string; refresh: string }>("/api/auth/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function loginWithGoogle(idToken: string) {
  return fetchJson<{ access: string; refresh: string }>("/api/auth/google/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });
}

export async function getMe() {
  return fetchJson<AuthUser>("/api/auth/me/", {
    headers: { ...getAuthHeaders() },
  });
}

export async function getAddresses() {
  return fetchJson<Address[]>("/api/auth/addresses/", {
    headers: { ...getAuthHeaders() },
  });
}

export async function createAddress(payload: {
  label?: string;
  street: string;
  city: string;
  state: string;
  pin_code: string;
  is_default?: boolean;
}) {
  return fetchJson<Address>("/api/auth/addresses/", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
}

export async function validateCheckout(payload: unknown) {
  return fetchJson<{ ok: boolean; subtotal: number; final_amount: number }>("/api/orders/checkout/validate/", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
}

export async function createCheckout(payload: unknown) {
  return fetchJson<{ id: number; status: string; final_amount: number }>("/api/orders/checkout/", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
}

export async function initiatePayment(payload: { order_id: number; redirect_url: string; phone?: string }) {
  return fetchJson<{ longurl: string; payment_request_id: string; order_id: number }>("/api/payments/create/", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
}

export async function verifyPayment(paymentRequestId: string) {
  const q = new URLSearchParams({ payment_request_id: paymentRequestId });
  return fetchJson<{
    order_id: number;
    status: string;
    final_amount: string;
    instamojo_payment_id: string | null;
  }>(`/api/payments/verify/?${q}`, {
    headers: { ...getAuthHeaders() },
  });
}

export type OrderSummary = {
  id: number;
  status: string;
  final_amount: number;
  created_at: string;
  item_count: number;
};

export type OrderLine = {
  id: number;
  item_type: string;
  product_name: string;
  price_at_purchase: number;
  quantity: number;
  line_total: number;
};

export type OrderDetail = {
  id: number;
  status: string;
  subtotal: number;
  discount_amount: number;
  loyalty_discount_amount: number;
  final_amount: number;
  tracking_number: string | null;
  instamojo_payment_request_id: string | null;
  created_at: string;
  items: OrderLine[];
};

export async function listOrders() {
  return fetchJson<OrderSummary[]>("/api/orders/", {
    headers: { ...getAuthHeaders() },
  });
}

export async function getOrder(id: number) {
  return fetchJson<OrderDetail>(`/api/orders/${id}/`, {
    headers: { ...getAuthHeaders() },
  });
}
