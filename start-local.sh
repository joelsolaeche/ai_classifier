#!/bin/bash

echo "=================================="
echo "🚀 Starting AI Classifier Locally"
echo "=================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Stop any existing containers
echo "🧹 Cleaning up old containers..."
docker-compose down

echo ""
echo "🔨 Building and starting services..."
echo "This may take 3-5 minutes on first run (downloading ResNet50 model)"
echo ""

# Start services
docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to initialize..."
sleep 10

echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "=================================="
echo "✅ Services Started!"
echo "=================================="
echo ""
echo "🌐 Access Points:"
echo "   API:            http://localhost:8000"
echo "   API Docs:       http://localhost:8000/docs"
echo "   Health Check:   http://localhost:8000/health"
echo "   Frontend:       http://localhost:3000"
echo ""
echo "🔐 Demo Login:"
echo "   Email:    admin@example.com"
echo "   Password: admin"
echo ""
echo "📋 Useful Commands:"
echo "   View logs:       docker-compose logs -f"
echo "   View API logs:   docker-compose logs -f api"
echo "   View ML logs:    docker-compose logs -f model"
echo "   Stop services:   docker-compose down"
echo ""
echo "🔍 Checking service health..."
sleep 5

# Test health endpoint
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ API is responding!"
    echo ""
    echo "🎉 Ready to use! Open http://localhost:3000 in your browser"
else
    echo "⚠️  API not responding yet, still initializing..."
    echo ""
    echo "Watch the logs: docker-compose logs -f"
    echo "It may take 1-2 minutes for model to load on first run"
fi

echo ""
echo "=================================="

