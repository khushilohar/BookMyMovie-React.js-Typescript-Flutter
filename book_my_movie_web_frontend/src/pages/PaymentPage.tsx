import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentApi, bookingApi } from '../services/api';
import { PaymentData, PaymentResponse, CreateBookingData } from '../types';

// ---------- Icons (simple emoji replacements, replace with actual icons if desired) ----------
const cardIcon = '💳';
const upiIcon = '📱';

const FakePaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingDetails } = location.state || {};

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');

  // Card fields
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  // UPI fields
  const [upiId, setUpiId] = useState('');
  const [selectedApp, setSelectedApp] = useState<string>(''); // optional, for app selection

  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: form, 2: processing, 3: result

  // Amount from bookingDetails
  const amount = bookingDetails?.total_amount || 0;

  useEffect(() => {
    if (!bookingDetails) {
      setError('No booking information found. Please start booking again.');
    }
  }, [bookingDetails]);

  // ---------- Validation ----------
  const validateCard = () => {
    if (!cardData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      setError('Please enter a valid 16‑digit card number');
      return false;
    }
    if (!cardData.cardHolder.trim()) {
      setError('Please enter card holder name');
      return false;
    }
    if (!cardData.expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      setError('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    if (!cardData.cvv.match(/^\d{3,4}$/)) {
      setError('Please enter a valid CVV (3‑4 digits)');
      return false;
    }
    return true;
  };

  const validateUpi = () => {
    // Simple UPI ID format: alphanumeric+.-_@bank
    const upiRegex = /^[\w.\-_]{2,}@[a-zA-Z]{2,}$/;
    if (!upiId.trim()) {
      setError('Please enter your UPI ID');
      return false;
    }
    if (!upiRegex.test(upiId)) {
      setError('Enter a valid UPI ID (e.g., name@okhdfcbank)');
      return false;
    }
    return true;
  };

  // ---------- Input Handlers ----------
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setCardData({ ...cardData, [name]: formatted });
    } else if (name === 'expiryDate') {
      const cleaned = value.replace(/[^0-9]/g, '');
      if (cleaned.length >= 2) {
        setCardData({ ...cardData, [name]: `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}` });
      } else {
        setCardData({ ...cardData, [name]: value });
      }
    } else {
      setCardData({ ...cardData, [name]: value });
    }
    setError('');
  };

  const handleUpiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpiId(e.target.value);
    setError('');
  };

  // ---------- Payment Submission ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDetails) {
      setError('Missing booking details. Please restart booking.');
      return;
    }

    // Validate based on method
    if (paymentMethod === 'card' && !validateCard()) return;
    if (paymentMethod === 'upi' && !validateUpi()) return;

    setStep(2);
    setProcessing(true);
    setError('');

    try {
      // Fake payment processing – simulate API call
      // For UPI we send different data (the paymentApi should handle it)
      const paymentPayload = paymentMethod === 'card'
        ? {
            amount,
            cardNumber: cardData.cardNumber.replace(/\s/g, ''),
            cardHolder: cardData.cardHolder,
            expiryDate: cardData.expiryDate,
            cvv: cardData.cvv,
            method: 'card',
          }
        : {
            amount,
            upiId,
            method: 'upi',
          };

      const response: any = await paymentApi.processPayment(paymentPayload);

      // 2. Create the booking in the database
      const createData: CreateBookingData = {
        user_id: bookingDetails.user_id,
        movie_id: bookingDetails.movie_id,
        hall_id: bookingDetails.hall_id,
        slot_selected: bookingDetails.slot_selected,
        booking_date: bookingDetails.booking_date,
        seats_selected: bookingDetails.seats_selected,
        total_seats: bookingDetails.total_seats,
        total_amount: bookingDetails.total_amount,
      };
      await bookingApi.createBooking(createData);

      setPaymentResult(response.data);
      setStep(3);

      // Auto redirect after 5 seconds
      setTimeout(() => {
        navigate('/bookings');
      }, 5000);
    } catch (err: any) {
      console.error('Payment/booking creation failed:', err);
      setError(err.response?.data?.message || 'Payment processing failed. Please try again.');
      setStep(1);
    } finally {
      setProcessing(false);
    }
  };

  // ---------- UI Helpers ----------
  const displayAmount = amount.toFixed(2);

  if (!bookingDetails) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Error</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>{error || 'No booking information found.'}</p>
        <button onClick={() => navigate('/movies')} style={styles.errorButton}>
          Browse Movies
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Progress Steps */}
      <div style={styles.progressContainer}>
        <div style={styles.progressLine} />
        {[1, 2, 3].map(stepNumber => (
          <div key={stepNumber} style={styles.progressStep}>
            <div
              style={{
                ...styles.progressCircle,
                backgroundColor: step >= stepNumber ? '#f84464' : '#e0e0e0',
                color: step >= stepNumber ? '#fff' : '#999',
              }}
            >
              {stepNumber}
            </div>
            <span
              style={{
                fontSize: '14px',
                color: step >= stepNumber ? '#f84464' : '#999',
                fontWeight: step >= stepNumber ? '600' : '400',
              }}
            >
              {stepNumber === 1 ? 'Payment' : stepNumber === 2 ? 'Processing' : 'Confirmation'}
            </span>
          </div>
        ))}
      </div>

      {/* Booking Summary Card */}
      <div style={styles.summaryCard}>
        <h3 style={styles.summaryTitle}>Booking Summary</h3>
        <div style={styles.summaryGrid}>
          <div>
            <div style={styles.summaryLabel}>Movie</div>
            <div style={styles.summaryValue}>{bookingDetails.movie_title || `Movie #${bookingDetails.movie_id}`}</div>
          </div>
          <div>
            <div style={styles.summaryLabel}>Hall</div>
            <div style={styles.summaryValue}>{bookingDetails.hall_name || `Hall #${bookingDetails.hall_id}`}</div>
          </div>
          <div>
            <div style={styles.summaryLabel}>Date & Slot</div>
            <div style={styles.summaryValue}>
              {bookingDetails.booking_date} • {bookingDetails.slot_selected}
            </div>
          </div>
          <div>
            <div style={styles.summaryLabel}>Seats</div>
            <div style={styles.summaryValue}>{bookingDetails.seats_selected}</div>
          </div>
          <div>
            <div style={styles.summaryLabel}>Total Amount</div>
            <div style={styles.summaryAmount}>₹{displayAmount}</div>
          </div>
        </div>
        <div style={styles.note}>
          <strong>Test Mode:</strong> Use card 4242 4242 4242 4242 or any UPI ID (simulated).
        </div>
      </div>

      {/* Payment Form */}
      {step === 1 && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Complete Payment</h2>

          {/* Method Tabs */}
          <div style={styles.methodTabs}>
            <button
              style={{
                ...styles.methodTab,
                ...(paymentMethod === 'card' ? styles.methodTabActive : {}),
              }}
              onClick={() => setPaymentMethod('card')}
            >
              <span style={styles.methodIcon}>{cardIcon}</span> Card
            </button>
            <button
              style={{
                ...styles.methodTab,
                ...(paymentMethod === 'upi' ? styles.methodTabActive : {}),
              }}
              onClick={() => setPaymentMethod('upi')}
            >
              <span style={styles.methodIcon}>{upiIcon}</span> UPI
            </button>
          </div>

          {error && <div style={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Card Form */}
            {paymentMethod === 'card' && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    value={cardData.cardNumber}
                    onChange={handleCardChange}
                    maxLength={19}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Card Holder Name</label>
                  <input
                    type="text"
                    name="cardHolder"
                    placeholder="John Doe"
                    value={cardData.cardHolder}
                    onChange={handleCardChange}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Expiry Date (MM/YY)</label>
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder="12/25"
                      value={cardData.expiryDate}
                      onChange={handleCardChange}
                      maxLength={5}
                      style={styles.input}
                      required
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>CVV</label>
                    <input
                      type="password"
                      name="cvv"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={handleCardChange}
                      maxLength={4}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* UPI Form */}
            {paymentMethod === 'upi' && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>UPI ID</label>
                  <input
                    type="text"
                    placeholder="yourname@okhdfcbank"
                    value={upiId}
                    onChange={handleUpiChange}
                    style={styles.input}
                    required
                  />
                </div>

                {/* Optional: Quick app selection (like BMS) */}
                <div style={styles.appGrid}>
                  {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setUpiId(`username@${app.toLowerCase().replace(' ', '')}`)} // demo
                      style={{
                        ...styles.appButton,
                        ...(selectedApp === app ? styles.appButtonSelected : {}),
                      }}
                    >
                      {app}
                    </button>
                  ))}
                </div>
                <p style={styles.appHint}>Tap an app to auto‑fill a sample ID (for demo).</p>
              </>
            )}

            {/* Action Buttons */}
            <div style={styles.actionRow}>
              <button type="button" onClick={() => navigate('/movies')} style={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" disabled={processing} style={styles.payButton}>
                Pay ₹{displayAmount}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Processing State */}
      {step === 2 && (
        <div style={styles.processingCard}>
          <div style={styles.spinner} />
          <h2 style={styles.processingTitle}>Processing Payment</h2>
          <p style={styles.processingText}>Please wait while we confirm your payment...</p>
        </div>
      )}

      {/* Success State */}
      {step === 3 && paymentResult && (
        <div style={styles.successCard}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>Payment Successful!</h2>
          <p style={styles.successText}>Your booking has been confirmed.</p>

          <div style={styles.detailsBox}>
            <div>
              <div style={styles.detailLabel}>Transaction ID</div>
              <div style={styles.detailValue}>{paymentResult.transactionId}</div>
            </div>
            <div>
              <div style={styles.detailLabel}>Amount Paid</div>
              <div style={styles.detailAmount}>₹{displayAmount}</div>
            </div>
            <div>
              <div style={styles.detailLabel}>Status</div>
              <div style={styles.completedBadge}>Completed</div>
            </div>
            <div>
              <div style={styles.detailLabel}>Date & Time</div>
              <div style={styles.detailValue}>{new Date(paymentResult.timestamp).toLocaleString()}</div>
            </div>
          </div>

          <div style={styles.nextSteps}>
            <strong>Next:</strong> You can view your ticket in "My Bookings".
          </div>

          <div style={styles.successActions}>
            <button onClick={() => navigate('/bookings')} style={styles.primaryButton}>
              📋 View My Bookings
            </button>
            <button onClick={() => navigate('/movies')} style={styles.secondaryButton}>
              🎬 Book Another
            </button>
          </div>

          <div style={styles.redirectNote}>
            Redirecting to My Bookings in 5 seconds...
          </div>
        </div>
      )}

      {/* Inject spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

/* ---------- BookMyShow‑inspired Styles ---------- */
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '24px 20px',
    backgroundColor: '#f5f5f5',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    minHeight: 'calc(100vh - 80px)',
  },
  progressContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  progressLine: {
    position: 'absolute',
    top: 20,
    left: '10%',
    right: '10%',
    height: 2,
    backgroundColor: '#e0e0e0',
    zIndex: 1,
  },
  progressStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 2,
    flex: 1,
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    transition: 'background-color 0.3s',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: '1px solid #f0f0f0',
  },
  summaryTitle: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#333',
    marginBottom: 20,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 16,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: '0.85rem',
    color: '#999',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: '1rem',
    fontWeight: 500,
    color: '#1a1a1a',
  },
  summaryAmount: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#f84464',
  },
  note: {
    backgroundColor: '#fef2f4',
    padding: 12,
    borderRadius: 8,
    fontSize: '0.9rem',
    color: '#f84464',
    border: '1px solid #ffe0e5',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: '1px solid #f0f0f0',
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#1a1a1a',
    marginBottom: 24,
  },
  methodTabs: {
    display: 'flex',
    gap: 16,
    marginBottom: 24,
    borderBottom: '1px solid #eee',
    paddingBottom: 16,
  },
  methodTab: {
    flex: 1,
    padding: '12px 0',
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    fontWeight: 500,
    color: '#999',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    transition: 'all 0.2s',
  },
  methodTabActive: {
    color: '#f84464',
    backgroundColor: '#fef2f4',
  },
  methodIcon: {
    fontSize: '1.2rem',
  },
  errorMessage: {
    backgroundColor: '#ffe0e0',
    color: '#d32f2f',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: '0.9rem',
  },
  inputGroup: {
    marginBottom: 20,
    flex: 1,
  },
  label: {
    display: 'block',
    marginBottom: 6,
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: '1rem',
    transition: 'border 0.2s',
    outline: 'none',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
    marginBottom: 20,
  },
  appGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  appButton: {
    padding: '10px 0',
    borderRadius: 8,
    border: '1px solid #ddd',
    background: '#fff',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  appButtonSelected: {
    borderColor: '#f84464',
    backgroundColor: '#fef2f4',
    color: '#f84464',
  },
  appHint: {
    fontSize: '0.8rem',
    color: '#999',
    marginTop: 8,
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 24,
    borderTop: '1px solid #eee',
  },
  cancelButton: {
    padding: '12px 24px',
    background: 'none',
    border: '1px solid #f84464',
    borderRadius: 40,
    color: '#f84464',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  payButton: {
    padding: '12px 32px',
    backgroundColor: '#f84464',
    border: 'none',
    borderRadius: 40,
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 8px 16px rgba(248,68,100,0.2)',
    transition: 'background 0.2s',
  },
  processingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 60,
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  spinner: {
    width: 60,
    height: 60,
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #f84464',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 24px',
  },
  processingTitle: {
    fontSize: '1.5rem',
    color: '#333',
    marginBottom: 12,
  },
  processingText: {
    color: '#999',
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  successIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#d4edda',
    borderRadius: '50%',
    margin: '0 auto 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 40,
    color: '#28a745',
  },
  successTitle: {
    fontSize: '2rem',
    color: '#28a745',
    marginBottom: 12,
  },
  successText: {
    color: '#666',
    marginBottom: 32,
  },
  detailsBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 20,
    textAlign: 'left',
  },
  detailLabel: {
    fontSize: '0.85rem',
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: '1rem',
    fontWeight: 500,
    color: '#333',
  },
  detailAmount: {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#28a745',
  },
  completedBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#d4edda',
    color: '#28a745',
    borderRadius: 20,
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  nextSteps: {
    backgroundColor: '#e7f5ff',
    padding: 16,
    borderRadius: 8,
    color: '#0066cc',
    marginBottom: 24,
  },
  successActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  primaryButton: {
    padding: '12px 24px',
    backgroundColor: '#f84464',
    border: 'none',
    borderRadius: 40,
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(248,68,100,0.3)',
  },
  secondaryButton: {
    padding: '12px 24px',
    backgroundColor: '#fff',
    border: '1px solid #f84464',
    borderRadius: 40,
    color: '#f84464',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  redirectNote: {
    fontSize: '0.9rem',
    color: '#999',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#fff',
    borderRadius: 16,
    maxWidth: 500,
    margin: '40px auto',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  errorButton: {
    padding: '12px 32px',
    backgroundColor: '#f84464',
    border: 'none',
    borderRadius: 40,
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default FakePaymentPage;