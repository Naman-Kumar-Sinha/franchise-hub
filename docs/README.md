# FranchiseHub API Documentation

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git (for cloning the repository)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd franchisehub/docs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the documentation server**
   ```bash
   npm start
   ```

4. **Access the documentation**
   - **Swagger UI**: http://localhost:3001/api-docs
   - **Raw YAML**: http://localhost:3001/swagger.yaml
   - **Raw JSON**: http://localhost:3001/swagger.json
   - **Health Check**: http://localhost:3001/health

## 📚 Documentation Features

### Professional Swagger UI
- **Interactive API Explorer**: Test endpoints directly from the browser
- **Authentication Support**: JWT token authentication with persistent sessions
- **Request/Response Examples**: Comprehensive examples for all endpoints
- **Schema Validation**: Real-time validation of request/response data
- **Professional Styling**: Custom CSS for branded appearance

### Comprehensive API Coverage
- **Authentication**: Login, registration, token refresh, logout
- **User Management**: Profile management, password changes
- **Franchise Management**: CRUD operations, search, filtering
- **Application Workflow**: Complete application lifecycle
- **Payment Processing**: Payment requests, transactions, settlements
- **Partnership Management**: Partnership lifecycle operations

### Development Tools
- **Hot Reload**: Automatic refresh when swagger.yaml is modified
- **Multiple Formats**: YAML and JSON export capabilities
- **Health Monitoring**: Built-in health check endpoint
- **Error Handling**: Comprehensive error response documentation

## 🛠️ Development

### Available Scripts

```bash
# Start documentation server
npm start

# Start with auto-reload (development)
npm run dev

# Validate Swagger specification
npm run validate

# Build documentation (production ready)
npm run build
```

### Modifying the API Documentation

1. **Edit the Swagger specification**
   ```bash
   # Edit the main API specification
   vim swagger.yaml
   ```

2. **Validate changes**
   ```bash
   npm run validate
   ```

3. **View changes**
   - The server automatically reloads when swagger.yaml is modified
   - Refresh your browser to see the updates

### Adding New Endpoints

1. **Add to paths section** in `swagger.yaml`
2. **Define request/response schemas** in components section
3. **Add examples** for better documentation
4. **Test the endpoint** using Swagger UI

## 📋 API Overview

### Base URLs
- **Development**: `http://localhost:8080/api/v1`
- **Production**: `https://api.franchisehub.com/v1`

### Authentication
All protected endpoints require JWT authentication:
```
Authorization: Bearer <your-jwt-token>
```

### Rate Limiting
- **Authenticated**: 1000 requests/hour
- **Unauthenticated**: 100 requests/hour

### Response Format
All responses follow a consistent JSON format:
```json
{
  "data": { ... },
  "pagination": { ... },
  "error": { ... },
  "timestamp": "2024-03-25T10:30:00Z"
}
```

## 🔧 API Endpoints Summary

### Authentication (`/auth`)
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout

### Users (`/users`)
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile
- `POST /users/change-password` - Change password

### Franchises (`/franchises`)
- `GET /franchises` - List franchises with filtering
- `POST /franchises` - Create new franchise
- `GET /franchises/{id}` - Get franchise details
- `PUT /franchises/{id}` - Update franchise
- `DELETE /franchises/{id}` - Delete franchise

### Applications (`/applications`)
- `GET /applications` - List applications
- `POST /applications` - Submit new application
- `GET /applications/{id}` - Get application details
- `PUT /applications/{id}` - Update application
- `POST /applications/{id}/review` - Review application

### Payments (`/payments`)
- `GET /payments/transactions` - List transactions
- `POST /payments/process` - Process payment
- `GET /payments/requests` - List payment requests
- `POST /payments/requests` - Create payment request

## 🚀 Deployment

### Production Deployment

1. **Build the documentation**
   ```bash
   npm run build
   ```

2. **Deploy to hosting platform**
   - **Static hosting**: Netlify, Vercel, GitHub Pages
   - **Container platforms**: Docker, Kubernetes
   - **Cloud platforms**: AWS S3, Google Cloud Storage

3. **Environment configuration**
   ```bash
   # Set production port
   export PORT=80
   
   # Start production server
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📞 Support

### Getting Help
- **Issues**: Create an issue in the repository
- **Documentation**: Check this README and inline comments
- **API Support**: Contact api-support@franchisehub.com

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes to `swagger.yaml`
4. Test the documentation locally
5. Submit a pull request

## 📄 License

This API documentation is licensed under the MIT License. See the LICENSE file for details.

---

**Built with ❤️ using OpenAPI 3.0 and Swagger UI**
