# Railway Deployment Guide

## Current Issues & Solutions

### Issue 1: Database Connection Timeout
**Error**: `could not connect to server: Connection timed out` on `postgres.railway.internal`

**Root Cause**: Railway PostgreSQL service may not be properly linked or network configuration issue.

**Solutions to Try**:

1. **Check Railway Service Linking**
   - Go to Railway dashboard
   - Ensure PostgreSQL service is **linked** to your main service
   - Variables should be automatically injected

2. **Verify Environment Variables**
   - Check that `DATABASE_URL` is present in your service settings
   - Format should be: `postgresql://user:pass@host:port/dbname`
   - Railway auto-generates this when you link PostgreSQL

3. **Network Configuration**
   - Ensure services are in the same **Railway project**
   - Check if "Private Networking" is enabled
   - PostgreSQL should be accessible via internal DNS

4. **Alternative: Use Public PostgreSQL URL**
   If internal networking fails, use the public URL:
   - Go to PostgreSQL service → Variables
   - Look for `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
   - Or use the public `DATABASE_URL` if provided

### Issue 2: CORS Headers
**Error**: `No 'Access-Control-Allow-Origin' header is present`

**Status**: ✅ **FIXED** in latest code
- CORS middleware now configured with `allow_origins=["*"]`
- Added `max_age=3600` for preflight caching
- Should work after redeployment

---

## Railway Deployment Checklist

### Prerequisites
- [ ] Railway account created
- [ ] GitHub repository connected to Railway
- [ ] Railway CLI installed (optional)

### Step 1: Create PostgreSQL Service
```bash
# In Railway dashboard
1. Click "New" → "Database" → "PostgreSQL"
2. Wait for provisioning (1-2 minutes)
3. Note the generated DATABASE_URL
```

### Step 2: Create Redis Service
```bash
1. Click "New" → "Database" → "Redis"
2. Wait for provisioning
3. Note the generated REDIS_URL
```

### Step 3: Deploy Main Application
```bash
1. Click "New" → "GitHub Repo"
2. Select your repository
3. Railway auto-detects Dockerfile
4. Service will build and deploy
```

### Step 4: Link Services
**CRITICAL: This is likely the missing step!**

```bash
1. Go to your main application service
2. Click "Settings" → "Service Variables"
3. Click "Reference" to add service references
4. Select PostgreSQL service → This adds DATABASE_URL
5. Select Redis service → This adds REDIS_URL
```

**Alternative Manual Linking**:
```bash
# In PostgreSQL service, copy the DATABASE_URL
# In main service, add it as environment variable
DATABASE_URL=postgresql://user:pass@postgres.railway.internal:5432/railway

# Same for Redis
REDIS_URL=redis://default:pass@redis.railway.internal:6379
```

### Step 5: Verify Deployment
```bash
# Check logs
railway logs

# Test health endpoint
curl https://your-app.up.railway.app/health

# Test root endpoint
curl https://your-app.up.railway.app/
```

---

## Environment Variables Required

### Auto-Generated (by Railway linking)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `PORT` - Dynamic port (Railway assigns)
- `RAILWAY_ENVIRONMENT` - Set to "production"

### Optional Variables
- `SECRET_KEY` - JWT secret (auto-generated if not provided)
- `API_SLEEP` - Redis polling interval (default: 0.5)

---

## Troubleshooting

### Database Connection Issues

**Check 1: Verify DATABASE_URL exists**
```bash
# In Railway dashboard → Service → Variables
# Should see DATABASE_URL with format:
postgresql://postgres:PASSWORD@HOST:5432/railway
```

**Check 2: Test database connection**
```bash
# Add temporary debug endpoint to verify DB
# Visit: https://your-app.up.railway.app/debug-env
```

**Check 3: Check PostgreSQL logs**
```bash
# In Railway → PostgreSQL service → Logs
# Look for connection attempts
```

**Check 4: Verify internal networking**
```bash
# PostgreSQL should be accessible at:
postgres.railway.internal:5432
# or
redis.railway.internal:6379
```

### CORS Issues

**If CORS persists after fixes**:
1. Clear browser cache
2. Test with curl to bypass browser:
   ```bash
   curl -X POST https://your-app.up.railway.app/login \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=admin@example.com&password=admin"
   ```
3. Check Railway logs for actual request/response
4. Verify frontend is using correct API URL

### Build Issues

**Dockerfile not found**:
- Ensure Dockerfile is in repository root
- Check railway.json points to correct path

**Build timeout**:
- TensorFlow/ML packages are large
- May take 5-10 minutes first time
- Railway provides 10 minute build timeout

---

## Common Railway Gotchas

1. **Service Linking**: Must explicitly link services in settings
2. **Internal DNS**: Use `.railway.internal` for service-to-service
3. **Port Binding**: Always use `$PORT` environment variable
4. **Build Context**: Dockerfile runs from repository root
5. **Startup Time**: ML models take time to load (~30 seconds)

---

## Monitoring & Logs

### View Live Logs
```bash
# In Railway dashboard
Service → Logs → Follow live logs
```

### Key Log Messages to Look For
- ✅ `Using Railway DATABASE_URL for PostgreSQL connection`
- ✅ `Connected to Railway managed Redis`
- ✅ `Database tables created/verified`
- ✅ `Demo user created: admin@example.com`
- ❌ `could not connect to server` - DB connection failed
- ❌ `Connection timed out` - Network/linking issue

---

## Next Steps

1. **Fix Database Connection**:
   - Verify service linking in Railway dashboard
   - Check DATABASE_URL format
   - Test with public PostgreSQL URL if needed

2. **Redeploy Application**:
   ```bash
   git add .
   git commit -m "fix: database connection and CORS config"
   git push origin main
   ```

3. **Monitor Deployment**:
   - Watch Railway logs for successful startup
   - Test /health endpoint
   - Try login from frontend

4. **Test Full Flow**:
   - Login with admin@example.com / admin
   - Upload and classify an image
   - Submit feedback

---

## Contact Railway Support

If issues persist:
1. Railway Discord: https://discord.gg/railway
2. Railway Docs: https://docs.railway.app
3. Check Railway Status: https://status.railway.app

---

## Success Criteria

Your deployment is successful when:
- [ ] Service builds without errors
- [ ] Health endpoint returns 200 OK
- [ ] Database initialization succeeds
- [ ] Redis connection works
- [ ] CORS allows frontend requests
- [ ] Login works from Vercel frontend
- [ ] Image classification works end-to-end

