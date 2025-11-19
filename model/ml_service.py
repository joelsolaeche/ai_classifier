import json
import os
import time

import numpy as np
import redis
import settings
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.applications.resnet50 import decode_predictions, preprocess_input
from tensorflow.keras.preprocessing import image

# CRITICAL: Import for Railway detection
import sys

# MANDATORY: Environment-aware Redis connection
# Automatically detects Railway managed Redis vs local development
redis_url = os.getenv('REDIS_URL')
print("=" * 60)
print("ML SERVICE INITIALIZATION")
print("=" * 60)
if redis_url and redis_url.startswith('redis://'):
    # Railway managed Redis
    print(f"🔧 Connecting to Railway Redis: {redis_url[:30]}...")
    # CRITICAL: Increase timeouts for Railway's network latency
    db = redis.from_url(
        redis_url,
        socket_connect_timeout=10,  # Allow 10 seconds for connection
        socket_timeout=30,           # Allow 30 seconds for socket operations
        socket_keepalive=True,       # Enable TCP keepalive
        socket_keepalive_options={},
        retry_on_timeout=True        # Retry on timeout
    )
    db.ping()  # Test connection
    print("✅ ML Service connected to Railway managed Redis")
else:
    # Local development Redis
    print(f"🔧 Connecting to local Redis: {settings.REDIS_IP}:{settings.REDIS_PORT}")
    db = redis.Redis(
        host=settings.REDIS_IP,
        port=settings.REDIS_PORT,
        db=settings.REDIS_DB_ID,
        socket_connect_timeout=10,
        socket_timeout=30,
        socket_keepalive=True,
        retry_on_timeout=True
    )
    db.ping()  # Test connection
    print("✅ ML Service connected to local development Redis")

# Load your ML model and assign to variable `model`
# See https://drive.google.com/file/d/1ADuBSE4z2ZVIdn66YDSwxKv-58U7WEOn/view?usp=sharing
# for more information about how to use this model.
print("🧠 Loading ResNet50 model (this may take 30-60 seconds)...", flush=True)
import sys
sys.stdout.flush()
sys.stderr.flush()

model = ResNet50(weights='imagenet')

# CRITICAL: Force flush after model loading
sys.stdout.flush()
sys.stderr.flush()
print("✅ ResNet50 model loaded successfully!", flush=True)
print(f"✅ ML Service ready - listening on queue: {settings.REDIS_QUEUE}", flush=True)
print("=" * 60, flush=True)
sys.stdout.flush()
sys.stderr.flush()


def predict(image_name):
    """
    Load image from the corresponding folder based on the image name
    received, then, run our ML model to get predictions.

    Parameters
    ----------
    image_name : str
        Image filename.

    Returns
    -------
    class_name, pred_probability : tuple(str, float)
        Model predicted class as a string and the corresponding confidence
        score as a number.
    """
    # Load image
    img_path = os.path.join(settings.UPLOAD_FOLDER, image_name)
    img = image.load_img(img_path, target_size=(224, 224))
    
    # Apply preprocessing (convert to numpy array, match model input dimensions (including batch) and use the resnet50 preprocessing)
    img_array = image.img_to_array(img)
    img_batch = np.expand_dims(img_array, axis=0)
    img_preprocessed = preprocess_input(img_batch)
    
    # Get predictions using model methods and decode predictions using resnet50 decode_predictions
    predictions = model.predict(img_preprocessed)
    decoded_predictions = decode_predictions(predictions, top=1)[0]
    
    _, class_name, pred_probability = decoded_predictions[0]
    
    # Convert probabilities to float and round it
    pred_probability = round(float(pred_probability), 4)

    return class_name, pred_probability


def classify_process():
    """
    Loop indefinitely asking Redis for new jobs.
    When a new job arrives, takes it from the Redis queue, uses the loaded ML
    model to get predictions and stores the results back in Redis using
    the original job ID so other services can see it was processed and access
    the results.

    Load image from the corresponding folder based on the image name
    received, then, run our ML model to get predictions.
    """
    print("🔄 Starting classification loop - waiting for jobs...")
    job_count = 0
    consecutive_errors = 0
    max_consecutive_errors = 3
    
    while True:
        try:
            # Take a new job from Redis with longer timeout for Railway
            print(f"📡 Polling Redis queue '{settings.REDIS_QUEUE}' for jobs...")
            job = db.brpop(settings.REDIS_QUEUE, timeout=10)  # Increased to 10 seconds
            
            # Reset error counter on successful operation
            consecutive_errors = 0
            
            if job:
                job_count += 1
                print(f"\n{'='*60}")
                print(f"🎯 Job #{job_count} received from queue")
                
                # Decode the JSON data for the given job
                job_data = json.loads(job[1])
                
                # Important! Get and keep the original job ID
                job_id = job_data["id"]
                image_name = job_data["image_name"]
                print(f"📋 Job ID: {job_id}")
                print(f"📸 Image: {image_name}")
                
                # Run the loaded ml model (use the predict() function)
                print(f"🧠 Running ResNet50 prediction...")
                start_time = time.time()
                class_name, pred_probability = predict(image_name)
                elapsed = time.time() - start_time
                
                print(f"✅ Prediction complete in {elapsed:.2f}s")
                print(f"🏷️  Class: {class_name}")
                print(f"📊 Score: {pred_probability}")
                
                # Prepare a new JSON with the results
                output = {"prediction": class_name, "score": pred_probability}
                
                # Store the job results on Redis using the original job ID as the key
                db.set(job_id, json.dumps(output))
                print(f"✅ Results stored in Redis with key: {job_id}")
                print(f"{'='*60}\n")
            else:
                # No job available (timeout)
                print("⏳ No jobs in queue, waiting...")
                
        except redis.exceptions.TimeoutError as e:
            consecutive_errors += 1
            print(f"⚠️  Redis timeout error (#{consecutive_errors}): {e}")
            
            if consecutive_errors >= max_consecutive_errors:
                print(f"❌ Too many consecutive errors ({consecutive_errors}). Attempting to reconnect...")
                try:
                    # Try to reconnect
                    db.ping()
                    print("✅ Redis connection still alive")
                    consecutive_errors = 0
                except Exception as reconnect_error:
                    print(f"❌ Redis connection lost: {reconnect_error}")
                    print("⏳ Waiting 5 seconds before retry...")
                    time.sleep(5)
                    consecutive_errors = 0  # Reset and try again
            else:
                print("⏳ Retrying after brief delay...")
                time.sleep(1)
                
        except redis.exceptions.ConnectionError as e:
            print(f"❌ Redis connection error: {e}")
            print("⏳ Waiting 5 seconds before reconnecting...")
            time.sleep(5)
            try:
                db.ping()
                print("✅ Reconnected to Redis")
            except Exception as reconnect_error:
                print(f"❌ Reconnection failed: {reconnect_error}")
                
        except Exception as e:
            consecutive_errors += 1
            print(f"❌ Error processing job: {e}")
            print(f"❌ Error type: {type(e).__name__}")
            import traceback
            traceback.print_exc()
            
            if consecutive_errors >= max_consecutive_errors:
                print("⏳ Too many errors, waiting 5 seconds...")
                time.sleep(5)
                consecutive_errors = 0
            
        # Sleep for a bit
        time.sleep(settings.SERVER_SLEEP)


if __name__ == "__main__":
    # Now launch process
    import sys
    sys.stdout.flush()
    sys.stderr.flush()
    print("\n" + "="*60, flush=True)
    print("🚀 LAUNCHING ML SERVICE - classify_process()", flush=True)
    print("="*60 + "\n", flush=True)
    sys.stdout.flush()
    sys.stderr.flush()
    classify_process()
