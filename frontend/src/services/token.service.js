import { jwtDecode } from 'jwt-decode';

// Get JWT token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Set JWT token in localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove JWT token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
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

// Get user data from token
export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};
