# SAYU Deployment Commands

## Current Status
✅ Backend deployment initiated
⏳ Frontend deployment pending

## Manual Deployment Steps

### Step 1: Check Backend Deployment Status
```bash
# Open Railway dashboard in browser
railway open
```

### Step 2: Deploy Frontend
Since the CLI has TTY limitations, use the Railway dashboard:

1. Go to https://railway.app/project/your-project-id
2. Click "New Service" 
3. Select "Deploy from GitHub repo"
4. Select your SAYU repository
5. Set the service name to "frontend"
6. Set the root directory to `frontend`

### Step 3: Configure Environment Variables

#### Backend Service Environment Variables:
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=your-postgresql-connection-string
REDIS_URL=your-redis-connection-string
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret-key
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=https://your-frontend-domain.railway.app
SENTRY_DSN=your-sentry-dsn (optional)
EMAIL_SERVICE_API_KEY=your-email-service-key (optional)
```

#### Frontend Service Environment Variables:
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app
NEXTAUTH_URL=https://your-frontend-domain.railway.app
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-client-id (optional)
GOOGLE_CLIENT_SECRET=your-google-client-secret (optional)
GITHUB_CLIENT_ID=your-github-client-id (optional)
GITHUB_CLIENT_SECRET=your-github-client-secret (optional)
APPLE_CLIENT_ID=your-apple-client-id (optional)
APPLE_CLIENT_SECRET=your-apple-client-secret (optional)
```

### Step 4: Generate Secrets
```bash
# Generate NextAuth Secret
openssl rand -base64 32

# Generate JWT Secret
openssl rand -base64 32

# Generate Session Secret
openssl rand -base64 32
```

### Step 5: Database Setup
After backend deployment, run database migrations:
```bash
# Connect to your production database and run:
# 1. schema.sql
# 2. All migration files in /migrations/
```

### Step 6: Test Deployment
1. Wait for both services to deploy successfully
2. Visit your frontend URL
3. Test login functionality
4. Test quiz functionality
5. Test API endpoints

## Deployment Checklist
- [ ] Backend service deployed
- [ ] Frontend service deployed  
- [ ] Environment variables configured
- [ ] Database schema applied
- [ ] SSL certificates active
- [ ] Custom domains configured (optional)
- [ ] All features tested

## Troubleshooting
- If build fails, check the build logs in Railway dashboard
- Ensure all environment variables are set correctly
- Verify database connection string is correct
- Check that all required services (PostgreSQL, Redis) are provisioned