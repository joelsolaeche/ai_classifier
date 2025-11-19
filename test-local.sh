#!/bin/bash

echo "=================================="
echo "🧪 Testing Local AI Classifier"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test 1: Health Check
echo "Test 1: Health Check"
HEALTH=$(curl -s http://localhost:8000/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Health endpoint responding"
    echo "   Response: $HEALTH"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ FAILED${NC} - Health endpoint not responding"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 2: Root Endpoint
echo "Test 2: Root Endpoint"
ROOT=$(curl -s http://localhost:8000/)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Root endpoint responding"
    echo "   Response: $ROOT"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ FAILED${NC} - Root endpoint not responding"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 3: Login
echo "Test 3: Login"
LOGIN=$(curl -s -X POST http://localhost:8000/login \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=admin@example.com&password=admin")

if [[ $LOGIN == *"access_token"* ]]; then
    echo -e "${GREEN}✅ PASSED${NC} - Login successful"
    TOKEN=$(echo $LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    echo "   Token: ${TOKEN:0:30}..."
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ FAILED${NC} - Login failed"
    echo "   Response: $LOGIN"
    FAILED=$((FAILED + 1))
    TOKEN=""
fi
echo ""

# Test 4: Prediction (if we have a token)
if [ ! -z "$TOKEN" ]; then
    echo "Test 4: Image Prediction"
    
    # Check if test image exists
    if [ -f "tests/dog.jpeg" ]; then
        PREDICTION=$(curl -s -X POST http://localhost:8000/model/predict \
            -H "Authorization: Bearer $TOKEN" \
            -F "file=@tests/dog.jpeg")
        
        if [[ $PREDICTION == *"prediction"* ]]; then
            echo -e "${GREEN}✅ PASSED${NC} - Prediction successful"
            echo "   Response: $PREDICTION"
            PASSED=$((PASSED + 1))
        else
            echo -e "${RED}❌ FAILED${NC} - Prediction failed"
            echo "   Response: $PREDICTION"
            FAILED=$((FAILED + 1))
        fi
    else
        echo -e "${YELLOW}⚠️  SKIPPED${NC} - Test image not found (tests/dog.jpeg)"
    fi
else
    echo -e "${YELLOW}⚠️  SKIPPED${NC} - Test 4: No auth token available"
fi
echo ""

# Test 5: API Documentation
echo "Test 5: API Documentation"
DOCS=$(curl -s http://localhost:8000/docs)
if [[ $DOCS == *"Swagger"* ]] || [[ $DOCS == *"FastAPI"* ]]; then
    echo -e "${GREEN}✅ PASSED${NC} - API docs accessible"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ FAILED${NC} - API docs not accessible"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 6: Check ML Service Logs
echo "Test 6: ML Service Status"
ML_LOGS=$(docker-compose logs model | grep "ResNet50 model loaded" | tail -1)
if [ ! -z "$ML_LOGS" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - ML service initialized"
    echo "   $ML_LOGS"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠️  WARNING${NC} - ML model may still be loading"
    echo "   Check logs: docker-compose logs model"
fi
echo ""

# Summary
echo "=================================="
echo "📊 Test Summary"
echo "=================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo "Your local setup is working perfectly! ✨"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed${NC}"
    echo "Check the logs: docker-compose logs -f"
    exit 1
fi

