# Backend Testing Documentation

This project uses Deno tests to ensure all backend edge functions work correctly.

## Test Structure

### Backend Tests (Deno)
Located in `supabase/functions/_tests/`

All tests verify:
- **Authentication**: Protected endpoints require valid JWT tokens
- **Authorization**: Users can only access their own data
- **Validation**: Required parameters and input validation
- **CORS**: Proper CORS headers are configured
- **Error Handling**: Appropriate error responses

## Running Tests

```bash
# Run all backend tests
supabase functions test

# Run specific test file
supabase functions test _tests/payments.test.ts
supabase functions test _tests/hotels.test.ts
supabase functions test _tests/bookings.test.ts
```

## Test Coverage

### Edge Functions
✅ **Hotels API** - Create, read, update, delete operations (admin only for mutations)
✅ **Rooms API** - Room management and queries (admin only for mutations)
✅ **Bookings API** - Booking creation and management (authenticated users)
✅ **Reviews API** - Review CRUD operations (authenticated users)
✅ **Favorites API** - User favorites management (authenticated users)
✅ **Notifications API** - Notification handling (authenticated users)
✅ **Payments API** - Stripe checkout and payment verification (authenticated users)

## Test Files

### Hotels Tests (`hotels.test.ts`)
- GET /hotels - Public access to hotel listings
- GET /hotels with search - Filtering functionality
- POST /hotels - Admin authentication required

### Bookings Tests (`bookings.test.ts`)
- POST /bookings - Authentication required
- GET /bookings - User's own bookings only

### Reviews Tests (`reviews.test.ts`)
- GET /reviews - Public access to reviews
- POST /reviews - Authentication required to create
- DELETE /reviews - Owner or admin can delete

### Rooms Tests (`rooms.test.ts`)
- GET /rooms - Public access to room listings
- POST /rooms - Admin authentication required
- PUT /rooms - Admin authentication required

### Favorites Tests (`favorites.test.ts`)
- GET /favorites - Authentication required
- POST /favorites - Authentication required
- DELETE /favorites - Authentication required

### Notifications Tests (`notifications.test.ts`)
- GET /notifications - Authentication required
- PUT /notifications - Authentication required to mark as read
- POST /notifications - Admin authentication required

### Payments Tests (`payments.test.ts`)
- POST /create-checkout - Authentication required, bookingId validation
- POST /verify-payment - Authentication required, sessionId validation
- OPTIONS requests - CORS preflight handling

## Writing New Tests

### Backend Test Example

```typescript
import { assertEquals, assertExists } from "https://deno.land/std@0.192.0/testing/asserts.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

Deno.test("Your API - should require authentication", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/your-function`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: "test" }),
  });

  assertEquals(response.status, 401);
  const data = await response.json();
  assertExists(data.error);
});
```

## Test Best Practices

1. **Test Authentication**: Always verify that protected endpoints require authentication
2. **Test Authorization**: Ensure users can only access their own data
3. **Test Validation**: Verify input validation and required parameters
4. **Test CORS**: Check that CORS headers are properly configured
5. **Test Error Cases**: Include tests for error conditions
6. **No Real Data**: Tests should not modify actual database data

## Environment Variables

Tests use these environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

## CI/CD Integration

Tests can be integrated into your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run Backend Tests
  run: supabase functions test
```

## Security Testing

All tests verify:
- ✅ RLS policies are enforced
- ✅ Authentication is required for protected endpoints
- ✅ Users cannot access other users' data
- ✅ Admin endpoints require admin role
- ✅ Input validation prevents injection attacks

## Troubleshooting

### Tests Fail
- Ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
- Check that edge functions are deployed
- Verify database tables and RLS policies are configured
- Review edge function logs for errors

### Authentication Errors
- Verify JWT token format in Authorization header
- Check that auth.users table exists
- Ensure RLS policies reference auth.uid() correctly

## Coverage Goals

- **Backend**: Test all API endpoints and error cases
- **Security**: Test all authentication and authorization paths
- **Integration**: Verify end-to-end payment flows
