import axios from 'axios';
import { PaginationParams, CreateBookingData, UpdatePaymentData } from '../types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export const userApi = {
  signUp: (data: { name: string; email: string; password: string }) =>
    api.post('/user/signup', data),
  signIn: (data: { email: string; password: string; rememberMe: boolean }) =>
    api.post('/user/signin', data),
  verifyOtp: (data: { email: string; otp: string }) =>
    api.post('/user/verifyotp', data),
  resendOtp: (data: { email: string }) =>
    api.post('/user/requestotp', data),
  forgotPassword: (data: { email: string }) =>
    api.post('/user/forgot-password', data),
  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post('/user/reset-password', data),
  getUser: () => api.get('/user/getuser'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/user/change-password', data),
  signOut: () => api.get('/user/signout'),
};

export const movieApi = {
  getAllMovies: (page?: number, limit?: number) =>
    api.get('/movie/get-all-movies', { params: { page, limit } }),
  getMovieById: (id: number | string) =>
    api.get(`/movie/${id}`),
  addMovie: (data: any) =>
    api.post('/movie/add', data),
  updateMovie: (id: number | string, data: any) =>
    api.put(`/movie/${id}`, data),
  deleteMovie: (id: number | string) =>
    api.delete(`/movie/${id}`),
  searchMovies: (query: string) =>
    api.get('/movie/search', { params: { q: query } }),
  getNowShowing: () =>
    api.get('/movie/now-showing'),
};

export const hallApi = {
  getAllHalls: () =>
    api.get('/hall'),
  getHallById: (id: number | string) =>
    api.get(`/hall/${id}`),
};

export const seatApi = {
  getSeatsByHall: (hallId: number | string) =>
    api.get(`/seats/hall/${hallId}`),
};

export const showMovieApi = {
  getHallDateSlotByMovieId: (movieId: number | string) =>
    api.get('/showmovie', { params: { movie_id: movieId } }),
  getDateSlotByMovieHall: (movieId: number | string, hallId: number | string) =>
    api.get('/showmovie', { params: { movie_id: movieId, hall_id: hallId } }),
  getHallSlotByMovieDate: (movieId: number | string, showDate: string) =>
    api.get('/showmovie', { params: { movie_id: movieId, show_date: showDate } }),
  getHallDateByMovieSlot: (movieId: number | string, slot: string) =>
    api.get('/showmovie', { params: { movie_id: movieId, slot } }),
  getSlotByMovieHallDate: (movieId: number | string, hallId: number | string, showDate: string) =>
    api.get('/showmovie', { params: { movie_id: movieId, hall_id: hallId, show_date: showDate } }),
  getHallByMovieSlotDate: (movieId: number | string, slot: string, showDate: string) =>
    api.get('/showmovie', { params: { movie_id: movieId, slot, show_date: showDate } }),
  getDateByMovieHallSlot: (movieId: number | string, hallId: number | string, slot: string) =>
    api.get('/showmovie', { params: { movie_id: movieId, hall_id: hallId, slot } }),
};

export const bookingApi = {
  createBooking: (data: CreateBookingData) =>
    api.post('/booking', data),
  getBookingsByUser: (userId: number | string) =>
    api.get(`/booking/user/${userId}`),
  getBookingsByMovie: (movieId: number | string) =>
    api.get(`/booking/movie/${movieId}`),
  getBookingById: (id: number | string) =>
    api.get(`/booking/${id}`),
  cancelBooking: (id: number | string) =>
    api.put(`/booking/cancel/${id}`),
  updatePaymentStatus: (id: number | string, data: UpdatePaymentData) =>
    api.put(`/booking/payment/${id}`, data),
  checkSeats: (params: { movie_id: number, hall_id: number; booking_date: string; slot_selected: string}) =>
    api.get('/booking/check-seats', { params }),
};

export const paymentApi = {
  processPayment: (data: { amount: number; cardNumber: string; cardHolder: string; expiryDate: string; cvv: string }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true,
            transactionId: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            message: 'Payment processed successfully',
            timestamp: new Date().toISOString(),
          },
        });
      }, 2000);
    });
  },
};

export default api;