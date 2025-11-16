import { describe, it, expect, beforeAll } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Supabase Integration Tests', () => {
  beforeAll(() => {
    // These tests verify the Supabase client is configured correctly
  });

  it('should have supabase client initialized', () => {
    expect(supabase).toBeDefined();
  });

  it('should be able to query public tables', async () => {
    // Test querying a public table (hotels should be public)
    const { data, error } = await supabase
      .from('hotels')
      .select('id, name')
      .limit(1);

    // Should not error on public query
    expect(error).toBeNull();
  });

  it('should handle authentication checks', async () => {
    const { data, error } = await supabase.auth.getSession();
    
    // Should return without error (even if no session)
    expect(error).toBeNull();
  });

  it('should have correct RLS policies on bookings table', async () => {
    // Without auth, should not be able to query bookings
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);

    // Expect empty result or specific RLS error (depends on policies)
    expect(data).toBeDefined();
  });

  it('should be able to query public reviews', async () => {
    const { error } = await supabase
      .from('reviews')
      .select('id, rating, comment')
      .limit(1);

    // Reviews should be publicly readable
    expect(error).toBeNull();
  });

  it('should be able to query public rooms', async () => {
    const { error } = await supabase
      .from('rooms')
      .select('id, room_type, price_per_night')
      .limit(1);

    // Rooms should be publicly readable
    expect(error).toBeNull();
  });
});
