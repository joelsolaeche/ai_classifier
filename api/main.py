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

app.include_router(auth_router.router)
app.include_router(model_router.router)
app.include_router(user_router.router)
app.include_router(feedback_router.router)
