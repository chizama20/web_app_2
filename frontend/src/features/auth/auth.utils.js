import { jwtDecode } from 'jwt-decode';

// Get JWT token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Get userId from JWT token
export const getUserIdFromToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.userId;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Clear authentication
export const clearAuth = () => {
  localStorage.removeItem('token');
};
