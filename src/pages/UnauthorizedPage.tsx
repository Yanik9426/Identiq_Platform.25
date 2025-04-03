// src/pages/UnauthorizedPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';

function UnauthorizedPage() {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="mb-6 text-gray-700">
                You do not have the necessary permissions to access the page you requested.
            </p>
            <Link
                to="/" // Link back to the homepage
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition duration-150 ease-in-out shadow-md"
            >
                Go to Home Page
            </Link>
            {/* You could add contact information for support if needed */}
        </div>
    );
}

export default UnauthorizedPage;