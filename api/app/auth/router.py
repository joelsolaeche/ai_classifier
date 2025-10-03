from app import db
from app.user import hashing
from app.user.models import User
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
import json
from sqlalchemy.orm import Session

from .jwt import create_access_token

router = APIRouter(tags=["auth"])


@router.options("/login")
async def login_options():
    """Handle preflight OPTIONS request for CORS"""
    return {"message": "OK"}

@router.post("/login")
def login(
    request: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(db.get_db)
):
    user = db.query(User).filter(User.email == request.username).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Invalid credentials"
        )
    if not hashing.verify_password(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Incorrect password"
        )

    access_token = create_access_token(data={"sub": user.email})
    
    # Create response with explicit CORS headers
    response_data = {"access_token": access_token, "token_type": "bearer"}
    response = Response(
        content=json.dumps(response_data),
        media_type="application/json"
    )
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response
