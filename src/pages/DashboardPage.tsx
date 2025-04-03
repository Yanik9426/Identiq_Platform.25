// src/pages/DashboardPage.tsx

import React from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjust path if needed, likely '../contexts/AuthContext'

function DashboardPage() {
    // Get the current user from the auth context
    const { currentUser } = useAuth();

    return (
        // Basic page structure - Style with Tailwind later
        <div className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>

            {/* Display a welcome message if the user object is available */}
            {currentUser ? (
                <p className="mb-4">
                    Welcome back, <span className="font-medium">{currentUser.email}</span>!
                </p>
            ) : (
                // This part should ideally not be reached if ProtectedRoute works correctly
                <p className="mb-4">Loading user information...</p>
            )}

            <p>This is your protected dashboard area. Only logged-in users should see this.</p>

            {/* You can add more dashboard-specific components and content here later */}
            <div className="mt-6 p-4 border border-dashed border-gray-300 rounded">
                <p className="text-gray-500">Dashboard content area...</p>
            </div>
        </div>
    );
}

export default DashboardPage;
