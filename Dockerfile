# Railway Production Dockerfile - Single Container Strategy
FROM python:3.9-slim as base

# Set environment variables
ENV PYTHONPATH=$PYTHONPATH:/app/
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies for ML libraries
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libhdf5-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# CRITICAL: Copy requirements FIRST for layer caching optimization
COPY api/requirements.txt /app/api_requirements.txt
COPY model/requirements.txt /app/model_requirements.txt

# Create combined requirements for production
RUN cat api_requirements.txt model_requirements.txt | sort -u > requirements.txt

# Install Python dependencies
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy API application files
COPY api/ /app/

# CRITICAL: Copy ML service and model files for bundling
COPY model/ml_service.py /app/ml_service.py
COPY model/settings.py /app/settings.py

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# MANDATORY: Use Railway's dynamic PORT
EXPOSE $PORT

# REQUIRED: Health check for monitoring  
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python3 -c "import requests; requests.get('http://localhost:' + str(__import__('os').environ.get('PORT', '8000')) + '/health', timeout=5)" || exit 1

# Production build stage
FROM base as production

CMD ["/app/start.sh"] 