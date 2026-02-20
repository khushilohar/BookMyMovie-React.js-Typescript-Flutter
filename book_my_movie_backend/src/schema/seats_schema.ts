import { RowDataPacket } from "mysql2";

export interface Seat extends RowDataPacket {
  id: number;
  hall_id: number;
  seat_number: string;
  seat_type: "REGULAR" | "PREMIUM" | "RECLINER";
  price: number;
  created_at: string;
}

export interface AddSeatData {
  hall_id: number;
  seat_number: string;
  seat_type?: "REGULAR" | "PREMIUM" | "RECLINER";
  price: number;
}

export interface BulkSeatData {
  hall_id: number;
  rows: number;
  cols: number;
  seat_type?: "REGULAR" | "PREMIUM" | "RECLINER";
  price: number;
}

export interface UpdateSeatData {
  seat_number?: string;
  seat_type?: "REGULAR" | "PREMIUM" | "RECLINER";
  price?: number;
}
