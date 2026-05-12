export type Maybe<T> = T | null;

export type Connection<T> = {
  edges: Array<Edge<T>>;
};

export type Edge<T> = {
  node: T;
};

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type Money = {
  amount: string;
  currencyCode: string;
};

export type SEO = {
  title: string;
  description: string;
};

// --- Products ---

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
  compareAtPrice: Money | null;
  image?: Image;
};

export type Product = {
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  description: string;
  descriptionHtml: string;
  options: ProductOption[];
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  variants: Connection<ProductVariant>;
  featuredImage: Maybe<Image>;
  images: Connection<Image>;
  seo: SEO;
  tags: string[];
  updatedAt: string;
};

// Reshaped Product for easier UI consumption
export type ReshapedProduct = Omit<Product, 'variants' | 'images'> & {
  variants: ProductVariant[];
  images: Image[];
};

// --- Cart ---

export type CartLine = {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: ProductVariant & {
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage: Maybe<Image>;
    };
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
  lines: Connection<CartLine>;
  totalQuantity: number;
};

export type ReshapedCart = Omit<Cart, 'lines'> & {
  lines: CartLine[];
};

// --- Customer ---

export type OrderLineItem = {
  title: string;
  quantity: number;
};

export type Order = {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  currentTotalPrice: Money;
  lineItems: Connection<OrderLineItem>;
};

export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  acceptsMarketing: boolean;
  orders?: Connection<Order>;
};

export type CustomerAccessToken = {
  accessToken: string;
  expiresAt: string;
};
