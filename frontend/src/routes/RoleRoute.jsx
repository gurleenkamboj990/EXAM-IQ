import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ROLE_DASHBOARDS } from '../utils/constants';

export const RoleRoute = ({ allowedRoles = [], children }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const targetDashboard = ROLE_DASHBOARDS[user.role] || '/';
    return <Navigate to={targetDashboard} replace />;
  }

  return children;
};

export default RoleRoute;

