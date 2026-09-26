import type{ProductVariant as SharedProductVariant}from"../../shared/src";
export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  read?: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  unread?: number;
  total?: number;
  page?: number;
  limit?: number;
}

export interface StoreSettings {
  logo?: string;
  storeName?: string;
  contact?: { email?: string; phone?: string };
  social?: { whatsapp?: string; messenger?: string; telegram?: string; tiktok?: string };
  [key: string]: unknown;
}

export interface CartItemVariant {
  variantId?: string;
  sku?: string;
  name?: string;
  attributes?: Record<string, string>;
}

export interface CartProduct {
  _id: string;
  name?: string;
  slug?: string;
  images?: string[];
  salePrice?: number;
  originalPrice?: number;
  stock?: number;
  availableStock?: number;
}

export interface CartItem {
  product: CartProduct | string;
  quantity: number;
  variant?: CartItemVariant;
}

export interface CartResponse {
  _id?: string;
  items: CartItem[];
  user?: string;
}

export interface OrderListItem {
  _id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  status: string;
}

export interface UserProfile {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  affiliateCode?: string;
  role?: string;
}

export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  province?: string;
  postalCode?: string;
  country: string;
  isDefault?: boolean;
}

export interface OrderItem {
  product: string;
  productName: string;
  quantity: number;
  subtotal: number;
  variantName?: string;
  variantAttributes?: Record<string, string>;
}

export interface OrderDetailResponse {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  items: OrderItem[];
  statusHistory?: Array<{ status: string; at: string }>;
}

export interface DeliveryResponse {
  status?: string;
  courier?: string;
  trackingNumber?: string;
  deliveryDate?: string;
  notes?: string; recipientName?: string; recipientConfirmedAt?: string;
}

export interface AuthRegisterResponse {
  verificationToken?: string;
}

export interface AuthLoginResponse {
  token: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface PaymentMethod {
  _id: string;
  name: string;
  type?: string;
  instructions?: string;
  accountNumber?: string;
  accountTitle?: string;
  active?: boolean;
  requiresReceipt?: boolean;
  requiresTransactionId?: boolean;
}

export interface CheckoutPreviewItem {
  product: string;
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  variantId?: string;
}

export interface CheckoutPreview {
  items: CheckoutPreviewItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon?: string | null;
}

export interface CreatedOrderResponse {
  _id: string;
}

export interface Banner {
  _id: string;
  title?: string;
  subtitle?: string;
  image: string;
  buttonUrl?: string;
  buttonText?: string;
}

export interface Product {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  images?: string[];
  category?: Category;
  salePrice: number;
  originalPrice: number;
  stock: number;
  availableStock?: number;
  variants?: ProductVariant[];
  colors?: string[];
  sizes?: string[];
  sku?: string;
  brand?: string; weight?: number; gender?: string; availability?: boolean; featured?: boolean; newArrival?: boolean; bestSeller?: boolean; limitedStock?: boolean; video?: string; videoThumbnail?: string; discount?: number;
}

export type ProductVariant = SharedProductVariant;

export interface ProductListResponse {
  items: Product[];
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
}

export interface Review {
  _id: string;
  rating: number;
  body: string;
  user?: { name?: string };
}

export interface Video {
  _id: string;
  title?: string;
  description?: string;
  url: string;
  thumbnail?: string;
}

export interface UploadResponse {
  url: string;
}
