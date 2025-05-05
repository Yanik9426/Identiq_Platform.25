import { db } from '../config/firebase'; // Existing import
import { doc, getDoc } from 'firebase/firestore';
import { User, UserRole } from '../types/user'; // Import the User interface and UserRole enum
import { logAuditEvent } from './auditService'; // <-- Add this line

/**
 * Fetches a user document from Firestore by their UID.
 * @param uid The user's unique ID.
 * @returns The User data or null if not found.
 */
export const getUserById = async (uid: string): Promise<User | null> => {
  // Validation check for UID
  if (!uid || uid.trim() === '') {
    console.error('Validation Error: UID is required and cannot be empty.');
    return null;
  }

  //   // Optional: UID format check (example - adjust to your format)
  //   const uidRegex = /^[a-zA-Z0-9]+$/; // Example: only alphanumeric
  //   if (!uidRegex.test(uid)) {
  //     console.error('Validation Error: Invalid UID format.');
  //     return null;
  //   }

  // Create a reference to the specific document path: users/{uid}
  const userDocRef = doc(db, 'users', uid);

  try {
    // Attempt to get the document snapshot
    const userDocSnap = await getDoc(userDocRef);

    // Check if the document exists
    if (userDocSnap.exists()) {
      // Get the data and cast it to our User interface
      // We also add the uid to the returned object as it's the document ID
      const userData = { uid: userDocSnap.id, ...userDocSnap.data() } as User;

      // Enhanced Validation on Retrieved Data
      if (!userData.email || userData.email.trim() === '') {
        console.error('Validation Error: Email is missing or empty.');
        return null; // Or throw an error, depending on your error handling
      }
      if (!userData.roles || !Array.isArray(userData.roles) || userData.roles.length === 0) {
        console.error('Validation Error: Roles array is missing, not an array, or empty.');
        return null; // Or throw an error
      }
      //   // Example: Check if all roles are valid UserRole enum values (if needed)
      //   for (const role of userData.roles) {
      //     if (!Object.values(UserRole).includes(role)) {
      //       console.error(`Validation Error: Invalid role: ${role}`);
      //       return null; // Or throw an error
      //     }
      //   }

      return userData;
    } else {
      console.log(`No user found with UID: ${uid}`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    // In a real app, you might want to throw the error or handle it differently
    return null;
  }
};

export async function createUser(userData: any): Promise<string> {
  // ... existing logic to create the user in the database ...
  const newUser = { uid: 'some-generated-id', ...userData }; // Example: Get the new user object

  // Log the user creation event
  await logAuditEvent(
    'system', // Or the admin user ID if an admin created the user
    'user_created',
    { type: 'user', id: newUser.uid },
    { email: userData.email, roles: userData.roles } // Details about the created user
  );

  return newUser.uid;
}

export async function updateUser(userId: string, updates: any): Promise<void> {
  // ... existing logic to update the user in the database ...

  // Log the user update event
  await logAuditEvent(
    userId, // The ID of the user whose profile is being updated (or admin ID if admin did it)
    'user_updated',
    { type: 'user', id: userId },
    { updatedFields: Object.keys(updates) } // Log which fields were changed
  );
}

export async function loginUser(userId: string /* ... other params ... */): Promise<void> {
    // ... existing login logic ...

    // Assuming login was successful:
    await logAuditEvent(
        userId,
        'login_success',
        { type: 'user', id: userId },
        { /* Add relevant details like IP address if available */ }
    );
}

export async function logoutUser(userId: string): Promise<void> {
    // ... existing logout logic ...

    await logAuditEvent(
        userId,
        'user_logout',
        { type: 'user', id: userId }
    );
}

export async function changePassword(userId: string): Promise<void> {
    // ... existing password change logic ...

    await logAuditEvent(
        userId,
        'user_password_changed',
        { type: 'user', id: userId }
        // Be careful NOT to log the password itself
    );
}

export async function disableUserAccount(adminUserId: string, targetUserId: string): Promise<void> {
    // ... logic to disable the user account ...

    await logAuditEvent(
        adminUserId, // ID of the admin performing the action
        'user_account_disabled',
        { type: 'user', id: targetUserId }
    );
}

export async function enableUserAccount(adminUserId: string, targetUserId: string): Promise<void> {
    // ... logic to enable the user account ...

    await logAuditEvent(
        adminUserId, // ID of the admin performing the action
        'user_account_enabled',
        { type: 'user', id: targetUserId }
    );
}


// --- Add similar logging calls for other relevant functions ---
// user_2fa_enabled / user_2fa_disabled
// otp_sent
// otp_verification_success / otp_verification_failure
// login_failure (in the error handling part of loginUser)
// token_refreshed
// candidate_suspended / candidate_unsuspended (if managed here by admin)

// ... rest of userService.ts ...