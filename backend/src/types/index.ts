// User Types
export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: 'user' | 'admin';
  profileImage?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

// Appointment/Booking Types
export interface IBooking {
  _id: string;
  bookingReference: string;
  userId: string;
  serviceId: string;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  bookingStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  amount: number;
  cancellationReason?: string;
  cancelledAt?: Date;
  completedAt?: Date;
  reminderSent?: boolean;
  reminderSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Service Types
export interface IService {
  _id: string;
  serviceName: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
}

// Notification Types
export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'reminder' | 'cancellation' | 'status_update';
  read: boolean;
  relatedBookingId?: string;
  createdAt: Date;
}

// Auth Response Types
export interface IAuthResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  user: Partial<IUser>;
  message?: string;
}

// Dashboard Types
export interface IDashboardData {
  upcomingBookings: IBooking[];
  bookingHistory: IBooking[];
  statistics: {
    totalBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
  };
  notifications: INotification[];
  userProfile?: Partial<IUser>;
}

// API Response Types
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

// JWT Payload
export interface IJWTPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

// Request with User
import express from 'express';

export interface IAuthRequest extends express.Request {
  user?: Partial<IUser>;
  body: any;
  query: any;
  params: any;
}
