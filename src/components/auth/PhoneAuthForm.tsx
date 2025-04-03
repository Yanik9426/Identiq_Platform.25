// src/components/auth/PhoneAuthForm.tsx

import React, { useState, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, User } from "firebase/auth";
import { auth } from '../../config/firebase'; // Adjust path if needed
import { ensureUserDocumentExists } from '../../utils/firestoreUtils'; // Adjust path if needed

// Augment window type for reCAPTCHA
declare global {
    interface Window {
        recaptchaVerifier?: RecaptchaVerifier;
    }
}

// Define Props interface
interface PhoneAuthFormProps {
    onSuccess?: (user: User) => void; // Optional: Callback on successful verification
    onError?: (error: any) => void; // Optional: Callback on error (sending or verifying)
}

const PhoneAuthForm: React.FC<PhoneAuthFormProps> = ({ onSuccess, onError }) => {
    // --- State for Phone Auth Flow ---
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [showOtpInput, setShowOtpInput] = useState(false); // Controls which form part is visible
    const [error, setError] = useState(''); // Local error state for this component
    const [loading, setLoading] = useState(false); // Loading state for button disables

    // --- Function to setup reCAPTCHA ---
    const setupRecaptcha = () => {
        // Ensure cleanup if verifier exists before creating new one (safer)
        if (window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier.clear(); // Clear previous instance
            } catch(e) { console.warn("Error clearing previous reCAPTCHA", e); }
            delete window.recaptchaVerifier;
        }
        try {
            // Use try-catch for initialization as well
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-phone', { // Use unique ID
                'size': 'invisible',
                'callback': (response: any) => { console.log("reCAPTCHA verified"); },
                'expired-callback': () => { console.log("reCAPTCHA expired"); setError('reCAPTCHA expired, please try sending code again.'); }
            });
            console.log("RecaptchaVerifier initialized for Phone Auth");
            return window.recaptchaVerifier.render(); // Ensure it renders
         } catch (e) {
             console.error("Error initializing reCAPTCHA:", e);
             setError("Failed to initialize reCAPTCHA. Please refresh.");
             return Promise.reject(e); // Propagate error if needed
         }
    };

    // --- Effect to setup reCAPTCHA only when needed ---
    useEffect(() => {
        // Setup reCAPTCHA when the component mounts, as it's always needed for this form
        setupRecaptcha();

        // Cleanup function to clear verifier when component unmounts
        return () => {
          if (window.recaptchaVerifier) {
               try { window.recaptchaVerifier.clear(); } catch(e) { /* ignore */ }
               delete window.recaptchaVerifier;
               console.log("Cleared reCAPTCHA verifier on unmount");
          }
        };
    }, []); // Run only once on mount

    // --- Handle Sending OTP ---
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setLoading(true);
        console.log("PhoneAuthForm: Attempting to send OTP to:", phoneNumber);

        const appVerifier = window.recaptchaVerifier;
        if (!appVerifier) { setError("reCAPTCHA not ready. Please wait or refresh."); setLoading(false); return; }

        const formattedPhoneNumber = phoneNumber.trim();
        if (!formattedPhoneNumber || !/^\+[1-9]\d{1,14}$/.test(formattedPhoneNumber)) { setError("Please enter valid phone number (E.164 format)."); setLoading(false); return; }

        try {
           const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
           console.log("PhoneAuthForm: OTP sent successfully!");
           setConfirmationResult(confirmation);
           setShowOtpInput(true); // Show OTP input field
           setError('');
        } catch (error: any) {
           console.error('PhoneAuthForm: Error sending OTP:', error);
           if (error.code === 'auth/invalid-phone-number') { setError('Invalid phone format.'); }
           else if (error.code === 'auth/too-many-requests') { setError('Too many requests. Try later.'); }
           else { setError('Failed to send OTP.'); }
           // Call onError prop if provided
           if (onError) onError(error);
           // Attempt to reset reCAPTCHA after error
            try {
               await appVerifier.render(); // Re-render might help reset invisible reCAPTCHA state
            } catch (recaptchaRenderError) {
                console.error("PhoneAuthForm: Error trying to re-render reCAPTCHA after failure:", recaptchaRenderError);
                // Consider more robust reset if needed (clear/re-init)
            }
        } finally { setLoading(false); }
    };

    // --- Handle Verifying OTP ---
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setLoading(true);
        console.log("PhoneAuthForm: Attempting to verify OTP:", otp);

        if (!confirmationResult) { setError("Verification session expired or invalid. Please request code again."); setShowOtpInput(false); setLoading(false); return; }
        if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) { setError("Please enter the 6-digit code."); setLoading(false); return; }

        try {
            const result = await confirmationResult.confirm(otp);
            const user = result.user;
            console.log("PhoneAuthForm: Phone number verified successfully! User:", user.uid);

            // Ensure Firestore document exists
            await ensureUserDocumentExists(user);

            // Call onSuccess prop if provided
            if (onSuccess) {
                onSuccess(user);
            }
            // Navigation should be handled by the parent component via onSuccess

        } catch (error: any) {
            console.error('PhoneAuthForm: Error verifying OTP:', error);
            if (['auth/invalid-verification-code', 'auth/code-expired'].includes(error.code)) { setError('Invalid or expired code. Try again or request new.'); }
            else { setError('Failed to verify code.'); }
            // Call onError prop if provided
            if (onError) onError(error);
        } finally { setLoading(false); }
    };

    // --- Render Component ---
    return (
        <div>
             {/* Unique ID for reCAPTCHA container within this component */}
            <div id="recaptcha-container-phone"></div>

            {/* Display local errors */}
             {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

            {!showOtpInput ? (
                 // --- Phone Number Input Form ---
                 <form onSubmit={handleSendCode}>
                     <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="phone-number-comp" style={{ display: 'block', marginBottom: '0.5rem' }}>Phone Number (E.164):</label>
                        <input
                            type="tel"
                            id="phone-number-comp" // Unique ID
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+27821234567"
                            required
                            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                            aria-label="Phone Number"
                        />
                    </div>
                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', backgroundColor: loading ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {loading ? 'Sending Code...' : 'Send Verification Code'}
                    </button>
                 </form>
             ) : (
                 // --- OTP Input Form ---
                 <form onSubmit={handleVerifyCode}>
                     <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="otp-code-comp" style={{ display: 'block', marginBottom: '0.5rem' }}>Verification Code:</label>
                        <input
                            type="number"
                            id="otp-code-comp" // Unique ID
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            maxLength={6}
                            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                            aria-label="Verification Code"
                        />
                         <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>Enter the 6-digit code.</small>
                    </div>
                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', backgroundColor: loading ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {loading ? 'Verifying...' : 'Verify Code'} {/* Adjust button text */}
                    </button>
                 </form>
             )}
        </div>
    );
};

export default PhoneAuthForm;