# API Client Migration Guide

This document explains how to use the new centralized API client instead of direct fetch calls.

## Before (Old Pattern)

```typescript
// Old way - direct fetch with manual auth headers
const response = await fetch(API_ENDPOINTS.users, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
});

if (!response.ok) {
  throw new Error('Failed to fetch users');
}

const data = await response.json();
```

## After (New Pattern)

```typescript
// New way - using API client
import { apiClient } from './api-client';

const result = await apiClient.get(API_ENDPOINTS.users);

if (!result.success) {
  throw new Error(result.message || 'Failed to fetch users');
}

const data = result.data;
```

## Key Changes

The API client now **passes through** the actual API response instead of wrapping it. This means:

- If your API returns `{ success: true, data: {...} }`, the client returns exactly that
- No double-wrapping of responses
- Direct access to your API's response structure

## API Client Methods

### GET Request
```typescript
const result = await apiClient.get<UserResponse>('/api/users');
// result is exactly what your API returns
```

### POST Request
```typescript
const result = await apiClient.post('/api/users', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

### PUT Request
```typescript
const result = await apiClient.put('/api/users/123', {
  name: 'Jane Doe'
});
```

### PATCH Request
```typescript
const result = await apiClient.patch('/api/users/123', {
  isActive: false
});
```

### DELETE Request
```typescript
const result = await apiClient.delete('/api/users/123');
```

### Request without Authentication
```typescript
const result = await apiClient.post('/api/login', {
  email: 'user@example.com',
  password: 'password'
}, { requireAuth: false });
```

## Response Handling

The API client intelligently handles responses:

1. **If your API returns a standardized format** (with `success` field), it passes it through unchanged
2. **If your API returns raw data**, it wraps it in `{ success: true, data: rawData }`
3. **For errors**, it returns `{ success: false, message: errorMessage }`

## Example API Response Formats

### Your API returns standardized format:
```typescript
// API returns: { success: true, data: { users: [...] } }
const result = await apiClient.get('/api/users');
// result = { success: true, data: { users: [...] } }
```

### Your API returns raw data:
```typescript
// API returns: [{ id: 1, name: 'John' }, ...]
const result = await apiClient.get('/api/users');
// result = { success: true, data: [{ id: 1, name: 'John' }, ...] }
```

## Benefits

1. **Automatic Authentication**: Authorization headers are added automatically
2. **Response Pass-through**: No double-wrapping of API responses
3. **Error Handling**: Consistent error handling across all API calls
4. **Type Safety**: Full TypeScript support with generic types
5. **Centralized Configuration**: Easy to modify headers, base URLs, or add interceptors

## Error Handling

```typescript
const result = await apiClient.get('/api/users');

if (result.success) {
  // Handle success
  console.log('Users:', result.data);
} else {
  // Handle error
  console.error('Error:', result.message);
  toast.error(result.message || 'An error occurred');
}
```