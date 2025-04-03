// src/routes/ProtectedRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom'; // Import Navigate for redirection
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook - CHECK PATH

// Define the expected props for this component: 'children'
// 'children' will be the actual component we want to render if the user is authenticated
// (e.g., <DashboardPage />)
interface ProtectedRouteProps {
    children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    // Get the current user and the loading status from the authentication context
    const { currentUser, loading } = useAuth();

    // 1. Handle the Loading State
    // While Firebase is checking the initial authentication state, 'loading' will be true.
    // We should wait until loading is false before deciding whether to render the children or redirect.
    if (loading) {
        // You can return null or a dedicated loading spinner component here
        // This prevents flickering or incorrect redirects while auth state is initializing
        return (
             <div className="flex justify-center items-center min-h-screen"> {/* Basic centering */}
                <p>Checking authentication...</p> {/* Placeholder loading indicator */}
            </div>
        );
    }

    // 2. Handle the Not Authenticated State
    // If loading is finished ('loading' is false) AND there is no 'currentUser' object
    if (!currentUser) {
        // The user is not logged in. Redirect them to the '/login' page.
        // The 'replace' prop is important: it replaces the current entry in the
        // browser's history stack instead of pushing a new one. This means the
        // user won't go back to the protected route they were trying to access
        // if they hit the back button after being redirected to login.
        return <Navigate to="/login" replace />;
    }

    // 3. Handle the Authenticated State
    // If loading is finished and 'currentUser' exists, the user is logged in.
    // Render the child component(s) that were passed into this ProtectedRoute.
    return children;
};

export default ProtectedRoute;