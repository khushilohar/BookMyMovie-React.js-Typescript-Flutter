import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import { Booking, PaginationParams } from '../types';
import { ITEMS_PER_PAGE } from '../utils/constants';

const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
  });
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // Toast state for cancellation feedback
  const [showCancelToast, setShowCancelToast] = useState(false);
  const [cancelToastMessage, setCancelToastMessage] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchBookings(pagination.page);
    }
  }, [user, pagination.page]);

  const fetchBookings = async (page: number) => {
    try {
      setLoading(true);
      const response = await bookingApi.getBookingsByUser(user!.id);
      console.log('Bookings API response:', response.data);

      let bookingsArray: Booking[] = [];
      const data = response.data;

      if (Array.isArray(data)) {
        bookingsArray = data;
      } else if (data?.data && Array.isArray(data.data)) {
        bookingsArray = data.data;
      } else if (data?.bookings && Array.isArray(data.bookings)) {
        bookingsArray = data.bookings;
      } else if (data?.result && Array.isArray(data.result)) {
        bookingsArray = data.result;
      } else if (typeof data === 'object' && data !== null) {
        const firstArrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
        if (firstArrayKey) {
          bookingsArray = data[firstArrayKey];
        }
      }

      const normalizedBookings = bookingsArray.map((b: any) => ({
        id: b.id,
        user_id: b.user_id,
        movie_id: b.movie_id,
        hall_id: b.hall_id,
        slot_selected: b.slot_selected,
        // Keep full datetime string for correct timezone handling
        booking_date: b.booking_date,
        seats_selected: b.seats_selected,
        total_seats: b.total_seats,
        total_amount: Number(b.total_amount) || 0,
        payment_status: b.payment_status || 'PENDING',
        booking_status: b.booking_status || 'CONFIRMED',
        created_at: b.created_at,
        movie_title: b.movie_title,
        movie_image: b.movie_image,
        hall_name: b.hall_name,
      }));

      const total = normalizedBookings.length;
      const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const paginated = normalizedBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
      setBookings(paginated);
      setPagination({ page, limit: ITEMS_PER_PAGE, total, totalPages });
    } catch (err: any) {
      console.error('❌ Failed to fetch bookings:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleCancelBooking = async (bookingId: number) => {
    setCancellingId(bookingId);
    try {
      await bookingApi.cancelBooking(bookingId);
      setCancelToastMessage('Booking cancelled successfully');
      setShowCancelToast(true);
      setTimeout(() => setShowCancelToast(false), 3000);
      fetchBookings(pagination.page);
    } catch (err: any) {
      console.error('❌ Cancel failed:', err);
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const handleMakePayment = (booking: Booking) => {
    navigate(`/payment/${booking.id}`, {
      state: { amount: booking.total_amount },
    });
  };

  // Format booking date to local date (without time)
  const formatBookingDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // If the date is invalid, return the original string
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && bookings.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <LoadingSpinner size="large" />
        <p style={{ marginTop: '20px', color: '#666' }}>Loading your bookings...</p>
      </div>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ color: '#dc3545', fontSize: '18px' }}>{error}</p>
        <button onClick={() => fetchBookings(1)} style={retryButtonStyle}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#333', margin: 0, fontSize: '28px' }}>
            My Bookings
            {pagination.total > 0 && (
              <span style={{ fontSize: '16px', color: '#666', marginLeft: '10px', fontWeight: 'normal' }}>
                ({pagination.total} bookings)
              </span>
            )}
          </h2>
        </div>

        {loading && bookings.length > 0 && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <LoadingSpinner size="small" />
          </div>
        )}

        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#666', fontSize: '18px', marginBottom: '20px' }}>
              You haven't made any bookings yet.
            </p>
            <a href="/movies" style={browseButtonStyle}>
              Browse Movies
            </a>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '40px' }}>
              {bookings.map(booking => (
                <div key={booking.id} style={bookingCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', gap: '15px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, color: '#333', fontSize: '20px' }}>Booking #{booking.id}</h3>
                        <span style={{ ...statusBadgeStyle, backgroundColor: booking.booking_status === 'CANCELLED' ? '#dc3545' : '#17a2b8' }}>
                          {booking.booking_status}
                        </span>
                        <span style={{
                          ...paymentBadgeStyle,
                          backgroundColor: booking.payment_status === 'SUCCESS' ? '#d4edda' : booking.payment_status === 'FAILED' ? '#f8d7da' : '#fff3cd',
                          color: booking.payment_status === 'SUCCESS' ? '#155724' : booking.payment_status === 'FAILED' ? '#721c24' : '#856404',
                        }}>
                          {booking.payment_status === 'SUCCESS' ? 'PAYMENT DONE' : booking.payment_status}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                        <div>
                          <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Movie ID</div>
                          <div style={{ color: '#333', fontSize: '16px', fontWeight: 'bold' }}>{booking.movie_id}</div>
                        </div>
                        <div>
                          <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Hall ID</div>
                          <div style={{ color: '#333', fontSize: '16px' }}>{booking.hall_id}</div>
                        </div>
                        <div>
                          <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Date & Slot</div>
                          <div style={{ color: '#333', fontSize: '16px' }}>
                            {formatBookingDate(booking.booking_date)} • {booking.slot_selected}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Seats</div>
                          <div style={{ color: '#333', fontSize: '16px', fontWeight: 'bold' }}>{booking.seats_selected}</div>
                        </div>
                        <div>
                          <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Total Amount</div>
                          <div style={{ color: '#28a745', fontSize: '18px', fontWeight: 'bold' }}>
                            ₹{(booking.total_amount || 0).toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Booked On</div>
                          <div style={{ color: '#333', fontSize: '14px' }}>{formatDateTime(booking.created_at)}</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {booking.payment_status !== 'SUCCESS' && booking.booking_status !== 'CANCELLED' && (
                        <button onClick={() => handleMakePayment(booking)} style={payButtonStyle}>
                          💳 Pay Now
                        </button>
                      )}
                      {booking.booking_status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                          style={cancelButtonStyle}
                        >
                          {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <Pagination pagination={pagination} onPageChange={handlePageChange} />
            )}
          </>
        )}
      </div>

      {showCancelToast && (
        <div style={toastStyle}>
          ✅ {cancelToastMessage}
        </div>
      )}
    </>
  );
};

/* ---------- Styles ---------- */
const retryButtonStyle: React.CSSProperties = {
  marginTop: '20px',
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const browseButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-block',
  fontWeight: 'bold',
};

const bookingCardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '25px',
  borderRadius: '8px',
  marginBottom: '20px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  borderLeft: '4px solid #007bff',
  transition: 'transform 0.2s',
};

const statusBadgeStyle: React.CSSProperties = {
  color: 'white',
  padding: '4px 12px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: 'bold',
};

const paymentBadgeStyle: React.CSSProperties = {
  padding: '4px 12px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: 'bold',
};

const payButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const cancelButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: "linear-gradient(90deg, #e12c26, #ba1cc8)",
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const toastStyle: React.CSSProperties = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  background: "linear-gradient(90deg, #82c0f2, #1c66c8)",
  borderRadius: "8px 20px 8px 20px",
  color: '#fff',
  padding: '14px 24px',
  fontSize: '14px',
  fontWeight: 500,
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  animation: 'slideInRight 0.4s ease',
  zIndex: 9999,
};

export default BookingsPage;