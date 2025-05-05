import { Timestamp } from 'firebase/firestore';

/**
 * Defines the possible relationships between an endorser and endorsee.
 */
export enum EndorsementRelationship {
  COLLEAGUE = 'Colleague',
  SUPERVISOR = 'Supervisor',
  MANAGER = 'Manager',
  // Add 'Client' or others later if needed
}

/**
 * Defines the possible statuses for an endorsement.
 */
export enum EndorsementStatus {
  PENDING = 'Pending', // Submitted but not yet approved/rejected
  APPROVED = 'Approved', // Approved (e.g., by endorsee or admin) and potentially visible
  REJECTED = 'Rejected', // Rejected and not visible
}

/**
 * Defines the standard skill areas that can be rated in an endorsement.
 * (Modify this list based on discussion)
 */
export enum EndorsedSkillArea {
  PROFESSIONALISM = 'Professionalism',
  COMMUNICATION = 'Communication',
  TEAMWORK = 'Teamwork',
  RELIABILITY = 'Reliability',
  LEADERSHIP = 'Leadership',
  PROBLEM_SOLVING = 'Problem Solving',
}

/**
 * Represents a rating given for a specific skill area within an endorsement.
 */
interface SkillRating {
  skillArea: EndorsedSkillArea; // The area being rated
  rating: number; // The rating given (e.g., 1-5)
}

export interface EndorsementRequest {
  requestId?: string;
  candidateId: string; // Encrypted
  requesterCompanyId: string; // Encrypted
  requesterUserId: string; // User within the company who initiated
  endorserEmail: string; // Encrypted
  requestDate: Timestamp;
  status: 'Pending' | 'Completed' | 'Declined' | 'Expired';
  uniqueToken: string; // Used for the endorsement link (consider if this needs encryption)
  expiryDate: Timestamp;
}

export interface Endorsement {
  endorsementId?: string;
  requestId: string; // Link back to the request
  candidateId: string; // Encrypted
  endorserUserId?: string; // Encrypted // If the endorser is a platform user
  endorserCompanyId?: string; // Encrypted // If the endorser belongs to a company on platform
  endorserName: string; // Encrypted
  endorserEmail: string; // Encrypted // Captured during submission
  endorserPosition?: string; // Encrypted
  endorsementDate: Timestamp;
  relationship: EndorsementRelationship; // Changed from string to use the enum
  rating?: number; // Optional rating (1-5)
  comments?: string; // Encrypted - Free text
  consentProvided: boolean; // Confirmation endorser consented to sharing this info
  skillRatings?: SkillRating[]; // Add skillRatings here if desired, matching the deleted interface
  status: EndorsementStatus;
}