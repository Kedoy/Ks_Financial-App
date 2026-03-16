#!/bin/bash

# Ks Financial App - Docker Containers Test Script
# Tests all services and endpoints after deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:5173"
PGADMIN_URL="http://localhost:5050"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Ks Financial App - Container Tests${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=$3
    
    echo -ne "${YELLOW}Testing: ${name}...${NC}"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$response" == "$expected_code" ]; then
        echo -e "${GREEN} ✓ PASSED${NC} (HTTP $response)"
        ((TESTS_PASSED++))
    else
        echo -e "${RED} ✗ FAILED${NC} (Expected: $expected_code, Got: $response)"
        ((TESTS_FAILED++))
    fi
}

# Test Docker containers
test_container() {
    local name=$1
    
    echo -ne "${YELLOW}Checking container: ${name}...${NC}"
    
    if docker-compose ps | grep -q "$name.*Up"; then
        echo -e "${GREEN} ✓ RUNNING${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED} ✗ NOT RUNNING${NC}"
        ((TESTS_FAILED++))
    fi
}

echo -e "${BLUE}Step 1: Docker Container Status${NC}"
echo "-------------------------------------------"
test_container "backend"
test_container "frontend"
test_container "postgres"
echo ""

echo -e "${BLUE}Step 2: Backend Health Checks${NC}"
echo "-------------------------------------------"
test_endpoint "Backend Health" "$BACKEND_URL/api/v1/health/" "200"
test_endpoint "Swagger UI" "$BACKEND_URL/api/docs/" "200"
test_endpoint "ReDoc" "$BACKEND_URL/api/redoc/" "200"
test_endpoint "API Schema" "$BACKEND_URL/api/schema/" "200"
echo ""

echo -e "${BLUE}Step 3: Frontend Health Checks${NC}"
echo "-------------------------------------------"
test_endpoint "Frontend Main" "$FRONTEND_URL/" "200"
test_endpoint "Frontend Health" "$FRONTEND_URL/health" "200"
echo ""

echo -e "${BLUE}Step 4: API Endpoint Tests${NC}"
echo "-------------------------------------------"

# Test public endpoints (should return 401 without auth)
test_endpoint "Auth Login (POST)" "$BACKEND_URL/api/v1/auth/login/" "405"
test_endpoint "Categories (unauth)" "$BACKEND_URL/api/v1/categories/" "401"
test_endpoint "Transactions (unauth)" "$BACKEND_URL/api/v1/transactions/" "401"
echo ""

echo -e "${BLUE}Step 5: Database Connectivity${NC}"
echo "-------------------------------------------"
echo -ne "${YELLOW}Testing database connection...${NC}"
db_test=$(docker-compose exec -T backend python -c "from django.db import connection; connection.ensure_connection(); print('OK')" 2>&1 || echo "FAILED")
if [ "$db_test" == "OK" ]; then
    echo -e "${GREEN} ✓ CONNECTED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED} ✗ FAILED${NC} ($db_test)"
    ((TESTS_FAILED++))
fi
echo ""

echo -e "${BLUE}Step 6: Static Files${NC}"
echo "-------------------------------------------"
echo -ne "${YELLOW}Checking static files collection...${NC}"
if docker-compose exec -T backend ls staticfiles > /dev/null 2>&1; then
    echo -e "${GREEN} ✓ COLLECTED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED} ✗ NOT FOUND${NC}"
    ((TESTS_FAILED++))
fi
echo ""

echo -e "${BLUE}Step 7: Volume Mounts${NC}"
echo "-------------------------------------------"
echo -ne "${YELLOW}Checking PostgreSQL volume...${NC}"
if docker volume ls | grep -q "backend_postgres_data"; then
    echo -e "${GREEN} ✓ MOUNTED${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED} ✗ NOT FOUND${NC}"
    ((TESTS_FAILED++))
fi
echo ""

# Summary
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! System is healthy.${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please check the logs.${NC}"
    echo -e "${YELLOW}Use 'docker-compose logs' to debug issues.${NC}"
    exit 1
fi
