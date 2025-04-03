// src/components/layout/Header.tsx - Updated to display roles

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // CHECK PATH if needed

const Header: React.FC = () => {
  // Destructure currentUser, logout, and userRoles from context
  const { currentUser, logout, userRoles } = useAuth();
  const navigate = useNavigate();

  // Logout handler remains the same
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">

        {/* Logo / Title Area */}
        <div>
          <Link to="/" className="text-xl font-bold hover:text-gray-300">
             Identiq
          </Link>
        </div>

        {/* Authentication Status / Actions Area */}
        <div className="flex items-center space-x-4">
          {currentUser ? (
            // --- User is Logged In ---
            <>
              {/* Display User Info (Email or Phone) */}
              <span className="text-sm hidden sm:inline">
                {currentUser.email || currentUser.phoneNumber}
              </span>

              {/* --- Display Roles --- */}
              {/* Check if userRoles array exists and is not empty */}
              {userRoles && userRoles.length > 0 && (
                <span className="text-xs py-0.5 px-1.5 bg-gray-600 rounded font-medium capitalize">
                  {/* Display the first role found. You could adjust this logic */}
                  {/* e.g., userRoles.join(', ') to show multiple roles */}
                  {userRoles[0]}
                </span>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            // --- User is Logged Out ---
            <>
              <Link to="/login" className="hover:text-gray-300 text-sm font-medium">
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm font-medium"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;