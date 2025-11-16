import { assertEquals, assertExists } from "https://deno.land/std@0.192.0/testing/asserts.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

Deno.test("Rooms API - GET /rooms should work without authentication", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/rooms?hotel_id=test-hotel-id`, {
    method: "GET",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  assertEquals(response.status, 200);
  const data = await response.json();
  assertExists(data);
});

Deno.test("Rooms API - POST /rooms should require admin authentication", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/rooms`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      hotel_id: "test-hotel-id",
      room_type: "Deluxe",
      capacity: 2,
      price_per_night: 150,
      total_rooms: 10,
      available_rooms: 10,
    }),
  });

  // Should fail without admin authentication
  assertEquals(response.status, 401);
});

Deno.test("Rooms API - PUT /rooms should require admin authentication", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/rooms?room_id=test-room-id`, {
    method: "PUT",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_per_night: 200,
    }),
  });

  // Should fail without admin authentication
  assertEquals(response.status, 401);
});
