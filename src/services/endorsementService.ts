import { db } from '../config/firebase'; // Import from the correct path
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Endorsement, EndorsementRelationship, EndorsementStatus, EndorsedSkillArea } from '../types/endorsement';
import { logAuditEvent } from './auditService';

// Type for the data needed to create an endorsement.
type CreateEndorsementData = Omit<Endorsement, 'endorsementId' | 'endorsementDate' | 'endorserId'>; // <-- Adjusted Omit if endorserId was part of Endorsement

// Define NewEndorsement based on the actual Endorsement interface, omitting only the ID.
// Note: We might need to add endorserId back here if the DB schema requires it.
type NewEndorsement = Omit<Endorsement, 'endorsementId'>;

// Update the function signature to accept endorserId and use CreateEndorsementData
async function createEndorsement(
    endorserId: string, // <-- Add endorserId as the first parameter
    endorsementData: CreateEndorsementData
): Promise<string | null> {
  // Validation checks for Endorsement creation

  // --- Changed 'endorseeId' to 'candidateId' ---
  if (!endorsementData.candidateId || endorsementData.candidateId.trim() === '') {
    console.error('Validation Error: Candidate ID (endorsee) is required.');
    return null;
  }
  if (typeof endorsementData.candidateId !== 'string') {
    console.error('Validation Error: Candidate ID (endorsee) must be a string.');
    return null;
  }

  // --- Changed 'endorserId' validation to check 'endorserName' and 'endorserEmail' ---
  if (!endorsementData.endorserName || endorsementData.endorserName.trim() === '') {
    console.error('Validation Error: Endorser Name is required.');
    return null;
  }
  if (!endorsementData.endorserEmail || endorsementData.endorserEmail.trim() === '') {
    console.error('Validation Error: Endorser Email is required.');
    return null;
  }
  // Add email format validation if needed

  if (!endorsementData.relationship || !Object.values(EndorsementRelationship).includes(endorsementData.relationship)) {
    console.error('Validation Error: Relationship is required and must be a valid relationship.');
    return null;
  }

  // --- Make rating validation respect optionality ---
  if (endorsementData.rating !== undefined && (typeof endorsementData.rating !== 'number' || endorsementData.rating < 1 || endorsementData.rating > 5)) {
    console.error('Validation Error: If provided, Rating must be between 1 and 5.');
    return null;
  }

  // --- Changed 'comment' to 'comments' and respect optionality ---
  if (endorsementData.comments !== undefined && typeof endorsementData.comments !== 'string') {
      console.error('Validation Error: If provided, Comments must be a string.');
      return null;
  }
  if (endorsementData.comments && endorsementData.comments.length > 500) { // Check length only if comments exist
    console.error('Validation Error: Comments must be 500 characters or less.');
    return null;
  }

  // --- Added validation for 'status' ---
  if (!endorsementData.status || !Object.values(EndorsementStatus).includes(endorsementData.status)) {
    console.error('Validation Error: Status is required and must be a valid status.');
    return null;
  }

  // --- Added validation for 'consentProvided' ---
  if (typeof endorsementData.consentProvided !== 'boolean' || !endorsementData.consentProvided) {
      console.error('Validation Error: Endorser consent must be provided.');
      return null;
  }

  // Validate skillRatings (if present) - This part seems okay but double-check logic if issues persist
  if (endorsementData.skillRatings !== undefined) {
    if (!Array.isArray(endorsementData.skillRatings)) {
      console.error('Validation Error: Skill ratings must be an array.');
      return null;
    } else {
      // Allow empty array for skillRatings? Or require if the key exists? Assuming required if key exists.
      if (endorsementData.skillRatings.length === 0) {
        console.error('Validation Error: Skill ratings array cannot be empty if provided.');
        return null;
      }
      for (const skillRating of endorsementData.skillRatings) {
        if (!skillRating.skillArea || !Object.values(EndorsedSkillArea).includes(skillRating.skillArea)) {
          console.error('Validation Error: Skill area is required and must be a valid skill area.');
          return null;
        }
        if (typeof skillRating.rating !== 'number' || skillRating.rating < 1 || skillRating.rating > 5) {
          console.error('Validation Error: Skill rating must be between 1 and 5.');
          return null;
        }
      }
    }
  }

  // Construct the object to save
  // Decide if endorserId needs to be stored on the document itself
  const newEndorsement: NewEndorsement = {
    ...endorsementData,
    // endorserId: endorserId, // <-- Optional: Add if you want to store the ID on the document too
    endorsementDate: Timestamp.now(),
  };

  try {
    // Firestore generates the ID, which matches our omitted 'endorsementId'
    const docRef = await addDoc(collection(db, 'endorsements'), newEndorsement);
    await logAuditEvent(
        endorserId, // <-- Use the endorserId parameter here
        'endorsement_submitted',
        { type: 'endorsement', id: docRef.id }, // Target is the new endorsement itself
        {
            endorseeId: endorsementData.candidateId, // User being endorsed
            relationship: endorsementData.relationship,
            rating: endorsementData.rating,
            // skillRatings: endorsementData.skillRatings, // Be mindful of data size/sensitivity
            // comment: endorsementData.comments, // Be mindful of PII/sensitivity
            // averageRating: calculatedAverageRating // If available
        }
    );
    return docRef.id;
  } catch (error) {
    console.error('Error creating endorsement:', error);
    return null;
  }
}

// Make sure to export the function
export { createEndorsement };