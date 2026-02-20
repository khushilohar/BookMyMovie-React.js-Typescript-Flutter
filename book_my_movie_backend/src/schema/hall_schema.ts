import { RowDataPacket } from "mysql2";

export interface Hall extends RowDataPacket {
  id: number;
  hall_name: string;
  total_seats: number;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Halls {
  id: number;
  hall_name: string;
  total_seats: number;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface AddHallData {
  hall_name: string;
  total_seats: number;
  location?: string;
}

export interface UpdateHallData {
  hall_name?: string;
  total_seats?: number;
  location?: string;
}