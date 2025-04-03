// src/pages/SignupPage.tsx - Refactored

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // For Email/Password signup
import { useNavigate, Link } from 'react-router-dom';
import { User } from 'firebase/auth'; // Import User type for callback
// Keep Firestore imports needed for the primary Email/Password signup handler
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../config/firebase'; // Import Firestore instance - CHECK PATH

// Import the reusable components
import GoogleSignInButton from '../components/auth/GoogleSignInButton'; // Adjust path if needed
import PhoneAuthForm from '../components/auth/PhoneAuthForm'; // Adjust path if needed

function SignupPage() {
    // --- State for Email/Password Flow ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // --- State for Toggling Phone UI ---
    const [showPhoneSignUp, setShowPhoneSignUp] = useState(false); // To show/hide PhoneAuthForm

    // --- Common State ---
    const [error, setError] = useState(''); // For displaying errors from any method
    const [loading, setLoading] = useState(false); // Loading state specifically for the Email/Password form

    // --- Hooks ---
    const { signup } = useAuth(); // Email/Password signup function from context
    const navigate = useNavigate();

    // --- Handle Email/Password SIGNUP --- (Original logic including Firestore creation)
    const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setLoading(true);
        if (!email || !password) { setError('Please fill in both email and password.'); setLoading(false); return; }
        try {
            // 1. Create user via Auth
            const userCredential = await signup(email, password);
            const user = userCredential.user;
            console.log('Email Signup successful! User UID:', user.uid);

            // 2. Create Firestore document (This is specific to the Email/Password signup path)
            // The reusable components handle Firestore doc creation for their paths internally.
            console.log('Creating Firestore document via Email Signup...');
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email, // Email is guaranteed here
                createdAt: serverTimestamp(),
                // Initialize other default fields like roles, etc.
                // Example: roles: ['candidate'],
            });
            console.log('Firestore document created successfully!');

            // 3. Navigate
            navigate('/');
        } catch (err: any) {
            console.error("Email Signup or Firestore operation failed:", err);
            if (err.code === 'auth/email-already-in-use') { setError('Email already registered.'); }
            else if (err.code === 'auth/weak-password') { setError('Password too weak (min 6 chars).'); }
            else if (err.message.includes('firestore')) { setError('Failed to save user data.'); }
            else { setError('Failed to create account.'); }
        } finally { setLoading(false); }
    };

    // --- Callback for successful Phone/Google sign-up/in ---
    // Called by PhoneAuthForm and GoogleSignInButton upon their success
    const handleAuthSuccess = (user: User) => {
        console.log("Signup/Login successful via alternative method for user:", user.uid);
        // Firestore doc check/creation is handled within the reusable components now
        setError('');
        // TODO: Consider role check/redirection after signup success
        navigate('/'); // Navigate to home page
    };

    // --- Callback for failed Phone/Google sign-up/in ---
    // Called by PhoneAuthForm and GoogleSignInButton upon their failure
    const handleAuthError = (error: any) => {
        console.error("Alternative Sign-Up/In Error:", error);
        if (error.code === 'auth/popup-closed-by-user') { setError('Google Sign-Up cancelled.'); }
        else if (error.code === 'auth/account-exists-with-different-credential') { setError('Email already registered via different method.'); }
        else if (error.code === 'auth/invalid-verification-code' || error.code === 'auth/code-expired') { setError('Invalid or expired phone verification code.'); setShowPhoneSignUp(true); } // Keep phone form visible
        else { setError('Sign up failed. Please try again.'); }
    };

    // --- Render Component ---
    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
            {/* PhoneAuthForm handles its own recaptcha container internally */}
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Sign Up</h2>
            {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

            {/* Conditionally render Email/Password signup form OR PhoneAuthForm */}
            {!showPhoneSignUp ? (
                // --- Email/Password SIGNUP Form ---
                <form onSubmit={handleEmailPasswordSubmit}>
                    {/* Email Input */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="signup-email" style={{ display: 'block', marginBottom: '0.5rem' }}>Email Address:</label>
                        <input type="email" id="signup-email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} aria-label="Email Address"/>
                    </div>
                    {/* Password Input */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="signup-password" style={{ display: 'block', marginBottom: '0.5rem' }}>Password:</label>
                        <input type="password" id="signup-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} aria-label="Password"/>
                        <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>Password should be at least 6 characters.</small>
                    </div>
                    {/* Submit Button */}
                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', backgroundColor: loading ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {loading ? 'Creating Account...' : 'Sign Up with Email'}
                    </button>
                </form>
            ) : (
                // --- Render Phone Auth Component ---
                // It handles the entire phone signup/login flow internally
                <PhoneAuthForm onSuccess={handleAuthSuccess} onError={handleAuthError} />
            )}

            {/* --- OR Separator --- */}
            <div style={{ textAlign: 'center', margin: '1.5rem 0', display: 'flex', alignItems: 'center' }}> <hr style={{ flexGrow: 1, borderTop: '1px solid #ccc' }} /> <span style={{ padding: '0 1rem', color: '#666' }}>OR</span> <hr style={{ flexGrow: 1, borderTop: '1px solid #ccc' }} /> </div>

            {/* --- Render Google Sign In Button Component --- */}
            <GoogleSignInButton
                onSuccess={handleAuthSuccess}
                onError={handleAuthError}
                buttonText="Sign up with Google" // Use "Sign up" text
            />

            {/* --- Toggle Button / Link to Login --- */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                    onClick={() => { setShowPhoneSignUp(!showPhoneSignUp); setError(''); /* Clear error on toggle */ }}
                    disabled={loading} // Disable if email signup is loading
                    style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', marginRight: '1rem' }}
                >
                    {showPhoneSignUp ? 'Sign up with Email instead' : 'Sign up with Phone instead'}
                </button>
                <p style={{ display: 'inline-block', marginTop: '1rem' }}>
                    Already have an account?
                    <Link to="/login" style={{ marginLeft: '0.5rem', color: '#007bff' }}>Log In</Link>
                </p>
            </div>
        </div>
    );
}

export default SignupPage;