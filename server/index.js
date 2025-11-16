import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import hotelsRouter from './routes/hotels.js';
import bookingsRouter from './routes/bookings.js';
import reviewsRouter from './routes/reviews.js';
import roomsRouter from './routes/rooms.js';
import favoritesRouter from './routes/favorites.js';
import notificationsRouter from './routes/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/hotels', hotelsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/notifications', notificationsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Hotel Booking API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      hotels: '/api/hotels',
      bookings: '/api/bookings',
      reviews: '/api/reviews',
      rooms: '/api/rooms',
      favorites: '/api/favorites',
      notifications: '/api/notifications',
    },
  });
});

// Error handling middleware
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
});

export default app;
