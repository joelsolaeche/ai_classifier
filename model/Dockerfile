# Multi-stage build for ML service local development
FROM python:3.9-slim as base

ENV PYTHONPATH=$PYTHONPATH:/src/
ENV PYTHONUNBUFFERED=1

WORKDIR /src

# Install system dependencies for ML libraries
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libhdf5-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# CRITICAL: Copy requirements FIRST for layer caching
COPY requirements.txt /src/requirements.txt
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY ./ /src/

# Create uploads directory
RUN mkdir -p /src/uploads

FROM base as test
RUN ["pytest", "-v", "/src/tests"]

FROM base as build
ENTRYPOINT ["python3", "/src/ml_service.py"]

