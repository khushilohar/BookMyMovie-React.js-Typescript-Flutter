export interface User {
  id: number;
  name: string;
  email: string;
  is_verified: boolean;
  is_active: boolean;
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  image: string;          
  rating: number;
  duration_minutes: number;
  release_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Hall {
  id: number;
  hall_name: string;
  total_seats: number;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Seat {
  id: number;
  hall_id: number;
  seat_number: string;
  seat_type: 'REGULAR' | 'PREMIUM' | 'RECLINER';
  price: number;
  created_at: string;
}

export interface Booking {
  id: number;
  user_id: number;
  movie_id: number;
  title : string;
  hall_id: number;
  slot_selected: '11:00-14:00' | '14:30-17:30' | '18:00-21:00';
  booking_date: string;   
  seats_selected: string; 
  total_seats: number;
  total_amount: number;
  payment_status: 'PENDING' | 'SUCCESS' | 'FAILED';
  booking_status: 'CONFIRMED' | 'CANCELLED';
  created_at: string;
  movie_title?: string;
  movie_image?: string;
  hall_name?: string;
}

export interface CreateBookingData {
  user_id: number;
  movie_id: number;
  hall_id: number;
  slot_selected: '11:00-14:00' | '14:30-17:30' | '18:00-21:00';
  booking_date: string;
  seats_selected: string;
  total_seats: number;
  total_amount: number;
  payment_status?: 'PENDING' | 'SUCCESS' | 'FAILED';
}

export interface UpdatePaymentData {
  payment_status: 'PENDING' | 'SUCCESS' | 'FAILED';
}


export interface SignUpData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignInData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  pagination?: PaginationParams;
}

export interface PaymentData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  amount: number;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  message: string;
  timestamp: string;
}

export interface BookingWithMovie extends Booking {
  movie_title?: string;
  movie_image?: string;
}