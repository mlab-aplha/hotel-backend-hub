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
    const hotelId = url.searchParams.get('id');

    // GET - Fetch hotels with optional filters
    if (req.method === 'GET') {
      let query = supabaseClient
        .from('hotels')
        .select(`
          *,
          hotel_images(*),
          hotel_facilities(*),
          rooms(*),
          reviews(rating)
        `);

      // Apply filters
      const city = url.searchParams.get('city');
      const country = url.searchParams.get('country');
      const minPrice = url.searchParams.get('minPrice');
      const maxPrice = url.searchParams.get('maxPrice');
      const rating = url.searchParams.get('rating');
      const search = url.searchParams.get('search');

      if (hotelId) {
        query = query.eq('id', hotelId);
      }
      if (city) query = query.ilike('city', `%${city}%`);
      if (country) query = query.ilike('country', `%${country}%`);
      if (rating) query = query.gte('star_rating', parseInt(rating));
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,city.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate average ratings
      let hotels = Array.isArray(data) ? data : [data];
      hotels = hotels.map(hotel => {
        const reviews = hotel.reviews || [];
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
          : 0;
        return { ...hotel, average_rating: avgRating, total_reviews: reviews.length };
      });

      return new Response(JSON.stringify(hotelId ? hotels[0] : hotels), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // POST - Create new hotel (admin only)
    if (req.method === 'POST') {
      const body = await req.json();
      
      const { data: hotel, error: hotelError } = await supabaseClient
        .from('hotels')
        .insert({
          name: body.name,
          description: body.description,
          address: body.address,
          city: body.city,
          country: body.country,
          star_rating: body.star_rating,
          latitude: body.latitude,
          longitude: body.longitude,
          check_in_time: body.check_in_time,
          check_out_time: body.check_out_time,
          policies: body.policies,
        })
        .select()
        .single();

      if (hotelError) throw hotelError;

      console.log('Hotel created:', hotel.id);

      return new Response(JSON.stringify(hotel), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PUT - Update hotel (admin only)
    if (req.method === 'PUT') {
      if (!hotelId) {
        return new Response(JSON.stringify({ error: 'Hotel ID required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const body = await req.json();
      
      const { data, error } = await supabaseClient
        .from('hotels')
        .update(body)
        .eq('id', hotelId)
        .select()
        .single();

      if (error) throw error;

      console.log('Hotel updated:', hotelId);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // DELETE - Delete hotel (admin only)
    if (req.method === 'DELETE') {
      if (!hotelId) {
        return new Response(JSON.stringify({ error: 'Hotel ID required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const { error } = await supabaseClient
        .from('hotels')
        .delete()
        .eq('id', hotelId);

      if (error) throw error;

      console.log('Hotel deleted:', hotelId);

      return new Response(JSON.stringify({ message: 'Hotel deleted successfully' }), {
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