import { Timestamp } from 'firebase/firestore'; // Import Timestamp type

/**
 * Represents an entry in the audit log, recording significant actions performed within the platform.
 * Ref: [cite: 22, 168]
 */
export interface AuditLogEntry {
  logId?: string;             // Optional: Firestore document ID
  timestamp: Timestamp;       // Firestore Timestamp of when the action occurred
  userId: string;             // ID of the user who performed the action (or 'system' for automated actions)
  action: string;             // Description of the action (e.g., 'user_login', 'profile_update', 'coupon_applied', 'vacancy_created')
  targetType: string;         // Type of the entity affected (e.g., 'user', 'candidateProfile', 'coupon', 'invoice', 'vacancy')
  targetId: string;           // ID of the specific entity affected
  details?: object;           // Optional: Additional context or data related to the event (e.g., { changes: {...}, ipAddress: '...' })
}

export interface AuditLog {
  logId?: string;
  timestamp: Timestamp;
  userId: string; // Encrypted // ID of the user performing the action
  action: string; // e.g., 'candidate_profile_update', 'company_login', 'download_profile'
  targetType?: 'candidate' | 'company' | 'user' | 'vacancy' | 'system';
  targetId?: string; // Encrypted // ID of the entity being acted upon (if applicable)
  ipAddress?: string; // Encrypted
  // Use structured details where possible, but allow free text for flexibility
  details: Record<string, any> | string; // Encrypted - Could contain sensitive details depending on the action
  status: 'Success' | 'Failure';
  failureReason?: string; // Potentially sensitive if it reveals PII in error message
}