# Render Deployment Fix

## Problem

The backend is crashing on Render because Google OAuth environment variables are missing.

## Error

```
TypeError: OAuth2Strategy requires a clientID option
```

## Solution Applied

1. **Added environment variable validation** in `passport.js`
2. **Added graceful fallbacks** when OAuth is not configured
3. **Added health check endpoints** for debugging

## Required Environment Variables for Render

Set these in your Render dashboard under "Environment":

### Critical (Required for server to start)

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meetease
JWT_SECRET=your-jwt-secret-key
PORT=8000
NODE_ENV=production
```

### Google OAuth (Optional - for Google login)

```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-render-app.onrender.com/api/v1/auth/google/callback
FRONTEND_URL=https://your-vercel-app.vercel.app
```

## What Happens Now

### If Google OAuth variables are missing:

- ✅ Server starts successfully (no crash)
- ⚠️ Google OAuth routes return 503 "Not configured"
- ✅ Regular email/password login still works
- ✅ All other functionality works

### If Google OAuth variables are present:

- ✅ Full Google OAuth functionality enabled
- ✅ Users can login with Google
- ✅ All features work normally

## Health Check Endpoints

After deployment, you can check:

- `https://your-app.onrender.com/api/v1/health` - Overall health
- `https://your-app.onrender.com/api/v1/config` - Configuration status

## Quick Fix for Production

1. Go to Render dashboard
2. Navigate to your service settings
3. Add the environment variables listed above
4. Redeploy the service

The app will now start even without Google OAuth configured!
