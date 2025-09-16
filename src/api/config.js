
// src/api/config.js
// Centralized API configuration
// Using empty string for development proxy, or full URL for production
export const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'http://localhost:8080' : ''
