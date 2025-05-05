import { Timestamp } from 'firebase/firestore';

/**
 * Basic document status tracking for all uploaded documents
 */
interface DocumentStatus {
  documentType:
    // Core documents
    | 'ProfilePicture'
    | 'ID'
    | 'BankingProof'
    | 'SARS'
    // Education & qualification documents
    | 'BasicEdCert'
    | 'TertiaryCert'
    | 'LicenceFront'
    | 'LicenceBack'
    | 'DriverTrainingCert'
    | 'PSIRACert'
    | 'SpecialisedPSIRACert'
    | 'RoleSpecificCert'
    | 'MedicalCert'
    | 'K9Cert'
    | 'ComputerCert'
    | 'StrikesRiotCert'
    | 'SecurityTechCert'
    | 'OtherQualCert'
    // Firearm related documents
    | 'ProficiencyCert'
    | 'CompetencyCert'
    | 'AdditionalFirearmCert'
    // | 'FirearmLicense' // Placeholder, not explicitly collected yet
    // | 'FirearmCompetency' // Covered by CompetencyCert now
    | 'Other';
  storagePath: string; // Path in Firebase Storage
  fileName: string; // Store original filename
  uploadedAt: Timestamp;
  verificationStatus: 'Pending' | 'Verified' | 'Rejected' | 'Expired';
  expiryDate?: Timestamp;
}

/**
 * Address details structure
 */
export interface Address {
  addressLine1: string; // Encrypted
  addressLine2?: string; // Encrypted
  suburb: string; // Encrypted
  city: string; // Encrypted
  province: string; // Encrypted
  postalCode: string; // Encrypted
  // For Mapbox integration
  latitude?: number; // Encrypted
  longitude?: number; // Encrypted
}

/**
 * Job history entry structure
 */
interface JobHistoryEntry {
  companyName: string;
  startDate: string; // From UI <input type="date">
  endDate: string; // From UI <input type="date"> OR 'Present'
  position: string;
  employmentType: 'short-term' | 'long-term' | 'contractual' | '';
  refName: string; // Encrypted
  refNumber: string; // Encrypted
}

/**
 * Basic education details
 */
interface BasicEducationDetails {
  school: string;
  year: string; // From UI input
  fileName?: string; // Optional uploaded certificate filename
}

/**
 * Tertiary qualification details
 */
interface TertiaryQualification {
  type: string; // e.g., "Bachelor's Degree", "Other"
  institution: string;
  qualificationName: string;
  nqfLevel?: string;
  yearCompleted: string;
  unitStandardName?: string;
  unitStandardCode?: string;
  fileName?: string; // Optional certificate filename
}

/**
 * Driver's license details
 */
interface DriversLicenceDetails {
  code: string; // e.g., "EB", "C1"
  issueDate: string;
  expiryDate: string;
  frontFileName?: string; // Filename for front copy
  backFileName?: string; // Filename for back copy
}

/**
 * PRDP details
 */
interface PrdpDetails {
  categories: string[]; // e.g., ["G (Goods)", "P (Passengers)"]
  expiryDate: string;
}

/**
 * Driver training details
 */
interface DriverTraining {
  trainingName: string; // e.g., "Advanced Driving Course", "Other"
  otherTrainingName?: string; // If trainingName is "Other"
  provider: string;
  dateCompleted: string;
  unitStandardTitle?: string;
  unitStandardId?: string;
  fileName?: string; // Optional certificate filename
}

/**
 * PSIRA details
 */
interface PsiraDetails {
  psiraNumber: string; // Encrypted
  trainingProvider: string;
  issueDate: string;
  expiryDate: string;
  fileName?: string; // Certificate/Card copy filename
}

/**
 * Specialised PSIRA qualification
 */
interface SpecialisedPsiraQualification {
  qualificationName: string; // e.g., "National Key Point (NKP) Training", "Other"
  otherQualificationName?: string; // If qualificationName is "Other"
  provider: string;
  dateCompleted: string;
  expiryDate?: string;
  fileName?: string; // Certificate filename
}

/**
 * Role specific qualification
 */
interface RoleSpecificQualification {
  category: string; // e.g., "Close Protection Officer (CPO)"
  qualificationName: string; // Dropdown value or "Other"
  otherQualificationName?: string; // If qualificationName is "Other"
  provider: string;
  dateCompleted: string;
  expiryDate?: string;
  certificateNumber?: string;
  fileName?: string; // Certificate filename
}

/**
 * Medical training details
 */
interface MedicalTraining {
  certificationName: string; // e.g., "Basic First Aid (Level 1)", "Other"
  otherCertificationName?: string; // If certificationName is "Other"
  provider: string;
  dateCompleted: string;
  expiryDate?: string;
  hpcsaNumber?: string; // Encrypted
  fileName?: string; // Certificate/Card filename
}

/**
 * K9 training details
 */
interface K9Training {
  certificationName: string; // e.g., "Patrol Dog Handler", "Other"
  otherCertificationName?: string; // If certificationName is "Other"
  detectionType?: string; // If certificationName is "Detection Dog Handler..."
  provider: string;
  dateCompleted: string;
  expiryDate?: string;
  fileName?: string; // Certificate filename
}

/**
 * Computer training details
 */
interface ComputerTraining {
  trainingArea: string; // e.g., "General Office Software"
  specificSkill: string; // e.g., "MS Excel Advanced"
  provider: string;
  dateCompleted: string;
  levelAchieved?: string; // Optional, e.g., "Intermediate"
  fileName?: string; // Optional certificate filename
}

/**
 * Strikes and riot training details
 */
interface StrikesRiotTraining {
  trainingName: string; // e.g., "Public Order Policing/Management", "Other"
  otherName?: string; // If trainingName is "Other"
  provider: string;
  dateCompleted: string;
  expiryDate?: string;
  fileName?: string; // Certificate filename
}

/**
 * Security technician training details
 */
interface SecurityTechnicianTraining {
  technologyArea: string; // e.g., "Alarm Systems", "CCTV Systems"
  specificSystem: string; // e.g., "SAIDSA Level 2", "Hikvision HCSA"
  provider: string;
  dateCompleted: string;
  expiryDate?: string;
  registrationNumber?: string;
  fileName?: string; // Certificate/Proof filename
}

/**
 * Other qualification details
 */
interface OtherQualification {
  name: string; // Skill/License/Certification Name
  authority: string; // Issuing Authority/Organization
  certNumber?: string;
  expiryDate?: string;
  fileName?: string; // Certificate/Proof filename
}

/**
 * Proficiency certificate details
 */
interface ProficiencyCertificate {
  category: string; // Handgun, Shotgun, Self-loading Rifle, Manually Operated Rifle
  institutionName: string;
  sapsAccreditationNo: string;
  assessorName: string;
  assessorNo: string;
  issueDate: string;
  saqaId: string;
  pftcCertificateNo: string;
  fileName?: string; // Uploaded certificate filename
}

/**
 * Competency certificate details
 */
interface CompetencyCertificate {
  category: string; // Handgun, Shotgun, Self-loading Rifle, Manually Operated Rifle
  sapsCompetencyNo: string; // Encrypted
  issueDate: string;
  expiryDate: string;
  fileName?: string; // Uploaded certificate filename
}

/**
 * Additional firearm training details
 */
interface AdditionalFirearmTraining {
  category: string; // Handgun, Shotgun, SLR, MOR - For grouping
  trainingName: string; // e.g., Tactical Handgun Course
  provider: string;
  dateCompleted: string;
  expiryDate?: string;
  fileName?: string; // Uploaded certificate filename
}


/**
 * Represents the detailed profile data for a Candidate user.
 * This is the main interface for the 'candidateProfiles' Firestore collection.
 */
export interface CandidateProfile {
  userId: string; // Encrypted // Link to the User document (matches User['uid'])
  createdAt: Timestamp;
  updatedAt: Timestamp;
  profilePictureUrl?: string; // URL/path after upload
  profileStatus: 'Incomplete' | 'Complete' | 'PendingVerification' | 'Verified' | 'Suspended';
  uploadedDocuments?: DocumentStatus[]; // Array of all uploaded document statuses

  // --- Step 1: Personal Info ---
  personalInfo: {
    firstName: string; // Encrypted
    lastName: string; // Encrypted
    cellphoneNumber: string; // Encrypted
    isWhatsappSameAsCell: boolean;
    whatsappNumber: string; // Encrypted
    email: string; // Encrypted
    idNumber: string; // Encrypted
    dateOfBirth: string; // Encrypted
    homeLanguage: string; // Encrypted - Can indicate ethnicity
    additionalLanguages?: string; // Encrypted - Can indicate ethnicity
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | ''; // Encrypted
    visibleTattoos: 'yes' | 'no' | '';
    ownTransport: 'yes' | 'no' | '';
    disabilityStatus: 'prefer_not_to_say' | 'yes' | 'no'; // Encrypted - Health information
    personalBio?: string; // Encrypted - Free text, may contain PII
    // Fields from Specs NOT in Step 1 UI (Keep as optional for now):
    nationality?: string; // Encrypted
    psiraNumber?: string; // Now covered in Step 5 PsiraDetails
    psiraExpiryDate?: Timestamp; // Now covered in Step 5 PsiraDetails
    driversLicenseCode?: string; // Now covered in Step 5 DriversLicenceDetails
  };

  // --- Step 2: Residential ---
  residentialAddress?: Address; // Encrypted (Fields within Address are marked)

  // --- Step 3: Banking ---
  // Removed bankingDetails field as confirmed

  // --- Step 4: Employment ---
  hasExperience: 'yes' | 'no' | '';
  employmentWarningAccepted?: boolean;

  // Conditional fields based on hasExperience = 'yes'
  yearsExperience?: string; // e.g., '1-2', '5+'
  fieldsOfExperience?: string[];
  employmentHistory?: JobHistoryEntry[]; // Encrypted (Fields within JobHistoryEntry are marked)
  interestedFields?: string[];
  workTypePreference?: string[];

  // --- Step 5: Qualifications ---
  qualificationsDisclaimerAccepted?: boolean;

  // Basic Education
  basicEducationLevel?: string; // e.g., "Grade 12 / Matric"
  basicEducationDetails?: BasicEducationDetails;

  // Tertiary Education
  hasTertiaryEducation?: 'yes' | 'no' | '';
  tertiaryEducation?: TertiaryQualification[];

  // Driver's Licence & Related
  hasDriversLicence?: 'yes' | 'no' | '';
  driversLicenceDetails?: DriversLicenceDetails;
  hasPrdp?: 'yes' | 'no' | '';
  prdpDetails?: PrdpDetails;
  hasDriverTraining?: 'yes' | 'no' | '';
  driverTrainingList?: DriverTraining[];

  // PSIRA
  highestPsiraGrade?: string; // e.g., "A", "B"
  psiraDetails?: PsiraDetails;
  hasSpecialisedPsira?: 'yes' | 'no' | '';
  specialisedPsiraList?: SpecialisedPsiraQualification[];

  // Role-Specific Industry Qualifications
  roleSpecificQualificationsList?: RoleSpecificQualification[];

  // Medical Training
  medicalTrainingList?: MedicalTraining[]; // Encrypted (Fields within MedicalTraining are marked)

  // K9 Training
  k9TrainingList?: K9Training[];

  // Computer Efficiency Training
  computerTrainingList?: ComputerTraining[];

  // Strikes and Riot Training
  strikesRiotTrainingList?: StrikesRiotTraining[];

  // Security Technician Training
  securityTechnicianTrainingList?: SecurityTechnicianTraining[];

  // Other Skills, Licenses & Certifications
  otherQualificationsList?: OtherQualification[];

  // --- Step 6: Firearms ---
  firearmDisclaimerAccepted?: boolean;

  // Proficiency
  hasProficiencyCertificate?: 'yes' | 'no' | '';
  proficiencyCertificateList?: ProficiencyCertificate[];

  // Competency
  hasCompetencyCertificate?: 'yes' | 'no' | '';
  competencyCertificateList?: CompetencyCertificate[];

  // Regulation 21
  regulation21Status?: string; // e.g., 'within_6_months', 'never'

  // Additional Training
  hasAdditionalTraining?: 'yes' | 'no' | '';
  additionalFirearmTrainingList?: AdditionalFirearmTraining[];

  // --- Step 7: Assessments ---
  csaAverageScore?: number;
  lastAssessmentDate?: Timestamp;

  // --- Other Platform Features (From original interface based on specs) ---
  endorsementCode?: string; // Encrypted // Needs to be generated/assigned
  endorsementsPublic?: boolean; // Default likely false

  // --- Consent flags (align with POPIA/GDPR) ---
  consent?: { // Made optional in case it's handled separately initially
    backgroundCheckConsent?: boolean;
    dataProcessingConsent?: boolean;
    marketingConsent?: boolean;
  };

  // --- Metadata (From original interface) ---
  profileCompleteness?: number; // Percentage (0-100)
  searchable?: boolean; // Flag if profile should appear in company searches
  lastProfileUpdate?: Timestamp; // Can use updatedAt, but maybe specific user update?
}