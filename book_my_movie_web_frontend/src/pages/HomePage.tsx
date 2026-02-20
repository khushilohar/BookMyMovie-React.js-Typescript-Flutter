import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { token } = useAuth();

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>Welcome to Movie Booking System</h1>
      <p style={{ fontSize: '18px', marginBottom: '30px' }}>
        Book your favorite movies with ease
      </p>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '40px' }}>
        <Link to="/movies">
          <button style={{
            padding: '12px 24px',
            fontSize: '16px',
    background: "linear-gradient(90deg, #e12c26, #ba1cc8)",
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            Browse Movies
          </button>
        </Link>
        {!token && (
          <Link to="/signup">
            <button style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              Get Started
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default HomePage;