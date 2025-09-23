# 🏢 FranchiseHub - Comprehensive Franchise Management Platform

[![Angular](https://img.shields.io/badge/Angular-17+-red.svg)](https://angular.io/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.1-green.svg)](https://spring.io/projects/spring-boot)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue.svg)](https://www.typescriptlang.org/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/)
[![Material Design](https://img.shields.io/badge/Material%20Design-17+-purple.svg)](https://material.angular.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A modern, full-stack franchise management platform featuring an **Angular 17+ frontend** with **Spring Boot 3.2.1 backend** that connects franchise businesses with potential partners. The platform provides a complete ecosystem for franchise discovery, application management, payment processing, and partnership lifecycle management.

## 📋 Project Overview

FranchiseHub is a comprehensive franchise management solution consisting of:

- **🎨 Angular 17+ Frontend** (`franchise-hub-app/`) - Modern, responsive web application with Material Design
- **⚡ Spring Boot 3.2.1 Backend** (`franchise-hub-api/`) - RESTful API with JWT authentication and comprehensive business logic
- **📚 OpenAPI Documentation** (`docs/`) - Complete API specification with interactive Swagger UI

### 🌟 Key Features

- **👥 Dual User Roles**: Business owners and franchise partners with role-specific dashboards
- **🏪 Franchise Management**: Complete franchise listing and portfolio management
- **📋 Application Workflow**: End-to-end application processing with document management
- **💳 Payment Processing**: Secure payment handling with transaction tracking
- **🤝 Partnership Management**: Full partnership lifecycle from application to deactivation
- **🔐 JWT Authentication**: Secure, token-based authentication with role-based access control
- **📱 Mobile Responsive**: Mobile-first design with Material Design components
- **📊 Analytics Dashboard**: Performance metrics and business intelligence
- **🔔 Real-time Notifications**: In-app notifications and communication system
- **📄 Document Management**: Secure file upload and document verification

## 🛠️ Technology Stack

### **Frontend (Angular 17+)**
- **Angular 17+** with standalone components and signals
- **TypeScript 5.2+** for type-safe development
- **Angular Material 17+** for Material Design UI components
- **RxJS** for reactive programming
- **NgRx** for state management
- **Angular CDK** for advanced UI behaviors

### **Backend (Spring Boot 3.2.1)**
- **Spring Boot 3.2.1** with Java 21 LTS
- **Spring Security** with JWT authentication
- **Spring Data JPA** with Hibernate ORM
- **SQLite** (development) / **MySQL** (production)
- **SpringDoc OpenAPI** for API documentation
- **Maven** for dependency management

### **Documentation & API**
- **OpenAPI 3.0** specification
- **Swagger UI** for interactive API testing
- **Express.js** documentation server
- **Comprehensive API contracts** with 42 REST endpoints

## 📁 Project Structure

```
franchisehub/
├── 🎨 franchise-hub-app/          # Angular 17+ Frontend Application
│   ├── src/app/
│   │   ├── core/                  # Core services, guards, models
│   │   ├── features/              # Feature modules (auth, business, partner)
│   │   ├── shared/                # Shared components and utilities
│   │   └── app.routes.ts          # Application routing
│   ├── package.json               # Frontend dependencies
│   └── angular.json               # Angular CLI configuration
│
├── ⚡ franchise-hub-api/          # Spring Boot 3.2.1 Backend API
│   ├── src/main/java/com/franchisehub/api/
│   │   ├── controller/            # REST API controllers
│   │   ├── service/               # Business logic services
│   │   ├── repository/            # Data access layer
│   │   ├── model/                 # JPA entities
│   │   ├── dto/                   # Data transfer objects
│   │   ├── config/                # Configuration classes
│   │   └── security/              # JWT security implementation
│   ├── pom.xml                    # Maven dependencies
│   └── src/main/resources/        # Application configuration
│
├── 📚 docs/                       # OpenAPI Documentation
│   ├── swagger.yaml               # OpenAPI 3.0 specification
│   ├── server.js                  # Documentation server
│   ├── package.json               # Documentation dependencies
│   └── README.md                  # Documentation guide
│
├── .nvmrc                         # Node.js version (22.12.0)
├── .sdkmanrc                      # Java version (21.0.8-amzn)
└── README.md                      # This file
```

## 🔧 Prerequisites

### Required Tools

1. **Node.js** (via nvm)
2. **Java** (via sdkman)
3. **Maven** (for Spring Boot backend)

### Installation Instructions

#### 1. Install nvm (Node Version Manager)
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload your shell
source ~/.bashrc  # or ~/.zshrc
```

#### 2. Install sdkman (Java Version Manager)
```bash
# Install sdkman
curl -s "https://get.sdkman.io" | bash

# Reload your shell
source ~/.bashrc  # or ~/.zshrc
```

#### 3. Install Maven
```bash
# Using sdkman (recommended)
sdk install maven

# Or using package manager
# macOS: brew install maven
# Ubuntu: sudo apt install maven
```

### Version Requirements
- **Node.js**: 22.12.0 (specified in `.nvmrc`)
- **Java**: 21.0.8-amzn (specified in `.sdkmanrc`)
- **Maven**: 3.6+ (for Spring Boot backend)
- **Angular CLI**: 17+ (installed via npm)

## 🚀 Quick Start Guide

### Step 1: Setup Environment
```bash
# Clone the repository
git clone <repository-url>
cd franchisehub

# Set up Node.js version
nvm use  # Uses version from .nvmrc (22.12.0)

# Set up Java version
sdk env  # Uses version from .sdkmanrc (java=21.0.8-amzn)
```

### Step 2: Start the Documentation Server (Optional)
```bash
cd docs
npm install
npm start
```
📚 **Documentation available at**: `http://localhost:3001`

### Step 3: Start the Spring Boot Backend
```bash
cd franchise-hub-api
mvn spring-boot:run
```
⚡ **Backend API available at**: `http://localhost:8080/api/v1`
🔗 **Swagger UI available at**: `http://localhost:8080/api/v1/swagger-ui/index.html`

### Step 4: Start the Angular Frontend
```bash
cd franchise-hub-app
npm install
npm start
```
🎨 **Frontend application available at**: `http://localhost:4200`

### Demo Accounts
**Business Owner Account:**
- Email: `business@demo.com`
- Password: `password123`

**Partner Account:**
- Email: `partner@demo.com`
- Password: `password123`

## 🔧 Development Workflow

### Frontend Development (Angular)
```bash
cd franchise-hub-app

# Development server
npm start                    # Start dev server on port 4200
npm run dev                  # Alternative start command

# Building
npm run build               # Production build
npm run watch               # Development build with file watching

# Testing
npm test                    # Run unit tests
npm run test:coverage       # Run tests with coverage

# Code Quality
npm run lint                # Run ESLint
```

### Backend Development (Spring Boot)
```bash
cd franchise-hub-api

# Development server
mvn spring-boot:run         # Start backend on port 8080

# Building
mvn clean compile           # Compile the application
mvn clean package           # Build JAR file

# Testing
mvn test                    # Run unit tests
mvn test -Dtest=ClassName   # Run specific test class
```

### Documentation Development
```bash
cd docs

# Start documentation server
npm start                   # Start docs server on port 3001
npm run dev                 # Start with auto-reload

# Validate OpenAPI spec
npm run validate            # Validate swagger.yaml
```

## 📚 Documentation Links

### API Documentation
- **📖 OpenAPI Specification**: [`docs/swagger.yaml`](docs/swagger.yaml) - Complete API contract with 42 REST endpoints
- **🌐 Documentation Server**: `http://localhost:3001` - Interactive API documentation
- **⚡ Swagger UI**: `http://localhost:8080/api/v1/swagger-ui/index.html` - Live API testing interface
- **📋 Integration Guide**: [`docs/integration-guide.md`](docs/integration-guide.md) - Frontend-backend integration guide

### Project Documentation
- **🎨 Frontend README**: [`franchise-hub-app/README.md`](franchise-hub-app/README.md) - Angular application details
- **⚡ Backend README**: [`franchise-hub-api/README.md`](franchise-hub-api/README.md) - Spring Boot API details
- **📚 Documentation README**: [`docs/README.md`](docs/README.md) - API documentation guide
- **🏗️ API Design Decisions**: [`docs/api-design-decisions.md`](docs/api-design-decisions.md) - Architecture decisions

## 🔧 Production Build

### Frontend Production Build
```bash
cd franchise-hub-app
npm run build
# Output: dist/ directory ready for deployment
```

### Backend Production Build
```bash
cd franchise-hub-api
mvn clean package
# Output: target/franchise-hub-api-1.0.0.jar
```

### Environment Configuration
- **Frontend**: Update `src/environments/environment.prod.ts` with production API URL
- **Backend**: Configure `application-prod.yml` with production database and settings
- **Database**: Switch from SQLite (dev) to MySQL/PostgreSQL (production)

## 🚀 Deployment Options

### Frontend Deployment
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **Cloud Platforms**: AWS S3, Google Cloud Storage, Azure Static Web Apps
- **CDN Integration**: CloudFront, CloudFlare

### Backend Deployment
- **Cloud Platforms**: AWS EC2, Google Cloud Run, Azure App Service
- **Container Platforms**: Docker, Kubernetes
- **Traditional Hosting**: VPS, dedicated servers with Java 21 support

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Business, Partner, and Admin roles
- **Input Validation**: Comprehensive form and API validation
- **CORS Configuration**: Secure cross-origin resource sharing
- **SQL Injection Prevention**: JPA/Hibernate parameterized queries

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the comprehensive documentation
- Review the API documentation at `localhost:3001`
- Test endpoints using Swagger UI at `localhost:8080/api/v1/swagger-ui/index.html`

---

**Built with ❤️ using Angular 17+, Spring Boot 3.2.1, and Material Design**
