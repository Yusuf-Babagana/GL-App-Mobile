// --- USER & AUTHENTICATION ---

export type UserRole = 'buyer' | 'seller' | 'job_seeker' | 'employer' | 'delivery_partner' | 'admin';

export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface User {
  _id: string;
  clerkId: string;
  email: string;
  fullName: string;
  full_name?: string; // Backend field
  phoneNumber?: string; // Required for KYC [cite: 50]
  imageUrl: string;

  // Role Management
  roles: UserRole[];
  activeRole: UserRole; // To toggle UI between Buyer/Seller/Worker modes
  active_role?: UserRole; // Backend field

  // Trust & Safety [cite: 48-53]
  kycStatus: KycStatus;
  kyc_status?: KycStatus; // Backend field
  rejection_reason?: string; // Backend field
  kycDocuments?: {
    idType: 'national_id' | 'passport' | 'drivers_license';
    idImageUrl: string;
    selfieUrl: string;
    rejectionReason?: string;
  };

  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  label: string; // e.g., "Home", "Warehouse"
  fullName: string;
  full_name?: string; // Backend field
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phoneNumber: string;
  isDefault: boolean;
  location?: { // For delivery mapping
    lat: number;
    lng: number;
  };
}

// --- MARKETPLACE (BUYING & SELLING) ---

export interface Store {
  _id: string;
  ownerId: string; // Links to User
  name: string;
  description: string;
  logoUrl: string;
  rating: number;
  totalSales: number;
  createdAt: string;
}

export interface Product {
  _id: string;
  storeId: string; // Links to Store [cite: 18]
  name: string;
  description: string;
  price: number;
  currency: string; // e.g., 'USD', 'NGN'
  stock: number;
  category: string;

  // Media [cite: 19]
  images: string[];
  videoUrl?: string;

  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  buyerId: string;
  storeId: string;
  orderItems: OrderItem[];
  shippingAddress: Address;

  // Delivery Logic [cite: 27-30]
  deliveryPartnerId?: string; // Assigned driver
  deliveryStatus: 'pending' | 'ready_for_pickup' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';

  // Payment Logic [cite: 31-33]
  paymentStatus: 'pending' | 'escrow_held' | 'released' | 'refunded';
  totalPrice: number;

  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id: string;
  product: Product;
  quantity: number;
  priceAtPurchase: number;
}

// --- PROMOTED POSTS / ADVERTISEMENTS ---

// Unified shape returned by the promoted-posts endpoints (active list, detail,
// and the shareable /market/promotions/<code>/ lookup). Denormalized by the
// backend so both promotion_type values share one shape.
export interface Promotion {
  id: number;
  code: string;            // shareable short id — used in the deep link
  share_url: string | null; // https://<host>/promotion/<code>
  seller_id: number | null;
  seller_name: string | null;
  text_content: string;
  promotion_type: 'product' | 'standalone';
  contact_preference: 'chat' | 'whatsapp' | 'phone' | 'both'; // always 'chat' for new posts
  product_id: number | null;
  title: string | null;
  price: number | string | null;
  location: string | null;
  description?: string | null;
  image: string | null;
  images: string[];
  duration_type: '24h' | '3days' | '1wk';
  created_at: string;
  expires_at: string | null;
  time_remaining_seconds: number | null;
}

// --- JOBS & TALENT (WORK) ---

export interface JobPosting {
  _id: string;
  employerId: string; // Links to User (Employer role) [cite: 41]
  title: string;
  description: string;
  requirements: string[];
  budget: number; // or salary range
  currency: string;
  location: string; // or 'Remote'
  type: 'full_time' | 'part_time' | 'contract' | 'freelance';
  status: 'open' | 'closed';
  createdAt: string;
}

export interface JobApplication {
  _id: string;
  jobId: string;
  seekerId: string; // Links to User (Job Seeker role) [cite: 37]
  coverLetter: string;
  resumeUrl: string;
  status: 'applied' | 'interviewing' | 'hired' | 'rejected';
  createdAt: string;
}

export interface SeekerProfile {
  userId: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    years: number;
  }[];
  resumeUrl?: string;
}

// --- DELIVERY & LOGISTICS ---

export interface DeliveryJob {
  _id: string;
  orderId: string;
  pickupAddress: Address;
  deliveryAddress: Address;
  deliveryFee: number;
  status: 'available' | 'accepted' | 'completed';
  acceptedBy?: string; // Delivery Partner ID
}

// --- WALLET & PAYMENTS ---

export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
  isFrozen: boolean; // For security
}

export interface Transaction {
  _id: string;
  walletId: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'earning';
  amount: number;
  reference: string; // e.g., Opay reference
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
}