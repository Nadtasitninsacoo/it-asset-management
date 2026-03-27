import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
    roleRequired?: 'ADMIN' | 'USER';
}

const ProtectedRoute = ({ roleRequired }: ProtectedRouteProps) => {
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (roleRequired && userRole !== roleRequired) {
        return <Navigate to="/borrow-assets" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;