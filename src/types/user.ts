import { Timestamp } from 'firebase/firestore';

/**
 * Defines the possible roles a user can have within the Identiq platform.
 * Based on specifications[cite: 5, 144].
 */
export enum UserRole {
  SUPER_ADMIN = 'SuperAdmin', // Full platform access [cite: 5, 144]
  FINANCE_MANAGER = 'FinanceManager', // Billing access [cite: 5, 144]
  SUPPORT_STAFF = 'SupportStaff', // FAQ, endorsement management [cite: 5, 144]
  COMPANY_ADMIN = 'CompanyAdmin', // Admin role within a specific company
  COMPANY_USER = 'CompanyUser',   // Standard user within a specific company
  CANDIDATE = 'Candidate',       // Job seeker role
}

/**
 * Represents the core user data stored in Firestore for any authenticated user.
 * Aligns with schema suggestions [cite: 249] and RBAC requirements[cite: 17, 144, 164].
 */
export interface User {
  uid: string; // Encrypted // Primary identifier from Auth Provider (e.g., Firebase Auth UID)
  email: string; // Encrypted // Primary email used for login
  emailVerified: boolean;
  displayName?: string; // Encrypted
  phoneNumber?: string; // Encrypted
  photoURL?: string; // URL to profile picture (Access control needed)
  providerId: string; // e.g., 'password', 'google.com'
  metadata: {
    creationTime: Timestamp;
    lastSignInTime: Timestamp;
  };
  // Custom claims or roles might be stored here or fetched separately
  // e.g., customClaims?: { role: 'candidate' | 'company_admin' | 'platform_admin' };
  // Links to specific profiles
  candidateProfileId?: string; // Link to CandidateProfile document ID (if applicable)
  companyProfileId?: string;   // Link to CompanyProfile document ID (if applicable)
  currentRole?: 'candidate' | 'company' | 'admin'; // Helps UI switch context
  roles: UserRole[]; // Array to hold one or more roles for RBAC [cite: 17, 144]
  createdAt: Timestamp; // Firestore Timestamp of when the user record was created [cite: 249]
  lastLogin: Timestamp; // Firestore Timestamp of the last login [cite: 249]
  // Add other fields as needed, e.g., phoneNumber, emailVerified, etc.
  disabled?: boolean; // Flag to disable user account
}