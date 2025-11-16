import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

Deno.test("Favorites API - GET /favorites should require authentication", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/favorites`, {
    method: "GET",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  // Should fail without authentication
  assertEquals(response.status, 401);
});

Deno.test("Favorites API - POST /favorites should require authentication", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/favorites`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      hotel_id: "test-hotel-id",
    }),
  });

  // Should fail without authentication
  assertEquals(response.status, 401);
});

Deno.test("Favorites API - DELETE /favorites should require authentication", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/favorites?favorite_id=test-favorite-id`, {
    method: "DELETE",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  // Should fail without authentication
  assertEquals(response.status, 401);
});
