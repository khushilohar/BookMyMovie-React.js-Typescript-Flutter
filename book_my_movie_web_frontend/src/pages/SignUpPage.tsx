import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';
import { SignUpData } from '../types';

const SignUpPage: React.FC = () => {
  const [formData, setFormData] = useState<SignUpData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false); // Toast visibility

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await userApi.signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      // Show success toast
      setShowToast(true);

      // Redirect to OTP verification after 2 seconds
      setTimeout(() => {
        setShowToast(false);
        navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toast animation keyframes */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          minHeight: 'calc(100vh - 70px)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            padding: '40px',
            width: '100%',
            maxWidth: '450px'
          }}
        >
          <h2
            style={{
              textAlign: 'center',
              marginBottom: '30px',
              color: '#333',
              fontSize: '28px'
            }}
          >
            Create Account
          </h2>

          {/* Error message (inline) */}
          {error && (
            <div
              style={{
                padding: '15px',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #f5c6cb'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            {/* Password with eye */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Password</label>
              <div style={inputWrapperStyle}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={inputWithIconStyle}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={eyeButtonStyle}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm Password with eye */}
            <div style={{ marginBottom: '25px' }}>
              <label style={labelStyle}>Confirm Password</label>
              <div style={inputWrapperStyle}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  style={inputWithIconStyle}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={eyeButtonStyle}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonStyle,
                background: "linear-gradient(90deg, #e12c26, #ba1cc8)",
              }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ color: '#666' }}>
              Already have an account?{' '}
              <Link to="/signin" style={linkStyle}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div style={toastStyle}>
          ✅ Account created successfully! Redirecting...
        </div>
      )}
    </>
  );
};

/* ---------- Styles ---------- */
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 15px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '16px',
  transition: 'border-color 0.3s',
  boxSizing: 'border-box',
};

const inputWrapperStyle: React.CSSProperties = {
  position: 'relative',
};

const inputWithIconStyle: React.CSSProperties = {
  ...inputStyle,
  paddingRight: '45px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  color: '#555',
  fontWeight: '500',
};

const eyeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '20px',
  color: '#777',
  padding: '5px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '15px',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold',
  transition: 'background-color 0.3s',
  marginBottom: '20px',
};

const linkStyle: React.CSSProperties = {
  color: '#007bff',
  textDecoration: 'none',
  fontWeight: 'bold',
};

const toastStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '50px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: "linear-gradient(90deg, #82c0f2, #1c66c8)",
  color: '#fff',
  padding: '14px 24px',
  borderRadius: "8px 20px 8px 20px",
  fontSize: '14px',
  fontWeight: 500,
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  animation: 'slideUp 0.4s ease',
  zIndex: 9999,
};

export default SignUpPage;