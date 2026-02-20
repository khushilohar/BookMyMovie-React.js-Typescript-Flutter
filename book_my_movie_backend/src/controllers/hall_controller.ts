import pool from "../config/db";
import { Request, Response } from "express";
import {
  Hall,
  AddHallData,
  UpdateHallData,
  Halls,
} from "../schema/hall_schema";

export const addHall = async (
  req: Request,
  res: Response
) => {
  const {
    hall_name,
    total_seats,
    location,
  } = req.body as AddHallData;
  if (!hall_name || !total_seats) {
    return res.status(400).json({
      message:
        "hall_name and total_seats are required",
    });
  }
  try {
    const sql = `
      INSERT INTO hall_tb
      (hall_name, total_seats, location)
      VALUES (?, ?, ?)
    `;
    const [result]: any = await pool.execute(
      sql,
      [hall_name, total_seats, location || null]
    );
    return res.status(201).json({
      success: true,
      message: "Hall added successfully",
      hall_id: result.insertId,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllHalls = async (
  req: Request,
  res: Response
) => {
  // const {
  //   page = 1,
  //   limit = 10,
  //   location,
  //   minSeats,
  // } = req.query as any;
  // const offset =
  //   (Number(page) - 1) * Number(limit);
  try {
    // let sql = `
    //   SELECT *
    //   FROM hall_tb
    //   WHERE 1=1
    // `;
    // const values: any[] = [];
    // if (location) {
    //   sql += ` AND location LIKE ?`;
    //   values.push(`%${location}%`);
    // }
    // if (minSeats) {
    //   sql += ` AND total_seats >= ?`;
    //   values.push(minSeats);
    // }
    // sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
    // values.push(Number(limit), offset);
    // const [rows] = await pool.execute(
    //   sql,
    //   values
    // );
    const rows = await pool.execute(
      "SELECT * FROM hall_tb", []
    );
    return res.status(200).json({
      halls: rows[0]
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const searchHalls = async (
  req: Request,
  res: Response
) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({
      message: "Search query is required",
    });
  }
  try {
    const sql = `
      SELECT *
      FROM hall_tb
      WHERE hall_name LIKE ?
         OR location LIKE ?
      ORDER BY hall_name ASC
    `;
    const [rows] = await pool.execute(
      sql,
      [`%${q}%`, `%${q}%`]
    );
    return res.status(200).json({
      halls: rows,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getHallById = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  try {
    const sql = `
      SELECT *
      FROM hall_tb
      WHERE id = ?
    `;
    const [rows] = await pool.execute(
      sql,
      [id]
    );
    if ((rows as Hall[]).length === 0) {
      return res.status(404).json({
        message: "Hall not found",
      });
    }
    return res.status(200).json({
      hall: (rows as Hall[])[0],
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const updateHall = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const {
    hall_name,
    total_seats,
    location,
  } = req.body as UpdateHallData;
  if (
    hall_name === undefined &&
    total_seats === undefined &&
    location === undefined
  ) {
    return res.status(400).json({
      message:
        "At least one field is required to update",
    });
  }
  try {
    const fields: string[] = [];
    const values: any[] = [];
    if (hall_name !== undefined) {
      fields.push("hall_name = ?");
      values.push(hall_name);
    }
    if (total_seats !== undefined) {
      fields.push("total_seats = ?");
      values.push(total_seats);
    }
    if (location !== undefined) {
      fields.push("location = ?");
      values.push(location);
    }
    values.push(id);
    const sql = `
      UPDATE hall_tb
      SET ${fields.join(", ")}
      WHERE id = ?
    `;
    const [result]: any = await pool.execute(
      sql,
      values
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Hall not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Hall updated successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteHall = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  try {
    const sql = `
      DELETE FROM hall_tb
      WHERE id = ?
    `;
    const [result]: any = await pool.execute(
      sql,
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Hall not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Hall deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
