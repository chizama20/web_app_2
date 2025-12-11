import { jwtDecode } from 'jwt-decode'; // Correct import syntax for jwt-decode

export const getToken = () => {
  return localStorage.getItem('token');
};

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

export const getRoleFromToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.role || 'client';
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const getFirstNameFromToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.firstName;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const isContractor = () => {
  return getRoleFromToken() === 'contractor';
};

export const isClient = () => {
  return getRoleFromToken() === 'client';
};