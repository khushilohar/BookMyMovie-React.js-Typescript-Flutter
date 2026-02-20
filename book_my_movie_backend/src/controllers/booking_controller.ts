import pool from "../config/db";
import { Request, Response } from "express";
import {
  Booking,
  CreateBookingData,
  UpdatePaymentData,
} from "../schema/booking_schema";
import transporter from "../config/mailer";

export const createBooking = async (
  req: Request,
  res: Response
) => {
  const data =
    req.body as CreateBookingData;
  const {
    user_id,
    movie_id,
    hall_id,
    slot_selected,
    booking_date,
    seats_selected,
    total_amount,
  } = data;

  if (
    !user_id ||
    !movie_id ||
    !hall_id ||
    !slot_selected ||
    !booking_date ||
    !seats_selected
  ) {
    return res.status(400).json({
      message: "All fields required",
    });
  }
  try {
    const [existing]: any =
      await pool.execute(
        `
      SELECT seats_selected
      FROM booking_tb
      WHERE hall_id = ?
      AND movie_id = ?
      AND booking_date = ?
      AND slot_selected = ?
      AND booking_status = 'CONFIRMED'
    `,
        [
          hall_id,
          movie_id,
          booking_date,
          slot_selected,
        ]
      );
    const bookedSeats = existing
      .map((b: any) =>
        b.seats_selected.split(",")
      )
      .flat();
    const requestedSeats =
      seats_selected.split(",");
    const conflict =
      requestedSeats.filter((s) =>
        bookedSeats.includes(s)
      );
    if (conflict.length > 0) {
      return res.status(409).json({
        message: "Seats already booked",
        conflict_seats: conflict,
      });
    }
    const sql = `
      INSERT INTO booking_tb
      (
        user_id,
        movie_id,
        hall_id,
        slot_selected,
        booking_date,
        seats_selected,
        total_seats,
        total_amount
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const total_seats = requestedSeats.length;
    const [result]: any =
      await pool.execute(sql, [
        user_id,
        movie_id,
        hall_id,
        slot_selected,
        booking_date,
        seats_selected,
        total_seats,
        total_amount,
      ]);
    const [userRows]: any = await pool.execute(
      "SELECT name, email FROM user_tb WHERE id = ?",
      [user_id]
    );

    const [movieRows]: any = await pool.execute(
      "SELECT title FROM movie_tb WHERE id = ?",
      [movie_id]
    );

    const mailOptions = {
        from: process.env.MAIL_USER,
        to: userRows[0]?.email,
        subject: "🎬 Movie Booking Confirmation",
        html: `
            <h2>Hello ${userRows[0]?.name},</h2>
            <p>Your movie booking has been confirmed 🎉</p>
            <h3>Booking Details</h3>
            <ul>
                <li><b>Movie:</b> ${movieRows[0]?.title}</li>
                <li><b>Seats:</b> ${seats_selected}</li>
                <li><b>Total Seats:</b> ${total_seats}</li>
                <li><b>Total Amount:</b> ₹${total_amount}</li>
                <li><b>Booking Date:</b> ${booking_date}</li>
                <li><b>Slot:</b> ${slot_selected}</li>
            </ul>
            <p>Enjoy your movie 🍿</p>
            <p><b>Movie Booking Team</b></p>
        `
        };
    await transporter.sendMail(mailOptions);
    return res.status(201).json({
      success: true,
      booking_id: result.insertId,
      booking_details: {
        user: userRows[0],
        movie: movieRows[0],
        hall_id,
        slot_selected,
        booking_date,
        seats_selected,
        total_seats,
        total_amount
      }
    });

  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllBookings =
  async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 10,
      date,
    } = req.query as any;
    const offset =
      (page - 1) * limit;
    let sql =
      "SELECT * FROM booking_tb WHERE 1=1";
    const values: any[] = [];
    if (date) {
      sql +=
        " AND booking_date = ?";
      values.push(date);
    }
    sql +=
      " ORDER BY id DESC LIMIT ? OFFSET ?";
    values.push(
      Number(limit),
      Number(offset)
    );
    const [rows] =
      await pool.execute(sql, values);
    res.json({
      bookings: rows,
    });
  };

export const getBookingById =
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const [rows]: any =
      await pool.execute(
        "SELECT * FROM booking_tb WHERE id = ?",
        [id]
      );
    if (!rows.length) {
      return res
        .status(201)
        .json({ message: "Not found" });
    }
    res.json({ booking: rows[0] });
  };

export const getBookingsByUser =
  async (req: Request, res: Response) => {
    const { user_id } = req.params;
    const [rows] =
      await pool.execute(
        `
      SELECT *
      FROM booking_tb
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
        [user_id]
      );
    res.json({ bookings: rows });
  };

export const getBookingsByMovie =
  async (req: Request, res: Response) => {
    const { movie_id } = req.params;
    const [rows] =
      await pool.execute(
        `
      SELECT *
      FROM booking_tb
      WHERE movie_id = ?
    `,
        [movie_id]
      );
    res.json({ bookings: rows });
  };

export const getBookingsByHallSlot =
  async (req: Request, res: Response) => {
    const { hall_id } = req.params;
    const {
      movie_id,
      date,
      slot,
    } = req.query;
    const [rows] =
      await pool.execute(
        `
      SELECT *
      FROM booking_tb
      WHERE hall_id = ?
      AND movie_id = ?
      AND booking_date = ?
      AND slot_selected = ?
    `,
        [hall_id, movie_id, date, slot]
      );

    res.json({ bookings: rows });
  };

export const cancelBooking =
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const [result]: any =
      await pool.execute(
        `
      UPDATE booking_tb
      SET booking_status = 'CANCELLED'
      WHERE id = ?
    `,
        [id]
      );
    if (!result.affectedRows) {
      return res
        .status(404)
        .json({ message: "Not found" });
    }
    res.json({
      success: true,
      message: "Booking cancelled",
    });
};

export const updatePaymentStatus =
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      payment_status,
    } = req.body as UpdatePaymentData;
    const [result]: any =
      await pool.execute(
        `
      UPDATE booking_tb
      SET payment_status = ?
      WHERE id = ?
    `,
        [payment_status, id]
      );
    res.json({
      success: true,
      message: "Payment updated",
    });
  };

export const getBookingHistory =
  async (req: Request, res: Response) => {
    const { user_id } = req.params;
    const [rows] =
      await pool.execute(
        `
      SELECT *
      FROM booking_tb
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
        [user_id]
      );
    res.json({ history: rows });
  };

export const getRevenueSummary =
  async (req: Request, res: Response) => {
    const { from, to } = req.query;
    const [rows]: any =
      await pool.execute(
        `
      SELECT
        COUNT(*) AS total_bookings,
        SUM(total_amount) AS total_revenue
      FROM booking_tb
      WHERE payment_status = 'SUCCESS'
      AND booking_date BETWEEN ? AND ?
    `,
        [from, to]
      );
    res.json(rows[0]);
  };

export const checkSeatAvailability = async (req: Request, res: Response) => {
  try {
    let { movie_id, movieId, hall_id, hallId, booking_date, slot_selected } = req.query;
    const movieIdValue = movie_id || movieId;
    const hallIdValue = hall_id || hallId;
    if (!movieIdValue) {
      return res.status(400).json({ message: "Missing required parameter: movie_id" });
    }
    if (!hallIdValue) {
      return res.status(400).json({ message: "Missing required parameter: hall_id" });
    }
    if (!booking_date) {
      return res.status(400).json({ message: "Missing required parameter: booking_date" });
    }
    if (!slot_selected) {
      return res.status(400).json({ message: "Missing required parameter: slot_selected" });
    }
    const cleanMovieId = String(movieIdValue).replace(/'/g, "");
    const cleanHallId = String(hallIdValue).replace(/'/g, "");
    const cleanBookingDate = String(booking_date).replace(/'/g, "");
    const cleanSlot = String(slot_selected).replace(/'/g, "");
    const movieIdNum = parseInt(cleanMovieId, 10);
    const hallIdNum = parseInt(cleanHallId, 10);
    if (isNaN(movieIdNum) || isNaN(hallIdNum)) {
      return res.status(400).json({ message: "movie_id and hall_id must be valid numbers" });
    }
    const query = `
      SELECT seats_selected 
      FROM booking_tb 
      WHERE movie_id = ? 
        AND hall_id = ? 
        AND booking_date = ? 
        AND slot_selected = ? 
        AND booking_status = 'CONFIRMED'
    `;
    const [rows] = await pool.execute(query, [
      movieIdNum,
      hallIdNum,
      cleanBookingDate,
      cleanSlot,
    ]);
    const bookedSeats: string[] = [];
    (rows as any[]).forEach((row) => {
      if (row.seats_selected) {
        bookedSeats.push(...row.seats_selected.split(","));
      }
    });
    return res.status(200).json({
      success: true,
      booked_seats: bookedSeats,
    });
  } catch (error) {
    console.error("Error in checkSeatAvailability:", error);
    return res.status(500).json({
      message: "Internal server error while checking seat availability",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
