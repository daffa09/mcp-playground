# API Documentation

## Overview
This API provides endpoints for managing users and products in an e-commerce system.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Endpoints

### Users

#### GET /api/users
Get all users (admin only)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /api/users/:id
Get user by ID

**Parameters:**
- `id` (string): User ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### POST /api/users
Create new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

### Products

#### GET /api/products
Get all products with pagination

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `category` (string): Filter by category

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "456",
      "name": "Product Name",
      "price": 99.99,
      "category": "electronics",
      "stock": 50
    }
  ]
}
```

#### POST /api/products
Create new product (admin only)

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "category": "electronics",
  "stock": 100
}
```

## Error Handling

All endpoints return errors in this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
