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
      .from('bookings')
      .select(`
        *,
        rooms (
          *,
          hotels (*)
        )
      `)
      .eq('user_id', userId);

    if (id) {
      query = query.eq('id', id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { room_id, check_in_date, check_out_date, number_of_guests, number_of_rooms, special_requests } = req.body;
    const userId = req.user.id;
    const supabase = req.supabase;

    if (!room_id || !check_in_date || !check_out_date || !number_of_guests || !number_of_rooms) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);

    if (checkIn >= checkOut) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*, hotels(*)')
      .eq('id', room_id)
      .single();

    if (roomError || !room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.available_rooms < number_of_rooms) {
      return res.status(400).json({ error: 'Not enough rooms available' });
    }

    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price_per_night * nights * number_of_rooms;

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        user_id: userId,
        room_id,
        check_in_date,
        check_out_date,
        number_of_guests,
        number_of_rooms,
        special_requests,
        total_price: totalPrice,
        status: 'pending',
      }])
      .select()
      .single();

    if (bookingError) throw bookingError;

    const { error: updateError } = await supabase
      .from('rooms')
      .update({ available_rooms: room.available_rooms - number_of_rooms })
      .eq('id', room_id);

    if (updateError) throw updateError;

    await supabase.from('notifications').insert([{
      user_id: userId,
      title: 'Booking Confirmation',
      message: `Your booking at ${room.hotels.name} has been confirmed!`,
      type: 'booking',
    }]);

    return res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { id } = req.query;
    const { status } = req.body;
    const userId = req.user.id;
    const supabase = req.supabase;

    if (!id) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, rooms(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (status === 'cancelled' && booking.status !== 'cancelled') {
      const { error: updateRoomError } = await supabase
        .from('rooms')
        .update({ available_rooms: booking.rooms.available_rooms + booking.number_of_rooms })
        .eq('id', booking.room_id);

      if (updateRoomError) throw updateRoomError;
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    await supabase.from('notifications').insert([{
      user_id: userId,
      title: 'Booking Updated',
      message: `Your booking status has been updated to ${status}`,
      type: 'booking',
    }]);

    return res.json(data);
  } catch (error) {
    console.error('Error updating booking:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { id } = req.query;
    const userId = req.user.id;
    const supabase = req.supabase;

    if (!id) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    const { data, error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error('Error deleting booking:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
