#!/bin/bash

# CRITICAL: Dynamic Port Handling - NEVER hardcode ports
if [ -z "$PORT" ]; then
    PORT=8000
fi

echo "=== Railway Production Startup ==="
echo "Starting AI Classifier service on port $PORT"
echo "Environment: ${RAILWAY_ENVIRONMENT:-local}"

# CRITICAL: Clear old Redis jobs from previous deploys
echo "🧹 Clearing old Redis jobs..."
python3 -c "
import redis, os, sys
try:
    redis_url = os.getenv('REDIS_URL')
    if redis_url:
        r = redis.from_url(redis_url)
        count = r.llen('service_queue') or 0
        if count > 0:
            r.delete('service_queue')
            print(f'✅ Cleared {count} old jobs from Redis queue', flush=True)
        else:
            print('✅ Redis queue already empty', flush=True)
    else:
        print('⚠️  REDIS_URL not set, skipping queue clear', flush=True)
except Exception as e:
    print(f'⚠️  Could not clear Redis queue: {e}', flush=True)
" || echo "⚠️  Queue clear failed, continuing anyway..."

# Start ML service in background (bundled in single container)
echo "Starting ML classification service..."
echo "Working directory: $(pwd)"
echo "Checking for ml_service.py..."

# Check if ml_service.py exists
if [ -f "ml_service.py" ]; then
    echo "✅ Found ml_service.py in current directory"
    python3 ml_service.py 2>&1 | sed 's/^/[ML] /' &
    ML_PID=$!
    echo "✅ ML service started with PID: $ML_PID"
else
    echo "❌ ERROR: ml_service.py not found in $(pwd)"
    ls -la
fi

# Wait for ML service to initialize (model loading takes time)
echo "⏳ Waiting for ML service to initialize..."
sleep 5

# Check if ML service is still running
if ps -p $ML_PID > /dev/null 2>&1; then
    echo "✅ ML service running (PID: $ML_PID)"
else
    echo "⚠️  WARNING: ML service may have crashed"
fi

# Start the main FastAPI application
echo "Starting FastAPI application on port $PORT"
exec uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1

# Note: We use exec to ensure proper signal handling in containers
# The ML service runs in background as part of the single container strategy 