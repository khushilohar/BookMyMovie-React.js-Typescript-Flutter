import { Request, Response } from "express";
import db from "../config/db";

export const addShowMovie = async (req: Request, res: Response) => {
  try {
    const { movie_id, hall_id, show_date, slot } = req.body;

    
    if (!movie_id || !hall_id || !show_date || !slot) {
      return res.status(400).json({
        message: "movie_id, hall_id, show_date and slot are required",
      });
    }

    const validSlots = ["11:00-14:00", "14:30-17:30", "18:00-21:00"];
    if (!validSlots.includes(slot)) {
      return res.status(400).json({ message: "Invalid slot selected" });
    }

    const [movie] = await db.query(
      "SELECT id FROM movie_tb WHERE id = ?",
      [movie_id]
    );

    if ((movie as any[]).length === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const [hall] = await db.query(
      "SELECT id FROM hall_tb WHERE id = ?",
      [hall_id]
    );

    if ((hall as any[]).length === 0) {
      return res.status(404).json({ message: "Hall not found" });
    }

    const [existingShow] = await db.query(
      `
      SELECT id FROM showmoviehall_tb
      WHERE hall_id = ?
        AND show_date = ?
        AND slot = ?
      `,
      [hall_id, show_date, slot]
    );

    if ((existingShow as any[]).length > 0) {
      return res.status(409).json({
        message: "This hall already has a show in the selected slot",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO showmoviehall_tb
      (movie_id, hall_id, show_date, slot)
      VALUES (?, ?, ?, ?)
      `,
      [movie_id, hall_id, show_date, slot]
    );

    res.status(201).json({
      message: "Show added successfully",
      show_id: (result as any).insertId,
    });
  } catch (error: any) {
    console.error("Add show error:", error);

    res.status(500).json({
      message: "Failed to add show",
      error: error.message,
    });
  }
};

export const getHallDateSlotByMovieId = async (
  req: Request,
  res: Response
) => {
  try {
    const { movie_id } = req.query;

    const [rows] = await db.query(
      `
      SELECT 
        hall_id,
        show_date,
        slot
      FROM showmoviehall_tb
      WHERE movie_id = ?
      ORDER BY show_date, slot
      `,
      [movie_id]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch data", error });
  }
};

export const getDateSlotByMovieHall = async (
  req: Request,
  res: Response
) => {
  try {
    const { movie_id, hall_id } = req.query;

    const [rows] = await db.query(
      `
      SELECT 
        show_date,
        slot
      FROM showmoviehall_tb
      WHERE movie_id = ? AND hall_id = ?
      ORDER BY show_date, slot
      `,
      [movie_id, hall_id]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch data", error });
  }
};

export const getHallSlotByMovieDate = async (
  req: Request,
  res: Response
) => {
  try {
    const { movie_id, show_date } = req.query;

    const [rows] = await db.query(
      `
      SELECT 
        hall_id,
        slot
      FROM showmoviehall_tb
      WHERE movie_id = ? AND show_date = ?
      ORDER BY slot
      `,
      [movie_id, show_date]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch data", error });
  }
};

export const getHallDateByMovieSlot = async (
  req: Request,
  res: Response
) => {
  try {
    const { movie_id, slot } = req.query;

    const [rows] = await db.query(
      `
      SELECT 
        hall_id,
        show_date
      FROM showmoviehall_tb
      WHERE movie_id = ? AND slot = ?
      ORDER BY show_date
      `,
      [movie_id, slot]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch data", error });
  }
};

export const getSlotByMovieHallDate = async (
  req: Request,
  res: Response
) => {
  try {
    const { movie_id, hall_id, show_date } = req.query;

    const [rows] = await db.query(
      `
      SELECT 
        slot
      FROM showmoviehall_tb
      WHERE movie_id = ? 
        AND hall_id = ?
        AND show_date = ?
      `,
      [movie_id, hall_id, show_date]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch data", error });
  }
};


export const getHallByMovieSlotDate = async (
  req: Request,
  res: Response
) => {
  try {
    const { movie_id, slot, show_date } = req.query;

    const [rows] = await db.query(
      `
      SELECT 
        hall_id
      FROM showmoviehall_tb
      WHERE movie_id = ?
        AND slot = ?
        AND show_date = ?
      `,
      [movie_id, slot, show_date]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch data", error });
  }
};


export const getDateByMovieHallSlot = async (
  req: Request,
  res: Response
) => {
  try {
    const { movie_id, hall_id, slot } = req.query;

    const [rows] = await db.query(
      `
      SELECT 
        show_date
      FROM showmoviehall_tb
      WHERE movie_id = ?
        AND hall_id = ?
        AND slot = ?
      `,
      [movie_id, hall_id, slot]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch data", error });
  }
};
