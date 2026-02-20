import { RowDataPacket } from "mysql2";

export interface Booking extends RowDataPacket {
  id: number;
  user_id: number;
  movie_id: number;
  hall_id: number;
  slot_selected:
    | "11:00-14:00"
    | "14:30-17:30"
    | "18:00-21:00";
  booking_date: string;
  seats_selected: string;
  total_seats: number;
  total_amount: number;
  payment_status:
    | "PENDING"
    | "SUCCESS"
    | "FAILED";
  booking_status:
    | "CONFIRMED"
    | "CANCELLED";
  created_at: string;
}

export interface CreateBookingData {
  user_id: number;
  movie_id: number;
  hall_id: number;
  slot_selected:
    | "11:00-14:00"
    | "14:30-17:30"
    | "18:00-21:00";
  booking_date: string;
  seats_selected: string;
  total_seats: number;
  total_amount: number;
}

export interface UpdatePaymentData {
  payment_status:
    | "PENDING"
    | "SUCCESS"
    | "FAILED";
}
