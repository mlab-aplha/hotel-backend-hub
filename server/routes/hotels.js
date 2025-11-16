import express from 'express';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { id, city, country, min_price, max_price, min_rating, search } = req.query;
    const supabase = req.supabase;

    let query = supabase.from('hotels').select('*');

    if (id) {
      query = query.eq('id', id);
    }

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    if (country) {
      query = query.ilike('country', `%${country}%`);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,city.ilike.%${search}%`);
    }

    const { data: hotels, error } = await query;

    if (error) throw error;

    // Fetch reviews and calculate average ratings
    const hotelsWithRatings = await Promise.all(
      hotels.map(async (hotel) => {
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('rating')
          .eq('hotel_id', hotel.id);

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
          return { ...hotel, average_rating: null, total_reviews: 0 };
        }

        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
          : null;

        return {
          ...hotel,
          average_rating: averageRating,
          total_reviews: totalReviews,
        };
      })
    );

    // Apply rating and price filters
    let filteredHotels = hotelsWithRatings;

    if (min_rating) {
      filteredHotels = filteredHotels.filter(
        (hotel) => hotel.average_rating && hotel.average_rating >= parseFloat(min_rating)
      );
    }

    if (min_price || max_price) {
      const { data: rooms } = await supabase.from('rooms').select('hotel_id, price_per_night');
      
      const hotelPrices = {};
      rooms?.forEach((room) => {
        if (!hotelPrices[room.hotel_id] || room.price_per_night < hotelPrices[room.hotel_id]) {
          hotelPrices[room.hotel_id] = room.price_per_night;
        }
      });

      filteredHotels = filteredHotels.filter((hotel) => {
        const minPrice = hotelPrices[hotel.id];
        if (!minPrice) return false;
        if (min_price && minPrice < parseFloat(min_price)) return false;
        if (max_price && minPrice > parseFloat(max_price)) return false;
        return true;
      });
    }

    return res.json(filteredHotels);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = req.supabase || createSupabaseClient(token);

    const { data, error } = await supabase.from('hotels').insert([req.body]).select();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error) {
    console.error('Error creating hotel:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Hotel ID is required' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = req.supabase || createSupabaseClient(token);

    const { data, error } = await supabase
      .from('hotels')
      .update(req.body)
      .eq('id', id)
      .select();

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error('Error updating hotel:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Hotel ID is required' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = req.supabase || createSupabaseClient(token);

    const { data, error } = await supabase.from('hotels').delete().eq('id', id).select();

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error('Error deleting hotel:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
