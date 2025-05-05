import { Timestamp } from 'firebase/firestore';
// Optional: If using detailed address structure (not currently needed here)
// import { Address } from './candidate';

/**
 * Defines the possible statuses for a job vacancy.
 */
export enum VacancyStatus {
  DRAFT = 'Draft',
  OPEN = 'Open',
  PAUSED = 'Paused', // Temporarily hidden from candidates
  CLOSED = 'Closed', // Filled or no longer active
}

/**
 * Represents the requirements specified for a vacancy, used for matching.
 * Structure mirrors relevant fields from CandidateProfile for detailed matching.
 * All fields are optional, allowing companies to specify only what's crucial.
 */
interface VacancyRequirements {
  // --- Employment Requirements (Step 4 Mirror) ---
  minimumYearsExperience?: string; // e.g., '1-2', '5+' (Matches CandidateProfile.yearsExperience format)
  requiredExperienceFields?: string[]; // Array of specific skills/fields required (Matches CandidateProfile.fieldsOfExperience)
  // requiredPastRoles?: string[]; // Optional: e.g., "Must have experience as Security Supervisor"

  // --- Qualification Requirements (Step 5 Mirror) ---
  requiredEducationLevel?: string; // Minimum basic education (Matches CandidateProfile.basicEducationLevel)
  // requiredTertiaryTypes?: string[]; // Optional: e.g., ["Diploma", "Bachelor's Degree"] (Matches TertiaryQualification.type)
  // requiredTertiaryNames?: string[]; // Optional: Specific tertiary qual names? Might be too specific.

  // Driver/PSIRA related
  requiresDriversLicence?: boolean; // Does the job require a driver's licence?
  requiredLicenceCodes?: string[]; // Specific codes needed (e.g., ['EB', 'C1']) (Matches DriversLicenceDetails.code)
  requiresPrdp?: boolean; // Does the job require a PrDP?
  // requiredPrdpCategories?: string[]; // Optional: Specific PrDP categories?

  requiresPsira?: boolean; // Does the job require PSIRA registration?
  minimumPsiraGrade?: string; // Minimum grade accepted (e.g., "C") (Matches CandidateProfile.highestPsiraGrade)
  // requiredSpecialisedPsira?: string[]; // Optional: Specific PSIRA specializations needed? (Matches SpecialisedPsiraQualification.qualificationName)
  // requiredRoleSpecificQuals?: { category: string; qualificationName?: string }[]; // Optional: More complex matching

  // Other Training
  // requiredMedicalLevel?: string; // Optional: e.g., "Advanced First Aid (Level 3)" (Matches MedicalTraining.certificationName)
  // requiresK9Handler?: boolean;
  // requiredComputerSkills?: string[]; // Optional: e.g., ["MS Excel Advanced", "Listener Operator"] (Matches ComputerTraining.specificSkill)

  // --- Firearm Requirements (Step 6 Mirror) ---
  requiresFirearmProficiency?: boolean;
  requiresFirearmCompetency?: boolean;
  requiredCompetencyCategories?: string[]; // e.g., ['Handgun', 'Shotgun'] (Matches CompetencyCertificate.category)
  // requiresAdditionalFirearmTraining?: boolean;

  // --- Other Requirements ---
  requiredLanguages?: string[]; // e.g., ['English', 'Zulu'] (Matches CandidateProfile.personalInfo.homeLanguage / additionalLanguages)
  locationRadiusKm?: number; // Max distance from vacancy location for candidate search (e.g., 10, 25, 50) - From drag bar value
  // ownTransportRequired?: boolean; // Matches CandidateProfile.personalInfo.ownTransport === 'yes'
  // specificGender?: 'male' | 'female'; // Use with caution due to legal implications
}

/**
 * Represents a job vacancy posted by a company on the Identiq platform.
 * This would likely correspond to documents in a 'vacancies' collection in Firestore.
 */
export interface Vacancy {
  id: string; // Unique ID for this vacancy document
  companyId: string; // ID of the CompanyProfile posting the vacancy
  companyName: string; // Denormalized company name for easier display
  title: string; // Job title (e.g., "Security Officer Grade C")
  description: string; // Detailed job description, responsibilities, etc.
  status: VacancyStatus; // Current status of the vacancy (Open, Closed, etc.)

  // Location Details (Supports radius search)
  location: {
    type: 'On-site' | 'Remote' | 'Hybrid';
    address?: string; // Encrypted
    city?: string; // Encrypted
    province?: string; // Encrypted
    country: string; // Encrypted
    postalCode?: string; // Encrypted
    latitude?: number; // Encrypted
    longitude?: number; // Encrypted
    remoteWorkPolicy?: string; // e.g., 'Fully Remote', 'Hybrid (3 days office)'
  };

  requirements: VacancyRequirements; // Object containing specific requirements for matching

  // Optional Job Details
  employmentType?: 'Permanent' | 'Contractual' | 'Part-time' | 'Temporary'; // Type of employment offered
  salaryRange?: { // Optional salary information
    min?: number;
    max?: number;
    currency?: string; // e.g., "ZAR"
    period?: 'Hour' | 'Month' | 'Year'; // Specify salary period
  };

  // Tracking & Metadata
  createdAt: Timestamp; // When the vacancy was created
  updatedAt: Timestamp; // When the vacancy was last updated
  postedById: string; // User ID of the team member who posted/manages this vacancy
  applicantIds?: string[]; // Array of User IDs (Candidates) who applied
  shortlistedIds?: string[]; // Array of User IDs (Candidates) who were shortlisted
  suggestedCandidateIds?: string[]; // Optional: IDs suggested by matching algorithm
  viewCount?: number; // Optional: Track views
  shareableUrl?: string; // Optional: Unique URL for external sharing
  contactPerson?: string; // Encrypted
  contactEmail?: string; // Encrypted
  contactPhone?: string; // Encrypted
}

export interface Application {
  applicationId?: string;
  candidateId: string; // Encrypted
  vacancyId: string; // Encrypted
  companyId: string; // Encrypted - Denormalized for easier querying/rules
  applicationDate: Timestamp;
  status: 'Received' | 'Under Review' | 'Shortlisted' | 'Interviewing' | 'Offer Extended' | 'Hired' | 'Rejected' | 'Withdrawn';
  // Optional fields
  coverLetter?: string; // Encrypted - Free text PII possible
  attachments?: { name: string; url: string }[]; // URLs to potentially sensitive CVs etc. Secure storage needed.
  statusHistory?: { status: string; timestamp: Timestamp; notes?: string }[];
}