# API Tests

This directory contains integration tests for all the hotel booking API endpoints.

## Running Tests

To run the tests, use the Supabase CLI:

```bash
# Run all tests
supabase functions test

# Run specific test file
supabase functions test _tests/hotels.test.ts
```

## Test Coverage

### Hotels API (`hotels.test.ts`)
- ✅ GET /hotels - List hotels (public)
- ✅ GET /hotels with search - Filter hotels (public)
- ✅ POST /hotels - Create hotel (admin only)

### Bookings API (`bookings.test.ts`)
- ✅ POST /bookings - Create booking (authenticated users)
- ✅ GET /bookings - List user bookings (authenticated users)

### Reviews API (`reviews.test.ts`)
- ✅ GET /reviews - List reviews (public)
- ✅ POST /reviews - Create review (authenticated users)
- ✅ DELETE /reviews - Delete review (owner or admin)

### Rooms API (`rooms.test.ts`)
- ✅ GET /rooms - List rooms (public)
- ✅ POST /rooms - Create room (admin only)
- ✅ PUT /rooms - Update room (admin only)

### Favorites API (`favorites.test.ts`)
- ✅ GET /favorites - List favorites (authenticated users)
- ✅ POST /favorites - Add favorite (authenticated users)
- ✅ DELETE /favorites - Remove favorite (authenticated users)

### Notifications API (`notifications.test.ts`)
- ✅ GET /notifications - List notifications (authenticated users)
- ✅ PUT /notifications - Mark as read (authenticated users)
- ✅ POST /notifications - Send notification (admin only)

## Authentication Tests

All tests verify that:
- Public endpoints work without authentication
- User endpoints require valid JWT tokens
- Admin endpoints require admin role
- RLS policies are properly enforced

## Notes

- Tests use the `SUPABASE_URL` and `SUPABASE_ANON_KEY` environment variables
- Tests verify HTTP status codes and response structure
- Tests do not modify actual database data (only test authentication/authorization)
