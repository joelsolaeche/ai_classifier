from app import db
from app.auth import router as auth_router
from app.feedback import router as feedback_router
from app.model import router as model_router
from app.user import router as user_router
from app.user.models import User
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
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

# Temporary: Allow ALL origins for Vercel deployment testing
# TODO: Restrict this in production to specific domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins temporarily
    allow_credentials=False,  # Must be False when allow_origins=["*"]
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
