import express from 'express';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const supabase = req.supabase;

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        hotels (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { hotel_id } = req.body;
    const userId = req.user.id;
    const supabase = req.supabase;

    if (!hotel_id) {
      return res.status(400).json({ error: 'Hotel ID is required' });
    }

    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('hotel_id', hotel_id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Hotel is already in favorites' });
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert([{
        user_id: userId,
        hotel_id,
      }])
      .select();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error) {
    console.error('Error adding favorite:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { hotel_id } = req.query;
    const userId = req.user.id;
    const supabase = req.supabase;

    if (!hotel_id) {
      return res.status(400).json({ error: 'Hotel ID is required' });
    }

    const { data, error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('hotel_id', hotel_id)
      .select();

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error('Error removing favorite:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
