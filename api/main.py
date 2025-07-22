from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers with error handling
try:
    from app.auth import router as auth_router
    from app.feedback import router as feedback_router  
    from app.model import router as model_router
    from app.user import router as user_router
    AUTH_AVAILABLE = True
except Exception as e:
    print(f"Warning: Database-dependent modules failed to load: {e}")
    AUTH_AVAILABLE = False

app = FastAPI(title="Image Prediction API", version="0.0.1")

# CORS configuration for production deployment
origins = [
    "http://localhost:3000",  # Local development
    "http://127.0.0.1:3000",  # Local development alternative
    "https://ai-classifier-web-app.vercel.app",  # Main Vercel domain
    "https://ai-classifier-web-238zoj6ea-slashys-projects.vercel.app",  # Vercel preview domains
]

# Simple CORS - allow all origins temporarily for debugging  
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False, 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint for health check and CORS testing
@app.get("/")
async def root():
    return {"message": "AI Vision Classifier API", "status": "running", "version": "0.0.1"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-vision-classifier-api"}

# Include routers only if database modules loaded successfully
if AUTH_AVAILABLE:
    app.include_router(auth_router.router)
    app.include_router(model_router.router)
    app.include_router(user_router.router)
    app.include_router(feedback_router.router)
else:
    # Add a route to show service status when DB is not available
    @app.get("/status")
    async def service_status():
        return {
            "message": "API is running but database services are not configured",
            "status": "partial",
            "available_endpoints": ["/", "/health", "/status"]
        }
