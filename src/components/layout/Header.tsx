// src/components/layout/Header.tsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate for navigation
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth hook to access context

/*
This is the Header functional component, now updated to show
login/logout status and provide relevant actions.
*/
const Header: React.FC = () => {
  // Get current user and logout function from authentication context
  const { currentUser, logout } = useAuth();
  // Get navigate function for programmatic redirection
  const navigate = useNavigate();

  // Define the function to handle user logout
  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from context
      navigate('/login'); // Redirect to the login page after successful logout
    } catch (error) {
      console.error('Failed to log out:', error);
      // Consider adding user-facing error feedback here
    }
  };

  /*
  The 'return' statement renders the header structure.
  */
  return (
    /*
    Using your original background, text color, and padding.
    */
    <header className="bg-gray-800 text-white p-4">
      {/*
      Container is centered. Added flex utilities for layout:
      - flex: enables Flexbox.
      - justify-between: puts space between the logo/title and the auth actions.
      - items-center: vertically aligns the items in the middle.
      */
      }
      <div className="container mx-auto flex justify-between items-center">

        {/* Logo / Title Area */}
        <div>
          {/* Changed the H1 to a Link pointing to the home page */}
          <Link to="/" className="text-xl font-bold hover:text-gray-300">
             Identiq {/* Updated Placeholder Name */}
          </Link>
        </div>

        {/* Authentication Status / Actions Area */}
        <div className="flex items-center space-x-4"> {/* Use flex and spacing for the actions */}
          {currentUser ? (
            // --- Render this block if user IS logged in ---
            <>
              <span className="text-sm hidden sm:inline"> {/* Hide email on extra-small screens if desired */}
                {currentUser.email} {/* Display the user's email */}
              </span>
              <button
                onClick={handleLogout} // Call handleLogout when clicked
                // Basic button styling - adjust as needed
                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            // --- Render this block if user IS NOT logged in ---
            <>
              <Link to="/login" className="hover:text-gray-300 text-sm font-medium">
                Login
              </Link>
              <Link
                to="/signup"
                // Basic button styling for signup link - adjust as needed
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