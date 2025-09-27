#!/bin/bash

# =============================================================================
# FranchiseHub API - Development Profile Runner
# =============================================================================
# 
# This script starts the Spring Boot application with the development profile
# using SQLite database for local development.
# 
# Usage:
#   ./run-dev.sh
# 
# =============================================================================

echo "🚀 Starting FranchiseHub API in DEVELOPMENT mode..."
echo "📊 Database: SQLite (franchise_hub_dev.db)"
echo "🌐 Server: http://localhost:8080/api/v1"
echo "📚 Swagger UI: http://localhost:8080/api/v1/swagger-ui/index.html"
echo ""

mvn spring-boot:run -Dspring-boot.run.profiles=dev
