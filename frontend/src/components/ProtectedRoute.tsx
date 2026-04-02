// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
    roleRequired?: 'ADMIN' | 'USER';
}

const ProtectedRoute = ({ roleRequired }: ProtectedRouteProps) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const userRoleRaw = localStorage.getItem('role');
    const userRole = userRoleRaw ? userRoleRaw.toString().trim().toUpperCase() : 'USER';

    if (roleRequired && userRole !== roleRequired) {
        if (userRole === 'ADMIN') {
            return <Navigate to="/admin-dashboard" replace />;
        } else {
            return <Navigate to="/borrow-assets" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;