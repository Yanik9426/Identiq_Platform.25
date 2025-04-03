// src/pages/LoginPage.tsx - Refactored

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Keep useAuth for email/pass login
import { useNavigate, Link } from 'react-router-dom';
import { User } from 'firebase/auth'; // Import User type for callback

// Import the reusable components
import GoogleSignInButton from '../components/auth/GoogleSignInButton'; // Adjust path
import PhoneAuthForm from '../components/auth/PhoneAuthForm'; // Adjust path

function LoginPage() {
    // --- State for Email/Password Flow ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // --- State for Toggling Phone UI ---
    const [showPhoneSignIn, setShowPhoneSignIn] = useState(false);

    // --- Common State ---
    const [error, setError] = useState(''); // For displaying errors from any method
    // Loading state can be removed as child components handle their own internal loading

    // --- Hooks ---
    const { login } = useAuth(); // Only need email/password login from context now
    const navigate = useNavigate();

    // --- Handle Email/Password Login --- (Keep original logic)
    const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        // Optional: Add local loading state for this specific form if desired
        // setLoading(true);
        if (!email || !password) { setError('Please enter both email and password.'); return; }
        try {
            await login(email, password); // Use context function
            navigate('/'); // Navigate on success
        } catch (err: any) {
            console.error("Email Login failed:", err);
            // Set error based on code
            if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(err.code)) { setError('Invalid email or password.'); }
            else if (err.code === 'auth/invalid-email') { setError('Please enter a valid email address.'); }
            else if (err.code === 'auth/user-disabled') { setError('This account has been disabled.'); }
            else { setError('Failed to log in. Please try again later.'); }
        } finally {
            // Optional: setLoading(false);
        }
    };

    // --- Callback for successful Phone/Google sign-in ---
    const handleAuthSuccess = (user: User) => {
        console.log("Login successful via alternative method for user:", user.uid);
        setError(''); // Clear any previous errors
        navigate('/'); // Navigate to home page after successful login
    };

    // --- Callback for failed Phone/Google sign-in ---
    const handleAuthError = (error: any) => {
        console.error("Alternative Sign-In Error:", error);
        // Set a general error message, or inspect error.code if needed
         if (error.code === 'auth/popup-closed-by-user') { setError('Google Sign-In cancelled.'); }
         else if (error.code === 'auth/account-exists-with-different-credential') { setError('Email already registered via different method.'); }
         else if (error.code === 'auth/invalid-verification-code' || error.code === 'auth/code-expired') { setError('Invalid or expired phone verification code.'); setShowPhoneSignIn(true); } // Keep phone form visible
         else { setError('Sign in failed. Please try again.'); }
    };

    // --- Render Component ---
    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
            {/* NOTE: Removed the explicit recaptcha container div - PhoneAuthForm handles its own */}
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Log In</h2>
            {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

            {/* Conditionally render Email/Password form OR PhoneAuthForm */}
            {!showPhoneSignIn ? (
                // --- Email/Password Form ---
                <form onSubmit={handleEmailPasswordSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="login-email" style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</label>
                        <input type="email" id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} aria-label="Email Address" />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="login-password" style={{ display: 'block', marginBottom: '0.5rem' }}>Password:</label>
                        <input type="password" id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} aria-label="Password" />
                    </div>
                    <button type="submit" /* disabled={loading} */ style={{ width: '100%', padding: '0.75rem', backgroundColor: /* loading ? '#ccc' : */ '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {/* {loading ? 'Logging In...' : 'Log In'} */} Log In with Email
                    </button>
                </form>
            ) : (
                // --- Render Phone Auth Component ---
                <PhoneAuthForm onSuccess={handleAuthSuccess} onError={handleAuthError} />
            )}

            {/* --- OR Separator --- */}
            <div style={{ textAlign: 'center', margin: '1.5rem 0', display: 'flex', alignItems: 'center' }}> <hr style={{ flexGrow: 1, borderTop: '1px solid #ccc' }} /> <span style={{ padding: '0 1rem', color: '#666' }}>OR</span> <hr style={{ flexGrow: 1, borderTop: '1px solid #ccc' }} /> </div>

            {/* --- Render Google Sign In Button Component --- */}
            <GoogleSignInButton
                onSuccess={handleAuthSuccess}
                onError={handleAuthError}
                buttonText="Sign in with Google" // Explicitly set text
            />

            {/* --- Toggle Button / Links --- */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                    onClick={() => { setShowPhoneSignIn(!showPhoneSignIn); setError(''); /* Clear error on toggle */ }}
                    // disabled={loading} - Loading state removed from this level
                    style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', marginRight: '1rem' }}
                >
                    {showPhoneSignIn ? 'Sign in with Email instead' : 'Sign in with Phone instead'}
                </button>
                <p style={{ display: 'inline-block', marginTop: '1rem' }}>
                    Don't have an account?
                    <Link to="/signup" style={{ marginLeft: '0.5rem', color: '#007bff' }}>Sign Up</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;