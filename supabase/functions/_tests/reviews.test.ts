import { assertEquals, assertExists } from "https://deno.land/std@0.192.0/testing/asserts.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

Deno.test("Reviews API - GET /reviews should work without authentication", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/reviews?hotel_id=test-hotel-id`, {
    method: "GET",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  assertEquals(response.status, 200);
  const data = await response.json();
  assertExists(data);
});

Deno.test("Reviews API - POST /reviews should require authentication", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/reviews`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      hotel_id: "test-hotel-id",
      rating: 5,
      comment: "Great hotel!",
    }),
  });

  // Should fail without authentication
  assertEquals(response.status, 401);
});

Deno.test("Reviews API - DELETE /reviews should require authentication", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/reviews?review_id=test-review-id`, {
    method: "DELETE",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  // Should fail without authentication
  assertEquals(response.status, 401);
});
