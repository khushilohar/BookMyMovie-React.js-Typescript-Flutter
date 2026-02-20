import pool from "../config/db";
import { Request, Response } from "express";
import {
  Movie,
  AddMovieData,
  UpdateMovie
} from "../schema/movie_schema";

const addMovie = async (req: Request, res: Response) => {
  const {
    title,
    description,
    image,
    rating = 0.0,
    duration_minutes,
    release_date
  } = req.body as AddMovieData;
  if (!title || !description || !image || !duration_minutes) {
    return res.status(400).json({
      message:
        "All fields are required: title, description, image, duration_minutes",
    });
  }
  try {
    const sql = `
      INSERT INTO movie_tb
      (title, description, image, rating, duration_minutes, release_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result]: any = await pool.execute(sql, [
      title,
      description,
      image,
      rating,
      duration_minutes,
      release_date || null,
    ]);
    return res.status(201).json({
      success: true,
      message: "Movie added successfully",
      movie_id: result.insertId,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
export default addMovie;

export const getAllMovies = async (
  req: Request,
  res: Response
) => {
  const { title, rating } = req.query;
  try {
    let sql = `SELECT * FROM movie_tb WHERE 1=1`;
    const values: any[] = [];
    if (title) {
      sql += ` AND title LIKE ?`;
      values.push(`%${title}%`);
    }
    if (rating) {
      sql += ` AND rating >= ?`;
      values.push(rating);
    }
    sql += ` ORDER BY id DESC`;
    const [rows] = await pool.execute(sql, values);
    return res.status(200).json({
      movies: rows as Movie[],
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getNowShowingMovies = async (
  req: Request,
  res: Response
) => {
  try {
    const sql = `
      SELECT *
      FROM movie_tb
      WHERE release_date <= CURDATE()
      ORDER BY release_date DESC
    `;
    const [rows] = await pool.execute(sql);
    return res.status(200).json({
      movies: rows,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const searchMovies = async (
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
      FROM movie_tb
      WHERE title LIKE ?
      ORDER BY rating DESC
    `;
    const [rows] = await pool.execute(sql, [
      `%${q}%`,
    ]);
    return res.status(200).json({
      movies: rows,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getMovieById = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  try {
    const sql = `
      SELECT *
      FROM movie_tb
      WHERE id = ?
    `;
    const [rows] = await pool.execute(sql, [id]);
    if ((rows as Movie[]).length === 0) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }
    return res.status(200).json({
      movie: (rows as Movie[])[0],
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const updateMovie = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;

  const {
    title,
    description,
    image,
    rating,
    duration_minutes,
    release_date,
  } = req.body as UpdateMovie;

  if (
    title === undefined &&
    description === undefined &&
    image === undefined &&
    rating === undefined &&
    duration_minutes === undefined &&
    release_date === undefined
  ) {
    return res.status(400).json({
      message: "At least one field is required to update",
    });
  }
  try {
    const fields: string[] = [];
    const values: any[] = [];
    if (title !== undefined) {
      fields.push("title = ?");
      values.push(title);
    }
    if (description !== undefined) {
      fields.push("description = ?");
      values.push(description);
    }
    if (image !== undefined) {
      fields.push("image = ?");
      values.push(image);
    }
    if (rating !== undefined) {
      fields.push("rating = ?");
      values.push(rating);
    }
    if (duration_minutes !== undefined) {
      fields.push("duration_minutes = ?");
      values.push(duration_minutes);
    }
    if (release_date !== undefined) {
      fields.push("release_date = ?");
      values.push(release_date);
    }
    values.push(id);
    const sql = `
      UPDATE movie_tb
      SET ${fields.join(", ")}
      WHERE id = ?
    `;
    const [result]: any = await pool.execute(
      sql,
      values
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Movie updated successfully",
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteMovie = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  try {
    const sql = `
      DELETE FROM movie_tb
      WHERE id = ?
    `;
    const [result]: any = await pool.execute(
      sql,
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
