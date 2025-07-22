import os
from typing import List

from app import db
from app import settings as config
from app import utils
from app.auth.jwt import get_current_user
from app.model.schema import PredictRequest, PredictResponse
from app.model.services import model_predict
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

router = APIRouter(tags=["Model"], prefix="/model")


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
        
        # Check if file already exists, if not save it
        if not os.path.exists(file_path):
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
        
        # 3. Send the file to be processed by the model service
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
