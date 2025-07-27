# Multi-stage build for local development
FROM python:3.9-slim as base

ENV PYTHONPATH=$PYTHONPATH:/src/
ENV PYTHONUNBUFFERED=1

WORKDIR /src

# CRITICAL: Copy requirements FIRST for layer caching
COPY ./requirements.txt /src/requirements.txt

RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY ./ /src/

# Create uploads directory
RUN mkdir -p /src/uploads

FROM base as test
RUN ["python", "-m", "pytest", "-v", "/src/tests"]

FROM base as build

# Use dynamic port handling
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --reload