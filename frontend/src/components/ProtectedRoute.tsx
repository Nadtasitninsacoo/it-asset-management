import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
    roleRequired?: 'ADMIN' | 'USER';
}

const ProtectedRoute = ({ roleRequired }: ProtectedRouteProps) => {
    const token = localStorage.getItem('access_token');
    const rawRole = localStorage.getItem('role');
    const userRole = rawRole ? rawRole.trim().toUpperCase() : null;

    if (!token || !userRole) {
        return <Navigate to="/login" replace />;
    }

    if (roleRequired === 'ADMIN' && userRole !== 'ADMIN') {
        return <Navigate to="/borrow-assets" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;