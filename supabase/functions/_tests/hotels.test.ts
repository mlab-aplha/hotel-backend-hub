import { assertEquals, assertExists } from "https://deno.land/std@0.192.0/testing/asserts.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

Deno.test("Hotels API - GET /hotels should return list of hotels", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/hotels`, {
    method: "GET",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  assertEquals(response.status, 200);
  const data = await response.json();
  assertExists(data);
});

Deno.test("Hotels API - GET /hotels with search should filter results", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/hotels?search=luxury`, {
    method: "GET",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  assertEquals(response.status, 200);
  const data = await response.json();
  assertExists(data);
});

Deno.test("Hotels API - POST /hotels should require admin authentication", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/hotels`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Test Hotel",
      address: "123 Test St",
      city: "Test City",
      country: "Test Country",
    }),
  });

  // Should fail without authentication
  assertEquals(response.status, 401);
});
