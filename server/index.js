import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import hotelsRouter from './routes/hotels.js';
import bookingsRouter from './routes/bookings.js';
import reviewsRouter from './routes/reviews.js';
import roomsRouter from './routes/rooms.js';
import favoritesRouter from './routes/favorites.js';
import notificationsRouter from './routes/notifications.js';
import paymentsRouter from './routes/payments.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration - SPECIFIC to your frontend
app.use(cors({
  origin: [
    'https://tribetel-frontend-production.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/hotels', hotelsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/payments', paymentsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Hotel Booking API',
    version: '1.0.0',
    backend_url: 'https://hotel-backend-hub-dyfd.onrender.com',
    frontend_url: 'https://tribetel-frontend-production.onrender.com',
    endpoints: {
      health: '/health',
      hotels: '/api/hotels',
      bookings: '/api/bookings',
      reviews: '/api/reviews',
      rooms: '/api/rooms',
      favorites: '/api/favorites',
      notifications: '/api/notifications',
      payments: '/api/payments',
    },
  });
});


app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: https://tribetel-frontend-production.onrender.com`);
});

export default app;
