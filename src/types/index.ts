export type Department = 'men' | 'women' | 'kids' | 'other';

export type ProductColor = {
  name: string;
  hex: string;
  image?: string;
};

export type ProductVariant = {
  id: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  department: Department;
  category: string;
  collection: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  colors: ProductColor[];
  sizes: string[];
  stockByVariant: Record<string, number>; // key: `${size}_${color}` -> stock count
  totalStock: number;
  images: string[];
  video?: string;
  description: string;
  features: string[];
  fabricCare: string;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  isBundlePart?: boolean;
  isPublished?: boolean;
  isArchived?: boolean;
  createdAt: string;
};

export type CartItem = {
  id: string; // unique cart item id: `${productId}_${size}_${color}`
  productId: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  size: string;
  color: string;
  colorHex: string;
  image: string;
  quantity: number;
  maxStock: number;
};

export type WishlistItem = {
  productId: string;
  addedAt: string;
};

export type Address = {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

export type OrderItem = {
  productId: string;
  name: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
};

export type OrderStatus = 'placed' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'return_requested' | 'returned';

export type TrackingEvent = {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  location?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  codFee: number;
  total: number;
  paymentMethod: 'razorpay' | 'cod' | 'upi' | 'card' | 'netbanking';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  status: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery: string;
  createdAt: string;
  trackingHistory: TrackingEvent[];
  returnReason?: string;
  returnStatus?: 'pending' | 'approved' | 'rejected' | 'refunded';
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  savedAddresses: Address[];
  createdAt: string;
};

export type Coupon = {
  code: string;
  discountType: 'percentage' | 'flat';
  value: number; // e.g. 10 for 10%, or 300 for ₹300
  minOrderAmount: number;
  description: string;
  isActive: boolean;
  expiryDate?: string;
};

export type Review = {
  id: string;
  productId: string;
  author: string;
  city?: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
};

export type AdminRole = 'super_admin' | 'product_manager' | 'order_manager' | 'inventory_manager' | 'customer_support';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  phone?: string;
  lastLogin?: string;
  mfaEnabled?: boolean;
  mustChangePassword?: boolean;
  isActive?: boolean;
  createdAt: string;
};

export type CategoryItem = {
  id: string;
  name: string;
  department: Department;
  slug: string;
  subcategories: string[];
  productCount: number;
  order?: number;
  isArchived?: boolean;
};

export type CollectionItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  isFeatured: boolean;
  bannerImage?: string;
};

export type HomepageBanner = {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  desktopImage: string;
  mobileImage?: string;
  promoBadge?: string;
  isActive: boolean;
  order: number;
};

export type PaymentTransaction = {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  method: 'razorpay' | 'cod' | 'upi' | 'card' | 'netbanking';
  status: 'captured' | 'pending' | 'failed' | 'refunded';
  gatewayTransactionId?: string;
  refundId?: string;
  refundAmount?: number;
  refundReason?: string;
  createdAt: string;
  verifiedAt?: string;
};

export type StoreSettings = {
  storeName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  supportAddress: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  codAvailable: boolean;
  codFee: number;
  returnWindowDays: number;
};
