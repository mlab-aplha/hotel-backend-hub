# Testing Documentation

This project uses comprehensive testing to ensure 100% functionality.

## Test Structure

### Frontend Tests (Vitest)
Located in `src/test/`

- **Unit Tests**: Test individual components and utilities
- **Integration Tests**: Test Supabase client and API interactions
- **Setup**: `src/test/setup.ts` configures the testing environment

### Backend Tests (Deno)
Located in `supabase/functions/_tests/`

- **Edge Function Tests**: Test all Supabase edge functions
- **API Tests**: Verify authentication, authorization, and functionality
- **Payment Tests**: Test Stripe integration endpoints

## Running Tests

### Frontend Tests

```bash
# Run all frontend tests
npm run test

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Backend Tests (Edge Functions)

```bash
# Run all edge function tests
supabase functions test

# Run specific test file
supabase functions test _tests/payments.test.ts
supabase functions test _tests/hotels.test.ts
```

## Test Coverage

### Edge Functions
✅ Hotels API - Create, read, update, delete operations
✅ Rooms API - Room management and queries
✅ Bookings API - Booking creation and management
✅ Reviews API - Review CRUD operations
✅ Favorites API - User favorites management
✅ Notifications API - Notification handling
✅ **Payments API** - Stripe checkout and verification

### Frontend
✅ Supabase client initialization
✅ Public table queries (hotels, rooms, reviews)
✅ RLS policy verification
✅ Component rendering with providers
✅ Environment configuration

## Writing New Tests

### Frontend Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/test/example.test';
import YourComponent from '@/components/YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    const { getByText } = renderWithProviders(<YourComponent />);
    expect(getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Backend Test Example

```typescript
import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";

Deno.test("Your API - should do something", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/your-function`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: "test" }),
  });

  assertEquals(response.status, 200);
});
```

## Test Best Practices

1. **Test Authentication**: Always verify that protected endpoints require authentication
2. **Test Authorization**: Ensure users can only access their own data
3. **Test Validation**: Verify input validation and error handling
4. **Test CORS**: Check that CORS headers are properly configured
5. **Mock External Services**: Mock Stripe and other external APIs in tests
6. **Test Edge Cases**: Include tests for error conditions and edge cases

## CI/CD Integration

Tests can be integrated into your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run Frontend Tests
  run: npm run test:coverage

- name: Run Backend Tests
  run: supabase functions test
```

## Troubleshooting

### Frontend Tests Fail
- Ensure environment variables are set in `src/test/setup.ts`
- Check that all dependencies are installed: `npm install`
- Verify Supabase client is properly mocked

### Backend Tests Fail
- Ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
- Check that edge functions are deployed
- Verify database tables and RLS policies are configured

## Coverage Goals

- **Frontend**: Aim for 80%+ code coverage
- **Backend**: Test all API endpoints and error cases
- **Integration**: Verify end-to-end user flows
- **Security**: Test all authentication and authorization paths
