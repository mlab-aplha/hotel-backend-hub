import { assertEquals, assertExists } from "https://deno.land/std@0.192.0/testing/asserts.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

Deno.test("Notifications API - GET /notifications should require authentication", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/notifications`, {
    method: "GET",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  // Should fail without authentication
  assertEquals(response.status, 401);
});

Deno.test("Notifications API - PUT /notifications should require authentication", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/notifications?notification_id=test-notification-id`, {
    method: "PUT",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      is_read: true,
    }),
  });

  // Should fail without authentication
  assertEquals(response.status, 401);
});

Deno.test("Notifications API - POST /notifications should require admin authentication", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/notifications`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: "test-user-id",
      title: "Test Notification",
      message: "This is a test",
      type: "info",
    }),
  });

  // Should fail without admin authentication
  assertEquals(response.status, 401);
});
