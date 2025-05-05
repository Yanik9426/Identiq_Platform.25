import { db } from '../config/firebase'; // Import from the correct path
import { AssessmentDefinition, CandidateAssessmentResult, AssessmentQuestionType, QuestionOption, CandidateAnswer } from '../types/assessment';
import { collection, doc, setDoc, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { logAuditEvent } from './auditService';

// Helper function for checking optional non-negative numbers
function isValidOptionalNonNegative(value: any): boolean {
  return value === undefined || (typeof value === 'number' && value >= 0);
}

// Helper function for checking optional positive numbers
function isValidOptionalPositive(value: any): boolean {
  return value === undefined || (typeof value === 'number' && value > 0);
}

async function createAssessmentDefinition(
  adminUserId: string,
  assessmentData: AssessmentDefinition
): Promise<string> {
  // === Validation checks for AssessmentDefinition ===
  if (!assessmentData.id || typeof assessmentData.id !== 'string' || assessmentData.id.trim() === '') {
    throw new Error('Assessment ID is required and must be a non-empty string.');
  }
  if (!assessmentData.title || typeof assessmentData.title !== 'string' || assessmentData.title.trim() === '') {
    throw new Error('Assessment title is required and must be a non-empty string.');
  }
  if (!assessmentData.description || typeof assessmentData.description !== 'string' || assessmentData.description.trim() === '') {
    throw new Error('Assessment description is required and must be a non-empty string.');
  }
  if (!assessmentData.questions || !Array.isArray(assessmentData.questions) || assessmentData.questions.length === 0) {
    throw new Error('Assessment must have at least one question.');
  }
  // 1. Timestamp Validation
  if (!assessmentData.createdAt || !(assessmentData.createdAt instanceof Timestamp)) {
    throw new Error('Created At is required and must be a valid Firestore Timestamp.');
  }
  if (!assessmentData.updatedAt || !(assessmentData.updatedAt instanceof Timestamp)) {
    throw new Error('Updated At is required and must be a valid Firestore Timestamp.');
  }

  // 2. Optional Numeric Fields Validation
  if (!isValidOptionalNonNegative(assessmentData.passMarkPercentage) || (assessmentData.passMarkPercentage !== undefined && assessmentData.passMarkPercentage > 100)) {
    throw new Error('Pass Mark Percentage must be a number between 0 and 100, if provided.');
  }
  if (!isValidOptionalPositive(assessmentData.timeLimitMinutes)) {
    throw new Error('Time Limit Minutes must be a positive number, if provided.');
  }
  if (!isValidOptionalPositive(assessmentData.version)) {
     throw new Error('Version must be a positive number, if provided.');
  }
  if (assessmentData.isActive !== undefined && typeof assessmentData.isActive !== 'boolean') {
    throw new Error('IsActive must be a boolean, if provided.');
  }
   if (assessmentData.randomizeOrder !== undefined && typeof assessmentData.randomizeOrder !== 'boolean') {
    throw new Error('Randomize Order must be a boolean, if provided.');
  }

  // Validate each question
  const questionIds = new Set<string>();
  for (const question of assessmentData.questions) {
    if (!question.id || typeof question.id !== 'string' || question.id.trim() === '') {
      throw new Error('Each question must have a non-empty string ID.');
    }
    if (questionIds.has(question.id)) {
        throw new Error(`Duplicate question ID found: ${question.id}. IDs must be unique within an assessment.`);
    }
    questionIds.add(question.id);

    if (!question.text || typeof question.text !== 'string' || question.text.trim() === '') {
      throw new Error(`Question with ID ${question.id} must have non-empty text.`);
    }
    if (!question.type || !Object.values(AssessmentQuestionType).includes(question.type)) {
      throw new Error(`Question with ID ${question.id} has an invalid or missing question type.`);
    }
    // 2. Optional Numeric (Points)
    if (!isValidOptionalPositive(question.points)) {
        throw new Error(`Points for question ID ${question.id} must be a positive number, if provided.`);
    }

    // 6. Correct Answer Type Consistency & Value
    if (question.correctAnswer === undefined || question.correctAnswer === null) {
      throw new Error(`Question with ID ${question.id} must have a correct answer.`);
    }

    if (question.type === AssessmentQuestionType.MULTIPLE_CHOICE) {
      if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
        throw new Error(`Multiple choice question with ID ${question.id} must have at least two options.`);
      }
      const optionIds = new Set<string>();
      let correctAnswerFound = false;
      for (const option of question.options) {
        // 5. MCQ Option Validation
        if (!option.id || typeof option.id !== 'string' || option.id.trim() === '') {
          throw new Error(`Option in question ID ${question.id} must have a non-empty string ID.`);
        }
        if (optionIds.has(option.id)) {
            throw new Error(`Duplicate option ID '${option.id}' found in question ID ${question.id}. Option IDs must be unique within a question.`);
        }
        optionIds.add(option.id);
        if (!option.text || typeof option.text !== 'string' || option.text.trim() === '') {
          throw new Error(`Option with ID '${option.id}' in question ID ${question.id} must have non-empty text.`);
        }
        if (option.id === question.correctAnswer) {
          correctAnswerFound = true;
        }
      }
      // 6. Check Correct Answer matches an option ID
      if (typeof question.correctAnswer !== 'string') {
         throw new Error(`Correct answer for MCQ question ID ${question.id} must be a string (the option ID).`);
      }
      if (!correctAnswerFound) {
        throw new Error(`Correct answer '${question.correctAnswer}' for MCQ question ID ${question.id} does not match any of the provided option IDs.`);
      }
    } else if (question.type === AssessmentQuestionType.TRUE_FALSE) {
      // 6. Check Correct Answer is boolean
      if (typeof question.correctAnswer !== 'boolean') {
        throw new Error(`Correct answer for True/False question ID ${question.id} must be a boolean (true or false).`);
      }
    }
  }
  // === End Validation ===

  try {
    // Use setDoc with the provided ID instead of addDoc
    await setDoc(doc(db, 'assessmentDefinitions', assessmentData.id), assessmentData);
    console.log(`AssessmentDefinition created/updated with ID: ${assessmentData.id}`);
    await logAuditEvent(
      adminUserId,
      'assessment_created',
      { type: 'assessmentDefinition', id: assessmentData.id },
      { /* details */ }
    );
    return assessmentData.id;
  } catch (error) {
    console.error('Error creating/updating AssessmentDefinition:', error);
    throw new Error('Failed to create/update AssessmentDefinition.');
  }
}

async function updateAssessmentDefinition(
  adminUserId: string,
  assessmentId: string,
  updates: Partial<AssessmentDefinition>
): Promise<void> {
   // === Validation checks for updates (partial data) ===
   // Validate top-level optional fields if present
   if (updates.title !== undefined && (typeof updates.title !== 'string' || updates.title.trim() === '')) {
       throw new Error('Assessment title must be a non-empty string.');
   }
   if (updates.description !== undefined && (typeof updates.description !== 'string' || updates.description.trim() === '')) {
       throw new Error('Assessment description must be a non-empty string.');
   }
   // 1. Timestamp Validation
   if (updates.updatedAt !== undefined && !(updates.updatedAt instanceof Timestamp)) {
       throw new Error('Updated At must be a valid Firestore Timestamp.');
   }
   // 2. Optional Numeric Fields Validation
   if (updates.passMarkPercentage !== undefined && (!isValidOptionalNonNegative(updates.passMarkPercentage) || updates.passMarkPercentage > 100)) {
       throw new Error('Pass Mark Percentage must be a number between 0 and 100, if provided.');
   }
   if (updates.timeLimitMinutes !== undefined && !isValidOptionalPositive(updates.timeLimitMinutes)) {
       throw new Error('Time Limit Minutes must be a positive number, if provided.');
   }
   if (updates.version !== undefined && !isValidOptionalPositive(updates.version)) {
       throw new Error('Version must be a positive number, if provided.');
   }
   if (updates.isActive !== undefined && typeof updates.isActive !== 'boolean') {
       throw new Error('IsActive must be a boolean, if provided.');
   }
   if (updates.randomizeOrder !== undefined && typeof updates.randomizeOrder !== 'boolean') {
       throw new Error('Randomize Order must be a boolean, if provided.');
   }


   // Validate questions array if it's being updated
   if (updates.questions !== undefined) {
       if (!Array.isArray(updates.questions) || updates.questions.length === 0) {
       throw new Error('Assessment must have at least one question.');
       }
       const questionIds = new Set<string>();
       for (const question of updates.questions) {
           // Re-validate each question structure fully if the array is updated
           if (!question.id || typeof question.id !== 'string' || question.id.trim() === '') {
                throw new Error('Each question must have a non-empty string ID.');
           }
           if (questionIds.has(question.id)) {
               throw new Error(`Duplicate question ID found: ${question.id}. IDs must be unique within an assessment.`);
           }
           questionIds.add(question.id);

           if (!question.text || typeof question.text !== 'string' || question.text.trim() === '') {
                throw new Error(`Question with ID ${question.id} must have non-empty text.`);
           }
           if (!question.type || !Object.values(AssessmentQuestionType).includes(question.type)) {
                throw new Error(`Question with ID ${question.id} has an invalid or missing question type.`);
           }
           if (!isValidOptionalPositive(question.points)) {
                throw new Error(`Points for question ID ${question.id} must be a positive number, if provided.`);
           }
            if (question.correctAnswer === undefined || question.correctAnswer === null) {
                throw new Error(`Question with ID ${question.id} must have a correct answer.`);
           }

           if (question.type === AssessmentQuestionType.MULTIPLE_CHOICE) {
                if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
                    throw new Error(`Multiple choice question with ID ${question.id} must have at least two options.`);
                }
                const optionIds = new Set<string>();
                let correctAnswerFound = false;
                for (const option of question.options) {
                    if (!option.id || typeof option.id !== 'string' || option.id.trim() === '') {
                        throw new Error(`Option in question ID ${question.id} must have a non-empty string ID.`);
                    }
                    if (optionIds.has(option.id)) {
                        throw new Error(`Duplicate option ID '${option.id}' found in question ID ${question.id}.`);
                    }
                    optionIds.add(option.id);
                    if (!option.text || typeof option.text !== 'string' || option.text.trim() === '') {
                        throw new Error(`Option with ID '${option.id}' in question ID ${question.id} must have non-empty text.`);
                    }
                    if (option.id === question.correctAnswer) {
                        correctAnswerFound = true;
                    }
                }
                if (typeof question.correctAnswer !== 'string') {
                    throw new Error(`Correct answer for MCQ question ID ${question.id} must be a string (the option ID).`);
                }
                if (!correctAnswerFound) {
                    throw new Error(`Correct answer '${question.correctAnswer}' for MCQ question ID ${question.id} does not match any option IDs.`);
                }
            } else if (question.type === AssessmentQuestionType.TRUE_FALSE) {
                if (typeof question.correctAnswer !== 'boolean') {
                    throw new Error(`Correct answer for True/False question ID ${question.id} must be a boolean.`);
                }
            }
       }
   }
   // === End Validation ===

  try {
     // Ensure updatedAt is always updated
     const finalUpdates = { ...updates, updatedAt: Timestamp.now() };
    await updateDoc(doc(db, 'assessmentDefinitions', assessmentId), finalUpdates);
    console.log(`AssessmentDefinition updated for ID: ${assessmentId}`);
    await logAuditEvent(
      adminUserId,
      'assessment_updated',
      { type: 'assessmentDefinition', id: assessmentId },
      { updatedFields: Object.keys(updates) }
    );
  } catch (error) {
    console.error('Error updating AssessmentDefinition:', error);
    throw new Error('Failed to update AssessmentDefinition.');
  }
}

async function createCandidateAssessmentResult(
  resultData: CandidateAssessmentResult
): Promise<string> {
  // === Validation checks for CandidateAssessmentResult ===
  if (!resultData.id || typeof resultData.id !== 'string' || resultData.id.trim() === '') {
    throw new Error('Result ID is required and must be a non-empty string.');
  }
  if (!resultData.userId || typeof resultData.userId !== 'string' || resultData.userId.trim() === '') {
    throw new Error('User ID is required and must be a non-empty string.');
  }
  if (!resultData.assessmentDefinitionId || typeof resultData.assessmentDefinitionId !== 'string' || resultData.assessmentDefinitionId.trim() === '') {
    throw new Error('Assessment Definition ID is required and must be a non-empty string.');
  }

  // 3. Score Range Validation (Assuming 0-100)
  if (typeof resultData.score !== 'number' || resultData.score < 0 || resultData.score > 100) {
    throw new Error('Score must be a number between 0 and 100.');
  }
  if (resultData.passed !== undefined && typeof resultData.passed !== 'boolean') {
      throw new Error('Passed must be a boolean, if provided.');
  }

  // 4. Status Validation
  const validStatuses = ['started', 'in-progress', 'completed', 'abandoned'];
  if (!resultData.status || !validStatuses.includes(resultData.status)) {
    throw new Error(`Status is required and must be one of: ${validStatuses.join(', ')}.`);
  }

  // 1. Timestamp Validation
  if (!resultData.startedAt || !(resultData.startedAt instanceof Timestamp)) {
    throw new Error('Started At is required and must be a valid Firestore Timestamp.');
  }
  if (resultData.completedAt !== undefined && !(resultData.completedAt instanceof Timestamp)) {
    throw new Error('Completed At must be a valid Firestore Timestamp, if provided.');
  }

  // 2. Optional Numeric Fields Validation
  if (resultData.assessmentDefinitionVersion !== undefined && !isValidOptionalPositive(resultData.assessmentDefinitionVersion)) {
      throw new Error('Assessment Definition Version must be a positive number, if provided.');
  }
  if (resultData.timeTakenSeconds !== undefined && !isValidOptionalNonNegative(resultData.timeTakenSeconds)) {
      throw new Error('Time Taken Seconds must be a non-negative number, if provided.');
  }

  // Add validation for retakeNumber if needed (e.g., must be positive integer if present)
  if (resultData.retakeNumber !== undefined && (!Number.isInteger(resultData.retakeNumber) || resultData.retakeNumber <= 0)) {
      throw new Error('Retake Number must be a positive integer, if provided.');
  }

  if (!resultData.answers || !Array.isArray(resultData.answers)) { // Allow empty answers array if needed
    throw new Error('Answers must be a valid array.');
  }

  // Validate each answer
  const answerQuestionIds = new Set<string>();
  for (const answer of resultData.answers) {
    if (!answer.questionId || typeof answer.questionId !== 'string' || answer.questionId.trim() === '') {
      throw new Error('Each answer must have a non-empty question ID.');
    }
     if (answerQuestionIds.has(answer.questionId)) {
        throw new Error(`Duplicate answer found for question ID: ${answer.questionId}. Only one answer per question allowed.`);
    }
    answerQuestionIds.add(answer.questionId);

    // Allow null for unanswered, but not undefined. Check type otherwise.
    if (answer.answerGiven === undefined) {
      throw new Error(`Answer Given for question ${answer.questionId} cannot be undefined.`);
    }
     if (answer.answerGiven !== null && typeof answer.answerGiven !== 'string' && typeof answer.answerGiven !== 'boolean') {
         throw new Error(`Answer Given for question ${answer.questionId} must be a string, boolean, or null.`);
    }
    if (answer.isCorrect !== undefined && typeof answer.isCorrect !== 'boolean') {
        throw new Error(`Is Correct for answer ${answer.questionId} must be a boolean, if provided.`);
    }
    // 2. Optional Numeric (Points Awarded)
    if (!isValidOptionalNonNegative(answer.pointsAwarded)) {
        throw new Error(`Points Awarded for answer ${answer.questionId} must be a non-negative number, if provided.`);
    }
  }
  // === End Validation ===

  try {
    // Use setDoc with the provided ID
    await setDoc(doc(db, 'candidateAssessmentResults', resultData.id), resultData);
    console.log(`CandidateAssessmentResult created/updated with ID: ${resultData.id}`);
    await logAuditEvent(
        resultData.userId,
        'assessment_submitted',
        { type: 'assessment', id: resultData.id },
        { // Log details: score, status, and retakeNumber if available
            score: resultData.score,
            status: resultData.status,
            // Conditionally add retakeNumber to the log details if it exists
            ...(resultData.retakeNumber !== undefined && { retakeNumber: resultData.retakeNumber })
         }
    );
    return resultData.id;
  } catch (error) {
    console.error('Error creating/updating CandidateAssessmentResult:', error);
    throw new Error('Failed to create/update CandidateAssessmentResult.');
  }
}

async function updateCandidateAssessmentResult(
  actorUserId: string,
  resultId: string,
  updates: Partial<CandidateAssessmentResult>
): Promise<void> {
  // === Validation checks for updates (partial data) ===
  if (updates.score !== undefined && (typeof updates.score !== 'number' || updates.score < 0 || updates.score > 100)) {
      throw new Error('Score must be a number between 0 and 100.');
  }
  if (updates.passed !== undefined && typeof updates.passed !== 'boolean') {
      throw new Error('Passed must be a boolean, if provided.');
  }
  const validStatuses = ['started', 'in-progress', 'completed', 'abandoned'];
  if (updates.status !== undefined && !validStatuses.includes(updates.status)) {
      throw new Error(`Status must be one of: ${validStatuses.join(', ')}.`);
  }
  if (updates.completedAt !== undefined && !(updates.completedAt instanceof Timestamp)) {
      throw new Error('Completed At must be a valid Firestore Timestamp, if provided.');
  }
  if (updates.timeTakenSeconds !== undefined && !isValidOptionalNonNegative(updates.timeTakenSeconds)) {
      throw new Error('Time Taken Seconds must be a non-negative number, if provided.');
  }


  if (updates.answers !== undefined) {
    if (!Array.isArray(updates.answers)) { // Allow empty array
      throw new Error('Answers must be a valid array.');
    }
    const answerQuestionIds = new Set<string>();
    for (const answer of updates.answers) {
      // Re-validate each answer fully if the array is provided in updates
      if (!answer.questionId || typeof answer.questionId !== 'string' || answer.questionId.trim() === '') {
            throw new Error('Each answer must have a non-empty question ID.');
      }
      if (answerQuestionIds.has(answer.questionId)) {
          throw new Error(`Duplicate answer found for question ID: ${answer.questionId}.`);
      }
      answerQuestionIds.add(answer.questionId);

      if (answer.answerGiven === undefined) {
            throw new Error(`Answer Given for question ${answer.questionId} cannot be undefined.`);
      }
       if (answer.answerGiven !== null && typeof answer.answerGiven !== 'string' && typeof answer.answerGiven !== 'boolean') {
           throw new Error(`Answer Given for question ${answer.questionId} must be a string, boolean, or null.`);
      }
      if (answer.isCorrect !== undefined && typeof answer.isCorrect !== 'boolean') {
          throw new Error(`Is Correct for answer ${answer.questionId} must be a boolean, if provided.`);
      }
      if (!isValidOptionalNonNegative(answer.pointsAwarded)) {
          throw new Error(`Points Awarded for answer ${answer.questionId} must be a non-negative number, if provided.`);
      }
    }
  }
  // === End Validation ===

  try {
    await updateDoc(doc(db, 'candidateAssessmentResults', resultId), updates);
     console.log(`CandidateAssessmentResult updated for ID: ${resultId}`);
    await logAuditEvent(
      actorUserId,
      'assessment_updated',
      { type: 'assessment', id: resultId }
    );
  } catch (error) {
    console.error('Error updating CandidateAssessmentResult:', error);
    throw new Error('Failed to update CandidateAssessmentResult.');
  }
}

async function retakeAssessment(
  userId: string,
  assessmentId: string
): Promise<void> {
  await logAuditEvent(userId, 'assessment_retaken', { type: 'assessment', id: assessmentId });
  // Implementation of retakeAssessment function
}

export {
  createAssessmentDefinition,
  updateAssessmentDefinition,
  createCandidateAssessmentResult,
  updateCandidateAssessmentResult,
  retakeAssessment,
};