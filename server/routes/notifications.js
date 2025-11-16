import express from 'express';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', async (req, res) => {
  try {
    const { id } = req.query;
    const userId = req.user.id;
    const supabase = req.supabase;

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (id) {
      query = query.eq('id', id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { id } = req.query;
    const { is_read } = req.body;
    const userId = req.user.id;
    const supabase = req.supabase;

    if (!id) {
      return res.status(400).json({ error: 'Notification ID is required' });
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read })
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error('Error updating notification:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { id } = req.query;
    const userId = req.user.id;
    const supabase = req.supabase;

    if (!id) {
      return res.status(400).json({ error: 'Notification ID is required' });
    }

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
