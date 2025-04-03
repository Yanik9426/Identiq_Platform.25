// src/pages/LoginPage.tsx - Refactored with User Type Toggle

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User } from 'firebase/auth'; // Import User type for callback

// Import the reusable components
import GoogleSignInButton from '../components/auth/GoogleSignInButton'; // Adjust path if needed
import PhoneAuthForm from '../components/auth/PhoneAuthForm'; // Adjust path if needed

type UserType = 'candidate' | 'company'; // Define user types

function LoginPage() {
    // --- State ---
    const [email, setEmail] = useState(''); // For email/password form
    const [password, setPassword] = useState(''); // For email/password form
    const [userType, setUserType] = useState<UserType>('candidate'); // State for Candidate vs Company, default to candidate
    const [showPhoneSignIn, setShowPhoneSignIn] = useState(false); // State for toggling Phone UI *within* Candidate view
    const [error, setError] = useState(''); // General error display
    // Removed main loading state - handled within forms/buttons

    // --- Hooks ---
    const { login } = useAuth(); // Email/password login from context
    const navigate = useNavigate();

    // --- Email/Password Login Handler (Used by both types) ---
    const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
         e.preventDefault(); setError('');
         // TODO: Optionally add local loading state for this specific form submission
         if (!email || !password) { setError('Please enter both email and password.'); return; }
         try {
             await login(email, password); // Call context login function
             // TODO: Add role check after login to redirect to correct portal (candidate vs company vs admin)
             navigate('/'); // Navigate to generic home for now
         } catch (err: any) {
             console.error("Email Login failed:", err);
             if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(err.code)) { setError('Invalid email or password.'); }
             else { setError('Failed to log in. Please try again later.'); }
         }
    };

    // --- Callbacks for Alternative Auth Methods (Phone/Google) ---
    // These will only be triggered when userType is 'candidate'
    const handleAuthSuccess = (user: User) => {
        console.log("Login successful via alternative method for user:", user.uid);
        setError('');
        // TODO: Add role check after login to redirect to correct portal
        navigate('/');
    };
    const handleAuthError = (error: any) => {
        console.error("Alternative Sign-In Error:", error);
         if (error.code === 'auth/popup-closed-by-user') { setError('Google Sign-In cancelled.'); }
         else if (error.code === 'auth/account-exists-with-different-credential') { setError('Email already registered via different method.'); }
         else if (error.code === 'auth/invalid-verification-code' || error.code === 'auth/code-expired') { setError('Invalid or expired phone verification code.'); setShowPhoneSignIn(true); } // Keep phone form visible if OTP fails
         else { setError('Sign in failed. Please try again.'); }
    };

    // --- Function to handle changing user type ---
    const selectUserType = (type: UserType) => {
        setUserType(type);
        setError(''); // Clear errors
        setShowPhoneSignIn(false); // Reset sub-toggle
        setEmail(''); // Clear form fields
        setPassword('');
    };


    // --- Render Component ---
    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Log In</h2>

            {/* User Type Toggle Buttons */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button
                    onClick={() => selectUserType('candidate')}
                    style={{ padding: '0.5rem 1rem', border: '1px solid', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', borderColor: userType === 'candidate' ? '#007bff' : '#ccc', backgroundColor: userType === 'candidate' ? '#e7f3ff' : 'transparent', color: userType === 'candidate' ? '#007bff' : '#333' }}
                >
                    I am a Candidate
                </button>
                <button
                    onClick={() => selectUserType('company')}
                    style={{ padding: '0.5rem 1rem', border: '1px solid', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', borderColor: userType === 'company' ? '#007bff' : '#ccc', backgroundColor: userType === 'company' ? '#e7f3ff' : 'transparent', color: userType === 'company' ? '#007bff' : '#333' }}
                >
                    I am a Company Rep
                </button>
            </div>

            {/* General Error Display Area */}
            {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

            {/* --- Conditional Rendering Based on User Type --- */}

            {/* --- Company Rep View --- */}
            {userType === 'company' && (
                <form onSubmit={handleEmailPasswordSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="login-email-company" style={{ display: 'block', marginBottom: '0.5rem' }}>Company Email:</label>
                        <input type="email" id="login-email-company" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} aria-label="Company Email Address" />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="login-password-company" style={{ display: 'block', marginBottom: '0.5rem' }}>Password:</label>
                        <input type="password" id="login-password-company" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} aria-label="Password" />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '0.75rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Log In
                    </button>
                    {/* No alternative methods or signup link for companies */}
                </form>
            )}

            {/* --- Candidate View --- */}
            {userType === 'candidate' && (
                <div>
                    {!showPhoneSignIn ? (
                        // --- Candidate: Email/Password Form ---
                        <form onSubmit={handleEmailPasswordSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label htmlFor="login-email-candidate" style={{ display: 'block', marginBottom: '0.5rem' }}>Candidate Email:</label>
                                <input type="email" id="login-email-candidate" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} aria-label="Candidate Email Address" />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="login-password-candidate" style={{ display: 'block', marginBottom: '0.5rem' }}>Password:</label>
                                <input type="password" id="login-password-candidate" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} aria-label="Password" />
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '0.75rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Log In with Email
                            </button>
                        </form>
                    ) : (
                        // --- Candidate: Phone Auth Form Component ---
                        // It handles its own recaptcha container internally
                        <PhoneAuthForm onSuccess={handleAuthSuccess} onError={handleAuthError} />
                    )}

                    {/* --- OR Separator for Candidate --- */}
                    <div style={{ textAlign: 'center', margin: '1.5rem 0', display: 'flex', alignItems: 'center' }}> <hr style={{ flexGrow: 1, borderTop: '1px solid #ccc' }} /> <span style={{ padding: '0 1rem', color: '#666' }}>OR</span> <hr style={{ flexGrow: 1, borderTop: '1px solid #ccc' }} /> </div>

                    {/* --- Candidate: Google Sign In Button Component --- */}
                    <GoogleSignInButton
                        onSuccess={handleAuthSuccess}
                        onError={handleAuthError}
                        buttonText="Sign in with Google"
                    />

                    {/* --- Candidate: Toggle between Email/Phone --- */}
                     <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <button
                            onClick={() => { setShowPhoneSignIn(!showPhoneSignIn); setError(''); /* Clear error on sub-toggle */ }}
                            style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            {showPhoneSignIn ? 'Sign in with Email instead' : 'Sign in with Phone instead'}
                        </button>
                    </div>

                    {/* --- Candidate: Link to Sign Up --- */}
                     <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        Don't have an account?
                        <Link to="/signup" style={{ marginLeft: '0.5rem', color: '#007bff' }}>Sign Up</Link>
                    </p>
                </div>
            )}
        </div>
    );
}

export default LoginPage;