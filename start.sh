#!/bin/bash

# CRITICAL: Dynamic Port Handling - NEVER hardcode ports
if [ -z "$PORT" ]; then
    PORT=8000
fi

echo "=== Railway Production Startup ==="
echo "Starting AI Classifier service on port $PORT"
echo "Environment: ${RAILWAY_ENVIRONMENT:-local}"

# Start ML service in background (bundled in single container)
echo "Starting ML classification service..."
python3 ml_service.py &
ML_PID=$!

# Wait a moment for ML service to initialize
sleep 2

# Start the main FastAPI application
echo "Starting FastAPI application on port $PORT"
exec uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1

# Note: We use exec to ensure proper signal handling in containers
# The ML service runs in background as part of the single container strategy 