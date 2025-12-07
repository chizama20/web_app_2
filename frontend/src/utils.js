import { jwtDecode } from 'jwt-decode'; // Correct import syntax for jwt-decode
/*
export const getUsernameFromToken = () => {
  const token = localStorage.getItem('token'); // Get the token from localStorage
  if (!token) return null;

  try {
    const decoded = jwtDecode(token); // Decode the token to get user information
    return decoded.username; // Assuming the token has a "username" field
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};
*/

export const getFirstNameFromToken = () => {
  const token = localStorage.getItem('token'); // Get the token from localStorage
  if (!token) return null;

  try {
    const decoded = jwtDecode(token); // Decode the token to get user information
    return decoded.firstName; // Assuming the token has a "first name" field
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};