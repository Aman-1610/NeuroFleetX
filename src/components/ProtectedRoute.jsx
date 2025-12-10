import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../utils/authUtils';

const ProtectedRoute = ({ allowedRoles }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    const role = getUserRole();
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
