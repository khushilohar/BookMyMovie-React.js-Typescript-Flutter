import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  movieApi,
  hallApi,
  seatApi,
  bookingApi,
  showMovieApi,
} from "../services/api";
import { Movie, Hall, Seat } from "../types";

type SlotType = "11:00-14:00" | "14:30-17:30" | "18:00-21:00";

const BookMoviePage: React.FC = () => {
  const { user } = useAuth();
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookedSeatNumbers, setBookedSeatNumbers] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [availableShows, setAvailableShows] = useState<any[]>([]);
  const [selectedShow, setSelectedShow] = useState<{
    hall_id: number;
    show_date: string;
    slot: SlotType;
  } | null>(null);

  // New step‑by‑step state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHallId, setSelectedHallId] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotType | null>(null);

  const [loading, setLoading] = useState(false);
  const [showsLoading, setShowsLoading] = useState(false);
  const [error, setError] = useState("");

  /* -------------------- HELPERS -------------------- */

  const normalizeSeats = (arr: any[]): string[] =>
    arr
      .flatMap((s) =>
        typeof s === "string"
          ? s.split(",")
          : s?.seat_number
          ? [s.seat_number]
          : []
      )
      .map((s) => s.trim().toUpperCase());

  // Fixed date formatter – avoids timezone shift
  const formatDateForDisplay = (dateStr: string) => {
    try {
      // Extract YYYY-MM-DD part (handles both "2025-03-15" and full ISO)
      const datePart = dateStr.slice(0, 10);
      const [year, month, day] = datePart.split('-').map(Number);
      // Create date in local time using components (month is 0-indexed)
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      });
    } catch {
      return dateStr; // fallback
    }
  };

  const formatDateForComparison = (dateStr: string) => dateStr.slice(0, 10);

  /* -------------------- LOAD INITIAL DATA -------------------- */

  useEffect(() => {
    if (!movieId) return;
    movieApi
      .getMovieById(movieId)
      .then((res) => setMovie(res.data.movie || res.data))
      .catch(() => setError("Failed to load movie"));
  }, [movieId]);

  useEffect(() => {
    hallApi
      .getAllHalls()
      .then((res) => {
        const data = res.data?.data || res.data?.halls || res.data;
        setHalls(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Failed to load halls"));
  }, []);

  useEffect(() => {
    if (!movieId) return;

    setShowsLoading(true);
    showMovieApi
      .getHallDateSlotByMovieId(movieId)
      .then((res) => {
        const data = res.data?.data || res.data?.shows || res.data;
        setAvailableShows(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Failed to load shows"))
      .finally(() => setShowsLoading(false));
  }, [movieId]);

  /* -------------------- DERIVED DATA FOR STEPS -------------------- */

  // Unique dates from available shows (using the date part for comparison)
  const uniqueDates = useMemo(() => {
    const dates = availableShows.map(s => formatDateForComparison(s.show_date));
    return [...new Set(dates)].sort();
  }, [availableShows]);

  // Halls that have shows on the selected date
  const availableHallsForDate = useMemo(() => {
    if (!selectedDate) return [];
    const hallIds = availableShows
      .filter(s => formatDateForComparison(s.show_date) === selectedDate)
      .map(s => s.hall_id);
    const uniqueHallIds = [...new Set(hallIds)];
    return halls.filter(h => uniqueHallIds.includes(h.id));
  }, [selectedDate, availableShows, halls]);

  // Slots for the selected date and hall
  const availableSlotsForHall = useMemo(() => {
    if (!selectedDate || !selectedHallId) return [];
    const slots = availableShows
      .filter(s => formatDateForComparison(s.show_date) === selectedDate && s.hall_id === selectedHallId)
      .map(s => s.slot);
    return [...new Set(slots)] as SlotType[];
  }, [selectedDate, selectedHallId, availableShows]);

  // When all three are selected, set the selectedShow (triggers seat loading)
  useEffect(() => {
    if (selectedDate && selectedHallId && selectedSlot) {
      const show = availableShows.find(
        s =>
          formatDateForComparison(s.show_date) === selectedDate &&
          s.hall_id === selectedHallId &&
          s.slot === selectedSlot
      );
      if (show) {
        setSelectedShow({
          hall_id: show.hall_id,
          show_date: show.show_date,
          slot: show.slot,
        });
      } else {
        setSelectedShow(null);
      }
    } else {
      setSelectedShow(null);
    }
  }, [selectedDate, selectedHallId, selectedSlot, availableShows]);

  /* -------------------- LOAD SEATS WHEN SHOW SELECTED -------------------- */

  useEffect(() => {
    if (!selectedShow || !movieId) return;

    const loadSeats = async () => {
      setLoading(true);
      setSelectedSeats([]);

      try {
        const seatRes = await seatApi.getSeatsByHall(selectedShow.hall_id);
        const seatData = seatRes.data?.data || seatRes.data?.seats || seatRes.data;
        setSeats(Array.isArray(seatData) ? seatData : []);

        const checkRes = await bookingApi.checkSeats({
          movie_id: Number(movieId),
          hall_id: selectedShow.hall_id,
          booking_date: selectedShow.show_date.slice(0, 10),
          slot_selected: selectedShow.slot,
        });

        const bookedRaw =
          checkRes.data?.booked_seats ||
          checkRes.data?.data ||
          checkRes.data ||
          [];

        setBookedSeatNumbers(normalizeSeats(bookedRaw));
      } catch (err) {
        console.error(err);
        setBookedSeatNumbers([]);
      } finally {
        setLoading(false);
      }
    };

    loadSeats();
  }, [selectedShow, movieId]);

  /* -------------------- SEAT TOGGLE -------------------- */

  const toggleSeat = (seatNumber: string) => {
    const s = seatNumber.toUpperCase();
    if (bookedSeatNumbers.includes(s)) return;

    setSelectedSeats((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const totalPrice = selectedSeats.reduce((sum, num) => {
    const seat = seats.find((s) => s.seat_number.toUpperCase() === num);
    return sum + (seat ? Number(seat.price) : 0);
  }, 0);

  const seatsByRow = seats.reduce((acc, seat) => {
    const row = seat.seat_number.match(/[A-Za-z]+/)?.[0] || "";
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  const sortedRows = Object.keys(seatsByRow).sort();

  const sortByColumn = (arr: Seat[]) =>
    [...arr].sort(
      (a, b) =>
        parseInt(a.seat_number.replace(/\D/g, "")) -
        parseInt(b.seat_number.replace(/\D/g, ""))
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedShow || selectedSeats.length === 0) return;

    const userId = (user as any).id || (user as any)._id || (user as any).userId;

    navigate("/payment", {
      state: {
        bookingDetails: {
          user_id: userId,
          movie_id: Number(movieId),
          hall_id: selectedShow.hall_id,
          slot_selected: selectedShow.slot,
          booking_date: selectedShow.show_date.slice(0, 10),
          seats_selected: selectedSeats.join(","),
          total_seats: selectedSeats.length,
          total_amount: totalPrice,
        },
      },
    });
  };

  // Reset hall and slot when date changes
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedHallId(null);
    setSelectedSlot(null);
  };

  const handleHallSelect = (hallId: number) => {
    setSelectedHallId(hallId);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: SlotType) => {
    setSelectedSlot(slot);
  };

  /* ---------- STYLES ---------- */
  const styles = {
    container: {
      maxWidth: 1000,
      margin: "0 auto",
      padding: "24px 20px",
      backgroundColor: "#fff",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginBottom: 24,
    },
    backButton: {
      background: "none",
      border: "none",
      fontSize: 24,
      cursor: "pointer",
      color: "#333",
      padding: "0 8px",
    },
    movieTitle: {
      fontSize: "1.8rem",
      fontWeight: 700,
      color: "#1a1a1a",
      margin: 0,
    },
    sectionTitle: {
      fontSize: "1.3rem",
      fontWeight: 600,
      marginBottom: 16,
      color: "#222",
    },
    stepIndicator: {
      display: "flex",
      gap: 40,
      marginBottom: 30,
      justifyContent: "center",
    },
    stepItem: (active: boolean, completed: boolean) => ({
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      color: active ? "#f84464" : completed ? "#28a745" : "#999",
      fontWeight: active ? 600 : 400,
    }),
    stepCircle: (active: boolean, completed: boolean) => ({
      width: 36,
      height: 36,
      borderRadius: "50%",
      backgroundColor: active ? "#f84464" : completed ? "#28a745" : "#e0e0e0",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
      fontWeight: "bold",
    }),
    optionGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
      gap: 12,
      marginBottom: 30,
    },
    optionCard: (isSelected: boolean) => ({
      padding: "14px 12px",
      borderRadius: 10,
      border: isSelected ? "2px solid #f84464" : "1px solid #ddd",
      backgroundColor: isSelected ? "#fef2f4" : "#fff",
      cursor: "pointer",
      textAlign: "center" as const,
      fontWeight: isSelected ? 600 : 400,
      transition: "all 0.2s",
    }),
    legend: {
      display: "flex",
      gap: 24,
      marginBottom: 16,
      flexWrap: "wrap" as const,
    },
    legendItem: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: "0.9rem",
    },
    seatDemo: (type: "available" | "selected" | "booked") => ({
      width: 20,
      height: 20,
      borderRadius: 4,
      backgroundColor:
        type === "booked" ? "#dc3545" : type === "selected" ? "#44eff8" : "#fff",
      border: type === "available" ? "1px solid #44f5f8" : "none",
    }),
    screenContainer: {
      margin: "32px auto 40px",
      width: "80%",
      perspective: "200px",
    },
    screen: {
      backgroundColor: "#f1f1f1",
      height: 8,
      borderRadius: "50% 50% 0 0",
      boxShadow: "0 -4px 10px rgba(0,0,0,0.1)",
      transform: "rotateX(-5deg)",
    },
    screenLabel: {
      textAlign: "center" as const,
      marginTop: 8,
      fontSize: "0.85rem",
      color: "#777",
      textTransform: "uppercase" as const,
      letterSpacing: 2,
    },
    seatRow: {
      display: "flex",
      alignItems: "center",
      marginBottom: 16,
      justifyContent: "center" as const,
    },
    rowLabel: {
      width: 30,
      fontWeight: 700,
      color: "#888",
      fontSize: "0.95rem",
    },
    seatWrapper: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      margin: "0 4px",
    },
    seat: (isBooked: boolean, isSelected: boolean) => ({
      width: 40,
      height: 36,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 600,
      backgroundColor: isBooked
        ? "#dc3545"
        : isSelected
        ? "#44eff8"
        : "#fff",
      border: isBooked ? "none" : "1px solid #44f5f8",
      color: isBooked || isSelected ? "#fff" : "#f84464",
      cursor: isBooked ? "not-allowed" : "pointer",
      transition: "all 0.1s ease",
      boxShadow: isSelected ? "0 4px 8px rgba(68,239,248,0.3)" : "none",
    }),
    seatPrice: {
      fontSize: 11,
      color: "#666",
      marginTop: 2,
    },
    totalBar: {
      position: "sticky" as const,
      bottom: 0,
      backgroundColor: "#fff",
      borderTop: "1px solid #eee",
      padding: "16px 24px",
      marginTop: 32,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 -4px 12px rgba(0,0,0,0.05)",
      borderRadius: "16px 16px 0 0",
    },
    totalText: {
      fontSize: "1.2rem",
      fontWeight: 600,
      color: "#1a1a1a",
    },
    totalAmount: {
      color: "#f84464",
      fontSize: "1.5rem",
      fontWeight: 700,
      marginLeft: 8,
    },
    proceedButton: {
      backgroundColor: "#f84464",
      border: "none",
      color: "#fff",
      padding: "14px 32px",
      borderRadius: 40,
      fontSize: "1.1rem",
      fontWeight: 600,
      cursor: "pointer",
      transition: "background 0.2s",
      boxShadow: "0 8px 16px rgba(248,68,100,0.3)",
    },
    proceedButtonDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
      boxShadow: "none",
    },
    loadingSpinner: {
      textAlign: "center" as const,
      padding: 40,
      color: "#f84464",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)} aria-label="Go back">
          ←
        </button>
        <h1 style={styles.movieTitle}>{movie?.title || "Loading..."}</h1>
      </div>

      {error && <p style={{ color: "red", textAlign: "center", marginBottom: 20 }}>{error}</p>}

      {showsLoading && <div style={styles.loadingSpinner}>Loading shows...</div>}

      {!showsLoading && availableShows.length === 0 && (
        <p style={{ textAlign: "center", color: "#888", margin: 40 }}>
          No shows available for this movie.
        </p>
      )}

      {!showsLoading && availableShows.length > 0 && (
        <>
          {/* Step 1: Date selection */}
          <h2 style={styles.sectionTitle}>1. Select Date</h2>
          <div style={styles.optionGrid}>
            {uniqueDates.map((date) => (
              <div
                key={date}
                onClick={() => handleDateSelect(date)}
                style={styles.optionCard(selectedDate === date)}
              >
                {formatDateForDisplay(date)}
              </div>
            ))}
          </div>

          {/* Step 2: Hall selection (only if date selected) */}
          {selectedDate && (
            <>
              <h2 style={styles.sectionTitle}>2. Select Hall</h2>
              {availableHallsForDate.length === 0 ? (
                <p>No halls available on this date.</p>
              ) : (
                <div style={styles.optionGrid}>
                  {availableHallsForDate.map((hall) => (
                    <div
                      key={hall.id}
                      onClick={() => handleHallSelect(hall.id)}
                      style={styles.optionCard(selectedHallId === hall.id)}
                    >
                      {hall.hall_name}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Step 3: Slot selection (only if date and hall selected) */}
          {selectedDate && selectedHallId && (
            <>
              <h2 style={styles.sectionTitle}>3. Select Time Slot</h2>
              {availableSlotsForHall.length === 0 ? (
                <p>No slots available for this hall on this date.</p>
              ) : (
                <div style={styles.optionGrid}>
                  {availableSlotsForHall.map((slot) => (
                    <div
                      key={slot}
                      onClick={() => handleSlotSelect(slot)}
                      style={styles.optionCard(selectedSlot === slot)}
                    >
                      {slot}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Seat selection (only when a full show is selected) */}
      {selectedShow && (
        <>
          <h2 style={{ ...styles.sectionTitle, marginTop: 24 }}>Select Seats</h2>

          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <div style={styles.seatDemo("available")} /> Available
            </div>
            <div style={styles.legendItem}>
              <div style={styles.seatDemo("selected")} /> Selected
            </div>
            <div style={styles.legendItem}>
              <div style={styles.seatDemo("booked")} /> Booked
            </div>
          </div>

          <div style={styles.screenContainer}>
            <div style={styles.screen} />
            <div style={styles.screenLabel}>SCREEN</div>
          </div>

          {loading ? (
            <div style={styles.loadingSpinner}>Loading seats...</div>
          ) : (
            <div style={{ marginBottom: 40 }}>
              {sortedRows.map((row) => (
                <div key={row} style={styles.seatRow}>
                  <div style={styles.rowLabel}>{row}</div>
                  {sortByColumn(seatsByRow[row]).map((seat) => {
                    const num = seat.seat_number.toUpperCase();
                    const booked = bookedSeatNumbers.includes(num);
                    const selected = selectedSeats.includes(num);

                    return (
                      <div key={seat.id} style={styles.seatWrapper}>
                        <div
                          onClick={() => !booked && toggleSeat(num)}
                          style={styles.seat(booked, selected)}
                        >
                          {num}
                        </div>
                        <div style={styles.seatPrice}>₹{seat.price}</div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          <div style={styles.totalBar}>
            <div style={styles.totalText}>
              Total: <span style={styles.totalAmount}>₹{totalPrice}</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={selectedSeats.length === 0 || !user}
              style={{
                ...styles.proceedButton,
                ...(selectedSeats.length === 0 || !user ? styles.proceedButtonDisabled : {}),
              }}
            >
              Proceed
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BookMoviePage;