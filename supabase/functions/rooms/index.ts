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

    const url = new URL(req.url);
    const roomId = url.searchParams.get('id');
    const hotelId = url.searchParams.get('hotel_id');

    // GET - Fetch rooms
    if (req.method === 'GET') {
      let query = supabaseClient
        .from('rooms')
        .select(`
          *,
          hotel:hotels(*)
        `);

      if (roomId) {
        query = query.eq('id', roomId);
      }
      if (hotelId) {
        query = query.eq('hotel_id', hotelId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // POST - Create room (admin only)
    if (req.method === 'POST') {
      const body = await req.json();

      const { data, error } = await supabaseClient
        .from('rooms')
        .insert({
          hotel_id: body.hotel_id,
          room_type: body.room_type,
          capacity: body.capacity,
          price_per_night: body.price_per_night,
          total_rooms: body.total_rooms,
          available_rooms: body.available_rooms || body.total_rooms,
          description: body.description,
          amenities: body.amenities,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Room created:', data.id);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PUT - Update room (admin only)
    if (req.method === 'PUT') {
      if (!roomId) {
        return new Response(JSON.stringify({ error: 'Room ID required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const body = await req.json();

      const { data, error } = await supabaseClient
        .from('rooms')
        .update(body)
        .eq('id', roomId)
        .select()
        .single();

      if (error) throw error;

      console.log('Room updated:', roomId);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // DELETE - Delete room (admin only)
    if (req.method === 'DELETE') {
      if (!roomId) {
        return new Response(JSON.stringify({ error: 'Room ID required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const { error } = await supabaseClient
        .from('rooms')
        .delete()
        .eq('id', roomId);

      if (error) throw error;

      console.log('Room deleted:', roomId);

      return new Response(JSON.stringify({ message: 'Room deleted successfully' }), {
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