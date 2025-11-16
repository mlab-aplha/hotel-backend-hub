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
    const reviewId = url.searchParams.get('id');
    const hotelId = url.searchParams.get('hotel_id');

    // GET - Fetch reviews
    if (req.method === 'GET') {
      let query = supabaseClient
        .from('reviews')
        .select(`
          *,
          user:profiles(*),
          hotel:hotels(name)
        `)
        .order('created_at', { ascending: false });

      if (reviewId) {
        query = query.eq('id', reviewId);
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

    // POST - Create review (authenticated users only)
    if (req.method === 'POST') {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        });
      }

      const body = await req.json();

      // Validate rating
      if (body.rating < 1 || body.rating > 5) {
        return new Response(JSON.stringify({ error: 'Rating must be between 1 and 5' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const { data, error } = await supabaseClient
        .from('reviews')
        .insert({
          user_id: user.id,
          hotel_id: body.hotel_id,
          rating: body.rating,
          comment: body.comment,
        })
        .select(`
          *,
          user:profiles(*),
          hotel:hotels(name)
        `)
        .single();

      if (error) {
        if (error.code === '23505') {
          return new Response(JSON.stringify({ error: 'You have already reviewed this hotel' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }
        throw error;
      }

      console.log('Review created:', data.id);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PUT - Update review (own review only)
    if (req.method === 'PUT') {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        });
      }

      if (!reviewId) {
        return new Response(JSON.stringify({ error: 'Review ID required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const body = await req.json();

      const { data, error } = await supabaseClient
        .from('reviews')
        .update({
          rating: body.rating,
          comment: body.comment,
        })
        .eq('id', reviewId)
        .select(`
          *,
          user:profiles(*),
          hotel:hotels(name)
        `)
        .single();

      if (error) throw error;

      console.log('Review updated:', reviewId);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // DELETE - Delete review (own review or admin)
    if (req.method === 'DELETE') {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        });
      }

      if (!reviewId) {
        return new Response(JSON.stringify({ error: 'Review ID required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const { error } = await supabaseClient
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      console.log('Review deleted:', reviewId);

      return new Response(JSON.stringify({ message: 'Review deleted successfully' }), {
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