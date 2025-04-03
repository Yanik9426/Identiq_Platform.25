// src/pages/HomePage.tsx

import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { useAuth } from '../contexts/AuthContext'; // Import useAuth to check login status - CHECK PATH

function HomePage() {
    // Get the current user from the authentication context
    const { currentUser } = useAuth();

    return (
        // Using basic Tailwind classes for centering, padding, and text alignment
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">

            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                Welcome to Identiq {/* Placeholder Title - Update as needed */}
            </h1>

            {currentUser ? (
                // --- Content shown when user IS LOGGED IN ---
                <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded relative mb-6" role="alert">
                    <p className="block sm:inline">
                        You are logged in as: <strong className="font-bold">{currentUser.email}</strong>
                    </p>
                    <p className="mt-2">
                        Ready to manage your tasks?
                    </p>
                    <div className="mt-4">
                         <Link
                            to="/dashboard" // Link to the protected dashboard
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition duration-150 ease-in-out shadow-md"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            ) : (
                // --- Content shown when user IS LOGGED OUT ---
                <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded relative mb-6" role="alert">
                    <p className="block sm:inline mb-4">
                        Please log in or sign up to access the platform features.
                    </p>
                    <div className="space-x-4"> {/* Add space between buttons */}
                        <Link
                            to="/login"
                            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition duration-150 ease-in-out shadow-md"
                        >
                            Log In
                        </Link>
                        <Link
                            to="/signup"
                            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded transition duration-150 ease-in-out shadow-md"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            )}

            {/* Placeholder for additional static homepage content */}
            <div className='mt-10 border-t border-gray-200 pt-6 text-gray-600'>
                 <h2 className="text-xl font-semibold mb-3">Platform Features</h2>
                 <p>More details about the platform's benefits and features will go here.</p>
                 <p>(This area will be built out later with actual design and content).</p>
            </div>

        </div>
    );
}

export default HomePage;