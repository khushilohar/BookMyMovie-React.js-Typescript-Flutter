import React from "react";
import { Link } from "react-router-dom";
import { Movie } from "../types";

const MovieCard: React.FC<{ movie: Movie }> = ({ movie }) => {
  return (
    <Link
      to={`/movies/${movie.id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div style={{ cursor: "pointer" }}>
        
        {/* 🎞 Poster */}
        <div
          style={{
            height: "320px",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <img
            src={movie.image || "https://via.placeholder.com/300x450"}
            alt={movie.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s",
            }}
          />
        </div>

        {/* 🎬 Info */}
        <h4 style={{ margin: "10px 0 4px", fontSize: "16px" }}>
          {movie.title}
        </h4>
        <p style={{ fontSize: "14px", color: "#666" }}>
          ⭐ {movie.rating}
        </p>
        <span style={ {fontSize: "14px", color: "#666" }}>{movie.duration_minutes} min</span>
      </div>
    </Link>
  );
};

export default MovieCard;
