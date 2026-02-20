import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieApi } from '../services/api';
import { Movie } from '../types';
import Pagination from '../components/Pagination';

const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchMovie(id);
  }, [id]);

  const fetchMovie = async (movieId: string) => {
    try {
      const response = await movieApi.getMovieById(movieId);
      setMovie(response.data.movie);
    } catch (err) {
      setError('Failed to fetch movie details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '40px', color: '#dc3545' }}>{error}</div>;
  if (!movie) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '30px 20px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
       
        <div style={{ height: '400px', backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {movie.image ? (
            <img src={movie.image} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#666', fontSize: '24px' }}>No Image</span>
          )}
        </div>
        <div style={{ padding: '30px' }}>
          <h1 style={{ marginBottom: '20px', color: '#333' }}>{movie.title}</h1>
          <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>{movie.description}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div>
              <h4 style={{ color: '#333', marginBottom: '5px' }}>Rating</h4>
              <p style={{ fontSize: '24px', color: '#ffc107' }}>★ {movie.rating}</p>
            </div>
            <div>
              <h4 style={{ color: '#333', marginBottom: '5px' }}>Duration</h4>
              <p style={{ fontSize: '18px', color: '#666' }}>{movie.duration_minutes} minutes</p>
            </div>
            <div>
              <h4 style={{ color: '#333', marginBottom: '5px' }}>Release Date</h4>
              <p style={{ fontSize: '18px', color: '#666' }}>
                {movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'TBA'}
              </p>
            </div>
          </div>
          <Link to={`/book-movie/${movie.id}`}>
            <button style={bookButtonStyle}>Book Now</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const bookButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '15px',
  background: "linear-gradient(90deg, #e12c26, #ba1cc8)",
 
  color: 'white',
  border: 'none',
  borderRadius: '30px',
  cursor: 'pointer',
  fontSize: '18px',
  fontWeight: 'bold',
};

export default MovieDetailPage;