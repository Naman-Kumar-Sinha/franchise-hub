# FranchiseHub API Design Decisions

## 🎯 Overview

This document outlines the key design decisions made for the FranchiseHub REST API, providing rationale and context for implementation choices.

## 🏗️ Architecture Decisions

### RESTful Design Principles

**Decision**: Follow REST architectural constraints with resource-based URLs
**Rationale**: 
- Industry standard approach for web APIs
- Clear, predictable URL patterns
- Stateless communication
- Cacheable responses

**Examples**:
```
GET    /api/v1/franchises           # List franchises
POST   /api/v1/franchises           # Create franchise
GET    /api/v1/franchises/{id}      # Get specific franchise
PUT    /api/v1/franchises/{id}      # Update franchise
DELETE /api/v1/franchises/{id}      # Delete franchise
```

### API Versioning Strategy

**Decision**: URL path versioning (`/api/v1/`)
**Rationale**:
- Clear version identification
- Easy to implement and understand
- Allows parallel version support
- Compatible with API gateways

**Alternative Considered**: Header-based versioning
**Why Rejected**: Less visible, harder to test manually

### Authentication & Authorization

**Decision**: JWT (JSON Web Token) based authentication with role-based access control
**Rationale**:
- Stateless authentication suitable for microservices
- Industry standard for modern web applications
- Supports role-based permissions (BUSINESS, PARTNER)
- Compatible with frontend frameworks

**Security Features**:
- Bearer token authentication
- Token expiration and refresh mechanism
- Role-based endpoint protection
- Rate limiting by authentication status

### Data Model Design

**Decision**: Rich domain models with embedded objects and relationships
**Rationale**:
- Reflects real-world franchise business complexity
- Supports comprehensive business requirements
- Enables detailed filtering and search capabilities
- Facilitates data integrity and validation

**Key Design Patterns**:
- Embedded objects for related data (ContactInfo, Requirements)
- Enums for controlled vocabularies (UserRole, FranchiseCategory)
- Comprehensive audit fields (createdAt, updatedAt)
- Soft delete patterns (isActive flags)

## 🔍 API Design Patterns

### Pagination Strategy

**Decision**: Offset-based pagination with comprehensive metadata
**Rationale**:
- Simple to implement and understand
- Provides complete pagination context
- Supports sorting and filtering
- Compatible with most UI frameworks

**Response Structure**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Handling

**Decision**: Consistent error response format with detailed information
**Rationale**:
- Predictable error handling for clients
- Supports both general and field-specific errors
- Includes debugging information
- Follows HTTP status code conventions

**Error Response Format**:
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input parameters",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2024-03-25T10:30:00Z",
  "path": "/api/v1/auth/login"
}
```

### Filtering and Search

**Decision**: Query parameter-based filtering with multiple criteria support
**Rationale**:
- RESTful approach using HTTP query parameters
- Supports complex filtering scenarios
- Easy to implement caching strategies
- Compatible with URL bookmarking

**Supported Filters**:
- Category-based filtering
- Investment range filtering
- Geographic filtering (states)
- Keyword search
- Status filtering
- Date range filtering

## 📊 Business Logic Decisions

### Application Workflow

**Decision**: State-based application lifecycle with clear transitions
**Rationale**:
- Reflects real-world franchise application process
- Enables proper business rule enforcement
- Supports audit trail and reporting
- Allows for workflow automation

**Application States**:
```
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED
                                 ↓
                              WITHDRAWN
```

### Payment Processing

**Decision**: Separate payment transactions from payment requests
**Rationale**:
- Supports multiple payment scenarios (application fees, ongoing fees)
- Enables flexible payment request workflows
- Maintains clear audit trail
- Supports batch payment processing

**Payment Models**:
- `PaymentTransaction`: Actual payment processing
- `PaymentRequest`: Business-initiated payment requests
- Clear status tracking for both models

### Role-Based Access Control

**Decision**: Two primary roles (BUSINESS, PARTNER) with resource-level permissions
**Rationale**:
- Reflects the two main user types in franchise ecosystem
- Simple but effective permission model
- Supports future role expansion
- Clear separation of concerns

**Permission Matrix**:
```
Resource          | BUSINESS | PARTNER
------------------|----------|--------
Franchises        | CRUD own | Read all
Applications      | Read own | CRUD own
Payment Requests  | Create   | View own
Partnerships      | Manage   | View own
```

## 🔧 Technical Decisions

### Data Validation

**Decision**: Comprehensive input validation with detailed error messages
**Rationale**:
- Ensures data integrity
- Provides clear feedback to developers
- Prevents security vulnerabilities
- Supports frontend validation alignment

**Validation Strategies**:
- Required field validation
- Format validation (email, phone, URLs)
- Range validation (amounts, dates)
- Business rule validation
- Cross-field validation

### File Upload Handling

**Decision**: Multipart form data for document uploads with metadata
**Rationale**:
- Standard approach for file uploads
- Supports file metadata (type, size, requirements)
- Enables progress tracking
- Compatible with cloud storage integration

**Upload Features**:
- Document type classification
- File size validation
- Virus scanning capability
- Cloud storage integration ready

### Internationalization Support

**Decision**: Currency amounts in base units (INR) with formatting hints
**Rationale**:
- Avoids floating-point precision issues
- Supports multiple currency display formats
- Enables accurate financial calculations
- Future-proofs for international expansion

**Implementation**:
- All amounts stored as integers (paise for INR)
- Currency formatting handled by frontend
- Locale-aware number formatting
- Support for currency conversion

## 🚀 Performance Considerations

### Caching Strategy

**Decision**: HTTP caching headers with conditional requests
**Rationale**:
- Reduces server load
- Improves response times
- Supports CDN integration
- Standard HTTP caching mechanisms

**Caching Patterns**:
- Public franchise data: Long-term caching
- User-specific data: Short-term caching
- Dynamic data: No caching with proper headers

### Database Optimization

**Decision**: Indexed fields for common query patterns
**Rationale**:
- Optimizes search and filtering performance
- Supports efficient pagination
- Enables fast lookups
- Scales with data growth

**Index Strategy**:
- Primary keys and foreign keys
- Search fields (category, status)
- Filter fields (investment ranges)
- Composite indexes for complex queries

## 🔒 Security Considerations

### Input Sanitization

**Decision**: Comprehensive input validation and sanitization
**Rationale**:
- Prevents injection attacks
- Ensures data integrity
- Supports compliance requirements
- Maintains system stability

### Rate Limiting

**Decision**: Tiered rate limiting based on authentication status
**Rationale**:
- Prevents abuse and DoS attacks
- Encourages user registration
- Protects system resources
- Supports fair usage policies

**Rate Limits**:
- Authenticated users: 1000 requests/hour
- Unauthenticated users: 100 requests/hour
- Admin users: Higher limits
- Burst protection: 10 requests/second

## 📈 Scalability Decisions

### Stateless Design

**Decision**: Stateless API design with JWT tokens
**Rationale**:
- Enables horizontal scaling
- Supports load balancing
- Simplifies deployment
- Compatible with microservices architecture

### Microservice Ready

**Decision**: Domain-driven API design with clear boundaries
**Rationale**:
- Supports future microservice decomposition
- Clear separation of concerns
- Independent scaling capabilities
- Technology stack flexibility

**Service Boundaries**:
- Authentication Service
- Franchise Management Service
- Application Processing Service
- Payment Processing Service
- Notification Service

## 🔮 Future Considerations

### API Evolution

**Decision**: Backward-compatible changes with deprecation strategy
**Rationale**:
- Maintains client compatibility
- Supports gradual migration
- Reduces breaking changes
- Enables continuous deployment

### Integration Capabilities

**Decision**: Webhook support for real-time notifications
**Rationale**:
- Enables real-time integrations
- Supports event-driven architecture
- Reduces polling requirements
- Improves user experience

**Planned Webhooks**:
- Application status changes
- Payment completions
- Partnership updates
- System notifications

This design document serves as a reference for implementation decisions and provides context for future API evolution.
