import os
import redis

# import dotenv
import dotenv

# Load environment variables from .env file
dotenv.load_dotenv()

# MANDATORY: Environment-aware configuration
RAILWAY_ENVIRONMENT = os.getenv("RAILWAY_ENVIRONMENT")
IS_RAILWAY = RAILWAY_ENVIRONMENT is not None

# Run API in Debug mode (disable in production)
API_DEBUG = not IS_RAILWAY

# We will store images uploaded by the user on this folder
UPLOAD_FOLDER = "uploads/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# MANDATORY: Smart Redis connection - detects Railway vs local
REDIS_QUEUE = "service_queue"
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB_ID = int(os.getenv("REDIS_DB_ID", 0))
REDIS_IP = os.getenv("REDIS_IP", "redis")

# CRITICAL: Railway Redis URL detection
redis_url = os.getenv('REDIS_URL') or os.getenv('REDIS_IP')

def get_redis_connection():
    """
    MANDATORY: Environment-aware Redis connection
    Automatically detects Railway managed Redis vs local development
    """
    if redis_url and redis_url.startswith('redis://'):
        # Railway managed Redis
        return redis.from_url(redis_url)
    else:
        # Local development Redis
        return redis.Redis(
            host=REDIS_IP,
            port=REDIS_PORT,
            db=REDIS_DB_ID
        )

# Sleep parameters which manages the
# interval between requests to our redis queue
API_SLEEP = float(os.getenv("API_SLEEP", 0.5))

# Database settings
DATABASE_USERNAME = os.getenv("POSTGRES_USER")
DATABASE_PASSWORD = os.getenv("POSTGRES_PASSWORD")
DATABASE_HOST = os.getenv("DATABASE_HOST")
DATABASE_NAME = os.getenv("POSTGRES_DB")
SECRET_KEY = os.getenv("SECRET_KEY", "S09WWWHXBAJDIUEREHCN3752346572452VGGGVWWW526194")
