import express from 'express';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { id, hotel_id } = req.query;
    const supabase = req.supabase;

    let query = supabase
      .from('reviews')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `);

    if (id) {
      query = query.eq('id', id);
    }

    if (hotel_id) {
      query = query.eq('hotel_id', hotel_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateUser, async (req, res) => {
  try {
    const { hotel_id, rating, comment } = req.body;
    const userId = req.user.id;
    const supabase = req.supabase;

    if (!hotel_id || !rating) {
      return res.status(400).json({ error: 'Hotel ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        user_id: userId,
        hotel_id,
        rating,
        comment,
      }])
      .select();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.put('/', authenticateUser, async (req, res) => {
  try {
    const { id } = req.query;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    const supabase = req.supabase;

    if (!id) {
      return res.status(400).json({ error: 'Review ID is required' });
    }

    const { data, error } = await supabase
      .from('reviews')
      .update({ rating, comment })
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/', authenticateUser, async (req, res) => {
  try {
    const { id } = req.query;
    const userId = req.user.id;
    const supabase = req.supabase;

    if (!id) {
      return res.status(400).json({ error: 'Review ID is required' });
    }

    const { data, error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
