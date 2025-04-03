// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    // Removed getAuth and Auth as they are no longer used here
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    User, // Type for the Firebase User object - Still needed
    UserCredential // Type for the result of sign-in/sign-up - Still needed
} from 'firebase/auth'; // Imports updated

// Import the initialized auth service directly
import { auth } from '../config/firebase';

// 1. Define the shape of the context data (Interface remains the same)
interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signup: (email: string, password: string) => Promise<UserCredential>;
    login: (email: string, password: string) => Promise<UserCredential>;
    logout: () => Promise<void>;
}

// 2. Create the context (Remains the same)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create the custom hook (Remains the same)
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// 4. Create the Provider component (Props interface remains the same)
interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Authentication Functions use the imported 'auth' (Remain the same)
    function signup(email: string, password: string): Promise<UserCredential> {
        return createUserWithEmailAndPassword(auth, email, password);
    }
    function login(email: string, password: string): Promise<UserCredential> {
        return signInWithEmailAndPassword(auth, email, password);
    }
    function logout(): Promise<void> {
        return signOut(auth);
    }

    // --- Effect to listen for auth state changes ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    // --- Dependency array changed to empty based on lint warning ---
    }, []); // Dependency array is now empty

    // Assemble the context value (Remains the same)
    const value: AuthContextType = {
        currentUser,
        loading,
        signup,
        login,
        logout,
    };

    // Provide the context value to children (Remains the same)
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}