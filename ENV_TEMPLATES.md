# Environment Variables Templates

## Generate Required Secrets First

Run these commands to generate secure secrets:

```bash
# Generate NextAuth Secret
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"

# Generate JWT Secret  
echo "JWT_SECRET=$(openssl rand -base64 32)"

# Generate Session Secret
echo "SESSION_SECRET=$(openssl rand -base64 32)"
```

## Backend Service Environment Variables

Copy and paste these into Railway Dashboard > Backend Service > Variables:

```bash
NODE_ENV=production
PORT=3000

# Database (Railway will provide this automatically if you add PostgreSQL service)
DATABASE_URL=postgresql://username:password@host:port/database

# Redis (Railway will provide this automatically if you add Redis service)
REDIS_URL=redis://username:password@host:port

# Authentication Secrets (use generated values from above)
JWT_SECRET=your-generated-jwt-secret
SESSION_SECRET=your-generated-session-secret

# OpenAI API (required for AI features)
OPENAI_API_KEY=your-openai-api-key

# Frontend URL (will be available after frontend deployment)
FRONTEND_URL=https://your-frontend-service.railway.app

# Optional Services
SENTRY_DSN=your-sentry-dsn
EMAIL_SERVICE_API_KEY=your-email-service-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

## Frontend Service Environment Variables

Copy and paste these into Railway Dashboard > Frontend Service > Variables:

```bash
NODE_ENV=production

# API Connection (will be available after backend deployment)
NEXT_PUBLIC_API_URL=https://your-backend-service.railway.app

# NextAuth Configuration (use generated secret from above)
NEXTAUTH_URL=https://your-frontend-service.railway.app
NEXTAUTH_SECRET=your-generated-nextauth-secret

# OAuth Providers (Optional - only if you want social login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret

# Build Configuration
SKIP_ENV_VALIDATION=true
NEXT_TELEMETRY_DISABLED=1
```

## Quick Setup Checklist

1. ✅ Backend deployed to Railway
2. ⏳ Add PostgreSQL service to your Railway project
3. ⏳ Add Redis service to your Railway project (optional but recommended)
4. ⏳ Deploy frontend to Railway (create new service)
5. ⏳ Copy backend environment variables to backend service
6. ⏳ Copy frontend environment variables to frontend service
7. ⏳ Update FRONTEND_URL in backend service with actual frontend URL
8. ⏳ Update NEXT_PUBLIC_API_URL in frontend service with actual backend URL
9. ⏳ Test the deployment

## Database Setup

After PostgreSQL service is added, run these SQL commands in order:

1. First, run the main schema:
```sql
-- Run: /backend/schema.sql
```

2. Then run all migrations:
```sql
-- Run: /backend/migrations/add-oauth-accounts.sql
-- Run: /backend/migrations/add-user-roles.sql  
-- Run: /backend/migrations/add-community-features.sql
-- Run: /backend/migrations/add-email-system.sql
-- Run: /backend/migrations/performance-indexes.sql
```

## Railway Dashboard Steps

1. Go to https://railway.app/
2. Select your SAYU project
3. You should see your backend service already deployed
4. Click "New Service" → "Deploy from GitHub repo"
5. Select your repository and set root directory to `frontend`
6. Add a PostgreSQL service: "New Service" → "Database" → "PostgreSQL"
7. Add a Redis service: "New Service" → "Database" → "Redis" (optional)
8. Configure environment variables for each service using the templates above

## Testing Your Deployment

Once everything is deployed:

1. Visit your frontend URL
2. Try registering a new account
3. Take a quiz
4. Check that data is being saved
5. Test any OAuth providers you've configured

## Troubleshooting

If you encounter issues:

1. Check the deployment logs in Railway dashboard
2. Verify all environment variables are set
3. Ensure database migrations were run
4. Check that services can communicate with each other
5. Verify OAuth redirect URLs match your deployed frontend URL