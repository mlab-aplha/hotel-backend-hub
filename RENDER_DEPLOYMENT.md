# Deploy to Render

This guide will help you deploy your hotel booking backend to Render.

## Prerequisites

- A [Render account](https://render.com) (free tier available)
- Your Supabase credentials:
  - SUPABASE_URL: `https://uktflnzynfwoqpurgbhm.supabase.co`
  - SUPABASE_ANON_KEY: (from your Lovable Cloud project)

## Deployment Steps

### Option 1: Automatic Deployment (Recommended)

1. **Push to GitHub** (if you haven't already)
   - Connect your Lovable project to GitHub
   - Your code will automatically sync

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables**
   - Render will prompt you to set:
     - `SUPABASE_URL`: `https://uktflnzynfwoqpurgbhm.supabase.co`
     - `SUPABASE_ANON_KEY`: Your Lovable Cloud anon key
     - `STRIPE_SECRET_KEY`: `rk_test_51STzPCH0PYWHG0pzNG2iwIPDOLUnsVcyL3FJDTxYcMjnY2skNG4Oq3ZsWf9h724gNvUMgHyvv1hfJPlqW3GpXzgD007JcXQYks`

4. **Deploy**
   - Click "Apply" to start deployment
   - Wait for the build to complete (~2-3 minutes)
   - Your API will be live at `https://hotel-booking-api.onrender.com`

### Option 2: Manual Deployment

1. **Create a New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the Service**
   - **Name**: `hotel-booking-api`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
   - **Plan**: Free (or your preferred plan)

3. **Set Environment Variables**
   - Click "Environment" tab
   - Add these variables:
     ```
     NODE_ENV=production
     SUPABASE_URL=https://uktflnzynfwoqpurgbhm.supabase.co
     SUPABASE_ANON_KEY=your_anon_key_here
     STRIPE_SECRET_KEY=rk_test_51STzPCH0PYWHG0pzNG2iwIPDOLUnsVcyL3FJDTxYcMjnY2skNG4Oq3ZsWf9h724gNvUMgHyvv1hfJPlqW3GpXzgD007JcXQYks
     ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

## Verify Deployment

Once deployed, test your API:

```bash
# Health check
curl https://your-app.onrender.com/health

# Get hotels (public endpoint)
curl https://your-app.onrender.com/api/hotels

# Create booking (requires authentication)
curl -X POST https://your-app.onrender.com/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "room_id": "room-uuid",
    "check_in_date": "2025-12-01",
    "check_out_date": "2025-12-05",
    "number_of_guests": 2,
    "number_of_rooms": 1
  }'
```

## API Endpoints

Your deployed API will have these endpoints:

- `GET /health` - Health check
- `GET /api/hotels` - List hotels (public)
- `POST /api/hotels` - Create hotel (admin)
- `GET /api/rooms` - List rooms (public)
- `POST /api/rooms` - Create room (admin)
- `GET /api/reviews` - List reviews (public)
- `POST /api/reviews` - Create review (authenticated)
- `GET /api/bookings` - List user bookings (authenticated)
- `POST /api/bookings` - Create booking (authenticated)
- `GET /api/favorites` - List favorites (authenticated)
- `POST /api/favorites` - Add favorite (authenticated)
- `GET /api/notifications` - List notifications (authenticated)

## Authentication

All authenticated endpoints require a JWT token from Supabase:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

To get a JWT token, use the Supabase Auth API or your authentication flow.

## Monitoring

- **Logs**: View real-time logs in the Render Dashboard
- **Metrics**: Monitor CPU, memory, and bandwidth usage
- **Alerts**: Set up alerts for downtime or errors

## Costs

- **Free Tier**: 
  - 750 hours/month
  - Automatically sleeps after 15 minutes of inactivity
  - Cold starts may take 30+ seconds

- **Paid Plans**: 
  - Start at $7/month
  - Always-on instances
  - Instant response times
  - Custom domains

## Important Notes

1. **Database**: This Express server connects to the **same** Supabase database as your Lovable Cloud backend
2. **Dual Hosting**: You can run both Lovable Cloud Edge Functions AND this Render deployment simultaneously
3. **RLS Policies**: All database access respects your Supabase Row Level Security policies
4. **No Data Migration**: No need to migrate data - both backends use the same database

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node version compatibility

### 500 Errors
- Check environment variables are set correctly
- View logs in Render Dashboard
- Verify Supabase credentials

### Authentication Issues
- Ensure JWT token is valid
- Check token is passed in `Authorization` header
- Verify RLS policies in Supabase

## Need Help?

- [Render Documentation](https://render.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- Check the logs in Render Dashboard for detailed error messages
