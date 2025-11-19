import os
from typing import List

from app import db
from app import settings as config
from app import utils
from app.auth.jwt import get_current_user
from app.model.schema import PredictRequest, PredictResponse
from app.model.services import model_predict
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status, Response
from sqlalchemy.orm import Session

router = APIRouter(tags=["Model"], prefix="/model")


@router.options("/predict")
async def predict_options():
    """Handle preflight OPTIONS request for CORS"""
    return {"message": "OK"}

@router.post("/predict")
async def predict(file: UploadFile, current_user=Depends(get_current_user)):
    rpse = {"success": False, "prediction": None, "score": None}
    
    try:
        # 1. Check a file was sent and that file is an image
        if not file or not file.filename:
            return PredictResponse(**rpse)
        
        if not utils.allowed_file(file.filename):
            return PredictResponse(**rpse)
        
        # 2. Store the image to disk, calculate hash to avoid re-writing an image already uploaded
        hashed_filename = await utils.get_file_hash(file)
        file_path = os.path.join(config.UPLOAD_FOLDER, hashed_filename)
        
        print(f"📁 Saving file to: {file_path}", flush=True)
        print(f"📁 Upload folder: {config.UPLOAD_FOLDER}", flush=True)
        print(f"📁 File exists before save: {os.path.exists(file_path)}", flush=True)
        
        # Check if file already exists, if not save it
        if not os.path.exists(file_path):
            with open(file_path, "wb") as buffer:
                content = await file.read()
                print(f"📁 File content size: {len(content)} bytes", flush=True)
                buffer.write(content)
            print(f"✅ File saved successfully: {file_path}", flush=True)
            print(f"✅ File exists after save: {os.path.exists(file_path)}", flush=True)
        else:
            print(f"✅ File already exists, skipping save: {file_path}", flush=True)
        
        # 3. Send the file to be processed by the model service
        print(f"🚀 Sending to ML service: {hashed_filename}", flush=True)
        prediction, score = await model_predict(hashed_filename)
        
        # 4. Update and return rpse dict with the corresponding values
        rpse["success"] = True
        rpse["prediction"] = prediction
        rpse["score"] = score
        rpse["image_file_name"] = hashed_filename
        
    except Exception as e:
        # If any error occurs, return the default response
        rpse["success"] = False
        rpse["prediction"] = None
        rpse["score"] = None
        rpse["image_file_name"] = None

    return PredictResponse(**rpse)
