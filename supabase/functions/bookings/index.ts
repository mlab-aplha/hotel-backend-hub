import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const url = new URL(req.url);
    const bookingId = url.searchParams.get('id');

    // GET - Fetch bookings
    if (req.method === 'GET') {
      let query = supabaseClient
        .from('bookings')
        .select(`
          *,
          room:rooms(
            *,
            hotel:hotels(*)
          ),
          user:profiles(*)
        `);

      if (bookingId) {
        query = query.eq('id', bookingId);
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // POST - Create booking
    if (req.method === 'POST') {
      const body = await req.json();

      // Validate dates
      const checkIn = new Date(body.check_in_date);
      const checkOut = new Date(body.check_out_date);
      
      if (checkOut <= checkIn) {
        return new Response(JSON.stringify({ error: 'Check-out date must be after check-in date' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // Check room availability
      const { data: room, error: roomError } = await supabaseClient
        .from('rooms')
        .select('*')
        .eq('id', body.room_id)
        .single();

      if (roomError) throw roomError;

      if (room.available_rooms < body.number_of_rooms) {
        return new Response(JSON.stringify({ error: 'Not enough rooms available' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // Calculate total price
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      const totalPrice = room.price_per_night * body.number_of_rooms * nights;

      // Create booking
      const { data: booking, error: bookingError } = await supabaseClient
        .from('bookings')
        .insert({
          user_id: user.id,
          room_id: body.room_id,
          check_in_date: body.check_in_date,
          check_out_date: body.check_out_date,
          number_of_rooms: body.number_of_rooms,
          number_of_guests: body.number_of_guests,
          total_price: totalPrice,
          special_requests: body.special_requests,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Update room availability
      await supabaseClient
        .from('rooms')
        .update({ available_rooms: room.available_rooms - body.number_of_rooms })
        .eq('id', body.room_id);

      // Create notification
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Booking Confirmation',
          message: `Your booking has been created successfully. Booking ID: ${booking.id}`,
          type: 'booking',
        });

      console.log('Booking created:', booking.id);

      return new Response(JSON.stringify(booking), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PUT - Update booking status (admin or cancel own booking)
    if (req.method === 'PUT') {
      if (!bookingId) {
        return new Response(JSON.stringify({ error: 'Booking ID required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const body = await req.json();

      // Get current booking
      const { data: currentBooking, error: fetchError } = await supabaseClient
        .from('bookings')
        .select('*, room:rooms(*)')
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;

      // If cancelling, restore room availability
      if (body.status === 'cancelled' && currentBooking.status !== 'cancelled') {
        await supabaseClient
          .from('rooms')
          .update({ 
            available_rooms: currentBooking.room.available_rooms + currentBooking.number_of_rooms 
          })
          .eq('id', currentBooking.room_id);
      }

      const { data, error } = await supabaseClient
        .from('bookings')
        .update(body)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      // Create notification
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: currentBooking.user_id,
          title: 'Booking Updated',
          message: `Your booking status has been updated to: ${body.status}`,
          type: 'booking',
        });

      console.log('Booking updated:', bookingId);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // DELETE - Delete booking (admin only)
    if (req.method === 'DELETE') {
      if (!bookingId) {
        return new Response(JSON.stringify({ error: 'Booking ID required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const { error } = await supabaseClient
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      console.log('Booking deleted:', bookingId);

      return new Response(JSON.stringify({ message: 'Booking deleted successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});