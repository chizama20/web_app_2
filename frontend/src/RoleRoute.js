import React from 'react';
import { Navigate } from 'react-router-dom';
import { getRoleFromToken } from './utils';

const RoleRoute = ({ children, allowedRoles }) => {
  const userRole = getRoleFromToken();

  if (!userRole) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userRole)) {
    // Redirect based on role
    if (userRole === 'contractor') {
      return <Navigate to="/contractor/dashboard" />;
    } else {
      return <Navigate to="/dashboard" />;
    }
  }

  return children;
};

export default RoleRoute;

