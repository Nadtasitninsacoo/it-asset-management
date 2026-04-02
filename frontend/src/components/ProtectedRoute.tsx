import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
    roleRequired?: 'ADMIN' | 'USER';
}

const ProtectedRoute = ({ roleRequired }: ProtectedRouteProps) => {
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const role = localStorage.getItem('role')?.trim().toUpperCase() || 'USER';
        setUserRole(token ? role : null);
    }, []);

    if (userRole === null) return null; // รอโหลดก่อน render

    if (!localStorage.getItem('access_token')) {
        return <Navigate to="/login" replace />;
    }

    if (roleRequired && userRole !== roleRequired) {
        return <Navigate to={userRole === 'ADMIN' ? '/admin-dashboard' : '/borrow-assets'} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;