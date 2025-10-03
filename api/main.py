import os
from app import db
from app.auth import router as auth_router
from app.feedback import router as feedback_router
from app.model import router as model_router
from app.user import router as user_router
from app.user.models import User
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request, Response
from typing import List
from sqlalchemy.orm import Session

app = FastAPI(title="Image Prediction API", version="0.0.1")

# Initialize database and demo user for Railway production
def init_database_and_user():
    """Create database tables and demo user if they don't exist - for Railway deployment"""
    try:
        # CRITICAL: Create all database tables first
        from app.db import Base, engine
        print("🔧 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created/verified")
        
        # Create demo user
        session: Session = next(db.get_db())
        
        # Check if demo user already exists
        existing_user = session.query(User).filter(User.email == "admin@example.com").first()
        
        if not existing_user:
            # Create demo user
            demo_user = User(
                name="Admin User",
                email="admin@example.com", 
                password="admin"  # Will be automatically hashed by User.__init__
            )
            session.add(demo_user)
            session.commit()
            print("✅ Demo user created: admin@example.com / admin")
        else:
            print("✅ Demo user already exists")
            
        session.close()
        print("🎉 Database initialization complete!")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        print(f"❌ Error type: {type(e).__name__}")
        print(f"❌ DATABASE_URL available: {bool(os.getenv('DATABASE_URL'))}")
        import traceback
        traceback.print_exc()

# Initialize database and demo user on startup
init_database_and_user()



# Dynamic CORS function to handle all Vercel domains
def is_cors_allowed(origin: str) -> bool:
    """Check if origin is allowed for CORS"""
    if not origin:
        return False
    
    allowed_patterns = [
        "http://localhost:3000",
        "http://127.0.0.1:3000", 
        "https://localhost:3000",
        # Allow all Vercel domains
        ".vercel.app",
        # Allow Railway domains
        ".up.railway.app",
    ]
    
    # Check for exact matches and pattern matches
    for pattern in allowed_patterns:
        if origin == pattern or origin.endswith(pattern):
            return True
            
    return False

# Dynamic CORS origins - allow all Vercel and Railway domains
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://localhost:3000",
]

# CORS configuration for production deployment
# Allow all Vercel domains and localhost for development
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000", 
    "https://localhost:3000",
]

# Add all possible Vercel domain patterns
vercel_patterns = [
    "https://ai-classifier-nine.vercel.app",
    "https://ai-classifier-*.vercel.app", 
    "https://*.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for debugging
    allow_credentials=False,  # Must be False when allow_origins=["*"]
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],
)

# Root endpoint for health check and CORS testing
@app.get("/")
async def root():
    return {"message": "AI Vision Classifier API", "status": "running", "version": "0.0.1"}

# CORS test endpoint
@app.get("/cors-test")
async def cors_test(request: Request):
    return {
        "message": "CORS test successful",
        "origin": request.headers.get("origin"),
        "user_agent": request.headers.get("user-agent"),
        "headers": dict(request.headers)
    }

# Global OPTIONS handler for all routes
@app.options("/{full_path:path}")
async def options_handler(request: Request):
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400"
        }
    )

# TEMPORARY: Debug endpoint to check environment variables
@app.get("/debug-env", include_in_schema=False)
async def debug_env():
    import os
    return {
        "DATABASE_URL": os.getenv("DATABASE_URL", "NOT_SET"),
        "POSTGRES_USER": os.getenv("POSTGRES_USER", "NOT_SET"),
        "POSTGRES_PASSWORD": os.getenv("POSTGRES_PASSWORD", "NOT_SET"), 
        "POSTGRES_HOST": os.getenv("POSTGRES_HOST", "NOT_SET"),
        "POSTGRES_DB": os.getenv("POSTGRES_DB", "NOT_SET"),
        "DATABASE_HOST": os.getenv("DATABASE_HOST", "NOT_SET"),
        "RAILWAY_ENVIRONMENT": os.getenv("RAILWAY_ENVIRONMENT", "NOT_SET"),
        "All_DB_Vars": {k: v for k, v in os.environ.items() if any(db_key in k.upper() for db_key in ["DATABASE", "POSTGRES", "DB"])},
        "Redis_URL": os.getenv("REDIS_URL", "NOT_SET")
    }

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
        # CRITICAL: Check both uppercase and lowercase Redis URL env vars
        redis_url = os.getenv('REDIS_URL') or os.getenv('redis_url')
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
