# Railway Deployment Verification Checklist

## Pre-Deployment Checks ✓

1. **Build Configuration**
   - [x] `package.json` has `build:railway` script
   - [x] `next.config.ts` has `output: 'standalone'`
   - [x] `nixpacks.toml` is configured in frontend directory
   - [x] `railway.json` specifies NIXPACKS builder

2. **Railway Dashboard Settings**
   - [ ] Service root directory set to `frontend`
   - [ ] Builder set to "Nixpacks" (not Dockerfile)
   - [ ] Environment variables configured:
     ```
     NEXT_PUBLIC_API_URL=https://valiant-nature-production.up.railway.app
     NEXTAUTH_URL=https://[YOUR-FRONTEND-URL].railway.app
     NEXTAUTH_SECRET=[your-generated-secret]
     NODE_ENV=production
     SKIP_ENV_VALIDATION=true
     ```

## Deployment Steps

1. **In Railway Dashboard:**
   - Go to your project settings
   - Select your frontend service
   - Go to Settings → Build
   - Ensure "Nixpacks" is selected as builder
   - Set Root Directory to `frontend`
   - Add the environment variable: `RAILWAY_DOCKERFILE_PATH=` (empty value)

2. **Trigger New Deployment:**
   - Click "Redeploy" or push a new commit
   - Monitor the build logs

## Expected Build Output

The build should show:
```
Using Nixpacks
Installing dependencies...
Running: npm ci --only=production
Running: npm ci
Building application...
Running: npm run build:railway
Build successful!
```

## Post-Deployment Tests

1. **Frontend Health Check:**
   - Visit your frontend URL
   - Check browser console for errors
   - Verify the home page loads

2. **API Connection:**
   - Check Network tab for API calls
   - Verify NEXT_PUBLIC_API_URL is correct
   - Test login functionality

3. **PWA Features:**
   - Check if service worker registers
   - Verify manifest.json loads
   - Test offline functionality

## Troubleshooting

If deployment fails with Dockerfile error:
1. Ensure no `Dockerfile` exists in the root or frontend directory
2. Add `RAILWAY_DOCKERFILE_PATH=` environment variable
3. Clear build cache in Railway dashboard
4. Redeploy

If build succeeds but app doesn't work:
1. Check deployment logs for runtime errors
2. Verify all environment variables are set
3. Check if the port is correctly configured (Railway uses PORT env var)