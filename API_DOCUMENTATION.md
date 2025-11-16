# Hotel Booking API Documentation

## Overview

This is a comprehensive REST API for a hotel booking system (Supabase Edge Functions). All endpoints follow RESTful standards with proper HTTP methods and status codes.

## Base URL

```
https://uktflnzynfwoqpurgbhm.supabase.co/functions/v1
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## API Endpoints

### Hotels API (`/hotels`)

#### GET - List Hotels

Fetch all hotels with optional filters.

**Endpoint:** `GET /hotels`

**Query Parameters:**

- `id` - Hotel ID (returns single hotel)
- `city` - Filter by city (case-insensitive)
- `country` - Filter by country (case-insensitive)
- `minPrice` - Minimum price per night
- `maxPrice` - Maximum price per night
- `rating` - Minimum star rating (1-5)
- `search` - Search in name, description, or city

**Response:**

```json
[
  {
    "id": "uuid",
    "name": "Grand Hotel",
    "description": "Luxury hotel in the city center",
    "address": "123 Main St",
    "city": "New York",
    "country": "USA",
    "star_rating": 5,
    "latitude": 40.7128,
    "longitude": -74.0060,
    "check_in_time": "15:00:00",
    "check_out_time": "11:00:00",
    "policies": "No smoking, pets allowed",
    "average_rating": 4.5,
    "total_reviews": 120,
    "hotel_images": [...],
    "hotel_facilities": [...],
    "rooms": [...]
  }
]
```

#### POST - Create Hotel (Admin Only)

Create a new hotel.

**Endpoint:** `POST /hotels`

**Request Body:**

```json
{
  "name": "Grand Hotel",
  "description": "Luxury hotel",
  "address": "123 Main St",
  "city": "New York",
  "country": "USA",
  "star_rating": 5,
  "latitude": 40.7128,
  "longitude": -74.0060,
  "check_in_time": "15:00",
  "check_out_time": "11:00",
  "policies": "No smoking"
}
```

#### PUT - Update Hotel (Admin Only)

Update hotel details.

**Endpoint:** `PUT /hotels?id=HOTEL_ID`

**Request Body:** Any hotel fields to update

#### DELETE - Delete Hotel (Admin Only)

Delete a hotel.

**Endpoint:** `DELETE /hotels?id=HOTEL_ID`

---

### Rooms API (`/rooms`)

#### GET - List Rooms

Fetch rooms with optional filters.

**Endpoint:** `GET /rooms`

**Query Parameters:**

- `id` - Room ID
- `hotel_id` - Filter by hotel ID

**Response:**

```json
[
  {
    "id": "uuid",
    "hotel_id": "uuid",
    "room_type": "Deluxe Suite",
    "capacity": 2,
    "price_per_night": 250.00,
    "total_rooms": 10,
    "available_rooms": 7,
    "description": "Spacious room with city view",
    "amenities": ["WiFi", "TV", "Mini-bar"],
    "hotel": {...}
  }
]
```

#### POST - Create Room (Admin Only)

Add a new room type to a hotel.

**Endpoint:** `POST /rooms`

**Request Body:**

```json
{
  "hotel_id": "uuid",
  "room_type": "Deluxe Suite",
  "capacity": 2,
  "price_per_night": 250.00,
  "total_rooms": 10,
  "available_rooms": 10,
  "description": "Spacious room",
  "amenities": ["WiFi", "TV"]
}
```

#### PUT - Update Room (Admin Only)

Update room details.

**Endpoint:** `PUT /rooms?id=ROOM_ID`

#### DELETE - Delete Room (Admin Only)

Delete a room type.

**Endpoint:** `DELETE /rooms?id=ROOM_ID`

---

### Bookings API (`/bookings`)

#### GET - List Bookings (Authenticated)

Fetch user's bookings or all bookings (admin).

**Endpoint:** `GET /bookings`

**Query Parameters:**

- `id` - Booking ID

**Response:**

```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "room_id": "uuid",
    "check_in_date": "2024-12-01",
    "check_out_date": "2024-12-05",
    "number_of_rooms": 2,
    "number_of_guests": 4,
    "total_price": 1000.00,
    "status": "confirmed",
    "special_requests": "Late check-in",
    "payment_status": "paid",
    "room": {...},
    "user": {...}
  }
]
```

#### POST - Create Booking (Authenticated)

Create a new booking.

**Endpoint:** `POST /bookings`

**Request Body:**

```json
{
  "room_id": "uuid",
  "check_in_date": "2024-12-01",
  "check_out_date": "2024-12-05",
  "number_of_rooms": 2,
  "number_of_guests": 4,
  "special_requests": "Late check-in"
}
```

**Response:** Returns created booking with calculated `total_price`

#### PUT - Update Booking

Update booking status or details.

**Endpoint:** `PUT /bookings?id=BOOKING_ID`

**Request Body:**

```json
{
  "status": "confirmed",
  "payment_status": "paid"
}
```

#### DELETE - Delete Booking (Admin Only)

Delete a booking.

**Endpoint:** `DELETE /bookings?id=BOOKING_ID`

---

### Reviews API (`/reviews`)

#### GET - List Reviews

Fetch reviews for hotels.

**Endpoint:** `GET /reviews`

**Query Parameters:**

- `id` - Review ID
- `hotel_id` - Filter by hotel ID

**Response:**

```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "hotel_id": "uuid",
    "rating": 5,
    "comment": "Excellent stay!",
    "created_at": "2024-01-01T00:00:00Z",
    "user": {...},
    "hotel": {...}
  }
]
```

#### POST - Create Review (Authenticated)

Create a review for a hotel.

**Endpoint:** `POST /reviews`

**Request Body:**

```json
{
  "hotel_id": "uuid",
  "rating": 5,
  "comment": "Excellent stay!"
}
```

**Note:** Users can only review each hotel once.

#### PUT - Update Review (Authenticated)

Update your own review.

**Endpoint:** `PUT /reviews?id=REVIEW_ID`

**Request Body:**

```json
{
  "rating": 4,
  "comment": "Updated review"
}
```

#### DELETE - Delete Review (Authenticated)

Delete your own review.

**Endpoint:** `DELETE /reviews?id=REVIEW_ID`

---

### Favorites API (`/favorites`)

#### GET - List Favorites (Authenticated)

Fetch user's favorite hotels.

**Endpoint:** `GET /favorites`

**Response:**

```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "hotel_id": "uuid",
    "hotel": {...}
  }
]
```

#### POST - Add to Favorites (Authenticated)

Add a hotel to favorites.

**Endpoint:** `POST /favorites`

**Request Body:**

```json
{
  "hotel_id": "uuid"
}
```

#### DELETE - Remove from Favorites (Authenticated)

Remove a hotel from favorites.

**Endpoint:** `DELETE /favorites?hotel_id=HOTEL_ID`

---

### Notifications API (`/notifications`)

#### GET - List Notifications (Authenticated)

Fetch user's notifications.

**Endpoint:** `GET /notifications`

**Query Parameters:**

- `id` - Notification ID

**Response:**

```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Booking Confirmation",
    "message": "Your booking has been confirmed",
    "type": "booking",
    "is_read": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### PUT - Mark as Read (Authenticated)

Mark a notification as read.

**Endpoint:** `PUT /notifications?id=NOTIFICATION_ID`

#### DELETE - Delete Notification (Authenticated)

Delete a notification.

**Endpoint:** `DELETE /notifications?id=NOTIFICATION_ID`

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

## Error Response Format

```json
{
  "error": "Error message description"
}
```

## Data Models

### Booking Status Enum

- `pending` - Booking created, awaiting confirmation
- `confirmed` - Booking confirmed
- `cancelled` - Booking cancelled
- `completed` - Stay completed

### User Roles

- `user` - Regular user (default)
- `admin` - Administrator with full access

## Security Features

1. **Row Level Security (RLS)** - Database-level access control
2. **JWT Authentication** - Token-based authentication
3. **Role-based Access** - Admin vs User permissions
4. **Input Validation** - Server-side validation of all inputs
5. **CORS Headers** - Proper CORS configuration

## Database Schema

### Tables

- `profiles` - User profiles
- `user_roles` - User role assignments
- `hotels` - Hotel information
- `hotel_facilities` - Hotel amenities
- `hotel_images` - Hotel photo gallery
- `rooms` - Room types and availability
- `bookings` - User bookings
- `reviews` - User reviews and ratings
- `favorites` - User favorite hotels
- `notifications` - System notifications

### Storage

- `hotel-images` - Public bucket for hotel images

## Notes

- Auto-confirm email is enabled for development
- All timestamps are in UTC
- Prices are stored as DECIMAL(10, 2)
- Room availability is automatically managed on booking/cancellation
- Notifications are automatically created for bookings and status changes
