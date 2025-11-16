import { assertEquals, assertExists } from "https://deno.land/std@0.192.0/testing/asserts.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

Deno.test("Bookings API - POST /bookings should require authentication", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/bookings`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      room_id: "test-room-id",
      check_in_date: "2025-12-01",
      check_out_date: "2025-12-05",
      number_of_guests: 2,
      number_of_rooms: 1,
    }),
  });

  // Should fail without authentication
  assertEquals(response.status, 401);
});

Deno.test("Bookings API - GET /bookings should require authentication", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/bookings`, {
    method: "GET",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  // Should fail without authentication
  assertEquals(response.status, 401);
});
