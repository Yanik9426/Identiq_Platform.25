import { Timestamp } from 'firebase/firestore'; // Ensure Timestamp is imported
import { CandidateProfile } from './candidate'; // Add this import

/**
 * Defines the possible types for assessment questions.
 */
export enum AssessmentQuestionType {
    MULTIPLE_CHOICE = 'MCQ',
    TRUE_FALSE = 'TrueFalse',
    // Add other types later if needed (e.g., SHORT_ANSWER, RATING_SCALE)
  }
  
  /**
   * Represents a single option for a Multiple Choice question.
   */
  export interface QuestionOption {
    id: string; // Unique identifier for this option within the question (e.g., 'A', 'B', 'C')
    text: string; // The text displayed for this option
  }
  
  /**
   * Represents the structure of a single question within an AssessmentDefinition.
   */
  export interface AssessmentQuestion {
    id: string; // Unique identifier for this question within the assessment
    text: string; // The main text of the question
    type: AssessmentQuestionType; // Type of question (MCQ, TrueFalse)
    options?: QuestionOption[]; // Array of options (only for MCQ type)
    correctAnswer: string | boolean; // The correct answer. For MCQ, this could be the option 'id'. For TrueFalse, it's true or false.
    points?: number; // Optional: Points/weight for this question (defaults could be 1)
    // Optional: Explanation to show after answering (if desired)
    explanation?: string;
  }

/**
 * Represents the definition or template for a specific Candidate Self-Assessment (CSA).
 * This would likely be stored in an 'assessments' collection in Firestore, managed by Admins.
 */
export interface AssessmentDefinition {
  id: string; // Unique ID for this assessment definition (e.g., 'csa-customer-service-v1')
  title: string; // Display title of the assessment (e.g., "Customer Service Skills")
  description: string; // Brief description shown to the candidate
  questions: AssessmentQuestion[]; // Array containing all questions for this assessment
  passMarkPercentage?: number; // Optional: The minimum score required to pass (e.g., 70)
  timeLimitMinutes?: number; // Optional: Time limit for the assessment in minutes
  randomizeOrder?: boolean; // Optional: Whether to shuffle question order per attempt
  createdAt: Timestamp; // When this assessment definition was created
  updatedAt: Timestamp; // When this assessment definition was last updated
  isActive?: boolean; // Flag to control if candidates can take this assessment
  version?: number; // Optional: Version number for tracking changes
  createdBy?: string; // Optional: User ID of the admin who created/updated it
}

/**
 * Represents the candidate's answer to a single question within an assessment attempt.
 */
export interface CandidateAnswer {
  questionId: string; // Reference to the AssessmentQuestion.id
  answerGiven: string | boolean | null; // The answer selected/provided by the candidate (null if unanswered?)
  isCorrect?: boolean; // Was the given answer correct? (Can be calculated server-side or stored)
  // Optional: Points awarded for this specific answer
  pointsAwarded?: number;
}

/**
 * Represents the result of a single candidate completing a specific assessment attempt.
 * This would likely be stored in an 'assessmentResults' collection in Firestore.
 */
export interface CandidateAssessmentResult {
  id: string; // Unique ID for this specific assessment attempt/result document
  userId: string; // ID of the candidate (links to CandidateProfile.userId)
  assessmentDefinitionId: string; // ID of the AssessmentDefinition taken
  assessmentDefinitionVersion?: number; // Optional: Version of the definition taken
  score: number; // The overall score achieved (e.g., percentage 0-100)
  passed?: boolean; // Did the candidate meet the passMarkPercentage?
  status: 'started' | 'in-progress' | 'completed' | 'abandoned'; // Track the state
  startedAt: Timestamp; // Timestamp when the assessment was started
  completedAt?: Timestamp; // Timestamp when the assessment was completed or abandoned
  timeTakenSeconds?: number; // Optional: Duration of the attempt in seconds
  answers: CandidateAnswer[]; // Array storing the candidate's answer to each question
  retakeNumber?: number; // Optional field for retake count (e.g., 1st attempt, 2nd attempt)
}

export interface AssessmentResult {
  resultId?: string;
  assessmentId: string; // Link to the AssessmentTemplate used
  candidateId: string; // Encrypted
  companyId?: string; // Encrypted // Company that requested/assigned the assessment
  proctorId?: string; // Encrypted // User ID of the proctor, if proctored
  status: 'NotStarted' | 'InProgress' | 'Completed' | 'Expired' | 'Cancelled';
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  score?: number; // Overall score or percentage
  sectionScores?: { sectionId: string; score: number }[];
  candidateSnapshot?: Partial<CandidateProfile>; // Encrypted // Key PII at time of assessment (e.g., name, email)
  answers: { // Encrypted (encrypt the individual answer field)
    questionId: string;
    answer: any; // Encrypted - Could be text, choice ID, etc. Potentially sensitive.
    score?: number;
    timeTakenSeconds?: number;
  }[];
  proctorNotes?: string; // Encrypted - Free text, potentially PII
  // Optional: Fields for proctoring events/flags if using advanced proctoring
}