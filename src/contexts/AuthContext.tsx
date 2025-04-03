// src/contexts/AuthContext.tsx - Updated for Roles

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    User,
    UserCredential
} from 'firebase/auth'; // Removed unused imports
import { auth, db } from '../config/firebase'; // Import db (Firestore instance) as well - CHECK PATH
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions - CHECK PATH

// 1. Define the shape of the context data - ADD userRoles
interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    userRoles: string[] | null; // Store roles as an array of strings or null
    signup: (email: string, password: string) => Promise<UserCredential>;
    login: (email: string, password: string) => Promise<UserCredential>;
    logout: () => Promise<void>;
}

// 2. Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create the custom hook - Update return type (implicitly updated via AuthContextType)
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// 4. Create the Provider component
interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userRoles, setUserRoles] = useState<string[] | null>(null); // <-- State for roles
    const [loading, setLoading] = useState<boolean>(true); // Initial loading state

    // --- Authentication Functions (remain the same) ---
    function signup(email: string, password: string): Promise<UserCredential> {
        // Note: Role assignment happens during Firestore doc creation in SignupPage/utils
        return createUserWithEmailAndPassword(auth, email, password);
    }
    function login(email: string, password: string): Promise<UserCredential> {
        // Roles will be fetched by the useEffect below after login succeeds
        return signInWithEmailAndPassword(auth, email, password);
    }
    function logout(): Promise<void> {
        setUserRoles(null); // Clear roles state on explicit logout
        return signOut(auth);
    }

    // --- Effect to listen for auth state changes AND fetch Firestore roles ---
    useEffect(() => {
        // onAuthStateChanged listener provides the core Firebase User object
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            // Set the core user object first
            setCurrentUser(user);

            if (user) {
                // If user object exists (logged in), try to fetch their Firestore document
                console.log(`Auth state changed: User ${user.uid} logged in. Fetching Firestore roles...`);
                const userDocRef = doc(db, "users", user.uid); // Reference to /users/{uid}
                try {
                    const userDocSnap = await getDoc(userDocRef); // Fetch the document

                    if (userDocSnap.exists()) {
                        // Document found, extract the 'roles' field
                        // Default to empty array if 'roles' field doesn't exist on the doc
                        const roles = userDocSnap.data()?.roles || [];
                        setUserRoles(roles);
                        console.log(`Roles found for user ${user.uid}:`, roles);
                    } else {
                        // Document not found in Firestore (should be rare if signup logic works)
                        console.warn(`Firestore document not found for user ${user.uid}! Assigning empty roles.`);
                        setUserRoles([]); // Assign empty roles array
                    }
                } catch (error) {
                    console.error("Error fetching user roles from Firestore:", error);
                    setUserRoles(null); // Set roles to null if fetching fails
                }
            } else {
                // User object is null (logged out)
                setUserRoles(null); // Clear roles state
                console.log("Auth state changed: User logged out.");
            }
            // Set loading to false only after user and roles (if applicable) are processed
            setLoading(false);
        });

        // Cleanup the listener when the component unmounts
        return unsubscribe;
    }, []); // Empty dependency array ensures this runs only once on mount

    // --- Assemble the context value - Add userRoles ---
    const value: AuthContextType = {
        currentUser,
        loading,
        userRoles, // <-- Provide roles state
        signup,
        login,
        logout,
    };

    // --- Provide the context value to children ---
    return (
        <AuthContext.Provider value={value}>
            {/* Render children only when initial loading (auth check + role fetch) is complete */}
            {!loading && children}
        </AuthContext.Provider>
    );
}