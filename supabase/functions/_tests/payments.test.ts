import { assertEquals, assertExists } from "https://deno.land/std@0.192.0/testing/asserts.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

Deno.test("Payment API - POST /create-checkout should require authentication", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bookingId: "test-booking-id",
    }),
  });

  // Should fail without authentication
  assertEquals(response.status, 500);
  const data = await response.json();
  assertExists(data.error);
});

Deno.test("Payment API - POST /create-checkout should require bookingId", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": "Bearer invalid-token",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  assertEquals(response.status, 500);
  const data = await response.json();
  assertExists(data.error);
});

Deno.test("Payment API - POST /verify-payment should require authentication", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-payment`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionId: "cs_test_123",
    }),
  });

  // Should fail without authentication
  assertEquals(response.status, 500);
  const data = await response.json();
  assertExists(data.error);
});

Deno.test("Payment API - POST /verify-payment should require sessionId", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-payment`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": "Bearer invalid-token",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  assertEquals(response.status, 500);
  const data = await response.json();
  assertExists(data.error);
});

Deno.test("Payment API - CORS preflight should work for create-checkout", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
    method: "OPTIONS",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  assertEquals(response.status, 200);
  assertEquals(response.headers.get("Access-Control-Allow-Origin"), "*");
});

Deno.test("Payment API - CORS preflight should work for verify-payment", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-payment`, {
    method: "OPTIONS",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  assertEquals(response.status, 200);
  assertEquals(response.headers.get("Access-Control-Allow-Origin"), "*");
});
