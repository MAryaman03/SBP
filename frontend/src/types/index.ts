// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  profileImage?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Booking Types
export interface Booking {
  _id: string;
  userId: string;
  serviceId: string | Service;
  service?: Service;
  bookingDate: string;
  bookingTime: string;
  status?: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  bookingStatus?: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  bookingReference?: string;
  notes?: string;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  amount: number;
  createdAt: string;
  updatedAt: string;
}

// Service Types
export interface Service {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
}

// Notification Types
export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'reminder' | 'cancellation' | 'status_update';
  read: boolean;
  relatedBookingId?: string;
  createdAt: string;
}

// Dashboard Types
export interface DashboardData {
  upcomingBookings: Booking[];
  bookingHistory: Booking[];
  statistics: {
    totalBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    upcomingBookings?: number;
  };
  notifications: Notification[];
  userProfile: Partial<User>;
  unreadCount?: number;
}

// Auth Response Types
export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  user: Partial<User>;
  message?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignUpForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface BookingForm {
  serviceId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
}
