// src/components/auth/GoogleSignInButton.tsx

import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { auth } from '../../config/firebase'; // Adjust path: Goes up two levels then into config
import { ensureUserDocumentExists } from '../../utils/firestoreUtils'; // Adjust path: Goes up two levels then into utils

// Define Props interface for the component
interface GoogleSignInButtonProps {
    onSuccess?: (user: User) => void; // Optional callback on successful sign-in/signup
    onError?: (error: any) => void; // Optional callback on error
    buttonText?: string; // Optional text for the button (e.g., "Sign in", "Sign up")
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
    onSuccess,
    onError,
    buttonText = "Sign in with Google" // Default button text
}) => {
    const [loading, setLoading] = useState(false);
    // Optional: Add local error state if needed: const [error, setError] = useState<string | null>(null);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        // Optional: setError(null); // Clear previous errors
        const provider = new GoogleAuthProvider(); // Create provider instance

        try {
            // Trigger the Google Sign-In popup
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log("Google Sign-In successful via component! User:", user.uid);

            // Ensure the user document exists in Firestore after successful authentication
            // This handles both first-time sign-ups and subsequent sign-ins via Google.
            await ensureUserDocumentExists(user);

            // If an onSuccess callback was provided, call it with the user object
            if (onSuccess) {
                onSuccess(user);
            }

            // Note: Navigation (e.g., redirecting to '/') should be handled by the
            // component *using* this button (e.g., LoginPage, SignupPage) within the onSuccess callback,
            // or triggered globally based on the AuthContext state change.

        } catch (error: any) {
            console.error("Google Sign-In failed via component:", error);
            // Optional: setError(error.message); // Set local error state

            // If an onError callback was provided, call it with the error object
            if (onError) {
                onError(error);
            }
            // The parent component can use this callback to display a general error message.

        } finally {
            setLoading(false); // Ensure loading state is reset
        }
    };

    return (
        // Using the same button structure and styling as before
        <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#4285F4', // Google Blue
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: loading ? 0.7 : 1, // Dim button when loading
                marginTop: '0.5rem' // Added margin top for spacing
            }}
            aria-label={buttonText}
        >
            {/* Basic Google SVG Icon */}
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 48 48" style={{ marginRight: '10px' }}><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
            {loading ? 'Processing...' : buttonText}
        </button>
        // Optional: Can add local error display here if using local error state
        // {error && <p style={{ color: 'red', marginTop: '0.5rem', textAlign: 'center' }}>{error}</p>}
    );
};

export default GoogleSignInButton;