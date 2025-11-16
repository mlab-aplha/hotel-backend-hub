import express from 'express';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { id, hotel_id } = req.query;
    const supabase = req.supabase;

    let query = supabase.from('rooms').select('*');

    if (id) {
      query = query.eq('id', id);
    }

    if (hotel_id) {
      query = query.eq('hotel_id', hotel_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { hotel_id, room_type, capacity, price_per_night, total_rooms, available_rooms, description, amenities } = req.body;

    if (!hotel_id || !room_type || !capacity || !price_per_night || !total_rooms || available_rooms === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = req.supabase || createSupabaseClient(token);

    const { data, error } = await supabase
      .from('rooms')
      .insert([{
        hotel_id,
        room_type,
        capacity,
        price_per_night,
        total_rooms,
        available_rooms,
        description,
        amenities,
      }])
      .select();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error) {
    console.error('Error creating room:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = req.supabase || createSupabaseClient(token);

    const { data, error } = await supabase
      .from('rooms')
      .update(req.body)
      .eq('id', id)
      .select();

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error('Error updating room:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = req.supabase || createSupabaseClient(token);

    const { data, error } = await supabase.from('rooms').delete().eq('id', id).select();

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error('Error deleting room:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
