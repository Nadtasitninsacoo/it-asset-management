import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
    roleRequired?: 'ADMIN' | 'USER';
}

const ProtectedRoute = ({ roleRequired }: ProtectedRouteProps) => {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const rawRole = localStorage.getItem('role');
        const role = rawRole ? rawRole.trim().toUpperCase() : null;

        if (token && role) {
            setUserRole(role);
        } else {
            setUserRole(null);
        }

        setLoading(false);
    }, []);

    if (loading) {
        // รอโหลดค่า token/role
        return (
            <div className="flex items-center justify-center h-screen text-gray-500">
                Loading...
            </div>
        );
    }

    if (!userRole) {
        return <Navigate to="/login" replace />;
    }

    if (roleRequired && userRole !== roleRequired) {
        const redirectPath = userRole === 'ADMIN' ? '/admin-dashboard' : '/borrow-assets';
        return <Navigate to={redirectPath} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;