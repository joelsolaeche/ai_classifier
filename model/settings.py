import os

# CRITICAL: Use absolute path for Railway shared storage
# In Railway single-container deployment, both API and ML service share /app/uploads
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
print(f"✅ ML Service uploads directory: {UPLOAD_FOLDER}", flush=True)

# REDIS
# Queue name
REDIS_QUEUE = "service_queue"
# Port
REDIS_PORT = 6379
# DB Id
REDIS_DB_ID = 0
# Host IP
REDIS_IP = os.getenv("REDIS_IP", "redis")
# Sleep parameters which manages the
# interval between requests to our redis queue
SERVER_SLEEP = 0.05
