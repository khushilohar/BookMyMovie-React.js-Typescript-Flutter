import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SignInData } from '../types';

const SignInPage: React.FC = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState<SignInData>({
    email: '',
    password: '',
    rememberMe: false
  });

  // State for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await userApi.signIn({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      login(response.data.token, response.data.user);

      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        navigate('/movies');
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toast animation keyframes – right to left slide */}
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

      <div style={{ 
        display: 'flex', 
        minHeight: 'calc(100vh - 70px)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          padding: '40px',
          width: '100%',
          maxWidth: '450px'
        }}>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '30px',
            color: '#333',
            fontSize: '28px'
          }}>
            Welcome Back
          </h2>

          {error && (
            <div style={errorBox}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={label}>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={input}
                required
              />
            </div>

            {/* Password field with eye icon */}
            <div style={{ marginBottom: '20px' }}>
              <label style={label}>Password</label>
              <div style={inputWrapperStyle}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
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

            <div style={{ 
              marginBottom: '25px', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                  style={{ marginRight: '8px' }}
                />
                <label style={{ color: '#555' }}>Remember me</label>
              </div>

              <Link to="/forgot-password" style={forgotLink}>
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...submitBtn,
                background: "linear-gradient(90deg, #e12c26, #ba1cc8)",
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#007bff', fontWeight: 'bold' }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Toast Notification – top right, slide in from right */}
      {showToast && (
        <div style={toastStyle}>
          ✅ Signin successful Done!
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
  boxSizing: 'border-box',
};

const inputWrapperStyle: React.CSSProperties = {
  position: 'relative',
};

const inputWithIconStyle: React.CSSProperties = {
  ...inputStyle,
  paddingRight: '45px', // space for the eye icon
};

const input = inputWithIconStyle; // alias for brevity

const label: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  color: '#555',
  fontWeight: 500,
};

const submitBtn: React.CSSProperties = {
  width: '100%',
  padding: '15px',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold',
};

const errorBox: React.CSSProperties = {
  padding: '12px',
  backgroundColor: '#f8d7da',
  color: '#721c24',
  borderRadius: '6px',
  marginBottom: '20px',
};

const forgotLink: React.CSSProperties = {
  color: '#007bff',
  textDecoration: 'none',
  fontSize: '14px',
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

const toastStyle: React.CSSProperties = {
  position: 'fixed',
  top: '20px',
  right: '20px',
 background: "linear-gradient(90deg, #82c0f2, #1c66c8)",
  color: '#fff',
  padding: '14px 24px',
  borderRadius: "8px 20px 8px 20px",
  fontSize: '14px',
  fontWeight: 500,
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  animation: 'slideInRight 0.4s ease',
  zIndex: 9999,
};

export default SignInPage;