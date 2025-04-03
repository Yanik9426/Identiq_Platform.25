// src/routes/ProtectedRoute.tsx - Fixed Children Prop Type

import React from 'react'; // Import React to use React.ReactNode
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust path if needed: '../contexts/AuthContext'

interface ProtectedRouteProps {
    // --- TYPE CHANGED HERE ---
    // Use React.ReactNode which is more flexible for component children
    children: React.ReactNode;
    allowedRoles?: string[]; // Optional array of roles allowed to access this route
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { currentUser, loading, userRoles } = useAuth(); // Get roles from context

    // 1. While checking authentication state, show loading
    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p>Verifying access...</p></div>;
    }

    // 2. If not loading and no user, redirect to login
    if (!currentUser) {
        console.log("ProtectedRoute: No user, redirecting to /login");
        return <Navigate to="/login" replace />;
    }

    // 3. If logged in, check roles (only if allowedRoles is provided)
    if (allowedRoles && allowedRoles.length > 0) {
        const hasRequiredRole = userRoles && userRoles.some(role => allowedRoles.includes(role));

        if (!hasRequiredRole) {
            // User is logged in BUT does not have any of the required roles
            console.log(`ProtectedRoute: User ${currentUser.uid} roles (${userRoles?.join(', ') || 'none'}) do not include required roles (${allowedRoles.join(', ')}). Redirecting to /unauthorized.`);
            return <Navigate to="/unauthorized" replace />;
        }
        console.log(`ProtectedRoute: User ${currentUser.uid} has required role. Access granted.`);
    } else {
         console.log(`ProtectedRoute: No specific roles required, access granted for user ${currentUser.uid}.`);
    }

    // 4. If all checks pass, render the requested child component(s)
    // Returning children directly works fine with ReactNode type
    return <>{children}</>; // Using fragment is also safe
};

export default ProtectedRoute;