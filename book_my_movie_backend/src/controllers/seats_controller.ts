import pool from "../config/db";
import { Request, Response } from "express";
import {
  Seat,
  AddSeatData,
  BulkSeatData,
  UpdateSeatData,
} from "../schema/seats_schema";
import { RowDataPacket } from "mysql2";

export const addSeat = async (req: Request, res: Response) => {
  const {
    hall_id,
    seat_number,
    seat_type = "REGULAR",
    price,
  } = req.body as AddSeatData;
  if (!hall_id || !seat_number || !price) {
    return res.status(400).json({
      message: "hall_id, seat_number and price are required",
    });
  }
  try {
    const [capacityRows] = await pool.execute<RowDataPacket[]>(
      "SELECT total_seats FROM hall_tb WHERE id = ?",
      [hall_id]
    );
    if (capacityRows.length === 0) {
      return res.status(404).json({
        message: "Hall not found",
      });
    }
    const totalSeatCapacity = capacityRows[0].total_seats;
    const [createdRows] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(id) AS total_seats_created FROM seats_tb WHERE hall_id = ?",
      [hall_id]
    );
    const totalSeatsCreated = createdRows[0].total_seats_created;
    if (totalSeatsCreated >= totalSeatCapacity) {
      return res.status(400).json({
        message: "Total seat capacity exceeded",
      });
    }
    const sql = `
      INSERT INTO seats_tb (hall_id, seat_number, seat_type, price)
      VALUES (?, ?, ?, ?)
    `;
    await pool.execute(sql, [
      hall_id,
      seat_number,
      seat_type,
      price,
    ]);
    return res.status(201).json({
      success: true,
      message: "Seat added successfully",
      totalSeatsCreated: totalSeatsCreated + 1,
      totalSeatCapacity,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const bulkCreateSeats = async (
  req: Request,
  res: Response
) => {
  const {
    hall_id,
    rows,
    cols,
    seat_type = "REGULAR",
    price,
  } = req.body as BulkSeatData;
  if (!hall_id || !rows || !cols || !price) {
    return res.status(400).json({
      message:
        "hall_id, rows, cols, price required",
    });
  }
  try {
    const seats: any[] = [];
    for (let i = 0; i < rows; i++) {
      const rowLetter = String.fromCharCode(
        65 + i
      );
      for (let j = 1; j <= cols; j++) {
        const seatNumber = `${rowLetter}${j}`;
        seats.push([
          hall_id,
          seatNumber,
          seat_type,
          price,
        ]);
      }
    }
    const sql = `
      INSERT INTO seats_tb
      (hall_id, seat_number, seat_type, price)
      VALUES ?
    `;
    await pool.query(sql, [seats]);
    return res.status(201).json({
      success: true,
      message: "Bulk seats created successfully",
      total_seats: seats.length,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllSeats = async (
  req: Request,
  res: Response
) => {
  try {
    const sql = `
      SELECT *
      FROM seats_tb
      ORDER BY id DESC
    `;
    const [rows] = await pool.execute(sql);
    return res.status(200).json({
      seats: rows as Seat[],
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getSeatsByHall = async (
  req: Request,
  res: Response
) => {
  const { hall_id } = req.params;
  try {
    const sql = `
      SELECT *
      FROM seats_tb
      WHERE hall_id = ?
      ORDER BY seat_number
    `;
    const [rows] = await pool.execute(sql, [
      hall_id,
    ]);
    return res.status(200).json({
      seats: rows as Seat[],
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getAvailableSeats = async (
  req: Request,
  res: Response
) => {
  const { hall_id } = req.params;
  const { movie_id, date, slot } =
    req.query;
  if (!movie_id || !date || !slot) {
    return res.status(400).json({
      message:
        "movie_id, date, slot required",
    });
  }
  try {
    const [allSeats]: any = await pool.execute(
      `SELECT * FROM seats_tb WHERE hall_id = ?`,
      [hall_id]
    );
    const [booked]: any = await pool.execute(
      `
      SELECT seats_selected
      FROM booking_tb
      WHERE hall_id = ?
      AND movie_id = ?
      AND booking_date = ?
      AND slot_selected = ?
      AND booking_status = 'CONFIRMED'
    `,
      [hall_id, movie_id, date, slot]
    );
    const bookedSeats = booked
      .map((b: any) =>
        b.seats_selected.split(",")
      )
      .flat();
    const availableSeats = allSeats.filter(
      (seat: any) =>
        !bookedSeats.includes(
          seat.seat_number
        )
    );
    return res.status(200).json({
      available_seats: availableSeats,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getSeatById = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const [rows]: any = await pool.execute(
    `SELECT * FROM seats_tb WHERE id = ?`,
    [id]
  );
  if (rows.length === 0) {
    return res
      .status(404)
      .json({ message: "Seat not found" });
  }
  return res.status(200).json({
    seat: rows[0],
  });
};

export const updateSeat = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const {
    seat_number,
    seat_type,
    price,
  } = req.body as UpdateSeatData;
  if (
    seat_number === undefined &&
    seat_type === undefined &&
    price === undefined
  ) {
    return res.status(400).json({
      message:
        "At least one field required",
    });
  }
  const fields: string[] = [];
  const values: any[] = [];
  if (seat_number !== undefined) {
    fields.push("seat_number = ?");
    values.push(seat_number);
  }
  if (seat_type !== undefined) {
    fields.push("seat_type = ?");
    values.push(seat_type);
  }
  if (price !== undefined) {
    fields.push("price = ?");
    values.push(price);
  }
  values.push(id);
  const sql = `
    UPDATE seats_tb
    SET ${fields.join(", ")}
    WHERE id = ?
  `;
  const [result]: any = await pool.execute(
    sql,
    values
  );
  if (result.affectedRows === 0) {
    return res
      .status(404)
      .json({ message: "Seat not found" });
  }
  return res.status(200).json({
    success: true,
    message: "Seat updated successfully",
  });
};

export const deleteSeat = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const [result]: any = await pool.execute(
    `DELETE FROM seats_tb WHERE id = ?`,
    [id]
  );
  if (result.affectedRows === 0) {
    return res
      .status(404)
      .json({ message: "Seat not found" });
  }
  return res.status(200).json({
    success: true,
    message: "Seat deleted successfully",
  });
};

export const deleteSeatsByHall =
  async (req: Request, res: Response) => {
    const { hall_id } = req.params;
    const [result]: any =
      await pool.execute(
        `DELETE FROM seats_tb WHERE hall_id = ?`,
        [hall_id]
      );
    return res.status(200).json({
      success: true,
      message:
        "All seats deleted for hall",
      deleted: result.affectedRows,
    });
  };
