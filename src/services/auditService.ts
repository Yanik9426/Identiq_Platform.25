import { db } from '../config/firebase'; // Import from the correct path
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { AuditLogEntry } from '../types/audit';

/**
 * Logs an event to the auditLogs collection in Firestore.
 *
 * @param userId The ID of the user who performed the action (or 'system' for automated actions).
 * @param action A descriptive string of the action performed (e.g., 'user_created', 'profile_updated').
 * @param targetInfo Information about the data affected by the action.
 * @param details Optional: Additional details about the event.
 * @returns A Promise that resolves to the ID of the created audit log entry.
 */
async function logAuditEvent(
  userId: string,
  action: string,
  targetInfo: { type: string; id: string },
  details?: object
): Promise<string> {
  // === Validation checks for AuditLogEntry ===

  // 1. Non-Empty String Checks
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    console.error('AuditLog: Invalid userId:', userId);
    throw new Error('User ID is required and must be a non-empty string.');
  }
  if (!action || typeof action !== 'string' || action.trim() === '') {
    console.error('AuditLog: Invalid action:', action);
    throw new Error('Action is required and must be a non-empty string.');
  }
  if (!targetInfo || typeof targetInfo !== 'object' || targetInfo === null) {
    console.error('AuditLog: Invalid targetInfo:', targetInfo);
    throw new Error('Target info is required and must be a valid object.');
  }
  if (!targetInfo.type || typeof targetInfo.type !== 'string' || targetInfo.type.trim() === '') {
    console.error('AuditLog: Invalid targetType:', targetInfo.type);
    throw new Error('Target type is required and must be a non-empty string.');
  }
  if (!targetInfo.id || typeof targetInfo.id !== 'string' || targetInfo.id.trim() === '') {
    console.error('AuditLog: Invalid targetId:', targetInfo.id);
    throw new Error('Target ID is required and must be a non-empty string.');
  }

  // 2. (Optional) String Length Limit Check - Uncomment and adjust length if needed
  /*
  const MAX_ACTION_LENGTH = 250;
  if (action.length > MAX_ACTION_LENGTH) {
    console.error(`AuditLog: Action exceeds max length (${MAX_ACTION_LENGTH}):`, action);
    throw new Error(`Action cannot exceed ${MAX_ACTION_LENGTH} characters.`);
  }
  */

  // 3. Validate 'details' object (if provided)
  if (details !== undefined && (typeof details !== 'object' || details === null || Array.isArray(details))) {
    console.error('AuditLog: Invalid details:', details);
    throw new Error('Details must be a valid object, if provided.');
  }

  // === End Validation ===

  const newLogEntry: AuditLogEntry = {
    timestamp: Timestamp.now(), // Use Firestore server timestamp
    userId: userId.trim(), // Store trimmed versions
    action: action.trim(),
    targetType: targetInfo.type.trim(),
    targetId: targetInfo.id.trim(),
    // Only include details if it was provided and passed validation
    ...(details !== undefined ? { details } : {}), // More concise conditional inclusion
  };

  try {
    const docRef = await addDoc(collection(db, 'auditLogs'), newLogEntry);
    console.log(`Audit event logged with ID: ${docRef.id}`); // Added log for confirmation
    return docRef.id;
  } catch (error) {
    console.error('Error creating AuditLogEntry:', error);
    // Re-throw the error or a more specific error after logging
    throw new Error('Failed to create audit log entry.');
  }
}

export { logAuditEvent };