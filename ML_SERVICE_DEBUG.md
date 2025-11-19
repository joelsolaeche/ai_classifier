# ML Service Debugging Guide

## Current Issue: Image Prediction Hanging

### Symptoms:
```
INFO: "POST /login HTTP/1.1" 200 OK ✅
INFO: "OPTIONS /model/predict HTTP/1.1" 200 OK ✅
Processing image 46679104df96b8f2f8bc02312357fad3.jpg... ⏳
[HANGS HERE - No response]
```

### Root Cause Analysis:

The API receives the image and queues it to Redis, but the **ML service is not processing the queue**. This means:

1. ❌ ML service may not have started
2. ❌ ML service crashed during initialization
3. ❌ ML service can't connect to Redis
4. ❌ ML service is reading from wrong queue

---

## Fixes Applied

### 1. Enhanced ML Service Logging (`model/ml_service.py`)

**Added comprehensive logging:**
- Redis connection verification
- Model loading progress
- Job processing details
- Error handling with stack traces

**Key improvements:**
```python
# Redis connection with ping test
db = redis.from_url(redis_url, socket_connect_timeout=5, socket_timeout=5)
db.ping()  # Test connection
print("✅ ML Service connected to Railway managed Redis")

# Model loading with timing
print("🧠 Loading ResNet50 model (this may take 30-60 seconds)...")
model = ResNet50(weights='imagenet')
print("✅ ResNet50 model loaded successfully!")

# Job processing with detailed logs
print(f"🎯 Job #{job_count} received from queue")
print(f"📋 Job ID: {job_id}")
print(f"📸 Image: {image_name}")
```

### 2. Enhanced Startup Script (`start.sh`)

**Added verification and logging:**
- Check if `ml_service.py` exists
- Prefix ML logs with `[ML]` for easy identification
- Verify ML service PID after startup
- Increased wait time for model loading (2s → 5s)

---

## What to Look For in Railway Logs

### Good Signs ✅:

**ML Service Starting:**
```
Starting ML classification service...
✅ Found ml_service.py in current directory
✅ ML service started with PID: 123
```

**ML Service Initialization:**
```
[ML] ============================================================
[ML] ML SERVICE INITIALIZATION
[ML] ============================================================
[ML] 🔧 Connecting to Railway Redis: redis://...
[ML] ✅ ML Service connected to Railway managed Redis
[ML] 🧠 Loading ResNet50 model (this may take 30-60 seconds)...
[ML] ✅ ResNet50 model loaded successfully!
[ML] ✅ ML Service ready - listening on queue: service_queue
[ML] ============================================================
```

**ML Service Running:**
```
[ML] 🔄 Starting classification loop - waiting for jobs...
[ML] 📡 Polling Redis queue 'service_queue' for jobs...
[ML] ⏳ No jobs in queue, waiting...
```

**Job Processing:**
```
[ML] 🎯 Job #1 received from queue
[ML] 📋 Job ID: abc-123-def
[ML] 📸 Image: 46679104df96b8f2f8bc02312357fad3.jpg
[ML] 🧠 Running ResNet50 prediction...
[ML] ✅ Prediction complete in 2.34s
[ML] 🏷️  Class: golden_retriever
[ML] 📊 Score: 0.8542
[ML] ✅ Results stored in Redis with key: abc-123-def
```

### Bad Signs ❌:

**ML Service Not Found:**
```
❌ ERROR: ml_service.py not found in /app
```
**Solution**: Check Dockerfile copies ml_service.py correctly

**ML Service Crashed:**
```
✅ ML service started with PID: 123
⚠️  WARNING: ML service may have crashed
```
**Solution**: Check for errors in ML service initialization

**Redis Connection Failed:**
```
[ML] ❌ Error: Connection refused
```
**Solution**: Verify REDIS_URL is set and Redis service is linked

**Model Loading Failed:**
```
[ML] ❌ Error loading model
[ML] OSError: Unable to download ImageNet weights
```
**Solution**: Railway may have network restrictions or timeout

---

## Troubleshooting Steps

### Step 1: Verify ML Service Started
Look for these lines in Railway logs:
```
✅ Found ml_service.py in current directory
✅ ML service started with PID: [number]
[ML] ML SERVICE INITIALIZATION
```

If missing → ML service didn't start

### Step 2: Verify Redis Connection
Look for:
```
[ML] ✅ ML Service connected to Railway managed Redis
```

If missing → Check REDIS_URL environment variable

### Step 3: Verify Model Loaded
Look for:
```
[ML] 🧠 Loading ResNet50 model...
[ML] ✅ ResNet50 model loaded successfully!
```

If missing or error → Model loading failed (network/memory issue)

### Step 4: Verify Queue Processing
Look for:
```
[ML] 🔄 Starting classification loop - waiting for jobs...
[ML] 📡 Polling Redis queue 'service_queue' for jobs...
```

If missing → classify_process() never started

### Step 5: Test Job Processing
After uploading an image, look for:
```
[ML] 🎯 Job #1 received from queue
```

If missing → Jobs not being picked up from queue

---

## Common Issues & Solutions

### Issue 1: ML Service Not Starting
**Symptom:** No `[ML]` logs at all

**Possible Causes:**
- `ml_service.py` not copied to container
- Python dependencies missing
- Import errors

**Solution:**
```bash
# Check Dockerfile
COPY model/ml_service.py /app/ml_service.py
COPY model/settings.py /app/settings.py

# Verify requirements installed
RUN pip install tensorflow keras redis numpy pillow
```

### Issue 2: Model Loading Timeout
**Symptom:** Logs stop at "Loading ResNet50 model..."

**Possible Causes:**
- Downloading ImageNet weights fails
- Memory insufficient
- Railway timeout

**Solutions:**
1. Increase memory allocation in Railway
2. Pre-download weights in Docker build
3. Use smaller model for testing

### Issue 3: Wrong Redis Queue
**Symptom:** ML service running but jobs not processed

**Possible Causes:**
- API using different queue name
- Settings mismatch

**Solution:**
```python
# In both api/app/settings.py AND model/settings.py
REDIS_QUEUE = "service_queue"  # Must match!
```

### Issue 4: Upload Directory Missing
**Symptom:** "FileNotFoundError: uploads/image.jpg"

**Solution:**
```bash
# In Dockerfile
RUN mkdir -p /app/uploads

# Ensure same path in both services
UPLOAD_FOLDER = "uploads/"  # or "/app/uploads/"
```

---

## Testing ML Service Locally

### Test 1: Direct ML Service Run
```bash
cd model
REDIS_URL=redis://localhost:6379 python ml_service.py
```

Should see:
- Redis connection
- Model loading
- Queue polling

### Test 2: Manual Job Submission
```python
import redis
import json
import uuid

r = redis.Redis(host='localhost', port=6379)
job = {"id": str(uuid.uuid4()), "image_name": "test.jpg"}
r.lpush("service_queue", json.dumps(job))

# Check result
import time
time.sleep(5)
result = r.get(job["id"])
print(result)
```

---

## Expected Flow

### 1. Startup Sequence:
```
[Start] → [Load Redis] → [Load Model] → [Start Loop] → [Poll Queue]
```

### 2. Request Flow:
```
[Frontend] → [API] → [Redis Queue] → [ML Service] → [Prediction] → [Redis Result] → [API] → [Frontend]
```

### 3. Timing:
- Model loading: 30-60 seconds
- Image upload: < 1 second
- Queue to ML: < 1 second
- Prediction: 2-5 seconds
- Total: 3-6 seconds (after startup)

---

## Next Steps After Deployment

1. **Deploy Updated Code:**
   ```bash
   git add .
   git commit -m "fix: add comprehensive ML service logging and error handling"
   git push origin main
   ```

2. **Watch Railway Logs:**
   - Look for `[ML]` prefixed logs
   - Verify each initialization step
   - Check for errors

3. **Test Prediction:**
   - Upload image from frontend
   - Watch logs in real-time
   - Should see job processing

4. **If Still Hanging:**
   - Share full Railway logs (especially `[ML]` lines)
   - Check Redis connection
   - Verify uploads directory exists

---

## Success Criteria

Your ML service is working correctly when you see:

1. ✅ ML service starts without errors
2. ✅ Redis connection established
3. ✅ ResNet50 model loaded
4. ✅ Queue polling begins
5. ✅ Jobs received from queue
6. ✅ Predictions completed
7. ✅ Results stored in Redis
8. ✅ Frontend receives prediction

After this fix, watch the logs and you should see detailed information about what's happening!

