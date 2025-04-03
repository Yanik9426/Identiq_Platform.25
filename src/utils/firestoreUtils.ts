// src/utils/firestoreUtils.ts

import { User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../config/firebase'; // Adjust path if needed

/**
 * Checks if a user document exists in Firestore for the given user UID.
 * If it doesn't exist, it creates a new document with basic information
 * including a default 'candidate' role.
 *
 * @param user The Firebase Auth User object after successful sign-in/signup.
 */
export const ensureUserDocumentExists = async (user: User): Promise<void> => {
    if (!user) return; // Exit if no user object is provided

    // Create a reference to the potential document location: /users/{userUID}
    const userDocRef = doc(db, "users", user.uid);

    try {
        // Check if the document already exists
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            // Document does not exist, create it
            console.log(`Firestore document for user ${user.uid} doesn't exist, creating...`);
            const userData = {
                uid: user.uid,
                email: user.email || null, // Email might be null (e.g., phone auth)
                displayName: user.displayName || '', // Might be provided by Google/others
                photoURL: user.photoURL || '', // Might be provided by Google/others
                phoneNumber: user.phoneNumber || null, // Might be provided by phone auth
                createdAt: serverTimestamp(),
                // --- Ensure this line exists ---
                roles: ['candidate'] // Default role for new users
                // --- End of check ---
            };
            await setDoc(userDocRef, userData);
            console.log(`Firestore document created for user ${user.uid} with default role.`);
        } else {
            // Document already exists
            console.log(`Firestore document already exists for user ${user.uid}.`);
            // Optional: Check/add roles if missing on existing doc (more complex)
        }
    } catch (error) {
        console.error("Error ensuring user document exists in Firestore:", error);
        // Decide if error should be propagated
        // throw error;
    }
};