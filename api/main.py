from app.auth import router as auth_router
from app.feedback import router as feedback_router
from app.model import router as model_router
from app.user import router as user_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Image Prediction API", version="0.0.1")

# CORS configuration for production deployment
origins = [
    "http://localhost:3000",  # Local development
    "http://127.0.0.1:3000",  # Local development alternative
    "https://ai-classifier-web-app.vercel.app",  # Main Vercel domain
    "https://ai-classifier-rb2zmdbwq-slashys-projects.vercel.app",  # Previous Vercel deployment
    "https://ai-classifier-553b5rxj2-slashys-projects.vercel.app",  # Current Vercel deployment
    "https://*.up.railway.app",  # Railway domains
    # Note: FastAPI CORS doesn't support wildcards like *.vercel.app reliably
]

# Production CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, 
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Root endpoint for health check and CORS testing
@app.get("/")
async def root():
    return {"message": "AI Vision Classifier API", "status": "running", "version": "0.0.1"}

# CRITICAL: Comprehensive Health Check Implementation
@app.get("/health", include_in_schema=False)
async def health_check():
    """Railway deployment health monitoring with comprehensive service checks"""
    import redis
    import os
    from app.settings import REDIS_IP, REDIS_PORT, REDIS_DB_ID
    
    health_status = {
        "status": "healthy",
        "service": "ai-vision-classifier-api",
        "version": "1.0.0",
        "environment": os.getenv("RAILWAY_ENVIRONMENT", "local"),
        "port": os.getenv("PORT", "8000")
    }
    
    # Test Redis connection
    try:
        redis_url = os.getenv('REDIS_URL') 
        if redis_url and redis_url.startswith('redis://'):
            # Railway managed Redis
            db = redis.from_url(redis_url)
        else:
            # Local development Redis
            db = redis.Redis(
                host=REDIS_IP,
                port=REDIS_PORT,
                db=REDIS_DB_ID,
                socket_connect_timeout=2,
                socket_timeout=2
            )
        
        db.ping()
        health_status["redis"] = "healthy"
        health_status["queue"] = f"redis://{REDIS_IP}:{REDIS_PORT}/{REDIS_DB_ID}"
    except Exception as e:
        health_status["redis"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    # Check ML service availability (for Railway single container)
    try:
        if os.path.exists("/app/ml_service.py"):
            health_status["ml_service"] = "bundled"
        else:
            health_status["ml_service"] = "external"
    except Exception as e:
        health_status["ml_service"] = f"error: {str(e)}"
    
    # Check uploads directory
    try:
        uploads_dir = os.path.join(os.getcwd(), "uploads")
        if os.path.exists(uploads_dir):
            health_status["uploads"] = "ready"
        else:
            os.makedirs(uploads_dir, exist_ok=True)
            health_status["uploads"] = "created"
    except Exception as e:
        health_status["uploads"] = f"error: {str(e)}"
    
    # Database connection check
    try:
        from app.db import get_db
        # This is a simple check - you might want to expand based on your DB setup
        health_status["database"] = "available"
    except Exception as e:
        health_status["database"] = f"error: {str(e)}"
    
    return health_status

app.include_router(auth_router.router)
app.include_router(model_router.router)
app.include_router(user_router.router)
app.include_router(feedback_router.router)
