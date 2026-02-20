import React, { useEffect, useState, useCallback, useRef } from "react";
import { movieApi } from "../services/api";
import MovieCard from "../components/MovieCard";
import Pagination from "../components/Pagination";
import LoadingSpinner from "../components/LoadingSpinner";
import { Movie, PaginationParams } from "../types";
import { ITEMS_PER_PAGE } from "../utils/constants";
import BannerSlider from "../components/BannerSlider";

const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState(""); // for immediate input update

  // Ref for debounce timer
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch movies based on current searchTerm and page
  const fetchMovies = useCallback(async (page: number, term: string) => {
    try {
      setLoading(true);
      const res = await movieApi.getAllMovies();
      const allMovies = res.data.movies || [];

      // Filter by search term
      let filtered = allMovies;
      if (term.trim()) {
        filtered = allMovies.filter((movie: Movie) =>
          movie.title.toLowerCase().includes(term.toLowerCase())
        );
      }

      const total = filtered.length;
      const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

      setMovies(paginated);
      setPagination({ page, limit: ITEMS_PER_PAGE, total, totalPages });
    } catch {
      setError("Failed to fetch movies");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced effect for searchTerm changes
  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      // Only fetch if searchTerm actually changed (avoid unnecessary fetch on mount)
      if (searchTerm !== inputValue) {
        setSearchTerm(inputValue);
        // Reset to page 1 when search changes
        fetchMovies(1, inputValue);
      }
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [inputValue, searchTerm, fetchMovies]);

  // Initial fetch on mount and page changes (but not on searchTerm because that's handled by debounce)
  useEffect(() => {
    fetchMovies(pagination.page, searchTerm);
  }, [pagination.page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle manual search form submit (immediate)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Cancel any pending debounce
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    setSearchTerm(inputValue);
    fetchMovies(1, inputValue);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <BannerSlider />

      {/* Header with search */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <h2 style={{ fontSize: "24px", fontWeight: 700 }}>
          Recommended Movies
        </h2>

        <form
          onSubmit={handleSearchSubmit}
          style={{ display: "flex", gap: "10px" }}
        >
          <input
            type="text"
            placeholder="Search movies..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={searchInput}
          />
          <button type="submit" style={searchBtn}>
            Search
          </button>
        </form>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <LoadingSpinner size="large" />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div style={{ textAlign: "center", color: "red" }}>{error}</div>
      )}

      {/* Movies grid */}
      {!loading && movies.length > 0 && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              pagination={pagination}
              onPageChange={(page) =>
                setPagination((p) => ({ ...p, page }))
              }
            />
          )}
        </>
      )}

      {/* No results */}
      {!loading && movies.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          No movies found.
        </div>
      )}
    </div>
  );
};

// Styles
const searchInput: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  fontSize: "15px",
  width: "250px",
};

const searchBtn: React.CSSProperties = {
  padding: "10px 18px",
  background: "#e50914",
  color: "#fff",
  border: "none",
  borderRadius: "16px",
  cursor: "pointer",
  fontWeight: 600,
};

export default MoviesPage;