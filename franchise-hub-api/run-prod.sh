#!/bin/bash

# =============================================================================
# FranchiseHub API - Production Profile Runner
# =============================================================================
# 
# This script starts the Spring Boot application with the production profile
# using MySQL database for production deployment.
# 
# Prerequisites:
#   - MySQL server running
#   - Database 'franchise_hub' created
#   - User with appropriate permissions
# 
# Environment Variables (set before running):
#   export DB_HOST=localhost
#   export DB_PORT=3306
#   export DB_NAME=franchise_hub
#   export DB_USERNAME=your_username
#   export DB_PASSWORD=your_password
#   export JWT_SECRET=your_jwt_secret_key
# 
# Usage:
#   ./run-prod.sh
# 
# =============================================================================

echo "🚀 Starting FranchiseHub API in PRODUCTION mode..."
echo "🗄️  Database: MySQL (${DB_HOST:-localhost}:${DB_PORT:-3306}/${DB_NAME:-franchise_hub})"
echo "🌐 Server: http://localhost:8080/api/v1"
echo "📚 Swagger UI: http://localhost:8080/api/v1/swagger-ui/index.html"
echo ""

# Check if required environment variables are set
if [ -z "$DB_USERNAME" ] || [ -z "$DB_PASSWORD" ]; then
    echo "⚠️  WARNING: DB_USERNAME and DB_PASSWORD environment variables should be set for production"
    echo "   Using default values from application.yml"
    echo ""
fi

if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  WARNING: JWT_SECRET environment variable should be set for production"
    echo "   Using default value from application.yml"
    echo ""
fi

mvn spring-boot:run -Dspring-boot.run.profiles=prod
