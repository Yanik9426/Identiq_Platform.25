// src/components/profile-setup/Step5Qualifications.tsx - Step 5: Corrected Render Function Placement

import React, { useState, useEffect, ChangeEvent } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useMemo } from 'react';

// --- Interfaces ---
interface BasicEducationDetails { school: string; year: string; fileName?: string; }
interface TertiaryQualification { id: string; type: string; institution: string; qualificationName: string; nqfLevel?: string; yearCompleted: string; unitStandardName?: string; unitStandardCode?: string; fileName?: string; }
interface DriversLicenceDetails { code: string; issueDate: string; expiryDate: string; frontFileName?: string; backFileName?: string; }
interface PrdpDetails { categories: string[]; expiryDate: string; }
interface DriverTraining { id: string; trainingName: string; otherTrainingName?: string; provider: string; dateCompleted: string; unitStandardTitle?: string; unitStandardId?: string; fileName?: string; }
interface PsiraDetails { psiraNumber: string; trainingProvider: string; issueDate: string; expiryDate: string; fileName?: string; }
interface SpecialisedPsiraQualification { id: string; qualificationName: string; otherQualificationName?: string; provider: string; dateCompleted: string; expiryDate?: string; fileName?: string; }
interface RoleSpecificQualification { id: string; category: string; qualificationName: string; otherQualificationName?: string; provider: string; dateCompleted: string; expiryDate?: string; certificateNumber?: string; fileName?: string; }
// Section 7 Interface
interface MedicalTraining {
  id: string;
  certificationName: string; // Dropdown value or 'Other'
  otherCertificationName?: string; // If 'Other' selected
  provider: string;
  dateCompleted: string;
  expiryDate?: string; // Optional
  hpcsaNumber?: string; // Optional HPCSA number
  fileName?: string; // Required upload filename
}
// Section 8 Interface
interface K9Training {
  id: string;
  certificationName: string; // Dropdown value: Basic Handler, Patrol, Detection etc.
  otherCertificationName?: string; // If 'Other' selected
  detectionType?: string; // If Detection Dog Handler selected
  provider: string;
  dateCompleted: string;
  expiryDate?: string; // Optional
  fileName?: string; // Required upload filename
}
// Section 9 Interface
interface ComputerTraining {
  id: string;
  trainingArea: string; // Dropdown value: General Office, Control Room Software, etc.
  specificSkill: string; // Required text: e.g., MS Excel Advanced, Listener Operator, 60 WPM
  provider: string; // Required text
  dateCompleted: string; // Required date
  levelAchieved?: string; // Optional text: e.g., Intermediate, Certified
  fileName?: string; // Required upload filename (optional '?' for initial state handling)
}
// Section 10 Interface
interface StrikesRiotTraining {
  id: string;
  trainingName: string; // Dropdown value: Public Order Policing, etc. or 'Other'
  otherName?: string; // Required if trainingName is 'Other'
  provider: string; // Required text
  dateCompleted: string; // Required date
  expiryDate?: string; // Optional date
  fileName?: string; // Required upload filename
}
// Section 11 Interface
interface SecurityTechnicianTraining {
  id: string;
  technologyArea: string; // Dropdown: Alarm, CCTV, Access Control, etc.
  specificSystem: string; // Required text: e.g., SAIDSA Level 2, Hikvision HCSA
  provider: string; // Required text: Provider/Issuing Body
  dateCompleted: string; // Required date
  expiryDate?: string; // Optional date
  registrationNumber?: string; // Optional text: Registration/Certification Number
  fileName?: string; // Required upload filename
}
// Section 12 Interface (Corrected)
interface OtherQualification {
  id: string;
  name: string; // Required text: Skill/License/Certification Name
  authority: string; // Required text: Issuing Authority/Organization
  certNumber?: string; // Optional text: Certificate/License Number
  expiryDate?: string; // Optional date
  fileName?: string; // <-- ADDED: Required upload filename
}

// Base Props Interface
interface Step5FormData {
  qualificationsDisclaimerAccepted?: boolean;
  basicEducationLevel?: string;
  basicEducationDetails?: BasicEducationDetails;
  hasTertiaryEducation?: 'yes' | 'no' | '';
  tertiaryEducation?: TertiaryQualification[];
  hasDriversLicence?: 'yes' | 'no' | '';
  driversLicenceDetails?: DriversLicenceDetails;
  hasPrdp?: 'yes' | 'no' | '';
  prdpDetails?: PrdpDetails;
  hasDriverTraining?: 'yes' | 'no' | '';
  driverTrainingList?: DriverTraining[];
  highestPsiraGrade?: string;
  psiraDetails?: PsiraDetails;
  hasSpecialisedPsira?: 'yes' | 'no' | '';
  specialisedPsiraList?: SpecialisedPsiraQualification[];
  roleSpecificQualificationsList?: RoleSpecificQualification[];
  medicalTrainingList?: MedicalTraining[];
  k9TrainingList?: K9Training[];
  computerTrainingList?: ComputerTraining[];
  strikesRiotTrainingList?: StrikesRiotTraining[];
  securityTechnicianTrainingList?: SecurityTechnicianTraining[];
  otherQualificationsList?: OtherQualification[]; // Add this line
  // Add other section data properties here...
}

interface Step5QualificationsProps {
  formData: Step5FormData;
  onUpdate: (data: Partial<Step5FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// --- Constants ---
const basicEducationLevelOptions: string[] = [ "None", "Below Grade 8 / Std 6", "Grade 8 / Std 6", "Grade 9 / Std 7", "Grade 10 / Std 8", "Grade 11 / Std 9", "Grade 12 / Matric" ];
const levelsRequiringDetails = basicEducationLevelOptions.slice(2);
const tertiaryQualificationTypeOptions: string[] = [ "Higher Certificate", "Advanced Certificate", "Diploma", "Advanced Diploma", "Bachelor's Degree", "Postgraduate Certificate", "Postgraduate Diploma", "Honours Degree", "Master's Degree", "Doctoral Degree (PhD)", "Other" ];
const licenceCodeOptions: string[] = ["A1", "A", "B", "EB", "C1", "C", "EC1", "EC"];
const prdpCategoryOptions: string[] = ["G (Goods)", "P (Passengers)", "D (Dangerous Goods)"];
const commonDriverTrainingOptions: string[] = [ "Advanced Driving Course", "Defensive Driving", "Anti-Hijack Training", "4x4 Driving", "Skid Control", "Economical Driving", "First Aid for Drivers", "Other" ];
const psiraGradeOptions: string[] = ["E", "D", "C", "B", "A"];
const specialisedPsiraOptions: string[] = [ "National Key Point (NKP) Training", "Cash-in-Transit (CIT)", "Armed Response / Reaction Officer", "Retail Security", "CCTV & Control Room Operator", "Close Protection Officer (CPO)", "Other" ];
const roleSpecificCategories: string[] = [
  "Close Protection Officer (CPO)",
  "Cash In Transit (CIT)",
  "Aviation Security (AVSEC) Screener",
  "Maritime Security Officer (SSO/PFSO)",
  "Security Technician",
  "Private Investigator",
  "Control Room Operator (Accredited)",
  "Security Trainer/Assessor/Moderator",
  "Retail Loss Prevention Specialist",
  "Armed Response / Reaction Officer",
  "Anti-Poaching / Field Ranger", // Added this line
  // Add more roles requiring distinct certifications if needed
];
const roleSpecificOptionsData: { [key: string]: string[] } = { // Map Role -> Specific Quals
"Close Protection Officer (CPO)": ["PSIRA CPO Specialisation / SASSETA Skills Program", "Advanced CPO Course (Hostile Environments, CAT, etc.)", "Advanced / Evasive / Protective Driving (CPO Context)", "Tactical Medical Training (CPO Context)", "Other CPO Specific Qualification"],
"Cash In Transit (CIT)": ["Specialised CIT Certificate (PSIRA Accredited)", "CIT Firearm Competency", "Advanced / Evasive Driving (CIT Context)", "Counter-Ambush / Anti-Hijack (CIT Context)", "Other CIT Specific Qualification"],
"Aviation Security (AVSEC) Screener": ["SACAA AVSEC Screener (Cargo)", "SACAA AVSEC Screener (Passenger)", "SACAA AVSEC Screener (Baggage)", "Other AVSEC Screener Qualification"],
"Maritime Security Officer (SSO/PFSO)": ["SAMSA Ship Security Officer (SSO)", "SAMSA Port Facility Security Officer (PFSO)", "Other Maritime Security Officer Qualification"],
"Security Technician": ["SAIDSA Alarm Installation Competency", "CCTV Systems Certification (e.g., Hikvision, Dahua)", "Access Control Systems Certification (e.g., Paxton, Impro)", "SAQCC Fire Detection Practitioner", "Other Technician Qualification"],
"Private Investigator": ["Formal Private Investigator Qualification/Course", "Relevant Legislation Certificate (CPA, POPIA, etc.)", "Surveillance Techniques Certificate", "Other Investigator Qualification"],
"Control Room Operator (Accredited)": ["SASSETA Accredited Control Room Operator Skills Programme", "Specific Accredited Software Certificate (e.g., Listener)", "Other Accredited Operator Qualification"],
"Security Trainer/Assessor/Moderator": ["SASSETA Accredited Assessor (115753)", "SASSETA Accredited Moderator (115759)", "SASSETA Accredited Facilitator (117871)", "Other Training/Assessment Qualification"],
"Retail Loss Prevention Specialist": ["Certified Forensic Interviewer (CFI)", "LPQualified (LPQ) / LPCertified (LPC)", "Wicklander-Zulawski Interviewing Certificate", "Other Loss Prevention Qualification"],
"Armed Response / Reaction Officer": ["PSIRA Armed Response Certificate", "Advanced Tactical Firearm Training", "Reaction Officer Driving Course", "Other Armed Response Qualification"],
// New entry for Anti-Poaching:
"Anti-Poaching / Field Ranger": [
    "Field Ranger Basic (Skills Programme)",
    "Field Ranger Advanced (Skills Programme)",
    "Specialised Anti-Poaching Course",
    "Tracking Course (Anti-Poaching Context)",
    "Bushcraft/Survival Course",
    "Other Anti-Poaching/Ranger Qualification"
],
// Add default "Other" for any unlisted categories or general use
"Default": ["Other"]
};

// Section 7 Constants
const medicalTrainingOptions: string[] = [
    "Basic First Aid (Level 1)",
    "Intermediate First Aid (Level 2)",
    "Advanced First Aid (Level 3)",
    "Basic Ambulance Assistant (BAA)",
    "Ambulance Emergency Assistant (AEA / ILS)",
    "Paramedic (N.Dip / B.Tech / B.EMC)",
    "Tactical Combat Casualty Care (TCCC / TECC)",
    "Other"
];

// Section 8 Constants (Revised based on feedback)
const k9TrainingOptions: string[] = [
    "Basic Dog Handler Course",
    "Patrol Dog Handler",
    "Tracker Dog Handler",
    "Detection Dog Handler (Specify Type)",
    "K9 First Aid",
    "Other"
];

// Section 9 Constants
const computerTrainingAreaOptions: string[] = [
    "General Office Software (e.g., MS Office, Google Suite)",
    "Security Control Room Software (e.g., Listener, Immix, Sentinel)",
    "Incident Reporting Software",
    "Visitor Management Software",
    "Access Control Monitoring Software (Client/User Interface)",
    "Video Management System (VMS) Client Software (e.g., HikCentral, Milestone Client)",
    "Typing Certification",
    "Other Area"
];

// Section 10 Constants
const strikesRiotTrainingOptions: string[] = [
    "Public Order Policing/Management",
    "Crowd Control Techniques",
    "Riot Control Basic/Advanced",
    "Use-of-Force (Public Order Context)",
    "Specific Equipment Training (Shields, Batons, etc.)",
    "Legal Aspects of Public Order Policing",
    "Other"
];

// Section 11 Constants
const securityTechAreaOptions: string[] = [
    "Alarm Systems",
    "CCTV Systems",
    "Access Control Systems",
    "Fire Detection Systems",
    "Networking (Security Context)",
    "Electric Fencing",
    "Other Technical Area" // Renamed slightly for clarity
];
// --- Component ---
const Step5Qualifications = ({
  formData, onUpdate, onBack, onNext,
}: Step5QualificationsProps): JSX.Element => {

  // --- State --- (Includes Sections 1-5)
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(formData?.qualificationsDisclaimerAccepted || false);
  const [error, setError] = useState<string | null>(null);
  // Basic Ed
  const [basicEducationLevel, setBasicEducationLevel] = useState<string>(formData?.basicEducationLevel || '');
  const [basicEducationDetails, setBasicEducationDetails] = useState<BasicEducationDetails | undefined>(formData?.basicEducationDetails);
  const [isBasicEducationEditorOpen, setIsBasicEducationEditorOpen] = useState<boolean>(false);
  const [editorSchool, setEditorSchool] = useState<string>('');
  const [editorYear, setEditorYear] = useState<string>('');
  const [editorFile, setEditorFile] = useState<File | null>(null);
  // Tertiary Ed
  const [hasTertiaryEducation, setHasTertiaryEducation] = useState<'yes' | 'no' | ''>(formData?.hasTertiaryEducation || '');
  const [tertiaryEducation, setTertiaryEducation] = useState<TertiaryQualification[]>(formData?.tertiaryEducation || []);
  const [isTertiaryEditorOpen, setIsTertiaryEditorOpen] = useState<boolean>(false);
  const [editingTertiaryId, setEditingTertiaryId] = useState<string | null>(null);
  const [editorTertiaryData, setEditorTertiaryData] = useState<Omit<TertiaryQualification, 'id' | 'fileName'>>({ type: '', institution: '', qualificationName: '', yearCompleted: '', nqfLevel: '', unitStandardName: '', unitStandardCode: '' });
  const [editorTertiaryFile, setEditorTertiaryFile] = useState<File | null>(null);
  // Section 4
  const [hasDriversLicence, setHasDriversLicence] = useState<'yes' | 'no' | ''>(formData?.hasDriversLicence || '');
  const [driversLicenceDetails, setDriversLicenceDetails] = useState<DriversLicenceDetails | undefined>(formData?.driversLicenceDetails);
  const [isLicenceEditorOpen, setIsLicenceEditorOpen] = useState<boolean>(false);
  const [editorLicenceData, setEditorLicenceData] = useState<Omit<DriversLicenceDetails, 'frontFileName' | 'backFileName'>>({ code: '', issueDate: '', expiryDate: '' });
  const [editorLicenceFrontFile, setEditorLicenceFrontFile] = useState<File | null>(null);
  const [editorLicenceBackFile, setEditorLicenceBackFile] = useState<File | null>(null);
  const [hasPrdp, setHasPrdp] = useState<'yes' | 'no' | ''>(formData?.hasPrdp || '');
  const [prdpDetails, setPrdpDetails] = useState<PrdpDetails | undefined>(formData?.prdpDetails);
  const [isPrdpEditorOpen, setIsPrdpEditorOpen] = useState<boolean>(false);
  const [editorPrdpData, setEditorPrdpData] = useState<PrdpDetails>({ categories: [], expiryDate: '' });
  const [hasDriverTraining, setHasDriverTraining] = useState<'yes' | 'no' | ''>(formData?.hasDriverTraining || '');
  const [driverTrainingList, setDriverTrainingList] = useState<DriverTraining[]>(formData?.driverTrainingList || []);
  const [isDriverTrainingEditorOpen, setIsDriverTrainingEditorOpen] = useState<boolean>(false);
  const [editingDriverTrainingId, setEditingDriverTrainingId] = useState<string | null>(null);
  const [editorDriverTrainingData, setEditorDriverTrainingData] = useState<Omit<DriverTraining, 'id' | 'fileName'>>({ trainingName: '', otherTrainingName: '', provider: '', dateCompleted: '', unitStandardTitle: '', unitStandardId: '' });
  const [editorDriverTrainingFile, setEditorDriverTrainingFile] = useState<File | null>(null);
  // Section 5
  const [highestPsiraGrade, setHighestPsiraGrade] = useState<string>(formData?.highestPsiraGrade || '');
  const [psiraDetails, setPsiraDetails] = useState<PsiraDetails | undefined>(formData?.psiraDetails);
  const [isPsiraDetailsEditorOpen, setIsPsiraDetailsEditorOpen] = useState<boolean>(false);
  const [editorPsiraData, setEditorPsiraData] = useState<Omit<PsiraDetails, 'fileName'>>({ psiraNumber: '', trainingProvider: '', issueDate: '', expiryDate: '' });
  const [editorPsiraFile, setEditorPsiraFile] = useState<File | null>(null);
  const [hasSpecialisedPsira, setHasSpecialisedPsira] = useState<'yes' | 'no' | ''>(formData?.hasSpecialisedPsira || '');
  const [specialisedPsiraList, setSpecialisedPsiraList] = useState<SpecialisedPsiraQualification[]>(formData?.specialisedPsiraList || []);
  const [isSpecialisedPsiraEditorOpen, setIsSpecialisedPsiraEditorOpen] = useState<boolean>(false);
  const [editingSpecialisedPsiraId, setEditingSpecialisedPsiraId] = useState<string | null>(null);
  const [editorSpecialisedPsiraData, setEditorSpecialisedPsiraData] = useState<Omit<SpecialisedPsiraQualification, 'id' | 'fileName'>>({ qualificationName: '', otherQualificationName: '', provider: '', dateCompleted: '', expiryDate: '' });
  const [editorSpecialisedPsiraFile, setEditorSpecialisedPsiraFile] = useState<File | null>(null);
// Section 6 State
const [roleSpecificQualificationsList, setRoleSpecificQualificationsList] = useState<RoleSpecificQualification[]>(formData?.roleSpecificQualificationsList || []);
const [isRoleSpecificEditorOpen, setIsRoleSpecificEditorOpen] = useState<boolean>(false);
const [editingRoleSpecificId, setEditingRoleSpecificId] = useState<string | null>(null);
const [editorRoleSpecificData, setEditorRoleSpecificData] = useState<Partial<RoleSpecificQualification>>({});
const [editorRoleSpecificFile, setEditorRoleSpecificFile] = useState<File | null>(null);
// Section 7 State
const [medicalTrainingList, setMedicalTrainingList] = useState<MedicalTraining[]>(formData?.medicalTrainingList || []);
const [isMedicalEditorOpen, setIsMedicalEditorOpen] = useState<boolean>(false);
const [editingMedicalId, setEditingMedicalId] = useState<string | null>(null);
const [editorMedicalData, setEditorMedicalData] = useState<Partial<MedicalTraining>>({}); // Use Partial for editor
const [editorMedicalFile, setEditorMedicalFile] = useState<File | null>(null);
// Section 8 State
const [k9TrainingList, setK9TrainingList] = useState<K9Training[]>(formData?.k9TrainingList || []);
const [isK9EditorOpen, setIsK9EditorOpen] = useState<boolean>(false);
const [editingK9Id, setEditingK9Id] = useState<string | null>(null);
const [editorK9Data, setEditorK9Data] = useState<Partial<K9Training>>({}); // Use Partial for editor
const [editorK9File, setEditorK9File] = useState<File | null>(null);
// Section 9 State: Computer Efficiency Training
const [computerTrainingList, setComputerTrainingList] = useState<ComputerTraining[]>(formData?.computerTrainingList || []);
const [isComputerTrainingEditorOpen, setIsComputerTrainingEditorOpen] = useState<boolean>(false);
const [editingComputerTrainingId, setEditingComputerTrainingId] = useState<string | null>(null);
const [editorComputerTrainingData, setEditorComputerTrainingData] = useState<Partial<ComputerTraining>>({}); // Use Partial for editor
const [editorComputerTrainingFile, setEditorComputerTrainingFile] = useState<File | null>(null);
// Section 10 State: Strikes and Riot Training
const [strikesRiotTrainingList, setStrikesRiotTrainingList] = useState<StrikesRiotTraining[]>(formData?.strikesRiotTrainingList || []);
const [isStrikesRiotEditorOpen, setIsStrikesRiotEditorOpen] = useState<boolean>(false);
const [editingStrikesRiotId, setEditingStrikesRiotId] = useState<string | null>(null);
const [editorStrikesRiotData, setEditorStrikesRiotData] = useState<Partial<StrikesRiotTraining>>({}); // Use Partial for editor
const [editorStrikesRiotFile, setEditorStrikesRiotFile] = useState<File | null>(null);
// Section 11 State: Security Technician Training
const [securityTechnicianTrainingList, setSecurityTechnicianTrainingList] = useState<SecurityTechnicianTraining[]>(formData?.securityTechnicianTrainingList || []);
const [isSecurityTechnicianEditorOpen, setIsSecurityTechnicianEditorOpen] = useState<boolean>(false);
const [editingSecurityTechnicianId, setEditingSecurityTechnicianId] = useState<string | null>(null);
const [editorSecurityTechnicianData, setEditorSecurityTechnicianData] = useState<Partial<SecurityTechnicianTraining>>({}); // Use Partial
const [editorSecurityTechnicianFile, setEditorSecurityTechnicianFile] = useState<File | null>(null);

// Section 12 State: Other Skills, Licenses & Certifications (Corrected)
const [otherQualifications, setOtherQualifications] = useState<OtherQualification[]>(formData?.otherQualificationsList || []);
// State for the inline input fields
const [newQualification, setNewQualification] = useState<Omit<OtherQualification, 'id' | 'fileName'>>({ name: '', authority: '', certNumber: '', expiryDate: '' }); // Removed fileName from initial object
const [newQualificationFile, setNewQualificationFile] = useState<File | null>(null); // <-- ADDED: State for the inline file input
const [otherError, setOtherError] = useState<string | null>(null); // For inline validation error

// State for other sections...


// --- Effects --- (Includes Section 5 dependencies and logic)
useEffect(() => {
  if (!disclaimerAccepted && !formData?.qualificationsDisclaimerAccepted) return;
  const dataToUpdate: Partial<Step5FormData> = {};
  let changed = false;
  const updateField = (key: keyof Step5FormData, localState: any) => { const defaultValue = Array.isArray(localState) ? [] : (typeof localState === 'object' && localState !== null ? undefined : ''); if (JSON.stringify(localState ?? defaultValue) !== JSON.stringify(formData?.[key] ?? defaultValue)) { if (localState === undefined && formData?.[key] !== undefined) { (dataToUpdate as any)[key] = undefined; changed = true; } else if (localState !== undefined) { (dataToUpdate as any)[key] = localState; changed = true; } } };

  // Check simple fields
  if (disclaimerAccepted !== (formData?.qualificationsDisclaimerAccepted || false)) { dataToUpdate.qualificationsDisclaimerAccepted = disclaimerAccepted; changed = true; }
  updateField('basicEducationLevel', basicEducationLevel); updateField('hasTertiaryEducation', hasTertiaryEducation); updateField('hasDriversLicence', hasDriversLicence); updateField('hasPrdp', hasPrdp); updateField('hasDriverTraining', hasDriverTraining); updateField('highestPsiraGrade', highestPsiraGrade); updateField('hasSpecialisedPsira', hasSpecialisedPsira);
  // Check complex fields / arrays
  updateField('basicEducationDetails', basicEducationDetails); updateField('tertiaryEducation', tertiaryEducation); updateField('driversLicenceDetails', driversLicenceDetails); updateField('prdpDetails', prdpDetails); updateField('driverTrainingList', driverTrainingList); updateField('psiraDetails', psiraDetails); updateField('specialisedPsiraList', specialisedPsiraList);
  updateField('roleSpecificQualificationsList', roleSpecificQualificationsList); // Added S6 update check
  updateField('medicalTrainingList', medicalTrainingList); // Added S7 update check
  updateField('k9TrainingList', k9TrainingList); // Added S8 update check
  updateField('computerTrainingList', computerTrainingList); // <-- ADD THIS LINE
  updateField('strikesRiotTrainingList', strikesRiotTrainingList); // <-- ADD THIS LINE
  updateField('securityTechnicianTrainingList', securityTechnicianTrainingList); // <-- ADD THIS LINE
  updateField('otherQualificationsList', otherQualifications); // <-- ADDED: using the correct field name

  // Handle clearing logic
  if (changed) {
      if (dataToUpdate.basicEducationLevel !== undefined && !levelsRequiringDetails.includes(dataToUpdate.basicEducationLevel)) { dataToUpdate.basicEducationDetails = undefined; }
      if (dataToUpdate.hasTertiaryEducation === 'no') { dataToUpdate.tertiaryEducation = []; }
      if (dataToUpdate.hasDriversLicence === 'no') { dataToUpdate.driversLicenceDetails = undefined; dataToUpdate.hasPrdp = 'no'; dataToUpdate.prdpDetails = undefined; dataToUpdate.hasDriverTraining = 'no'; dataToUpdate.driverTrainingList = []; }
      else if (dataToUpdate.hasDriversLicence === 'yes') { if (dataToUpdate.hasPrdp === 'no') dataToUpdate.prdpDetails = undefined; if (dataToUpdate.hasDriverTraining === 'no') dataToUpdate.driverTrainingList = []; }
      if (dataToUpdate.highestPsiraGrade !== undefined && !psiraGradeOptions.includes(dataToUpdate.highestPsiraGrade)) { dataToUpdate.psiraDetails = undefined; }
      if (dataToUpdate.hasSpecialisedPsira === 'no') { dataToUpdate.specialisedPsiraList = []; }
      // No specific clearing for RoleSpecific list needed here based on a flag
      if (Object.keys(dataToUpdate).length > 0) { console.log("Step 5: Relevant state changed, calling onUpdate", dataToUpdate); onUpdate(dataToUpdate); }
    }
}, [ // Dependencies include new Section 6 state
    disclaimerAccepted, formData?.qualificationsDisclaimerAccepted,
    basicEducationLevel, basicEducationDetails,
    hasTertiaryEducation, tertiaryEducation,
    hasDriversLicence, driversLicenceDetails, hasPrdp, prdpDetails, hasDriverTraining, driverTrainingList,
    highestPsiraGrade, psiraDetails, hasSpecialisedPsira, specialisedPsiraList,
    roleSpecificQualificationsList, // <-- Added S6 state
    medicalTrainingList, // <-- Added S7 state
    k9TrainingList, // <-- Added S8 state
    computerTrainingList, // <-- ADD THIS LINE
    strikesRiotTrainingList, // <-- ADD THIS LINE
    securityTechnicianTrainingList, // <-- ADD THIS LINE
    otherQualifications, // <-- ADDED: dependency
    formData, onUpdate
]);

// --- Memoized Calculation for Section 6 Summary ---
// Helper function (can be here or outside component if pure)
const getGroupedAndSortedRoleQuals = (list: RoleSpecificQualification[]) => {
  const grouped: { [key: string]: RoleSpecificQualification[] } = {};
  list.forEach(item => {
      if (!grouped[item.category]) { grouped[item.category] = []; }
      grouped[item.category].push(item);
  });
  Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime());
  });
  const sortedCategories = Object.keys(grouped).sort(); // Sort categories alphabetically
  return { sortedCategories, grouped };
};

// useMemo hook called at the top level of the component
const { sortedCategories: sortedRoleCategories, grouped: groupedRoleQualifications } = useMemo(
  () => getGroupedAndSortedRoleQuals(roleSpecificQualificationsList),
  [roleSpecificQualificationsList] // Dependency is correct here
);

// --- Helper for Section 6 Dropdown --- (Placed before handlers)
const getRoleQualificationOptions = (category: string | undefined): string[] => {
    return category ? (roleSpecificOptionsData[category] || ['Other']) : []; // Fallback
};

  // --- Handlers ---
  const handleAcceptDisclaimer = () => { setDisclaimerAccepted(true); onUpdate({ qualificationsDisclaimerAccepted: true }); };
  // Basic Ed Handlers ...
  const handleLevelChange = (event: ChangeEvent<HTMLInputElement>) => { const newLevel = event.target.value; setBasicEducationLevel(newLevel); if (!levelsRequiringDetails.includes(newLevel)) { setBasicEducationDetails(undefined); setIsBasicEducationEditorOpen(false); setError(null); } };
  const openBasicEducationEditor = () => { setError(null); setEditorSchool(basicEducationDetails?.school || ''); setEditorYear(basicEducationDetails?.year || ''); setEditorFile(null); setIsBasicEducationEditorOpen(true); };
  const handleBasicEducationFileChange = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { setEditorFile(e.target.files[0]); } else { setEditorFile(null); } setError(null); };
  const saveBasicEducationDetails = () => { if (!editorSchool.trim() || !editorYear.trim()) { setError("School/Institution and Year Completed are required."); return; } if (!/^\d{4}$/.test(editorYear.trim())) { setError("Please enter a valid 4-digit year."); return; } setError(null); const newDetails: BasicEducationDetails = { school: editorSchool.trim(), year: editorYear.trim(), fileName: editorFile?.name || basicEducationDetails?.fileName, }; setBasicEducationDetails(newDetails); setIsBasicEducationEditorOpen(false); setEditorSchool(''); setEditorYear(''); setEditorFile(null); };
  const cancelBasicEducationEditor = () => { setIsBasicEducationEditorOpen(false); setError(null); setEditorSchool(''); setEditorYear(''); setEditorFile(null); };
  // Tertiary Ed Handlers ...
  const handleHasTertiaryChange = (e: ChangeEvent<HTMLInputElement>) => { const value = e.target.value as 'yes' | 'no'; setHasTertiaryEducation(value); if (value === 'no') { setTertiaryEducation([]); setIsTertiaryEditorOpen(false); setEditingTertiaryId(null); setError(null); } };
  const openTertiaryEditor = (id: string | null = null) => { setError(null); setEditingTertiaryId(id); if (id) { const itemToEdit = tertiaryEducation.find(item => item.id === id); if (itemToEdit) { setEditorTertiaryData({ type: itemToEdit.type, institution: itemToEdit.institution, qualificationName: itemToEdit.qualificationName, yearCompleted: itemToEdit.yearCompleted, nqfLevel: itemToEdit.nqfLevel || '', unitStandardName: itemToEdit.unitStandardName || '', unitStandardCode: itemToEdit.unitStandardCode || '', }); setEditorTertiaryFile(null); setIsTertiaryEditorOpen(true); } else { console.error("Could not find tertiary item to edit with ID:", id); cancelTertiaryEditor(); } } else { setEditorTertiaryData({ type: '', institution: '', qualificationName: '', yearCompleted: '', nqfLevel: '', unitStandardName: '', unitStandardCode: '' }); setEditorTertiaryFile(null); setIsTertiaryEditorOpen(true); } };
  const handleTertiaryEditorInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value } = e.target; setEditorTertiaryData(prev => ({ ...prev, [name]: value })); setError(null); };
  const handleTertiaryEditorFileChange = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { setEditorTertiaryFile(e.target.files[0]); } else { setEditorTertiaryFile(null); } setError(null); };
  const saveTertiaryQualification = () => { if (!editorTertiaryData.type || !editorTertiaryData.institution.trim() || !editorTertiaryData.qualificationName.trim() || !editorTertiaryData.yearCompleted.trim()) { setError("Qualification Type, Institution, Qualification Name, and Year Completed are required."); return; } if (!/^\d{4}$/.test(editorTertiaryData.yearCompleted.trim())) { setError("Please enter a valid 4-digit year for Year Completed."); return; } setError(null); const existingFileName = editingTertiaryId ? tertiaryEducation.find(i => i.id === editingTertiaryId)?.fileName : undefined; const qualificationData = { type: editorTertiaryData.type, institution: editorTertiaryData.institution.trim(), qualificationName: editorTertiaryData.qualificationName.trim(), yearCompleted: editorTertiaryData.yearCompleted.trim(), nqfLevel: editorTertiaryData.nqfLevel?.trim() || undefined, unitStandardName: editorTertiaryData.unitStandardName?.trim() || undefined, unitStandardCode: editorTertiaryData.unitStandardCode?.trim() || undefined, fileName: editorTertiaryFile?.name || existingFileName, }; if (editingTertiaryId) { setTertiaryEducation(prev => prev.map(item => item.id === editingTertiaryId ? { ...item, ...qualificationData } : item )); } else { const newItem: TertiaryQualification = { ...qualificationData, id: Date.now().toString(), }; setTertiaryEducation(prev => [...prev, newItem]); } cancelTertiaryEditor(); };
  const cancelTertiaryEditor = () => { setIsTertiaryEditorOpen(false); setEditingTertiaryId(null); setError(null); setEditorTertiaryData({ type: '', institution: '', qualificationName: '', yearCompleted: '', nqfLevel: '', unitStandardName: '', unitStandardCode: '' }); setEditorTertiaryFile(null); };
  const removeTertiaryQualification = (idToRemove: string) => { setTertiaryEducation(prev => prev.filter(item => item.id !== idToRemove)); if (editingTertiaryId === idToRemove) { cancelTertiaryEditor(); } };
  // Section 4 Handlers...
  const handleHasLicenceChange = (e: ChangeEvent<HTMLInputElement>) => { const value = e.target.value as 'yes' | 'no'; setHasDriversLicence(value); if (value === 'no') { setDriversLicenceDetails(undefined); setIsLicenceEditorOpen(false); setHasPrdp('no'); setPrdpDetails(undefined); setIsPrdpEditorOpen(false); setHasDriverTraining('no'); setDriverTrainingList([]); setIsDriverTrainingEditorOpen(false); setEditingDriverTrainingId(null); setError(null); } };
  const openLicenceEditor = () => { setError(null); setEditorLicenceData(driversLicenceDetails ? { code: driversLicenceDetails.code, issueDate: driversLicenceDetails.issueDate, expiryDate: driversLicenceDetails.expiryDate } : { code: '', issueDate: '', expiryDate: '' }); setEditorLicenceFrontFile(null); setEditorLicenceBackFile(null); setIsLicenceEditorOpen(true); };
  const handleLicenceEditorInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value } = e.target; setEditorLicenceData(prev => ({ ...prev, [name]: value })); setError(null); };
  const handleLicenceFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { setter(e.target.files[0]); } else { setter(null); } setError(null); };
  const saveLicenceDetails = () => { const existingFront = driversLicenceDetails?.frontFileName; const existingBack = driversLicenceDetails?.backFileName; if (!editorLicenceData.code || !editorLicenceData.issueDate || !editorLicenceData.expiryDate) { setError("Licence Code, Issue Date, and Expiry Date are required."); return; } if (!editorLicenceFrontFile && !existingFront) { setError("Licence Front Copy upload is required."); return; } if (!editorLicenceBackFile && !existingBack) { setError("Licence Back Copy upload is required."); return; } if (new Date(editorLicenceData.expiryDate) <= new Date(editorLicenceData.issueDate)) { setError("Expiry Date must be after the Issue Date."); return; } setError(null); const newDetails: DriversLicenceDetails = { code: editorLicenceData.code, issueDate: editorLicenceData.issueDate, expiryDate: editorLicenceData.expiryDate, frontFileName: editorLicenceFrontFile?.name || existingFront, backFileName: editorLicenceBackFile?.name || existingBack, }; setDriversLicenceDetails(newDetails); setIsLicenceEditorOpen(false); setEditorLicenceFrontFile(null); setEditorLicenceBackFile(null); };
  const cancelLicenceEditor = () => { setIsLicenceEditorOpen(false); setError(null); setEditorLicenceFrontFile(null); setEditorLicenceBackFile(null); };
  const handleHasPrdpChange = (e: ChangeEvent<HTMLInputElement>) => { const value = e.target.value as 'yes' | 'no'; setHasPrdp(value); if (value === 'no') { setPrdpDetails(undefined); setIsPrdpEditorOpen(false); setError(null); } };
  const openPrdpEditor = () => { setError(null); setEditorPrdpData(prdpDetails || { categories: [], expiryDate: '' }); setIsPrdpEditorOpen(true); };
  const handlePrdpEditorInputChange = (e: ChangeEvent<HTMLInputElement>) => { setEditorPrdpData(prev => ({ ...prev, expiryDate: e.target.value })); setError(null); };
  const handlePrdpCategoryChange = (e: ChangeEvent<HTMLInputElement>) => { const { value, checked } = e.target; setEditorPrdpData(prev => ({ ...prev, categories: checked ? [...prev.categories, value] : prev.categories.filter(cat => cat !== value) })); setError(null); };
  const savePrdpDetails = () => { if (editorPrdpData.categories.length === 0 || !editorPrdpData.expiryDate) { setError("Please select at least one PrDP category and provide the expiry date."); return; } setError(null); setPrdpDetails({...editorPrdpData}); setIsPrdpEditorOpen(false); };
  const cancelPrdpEditor = () => { setIsPrdpEditorOpen(false); setError(null); };
  const handleHasDriverTrainingChange = (e: ChangeEvent<HTMLInputElement>) => { const value = e.target.value as 'yes' | 'no'; setHasDriverTraining(value); if (value === 'no') { setDriverTrainingList([]); setIsDriverTrainingEditorOpen(false); setEditingDriverTrainingId(null); setError(null); } };
  const openDriverTrainingEditor = (id: string | null = null) => { setError(null); setEditingDriverTrainingId(id); if (id) { const item = driverTrainingList.find(t => t.id === id); if (item) { setEditorDriverTrainingData({ trainingName: item.trainingName, otherTrainingName: item.otherTrainingName, provider: item.provider, dateCompleted: item.dateCompleted, unitStandardTitle: item.unitStandardTitle || '', unitStandardId: item.unitStandardId || '' }); setEditorDriverTrainingFile(null); setIsDriverTrainingEditorOpen(true);} else { cancelDriverTrainingEditor(); } } else { setEditorDriverTrainingData({ trainingName: '', otherTrainingName: '', provider: '', dateCompleted: '', unitStandardTitle: '', unitStandardId: '' }); setEditorDriverTrainingFile(null); setIsDriverTrainingEditorOpen(true); } };
  const handleDriverTrainingInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value } = e.target; setEditorDriverTrainingData(prev => ({ ...prev, [name]: value })); if(name === 'trainingName' && value !== 'Other') { setEditorDriverTrainingData(prev => ({...prev, otherTrainingName: ''}))}; setError(null);};
  const handleDriverTrainingFileChange = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { setEditorDriverTrainingFile(e.target.files[0]); } else { setEditorDriverTrainingFile(null); } setError(null);};
  const saveDriverTraining = () => { const isOtherSelected = editorDriverTrainingData.trainingName === 'Other'; if ((!editorDriverTrainingData.trainingName || isOtherSelected) && !editorDriverTrainingData.otherTrainingName?.trim()){ setError("Please select or specify the Training Type."); return; } if (!editorDriverTrainingData.provider.trim() || !editorDriverTrainingData.dateCompleted ) { setError("Training Provider and Date Completed are required."); return; } setError(null); const existingFileName = editingDriverTrainingId ? driverTrainingList.find(i=>i.id===editingDriverTrainingId)?.fileName : undefined; const trainingData = { trainingName: editorDriverTrainingData.trainingName, otherTrainingName: isOtherSelected ? editorDriverTrainingData.otherTrainingName?.trim() : undefined, provider: editorDriverTrainingData.provider.trim(), dateCompleted: editorDriverTrainingData.dateCompleted, unitStandardTitle: editorDriverTrainingData.unitStandardTitle?.trim() || undefined, unitStandardId: editorDriverTrainingData.unitStandardId?.trim() || undefined, fileName: editorDriverTrainingFile?.name || existingFileName }; if (editingDriverTrainingId) { setDriverTrainingList(prev => prev.map(item => item.id === editingDriverTrainingId ? { ...item, ...trainingData } : item)); } else { const newItem: DriverTraining = { ...trainingData, id: Date.now().toString() }; setDriverTrainingList(prev => [...prev, newItem]); } cancelDriverTrainingEditor(); };
  const cancelDriverTrainingEditor = () => { setIsDriverTrainingEditorOpen(false); setEditingDriverTrainingId(null); setError(null); setEditorDriverTrainingData({ trainingName: '', otherTrainingName: '', provider: '', dateCompleted: '', unitStandardTitle: '', unitStandardId: '' }); setEditorDriverTrainingFile(null); };
  const removeDriverTraining = (idToRemove: string) => { setDriverTrainingList(prev => prev.filter(item => item.id !== idToRemove)); if (editingDriverTrainingId === idToRemove) cancelDriverTrainingEditor(); };
  // Section 5 Handlers
  const handlePsiraGradeChange = (event: ChangeEvent<HTMLInputElement>) => { const newGrade = event.target.value; setHighestPsiraGrade(newGrade); if (!psiraGradeOptions.includes(newGrade)) { setPsiraDetails(undefined); setIsPsiraDetailsEditorOpen(false); setError(null); } };
  const openPsiraDetailsEditor = () => { setError(null); setEditorPsiraData(psiraDetails ? { psiraNumber: psiraDetails.psiraNumber, trainingProvider: psiraDetails.trainingProvider, issueDate: psiraDetails.issueDate, expiryDate: psiraDetails.expiryDate } : { psiraNumber: '', trainingProvider: '', issueDate: '', expiryDate: '' }); setEditorPsiraFile(null); setIsPsiraDetailsEditorOpen(true); };
  const handlePsiraDetailsInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value } = e.target; setEditorPsiraData(prev => ({ ...prev, [name]: value })); setError(null); };
  const handlePsiraDetailsFileChange = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { setEditorPsiraFile(e.target.files[0]); } else { setEditorPsiraFile(null); } setError(null); };
  const savePsiraDetails = () => { if (!editorPsiraData.psiraNumber.trim() || !editorPsiraData.trainingProvider.trim() || !editorPsiraData.issueDate || !editorPsiraData.expiryDate) { setError("PSIRA Number, Training Provider, Issue Date, and Expiry Date are required."); return; } const existingFileName = psiraDetails?.fileName; if (!editorPsiraFile && !existingFileName) { setError("Please upload a copy of your PSIRA Certificate or Card."); return; } if (new Date(editorPsiraData.expiryDate) <= new Date(editorPsiraData.issueDate)) { setError("Expiry Date must be after the Issue Date."); return; } setError(null); const newDetails: PsiraDetails = { psiraNumber: editorPsiraData.psiraNumber.trim(), trainingProvider: editorPsiraData.trainingProvider.trim(), issueDate: editorPsiraData.issueDate, expiryDate: editorPsiraData.expiryDate, fileName: editorPsiraFile?.name || existingFileName }; setPsiraDetails(newDetails); setIsPsiraDetailsEditorOpen(false); setEditorPsiraFile(null); };
  const cancelPsiraDetailsEditor = () => { setIsPsiraDetailsEditorOpen(false); setError(null); setEditorPsiraFile(null); };
  const handleHasSpecialisedPsiraChange = (e: ChangeEvent<HTMLInputElement>) => { const value = e.target.value as 'yes' | 'no'; setHasSpecialisedPsira(value); if (value === 'no') { setSpecialisedPsiraList([]); setIsSpecialisedPsiraEditorOpen(false); setEditingSpecialisedPsiraId(null); setError(null); } };
  const openSpecialisedPsiraEditor = (id: string | null = null) => { setError(null); setEditingSpecialisedPsiraId(id); if (id) { const itemToEdit = specialisedPsiraList.find(item => item.id === id); if (itemToEdit) { setEditorSpecialisedPsiraData({ qualificationName: itemToEdit.qualificationName, otherQualificationName: itemToEdit.otherQualificationName || '', provider: itemToEdit.provider, dateCompleted: itemToEdit.dateCompleted, expiryDate: itemToEdit.expiryDate || '', }); setEditorSpecialisedPsiraFile(null); setIsSpecialisedPsiraEditorOpen(true); } else { console.error("Could not find specialised PSIRA item to edit with ID:", id); cancelSpecialisedPsiraEditor(); } } else { setEditorSpecialisedPsiraData({ qualificationName: '', otherQualificationName: '', provider: '', dateCompleted: '', expiryDate: '' }); setEditorSpecialisedPsiraFile(null); setIsSpecialisedPsiraEditorOpen(true); } };
  const handleSpecialisedPsiraInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value } = e.target; setEditorSpecialisedPsiraData(prev => ({ ...prev, [name]: value })); if (name === 'qualificationName' && value !== 'Other') { setEditorSpecialisedPsiraData(prev => ({ ...prev, otherQualificationName: '' })); } setError(null); };
  const handleSpecialisedPsiraFileChange = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { setEditorSpecialisedPsiraFile(e.target.files[0]); } else { setEditorSpecialisedPsiraFile(null); } setError(null); };
  const saveSpecialisedPsiraQualification = () => { const isOtherSelected = editorSpecialisedPsiraData.qualificationName === 'Other'; if (!editorSpecialisedPsiraData.qualificationName) { setError("Please select the Qualification Name."); return; } if (isOtherSelected && !editorSpecialisedPsiraData.otherQualificationName?.trim()) { setError("Please specify the qualification name when 'Other' is selected."); return; } if (!editorSpecialisedPsiraData.provider.trim()) { setError("Training Provider / Institution is required."); return; } if (!editorSpecialisedPsiraData.dateCompleted) { setError("Date Completed / Issued is required."); return; } const existingFileName = editingSpecialisedPsiraId ? specialisedPsiraList.find(i => i.id === editingSpecialisedPsiraId)?.fileName : undefined; if (!editorSpecialisedPsiraFile && !existingFileName) { setError("Certificate Upload is required."); return; } if (editorSpecialisedPsiraData.expiryDate && new Date(editorSpecialisedPsiraData.expiryDate) <= new Date(editorSpecialisedPsiraData.dateCompleted)) { setError("Expiry Date must be after the Date Completed."); return; } setError(null); const qualificationData = { qualificationName: editorSpecialisedPsiraData.qualificationName, otherQualificationName: isOtherSelected ? editorSpecialisedPsiraData.otherQualificationName?.trim() : undefined, provider: editorSpecialisedPsiraData.provider.trim(), dateCompleted: editorSpecialisedPsiraData.dateCompleted, expiryDate: editorSpecialisedPsiraData.expiryDate || undefined, fileName: editorSpecialisedPsiraFile?.name || existingFileName, }; if (editingSpecialisedPsiraId) { setSpecialisedPsiraList(prev => prev.map(item => item.id === editingSpecialisedPsiraId ? { ...item, ...qualificationData } : item)); } else { const newItem: SpecialisedPsiraQualification = { ...qualificationData, id: Date.now().toString(), }; setSpecialisedPsiraList(prev => [...prev, newItem]); } cancelSpecialisedPsiraEditor(); };
  const cancelSpecialisedPsiraEditor = () => { setIsSpecialisedPsiraEditorOpen(false); setEditingSpecialisedPsiraId(null); setError(null); setEditorSpecialisedPsiraData({ qualificationName: '', otherQualificationName: '', provider: '', dateCompleted: '', expiryDate: '' }); setEditorSpecialisedPsiraFile(null); };
  const removeSpecialisedPsiraQualification = (idToRemove: string) => { setSpecialisedPsiraList(prev => prev.filter(item => item.id !== idToRemove)); if (editingSpecialisedPsiraId === idToRemove) { cancelSpecialisedPsiraEditor(); } };
  // --- Section 6 Handlers: Role-Specific Industry Qualifications ---
  const openRoleSpecificEditor = (id: string | null = null) => {
    setError(null);
    setEditingRoleSpecificId(id);
    if (id) {
        // Editing: Find item and populate editor state
        const itemToEdit = roleSpecificQualificationsList.find(item => item.id === id);
        if (itemToEdit) {
            setEditorRoleSpecificData({ // Pre-fill editor state fully
                id: itemToEdit.id, category: itemToEdit.category, qualificationName: itemToEdit.qualificationName,
                otherQualificationName: itemToEdit.otherQualificationName, provider: itemToEdit.provider,
                dateCompleted: itemToEdit.dateCompleted, expiryDate: itemToEdit.expiryDate,
                certificateNumber: itemToEdit.certificateNumber, fileName: itemToEdit.fileName // Keep filename info for display/validation
            });
            setEditorRoleSpecificFile(null); // Reset file input
            setIsRoleSpecificEditorOpen(true); // Open the editor modal/view
        } else {
            console.error("Could not find Role-Specific Qualification item to edit with ID:", id);
            cancelRoleSpecificEditor(); // Close if item not found
        }
    } else {
        // Adding: Reset editor state, maybe keep category if we implement pre-selection? No, start fresh.
        setEditorRoleSpecificData({ category: '', qualificationName: '' }); // Reset fully for adding
        setEditorRoleSpecificFile(null);
        setIsRoleSpecificEditorOpen(true); // Open the editor modal/view
    }
};

const handleRoleSpecificInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditorRoleSpecificData(prev => {
        const newState = { ...prev, [name]: value };
        // If category changed, reset qualification name and other qualification name
        if (name === 'category') {
            newState.qualificationName = '';
            newState.otherQualificationName = '';
        }
        // If qualification name changed TO something other than 'Other', clear other qualification name
        if (name === 'qualificationName' && value !== 'Other') {
           newState.otherQualificationName = '';
        }
        return newState;
    });
    setError(null); // Clear error on any input change
};

const handleRoleSpecificFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setEditorRoleSpecificFile(e.target.files[0]);
    } else {
        setEditorRoleSpecificFile(null);
    }
    setError(null); // Clear error on file change
};

const saveRoleSpecificQualification = () => {
    // --- Validation ---
    if (!editorRoleSpecificData.category) { setError("Please select the Security Field/Role."); return; }
    const isOtherSelected = editorRoleSpecificData.qualificationName === 'Other';
    if (!editorRoleSpecificData.qualificationName) { setError("Please select the Specific Qualification/Certification Name."); return; }
    if (isOtherSelected && !editorRoleSpecificData.otherQualificationName?.trim()) { setError("Please specify the qualification name when 'Other' is selected."); return; }
    if (!editorRoleSpecificData.provider?.trim()) { setError("Training Provider / Issuing Body is required."); return; }
    if (!editorRoleSpecificData.dateCompleted) { setError("Date Completed / Issued is required."); return; }
    // Check existing file name during edit before demanding a new file
    const existingFileName = editingRoleSpecificId ? roleSpecificQualificationsList.find(i => i.id === editingRoleSpecificId)?.fileName : undefined;
    if (!editorRoleSpecificFile && !existingFileName) { setError("Certificate/Proof Upload is required."); return; }
    if (editorRoleSpecificData.expiryDate && editorRoleSpecificData.dateCompleted && new Date(editorRoleSpecificData.expiryDate) <= new Date(editorRoleSpecificData.dateCompleted)) { setError("Expiry Date must be after the Date Completed."); return; }
    setError(null); // Clear error if validation passes

    // --- Prepare Data ---
    const qualificationDataPayload: Omit<RoleSpecificQualification, 'id'> = {
        category: editorRoleSpecificData.category,
        qualificationName: editorRoleSpecificData.qualificationName,
        otherQualificationName: isOtherSelected ? editorRoleSpecificData.otherQualificationName?.trim() : undefined,
        provider: editorRoleSpecificData.provider.trim(),
        dateCompleted: editorRoleSpecificData.dateCompleted,
        expiryDate: editorRoleSpecificData.expiryDate || undefined,
        certificateNumber: editorRoleSpecificData.certificateNumber?.trim() || undefined,
        fileName: editorRoleSpecificFile?.name || existingFileName, // Use new file name or keep old one
    };

    // --- Update State ---
    if (editingRoleSpecificId) {
        setRoleSpecificQualificationsList(prev => prev.map(item => item.id === editingRoleSpecificId ? { ...item, ...qualificationDataPayload } : item));
    } else {
        const newItem: RoleSpecificQualification = { ...qualificationDataPayload, id: Date.now().toString(), };
        setRoleSpecificQualificationsList(prev => [...prev, newItem]);
    }
    // TODO: Handle actual file upload (pass editorRoleSpecificFile up or handle here)
    cancelRoleSpecificEditor(); // Close and reset editor
};

const cancelRoleSpecificEditor = () => {
    setIsRoleSpecificEditorOpen(false); setEditingRoleSpecificId(null); setError(null); setEditorRoleSpecificData({}); setEditorRoleSpecificFile(null);
};

const removeRoleSpecificQualification = (idToRemove: string) => {
    setRoleSpecificQualificationsList(prev => prev.filter(item => item.id !== idToRemove));
    if (editingRoleSpecificId === idToRemove) { cancelRoleSpecificEditor(); }
};
  // Handlers for other sections...

  // Section 7 Handlers
  const openMedicalEditor = (id: string | null = null) => {
      setError(null);
      setEditingMedicalId(id);
      if (id) {
          const itemToEdit = medicalTrainingList.find(item => item.id === id);
          if (itemToEdit) {
              setEditorMedicalData({ // Pre-fill
                  id: itemToEdit.id, certificationName: itemToEdit.certificationName, otherCertificationName: itemToEdit.otherCertificationName,
                  provider: itemToEdit.provider, dateCompleted: itemToEdit.dateCompleted, expiryDate: itemToEdit.expiryDate,
                  hpcsaNumber: itemToEdit.hpcsaNumber, fileName: itemToEdit.fileName
              });
              setEditorMedicalFile(null);
              setIsMedicalEditorOpen(true);
          } else { cancelMedicalEditor(); }
      } else {
          setEditorMedicalData({}); // Start fresh
          setEditorMedicalFile(null);
          setIsMedicalEditorOpen(true);
      }
  };
  const handleMedicalInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setEditorMedicalData(prev => {
          const newState = { ...prev, [name]: value };
          // Clear other name if dropdown selection changes away from 'Other'
          if (name === 'certificationName' && value !== 'Other') {
              newState.otherCertificationName = '';
          }
          return newState;
      });
      setError(null);
  };
  const handleMedicalFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) { setEditorMedicalFile(e.target.files[0]); }
      else { setEditorMedicalFile(null); }
      setError(null);
  };
  const saveMedicalTraining = () => {
      // Validation
      const isOtherSelected = editorMedicalData.certificationName === 'Other';
      if (!editorMedicalData.certificationName) { setError("Please select the Training/Certification Name."); return; }
      if (isOtherSelected && !editorMedicalData.otherCertificationName?.trim()) { setError("Please specify the certification name when 'Other' is selected."); return; }
      if (!editorMedicalData.provider?.trim()) { setError("Training Provider is required."); return; }
      if (!editorMedicalData.dateCompleted) { setError("Date Completed is required."); return; }
      const existingFileName = editingMedicalId ? medicalTrainingList.find(i => i.id === editingMedicalId)?.fileName : undefined;
      if (!editorMedicalFile && !existingFileName) { setError("Certificate/Card Upload is required."); return; }
      if (editorMedicalData.expiryDate && editorMedicalData.dateCompleted && new Date(editorMedicalData.expiryDate) <= new Date(editorMedicalData.dateCompleted)) { setError("Expiry Date must be after the Date Completed."); return; }
      setError(null);

      // Prepare Data
      const trainingDataPayload: Omit<MedicalTraining, 'id'> = {
          certificationName: editorMedicalData.certificationName,
          otherCertificationName: isOtherSelected ? editorMedicalData.otherCertificationName?.trim() : undefined,
          provider: editorMedicalData.provider.trim(),
          dateCompleted: editorMedicalData.dateCompleted,
          expiryDate: editorMedicalData.expiryDate || undefined,
          hpcsaNumber: editorMedicalData.hpcsaNumber?.trim() || undefined,
          fileName: editorMedicalFile?.name || existingFileName,
      };

      // Update State
      if (editingMedicalId) {
          setMedicalTrainingList(prev => prev.map(item => item.id === editingMedicalId ? { ...item, ...trainingDataPayload } : item));
      } else {
          const newItem: MedicalTraining = { ...trainingDataPayload, id: Date.now().toString(), };
          setMedicalTrainingList(prev => [...prev, newItem]);
      }
      cancelMedicalEditor();
  };
  const cancelMedicalEditor = () => { setIsMedicalEditorOpen(false); setEditingMedicalId(null); setError(null); setEditorMedicalData({}); setEditorMedicalFile(null); };
  const removeMedicalTraining = (idToRemove: string) => {
      setMedicalTrainingList(prev => prev.filter(item => item.id !== idToRemove));
      if (editingMedicalId === idToRemove) { cancelMedicalEditor(); }
  };

  // Section 8 Handlers: K9 Training ---
  const openK9Editor = (id: string | null = null) => {
      setError(null);
      setEditingK9Id(id);
      if (id) {
          const itemToEdit = k9TrainingList.find(item => item.id === id);
          if (itemToEdit) {
              setEditorK9Data({ // Pre-fill
                  id: itemToEdit.id, certificationName: itemToEdit.certificationName, otherCertificationName: itemToEdit.otherCertificationName,
                  detectionType: itemToEdit.detectionType, provider: itemToEdit.provider, dateCompleted: itemToEdit.dateCompleted,
                  expiryDate: itemToEdit.expiryDate, fileName: itemToEdit.fileName
              });
              setEditorK9File(null);
              setIsK9EditorOpen(true);
          } else { cancelK9Editor(); }
      } else {
          setEditorK9Data({}); // Start fresh
          setEditorK9File(null);
          setIsK9EditorOpen(true);
      }
  };
  const handleK9InputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setEditorK9Data(prev => {
          const newState = { ...prev, [name]: value };
          // Clear other name if dropdown selection changes away from 'Other'
          if (name === 'certificationName' && value !== 'Other') {
              newState.otherCertificationName = '';
          }
           // Clear detection type if dropdown selection changes away from 'Detection...'
           if (name === 'certificationName' && value !== 'Detection Dog Handler (Specify Type)') {
              newState.detectionType = '';
          }
          return newState;
      });
      setError(null);
  };
  const handleK9FileChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) { setEditorK9File(e.target.files[0]); }
      else { setEditorK9File(null); }
      setError(null);
  };
  const saveK9Training = () => {
      // Validation
      const isOtherSelected = editorK9Data.certificationName === 'Other';
      const isDetectionSelected = editorK9Data.certificationName === 'Detection Dog Handler (Specify Type)';

      if (!editorK9Data.certificationName) { setError("Please select the Training/Certification Name."); return; }
      if (isOtherSelected && !editorK9Data.otherCertificationName?.trim()) { setError("Please specify the certification name when 'Other' is selected."); return; }
      if (isDetectionSelected && !editorK9Data.detectionType?.trim()) { setError("Please specify the Detection Type when 'Detection Dog Handler' is selected."); return; }
      if (!editorK9Data.provider?.trim()) { setError("Training Provider is required."); return; }
      if (!editorK9Data.dateCompleted) { setError("Date Completed is required."); return; }
      const existingFileName = editingK9Id ? k9TrainingList.find(i => i.id === editingK9Id)?.fileName : undefined;
      if (!editorK9File && !existingFileName) { setError("Certificate Upload is required."); return; }
      if (editorK9Data.expiryDate && editorK9Data.dateCompleted && new Date(editorK9Data.expiryDate) <= new Date(editorK9Data.dateCompleted)) { setError("Expiry Date must be after the Date Completed."); return; }
      setError(null);

      // Prepare Data
      const trainingDataPayload: Omit<K9Training, 'id'> = {
          certificationName: editorK9Data.certificationName,
          otherCertificationName: isOtherSelected ? editorK9Data.otherCertificationName?.trim() : undefined,
          detectionType: isDetectionSelected ? editorK9Data.detectionType?.trim() : undefined, // Only save if detection is selected
          provider: editorK9Data.provider.trim(),
          dateCompleted: editorK9Data.dateCompleted,
          expiryDate: editorK9Data.expiryDate || undefined,
          fileName: editorK9File?.name || existingFileName,
      };

      // Update State
      if (editingK9Id) {
          setK9TrainingList(prev => prev.map(item => item.id === editingK9Id ? { ...item, ...trainingDataPayload } : item));
      } else {
          const newItem: K9Training = { ...trainingDataPayload, id: Date.now().toString(), };
          setK9TrainingList(prev => [...prev, newItem]);
      }
      cancelK9Editor();
  };
  const cancelK9Editor = () => { setIsK9EditorOpen(false); setEditingK9Id(null); setError(null); setEditorK9Data({}); setEditorK9File(null); };
  const removeK9Training = (idToRemove: string) => {
      setK9TrainingList(prev => prev.filter(item => item.id !== idToRemove));
      if (editingK9Id === idToRemove) { cancelK9Editor(); }
  };

  // --- Section 9 Handlers: Computer Efficiency Training ---

  /** Opens the editor modal/view for adding or editing computer training. */
  const openComputerTrainingEditor = (id: string | null = null) => {
      setError(null); // Clear any previous errors
      setEditingComputerTrainingId(id);
      if (id) {
          // Editing existing item: Find it and pre-fill the editor form
          const itemToEdit = computerTrainingList.find(item => item.id === id);
          if (itemToEdit) {
              setEditorComputerTrainingData({
                  id: itemToEdit.id,
                  trainingArea: itemToEdit.trainingArea,
                  specificSkill: itemToEdit.specificSkill,
                  provider: itemToEdit.provider,
                  dateCompleted: itemToEdit.dateCompleted,
                  levelAchieved: itemToEdit.levelAchieved,
                  fileName: itemToEdit.fileName // Keep existing filename info for validation/display
              });
              setEditorComputerTrainingFile(null); // Reset file input
              setIsComputerTrainingEditorOpen(true);
          } else {
              console.error("Could not find Computer Training item to edit with ID:", id);
              cancelComputerTrainingEditor(); // Close editor if item not found
          }
      } else {
          // Adding new item: Reset editor form
          setEditorComputerTrainingData({}); // Start with empty data
          setEditorComputerTrainingFile(null);
          setIsComputerTrainingEditorOpen(true);
      }
  };

  /** Handles changes in the text inputs and select dropdown of the editor. */
  const handleComputerTrainingInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setEditorComputerTrainingData(prev => ({ ...prev, [name]: value }));
      setError(null); // Clear error on input change
  };

  /** Handles the file selection for the certificate upload. */
  const handleComputerTrainingFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setEditorComputerTrainingFile(e.target.files[0]);
      } else {
          setEditorComputerTrainingFile(null);
      }
      setError(null); // Clear error on file change
  };

  /** Saves the new or edited computer training item after validation. */
  const saveComputerTraining = () => {
      // --- Validation ---
      if (!editorComputerTrainingData.trainingArea) { setError("Please select the Training Area."); return; }
      if (!editorComputerTrainingData.specificSkill?.trim()) { setError("Specific Software / Skill Detail is required."); return; }
      if (!editorComputerTrainingData.provider?.trim()) { setError("Training Provider / Institution is required."); return; }
      if (!editorComputerTrainingData.dateCompleted) { setError("Date Completed is required."); return; }

      // File validation: Required for new entries, or if editing and no previous file exists.
      const existingFileName = editingComputerTrainingId
          ? computerTrainingList.find(i => i.id === editingComputerTrainingId)?.fileName
          : undefined;
      if (!editorComputerTrainingFile && !existingFileName) {
          // Use the spec's note: "Required (if applicable...)" - let's make it required here as per field spec
           setError("Certificate Upload is required.");
           return;
         // If truly optional sometimes, adjust logic:
         // console.warn("Computer Training certificate upload skipped.");
      }

      // --- Validation Passed ---
      setError(null);

      // --- Prepare Data Payload ---
      // Exclude 'id' when creating the payload, only include it for mapping during updates.
      const trainingDataPayload: Omit<ComputerTraining, 'id'> = {
          trainingArea: editorComputerTrainingData.trainingArea,
          specificSkill: editorComputerTrainingData.specificSkill.trim(),
          provider: editorComputerTrainingData.provider.trim(),
          dateCompleted: editorComputerTrainingData.dateCompleted,
          levelAchieved: editorComputerTrainingData.levelAchieved?.trim() || undefined, // Set to undefined if empty
          fileName: editorComputerTrainingFile?.name || existingFileName, // Use new filename or keep old one
      };

      // --- Update State ---
      if (editingComputerTrainingId) {
          // Update existing item
          setComputerTrainingList(prev =>
              prev.map(item =>
                  item.id === editingComputerTrainingId
                      ? { ...item, ...trainingDataPayload } // Spread existing item and overwrite with payload
                      : item
              )
          );
      } else {
          // Add new item
          const newItem: ComputerTraining = {
              ...trainingDataPayload,
              id: Date.now().toString(), // Generate a unique ID
          };
          setComputerTrainingList(prev => [...prev, newItem]);
      }

      // TODO: Handle the actual file upload (passing editorComputerTrainingFile up or handling elsewhere)
      cancelComputerTrainingEditor(); // Close and reset the editor
  };

  /** Closes the editor and resets its state variables. */
  const cancelComputerTrainingEditor = () => {
      setIsComputerTrainingEditorOpen(false);
      setEditingComputerTrainingId(null);
      setEditorComputerTrainingData({}); // Reset editor data
      setEditorComputerTrainingFile(null); // Reset file input state
      setError(null); // Clear any errors
  };

  /** Removes a computer training item from the list. */
  const removeComputerTraining = (idToRemove: string) => {
      setComputerTrainingList(prev => prev.filter(item => item.id !== idToRemove));
      // If the item being edited is removed, close the editor
      if (editingComputerTrainingId === idToRemove) {
          cancelComputerTrainingEditor();
      }
  };

  // --- Section 10 Handlers: Strikes and Riot Training ---

  /** Opens the editor modal/view for adding or editing Strikes/Riot training. */
  const openStrikesRiotEditor = (id: string | null = null) => {
      setError(null);
      setEditingStrikesRiotId(id);
      if (id) {
          const itemToEdit = strikesRiotTrainingList.find(item => item.id === id);
          if (itemToEdit) {
              setEditorStrikesRiotData({
                  id: itemToEdit.id,
                  trainingName: itemToEdit.trainingName,
                  otherName: itemToEdit.otherName,
                  provider: itemToEdit.provider,
                  dateCompleted: itemToEdit.dateCompleted,
                  expiryDate: itemToEdit.expiryDate,
                  fileName: itemToEdit.fileName
              });
              setEditorStrikesRiotFile(null);
              setIsStrikesRiotEditorOpen(true);
          } else {
              console.error("Could not find Strikes/Riot Training item to edit with ID:", id);
              cancelStrikesRiotEditor();
          }
      } else {
          setEditorStrikesRiotData({}); // Reset for adding
          setEditorStrikesRiotFile(null);
          setIsStrikesRiotEditorOpen(true);
      }
  };

  /** Handles changes in the editor inputs, including clearing 'Other Name' if dropdown changes. */
  const handleStrikesRiotInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setEditorStrikesRiotData(prev => {
          const newState = { ...prev, [name]: value };
          // Clear other name if dropdown selection changes away from 'Other'
          if (name === 'trainingName' && value !== 'Other') {
              newState.otherName = '';
          }
          return newState;
      });
      setError(null);
  };

  /** Handles the file selection for the certificate upload. */
  const handleStrikesRiotFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setEditorStrikesRiotFile(e.target.files[0]);
      } else {
          setEditorStrikesRiotFile(null);
      }
      setError(null);
  };

  /** Saves the new or edited Strikes/Riot training item after validation. */
  const saveStrikesRiotTraining = () => {
      // --- Validation ---
      const isOtherSelected = editorStrikesRiotData.trainingName === 'Other';
      if (!editorStrikesRiotData.trainingName) { setError("Please select the Training/Certification Name."); return; }
      if (isOtherSelected && !editorStrikesRiotData.otherName?.trim()) { setError("Please specify the training name when 'Other' is selected."); return; }
      if (!editorStrikesRiotData.provider?.trim()) { setError("Training Provider is required."); return; }
      if (!editorStrikesRiotData.dateCompleted) { setError("Date Completed is required."); return; }
      // File validation
      const existingFileName = editingStrikesRiotId
          ? strikesRiotTrainingList.find(i => i.id === editingStrikesRiotId)?.fileName
          : undefined;
      if (!editorStrikesRiotFile && !existingFileName) {
           setError("Certificate Upload is required.");
           return;
      }
      // Optional Expiry Date validation
      if (editorStrikesRiotData.expiryDate && editorStrikesRiotData.dateCompleted && new Date(editorStrikesRiotData.expiryDate) <= new Date(editorStrikesRiotData.dateCompleted)) {
          setError("Expiry Date must be after the Date Completed.");
          return;
      }
      setError(null);

      // --- Prepare Data Payload ---
      const trainingDataPayload: Omit<StrikesRiotTraining, 'id'> = {
          trainingName: editorStrikesRiotData.trainingName,
          otherName: isOtherSelected ? editorStrikesRiotData.otherName?.trim() : undefined,
          provider: editorStrikesRiotData.provider.trim(),
          dateCompleted: editorStrikesRiotData.dateCompleted,
          expiryDate: editorStrikesRiotData.expiryDate || undefined, // Handle empty string
          fileName: editorStrikesRiotFile?.name || existingFileName,
      };

      // --- Update State ---
      if (editingStrikesRiotId) {
          setStrikesRiotTrainingList(prev =>
              prev.map(item =>
                  item.id === editingStrikesRiotId
                      ? { ...item, ...trainingDataPayload }
                      : item
              )
          );
      } else {
          const newItem: StrikesRiotTraining = {
              ...trainingDataPayload,
              id: Date.now().toString(),
          };
          setStrikesRiotTrainingList(prev => [...prev, newItem]);
      }

      // TODO: Handle actual file upload
      cancelStrikesRiotEditor();
  };

  /** Closes the editor and resets its state variables. */
  const cancelStrikesRiotEditor = () => {
      setIsStrikesRiotEditorOpen(false);
      setEditingStrikesRiotId(null);
      setEditorStrikesRiotData({});
      setEditorStrikesRiotFile(null);
      setError(null);
  };

  /** Removes a Strikes/Riot training item from the list. */
  const removeStrikesRiotTraining = (idToRemove: string) => {
      setStrikesRiotTrainingList(prev => prev.filter(item => item.id !== idToRemove));
      if (editingStrikesRiotId === idToRemove) {
          cancelStrikesRiotEditor();
      }
  };

  // --- Section 11 Handlers: Security Technician Training ---

  /** Opens the editor for adding or editing Security Technician training. */
  const openSecurityTechnicianEditor = (id: string | null = null) => {
      setError(null);
      setEditingSecurityTechnicianId(id);
      if (id) {
          const itemToEdit = securityTechnicianTrainingList.find(item => item.id === id);
          if (itemToEdit) {
              setEditorSecurityTechnicianData({
                  id: itemToEdit.id,
                  technologyArea: itemToEdit.technologyArea,
                  specificSystem: itemToEdit.specificSystem,
                  provider: itemToEdit.provider,
                  dateCompleted: itemToEdit.dateCompleted,
                  expiryDate: itemToEdit.expiryDate,
                  registrationNumber: itemToEdit.registrationNumber,
                  fileName: itemToEdit.fileName
              });
              setEditorSecurityTechnicianFile(null);
              setIsSecurityTechnicianEditorOpen(true);
          } else {
              console.error("Could not find Security Technician Training item to edit with ID:", id);
              cancelSecurityTechnicianEditor();
          }
      } else {
          setEditorSecurityTechnicianData({}); // Reset for adding
          setEditorSecurityTechnicianFile(null);
          setIsSecurityTechnicianEditorOpen(true);
      }
  };

  /** Handles changes in the editor inputs for Section 11. */
  const handleSecurityTechnicianInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setEditorSecurityTechnicianData(prev => ({ ...prev, [name]: value }));
      setError(null);
  };

  /** Handles the file selection for the Section 11 certificate upload. */
  const handleSecurityTechnicianFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setEditorSecurityTechnicianFile(e.target.files[0]);
      } else {
          setEditorSecurityTechnicianFile(null);
      }
      setError(null);
  };

  /** Saves the new or edited Security Technician training item after validation. */
  const saveSecurityTechnicianTraining = () => {
      // --- Validation ---
      if (!editorSecurityTechnicianData.technologyArea) { setError("Please select the Technology Area."); return; }
      if (!editorSecurityTechnicianData.specificSystem?.trim()) { setError("Specific System/Certification is required."); return; }
      if (!editorSecurityTechnicianData.provider?.trim()) { setError("Provider / Issuing Body is required."); return; }
      if (!editorSecurityTechnicianData.dateCompleted) { setError("Date Completed is required."); return; }
      // File validation
      const existingFileName = editingSecurityTechnicianId
          ? securityTechnicianTrainingList.find(i => i.id === editingSecurityTechnicianId)?.fileName
          : undefined;
      if (!editorSecurityTechnicianFile && !existingFileName) {
           setError("Certificate/Proof Upload is required.");
           return;
      }
      // Optional Expiry Date validation
      if (editorSecurityTechnicianData.expiryDate && editorSecurityTechnicianData.dateCompleted && new Date(editorSecurityTechnicianData.expiryDate) <= new Date(editorSecurityTechnicianData.dateCompleted)) {
          setError("Expiry Date must be after the Date Completed.");
          return;
      }
      setError(null);

      // --- Prepare Data Payload ---
      const trainingDataPayload: Omit<SecurityTechnicianTraining, 'id'> = {
          technologyArea: editorSecurityTechnicianData.technologyArea,
          specificSystem: editorSecurityTechnicianData.specificSystem.trim(),
          provider: editorSecurityTechnicianData.provider.trim(),
          dateCompleted: editorSecurityTechnicianData.dateCompleted,
          expiryDate: editorSecurityTechnicianData.expiryDate || undefined,
          registrationNumber: editorSecurityTechnicianData.registrationNumber?.trim() || undefined,
          fileName: editorSecurityTechnicianFile?.name || existingFileName,
      };

      // --- Update State ---
      if (editingSecurityTechnicianId) {
          setSecurityTechnicianTrainingList(prev =>
              prev.map(item =>
                  item.id === editingSecurityTechnicianId
                      ? { ...item, ...trainingDataPayload }
                      : item
              )
          );
      } else {
          const newItem: SecurityTechnicianTraining = {
              ...trainingDataPayload,
              id: Date.now().toString(),
          };
          setSecurityTechnicianTrainingList(prev => [...prev, newItem]);
      }

      // TODO: Handle actual file upload
      cancelSecurityTechnicianEditor();
  };

  /** Closes the editor and resets its state variables for Section 11. */
  const cancelSecurityTechnicianEditor = () => {
      setIsSecurityTechnicianEditorOpen(false);
      setEditingSecurityTechnicianId(null);
      setEditorSecurityTechnicianData({});
      setEditorSecurityTechnicianFile(null);
      setError(null);
  };

  /** Removes a Security Technician training item from the list. */
  const removeSecurityTechnicianTraining = (idToRemove: string) => {
      setSecurityTechnicianTrainingList(prev => prev.filter(item => item.id !== idToRemove));
      if (editingSecurityTechnicianId === idToRemove) {
          cancelSecurityTechnicianEditor();
      }
  };

  // --- Section 12 Handlers: Other Skills, Licenses & Certifications (Corrected) ---

  /** Handles changes in the inline input fields for a new qualification. */
  const handleNewQualificationInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setNewQualification(prev => ({ ...prev, [name]: value }));
      setOtherError(null); // Clear error on input change
  };

  /** Handles file selection for the inline 'Other Qualification' input. */
  const handleNewQualificationFileChange = (e: ChangeEvent<HTMLInputElement>) => { // <-- ADDED HANDLER
      if (e.target.files && e.target.files[0]) {
          setNewQualificationFile(e.target.files[0]);
      } else {
          setNewQualificationFile(null);
      }
      setOtherError(null); // Clear error on file change
  };

  /** Validates and adds the qualification from the inline fields to the list. */
  const addOtherQualification = () => {
      // Validation
      if (!newQualification.name.trim()) {
          setOtherError("Skill/License/Certification Name is required.");
          return;
      }
      if (!newQualification.authority.trim()) {
          setOtherError("Issuing Authority/Organization is required.");
          return;
      }
       // File validation - Now mandatory per clarification
      if (!newQualificationFile) {
          setOtherError("Certificate/Proof upload is required for all qualifications.");
          return;
      }

      setOtherError(null); // Clear error if validation passes

      // Create and add the new item
      const newItem: OtherQualification = {
          id: Date.now().toString(),
          name: newQualification.name.trim(),
          authority: newQualification.authority.trim(),
          certNumber: newQualification.certNumber?.trim() || undefined,
          expiryDate: newQualification.expiryDate || undefined,
          fileName: newQualificationFile.name, // <-- ADDED fileName from state
      };
      setOtherQualifications(prev => [...prev, newItem]);

      // Reset the inline input fields AND the file input state
      setNewQualification({ name: '', authority: '', certNumber: '', expiryDate: '' });
      setNewQualificationFile(null); // <-- ADDED Reset file state
      // Clear the actual file input element visually (requires referencing the input element, tricky without direct ref - often better handled by framework form libraries or key prop changes)
      // Simple approach: User sees the state is cleared, next interaction will use empty state.
  };

  /** Removes an item from the 'Other Qualifications' list. */
  const removeOtherQualification = (idToRemove: string) => {
      setOtherQualifications(prev => prev.filter(item => item.id !== idToRemove));
  };

  // --- Render Functions --- (Ensuring full bodies are present)
  const renderDisclaimer = (): JSX.Element => ( <div className="border rounded-md p-4 bg-gray-50 shadow-sm"> <h3 className="text-lg font-medium text-gray-900 mb-2">Qualifications Disclaimer</h3> <p className="text-sm text-gray-700 mb-4"> Please ensure all qualification information provided is accurate and can be verified. You may be required to provide supporting documentation for any qualifications, licenses, or certifications listed in this section during the verification process. Providing false information may lead to disqualification or termination. </p> <button type="button" onClick={handleAcceptDisclaimer} className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"> I Understand and Accept </button> </div> );
  const renderBasicEducationEditor = (): JSX.Element => ( <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 shadow-sm animate-fade-in"> <h4 className="text-md font-medium text-gray-900 mb-3">Add Education Details</h4> <div className="space-y-4"> <div> <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">School/Institution *</label> <input id="school" type="text" value={editorSchool} onChange={(e) => { setEditorSchool(e.target.value); setError(null); }} className="input-class" placeholder="Enter school or institution name" required /> </div> <div> <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year Completed *</label> <input id="year" type="text" value={editorYear} onChange={(e) => { setEditorYear(e.target.value); setError(null); }} className="input-class" placeholder="Enter 4-digit year (e.g., 2010)" maxLength={4} required /> </div> <div> <label htmlFor="basicEdCertificate" className="block text-sm font-medium text-gray-700 mb-1"> Upload Certificate (Optional) {basicEducationDetails?.fileName && !editorFile && ` (Current: ${basicEducationDetails.fileName})`} </label> <input id="basicEdCertificate" type="file" onChange={handleBasicEducationFileChange} className="file-input-class" accept=".pdf,.jpg,.jpeg,.png" /> {editorFile && <p className="mt-1 text-xs text-gray-500">Selected: {editorFile.name}</p>} <p className="mt-1 text-xs text-gray-500">Accepted formats: PDF, JPG, PNG (max 5MB)</p> </div> {error && <p className="text-sm text-red-600 mt-2">{error}</p>} <div className="flex justify-end space-x-3 mt-4"> <button type="button" onClick={cancelBasicEducationEditor} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"> Cancel </button> <button type="button" onClick={saveBasicEducationDetails} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md shadow-sm text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"> Save Details </button> </div> </div> </div> );
  const renderBasicEducationSummary = (): JSX.Element => ( <div className="mt-4 p-3 border border-gray-200 rounded-md bg-white shadow-sm"> <div className="flex justify-between items-start"> <div className="text-sm"> <p><span className="font-medium text-gray-700">School:</span> {basicEducationDetails?.school}</p> <p><span className="font-medium text-gray-700">Year Completed:</span> {basicEducationDetails?.year}</p> {basicEducationDetails?.fileName && <p className="text-xs text-gray-500 mt-1"> File: {basicEducationDetails.fileName} </p> } {!basicEducationDetails?.fileName && <p className="text-xs text-gray-500 italic mt-1"> No certificate uploaded. </p> } </div> <button type="button" onClick={openBasicEducationEditor} className="ml-4 p-1 text-indigo-600 hover:text-indigo-800" aria-label="Edit Basic Education Details">
  <span>{FaEdit({ size: 16 })}</span>
</button> </div> </div> );
  const renderTertiaryEditor = (): JSX.Element => ( <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 shadow-sm animate-fade-in mb-4"> <h4 className="text-md font-medium text-gray-900 mb-3"> {editingTertiaryId ? 'Edit Tertiary Qualification' : 'Add Tertiary Qualification'} </h4> <div className="space-y-4"> <div> <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Qualification Type *</label> <select id="type" name="type" value={editorTertiaryData.type} onChange={handleTertiaryEditorInputChange} className="select-class" required> <option value="" disabled>Select a qualification type</option> {tertiaryQualificationTypeOptions.map(type => (<option key={type} value={type}>{type}</option>))} </select> </div> <div> <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">Institution *</label> <input type="text" id="institution" name="institution" value={editorTertiaryData.institution} onChange={handleTertiaryEditorInputChange} required className="input-class" placeholder="Enter institution name"/> </div> <div> <label htmlFor="qualificationName" className="block text-sm font-medium text-gray-700 mb-1">Qualification Name *</label> <input type="text" id="qualificationName" name="qualificationName" value={editorTertiaryData.qualificationName} onChange={handleTertiaryEditorInputChange} required className="input-class" placeholder="e.g., B.Com Accounting"/> </div> <div> <label htmlFor="yearCompleted" className="block text-sm font-medium text-gray-700 mb-1">Year Completed *</label> <input type="text" id="yearCompleted" name="yearCompleted" value={editorTertiaryData.yearCompleted} onChange={handleTertiaryEditorInputChange} required maxLength={4} className="input-class" placeholder="Enter 4-digit year"/> </div> <div> <label htmlFor="nqfLevel" className="block text-sm font-medium text-gray-700 mb-1">NQF Level (Optional)</label> <input type="text" id="nqfLevel" name="nqfLevel" value={editorTertiaryData.nqfLevel || ''} onChange={handleTertiaryEditorInputChange} className="input-class" placeholder="e.g., 7"/> </div> <div> <label htmlFor="unitStandardName" className="block text-sm font-medium text-gray-700 mb-1">Unit Standard Title (Optional)</label> <input type="text" id="unitStandardName" name="unitStandardName" value={editorTertiaryData.unitStandardName || ''} onChange={handleTertiaryEditorInputChange} className="input-class"/> </div> <div> <label htmlFor="unitStandardCode" className="block text-sm font-medium text-gray-700 mb-1">Unit Standard Code (Optional)</label> <input type="text" id="unitStandardCode" name="unitStandardCode" value={editorTertiaryData.unitStandardCode || ''} onChange={handleTertiaryEditorInputChange} className="input-class"/> </div> <div> <label htmlFor="tertiaryFile" className="block text-sm font-medium text-gray-700 mb-1"> Upload Certificate (Optional) {(editingTertiaryId && tertiaryEducation.find(i => i.id === editingTertiaryId)?.fileName && !editorTertiaryFile) && ` (Current: ${tertiaryEducation.find(i => i.id === editingTertiaryId)?.fileName})`} </label> <input id="tertiaryFile" type="file" onChange={handleTertiaryEditorFileChange} className="file-input-class" accept=".pdf,.jpg,.jpeg,.png"/> {editorTertiaryFile && <p className="mt-1 text-xs text-gray-500">Selected: {editorTertiaryFile.name}</p>} <p className="mt-1 text-xs text-gray-500">Accepted formats: PDF, JPG, PNG (max 5MB)</p> </div> {error && <p className="text-sm text-red-600 mt-2">{error}</p>} <div className="flex justify-end space-x-3 mt-4"> <button type="button" onClick={cancelTertiaryEditor} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button> <button type="button" onClick={saveTertiaryQualification} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md shadow-sm text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">{editingTertiaryId ? 'Update' : 'Save'} Qualification</button> </div> </div> </div> );
  const renderTertiarySummaryList = (): JSX.Element => ( <div className="mt-4 space-y-4"> {tertiaryEducation.length > 0 && <h4 className="text-sm font-medium text-gray-600">Added Qualifications:</h4>} {tertiaryEducation.length > 0 ? ( <div className="space-y-3"> {tertiaryEducation.map(item => ( <div key={item.id} className="p-3 border border-gray-200 rounded-md bg-white shadow-sm"> <div className="flex justify-between items-start gap-4"> <div className="text-sm flex-grow"> <p className="font-medium text-gray-900">{item.qualificationName}</p> <p className="text-gray-600">{item.type} - {item.institution}</p> <p className="text-gray-600">Year: {item.yearCompleted}</p> {item.nqfLevel && <p className="text-xs text-gray-500">NQF: {item.nqfLevel}</p>} {item.unitStandardName && <p className="text-xs text-gray-500">Unit Std: {item.unitStandardName} {item.unitStandardCode && `(${item.unitStandardCode})`}</p>} {item.fileName && <p className="text-xs text-gray-500 mt-1">File: {item.fileName}</p>} {!item.fileName && <p className="text-xs text-gray-500 italic mt-1">No certificate uploaded.</p>} </div> <div className="flex space-x-2 flex-shrink-0"> <button type="button" onClick={() => openTertiaryEditor(item.id)} className="p-1 text-indigo-600 hover:text-indigo-800" aria-label={`Edit ${item.qualificationName}`}> <span>{FaEdit({ size: 16 })}</span> </button> <button type="button" onClick={() => removeTertiaryQualification(item.id)} className="p-1 text-red-600 hover:text-red-800" aria-label={`Remove ${item.qualificationName}`}> <span>{FaTrash({ size: 16 })}</span> </button> </div> </div> </div> ))} </div> ) : ( <p className="text-sm text-gray-500 italic mb-4">No tertiary qualifications added yet.</p> )} <div className="flex justify-start pt-2"> <button type="button" onClick={() => openTertiaryEditor()} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"> + Add Tertiary Qualification </button> </div> </div> );
  // Section 4 Render Functions
  const renderLicenceEditor = (): JSX.Element => ( <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 shadow-sm animate-fade-in"> <h4 className="text-md font-medium text-gray-900 mb-3">Driver's Licence Details</h4> <div className="space-y-4"> <div> <label htmlFor="licenceCode" className="block text-sm font-medium text-gray-700 mb-1">Licence Code *</label> <select id="licenceCode" name="code" value={editorLicenceData.code} onChange={handleLicenceEditorInputChange} className="select-class" required> <option value="" disabled>Select code...</option> {licenceCodeOptions.map(code => ( <option key={code} value={code}>{code}</option> ))} </select> </div> <div> <label htmlFor="licenceIssueDate" className="block text-sm font-medium text-gray-700 mb-1">Issue Date *</label> <input id="licenceIssueDate" name="issueDate" type="date" value={editorLicenceData.issueDate} onChange={handleLicenceEditorInputChange} className="input-class" required/> </div> <div> <label htmlFor="licenceExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label> <input id="licenceExpiryDate" name="expiryDate" type="date" value={editorLicenceData.expiryDate} onChange={handleLicenceEditorInputChange} className="input-class" required/> </div> <div> <label htmlFor="frontFile" className="block text-sm font-medium text-gray-700 mb-1"> Upload Licence (Front) * {driversLicenceDetails?.frontFileName && !editorLicenceFrontFile && `(Current: ${driversLicenceDetails.frontFileName})`} </label> <input id="frontFile" type="file" onChange={handleLicenceFileChange(setEditorLicenceFrontFile)} className="file-input-class" accept=".pdf,.jpg,.jpeg,.png"/> {editorLicenceFrontFile && <p className="mt-1 text-xs text-gray-500">Selected: {editorLicenceFrontFile.name}</p>} {!editorLicenceFrontFile && !driversLicenceDetails?.frontFileName && <p className="mt-1 text-xs text-red-500">Required.</p>} <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG (Max 5MB)</p> </div> <div> <label htmlFor="backFile" className="block text-sm font-medium text-gray-700 mb-1"> Upload Licence (Back) * {driversLicenceDetails?.backFileName && !editorLicenceBackFile && `(Current: ${driversLicenceDetails.backFileName})`} </label> <input id="backFile" type="file" onChange={handleLicenceFileChange(setEditorLicenceBackFile)} className="file-input-class" accept=".pdf,.jpg,.jpeg,.png"/> {editorLicenceBackFile && <p className="mt-1 text-xs text-gray-500">Selected: {editorLicenceBackFile.name}</p>} {!editorLicenceBackFile && !driversLicenceDetails?.backFileName && <p className="mt-1 text-xs text-red-500">Required.</p>} <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG (Max 5MB)</p> </div> {error && <p className="text-sm text-red-600 mt-2">{error}</p>} <div className="flex justify-end space-x-3 mt-4"> <button type="button" onClick={cancelLicenceEditor} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"> Cancel </button> <button type="button" onClick={saveLicenceDetails} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md shadow-sm text-sm hover:bg-indigo-700"> Save Details </button> </div> </div> </div> );
  const renderLicenceSummary = (): JSX.Element => ( <div className="mt-4 p-3 border border-gray-200 rounded-md bg-white shadow-sm"> <div className="flex justify-between items-start"> <div className="text-sm"> <p><span className="font-medium text-gray-700">Code:</span> {driversLicenceDetails?.code}</p> <p><span className="font-medium text-gray-700">Issued:</span> {driversLicenceDetails?.issueDate} | <span className="font-medium text-gray-700">Expires:</span> {driversLicenceDetails?.expiryDate}</p> <p className="text-xs text-gray-500 mt-1"> Front: {driversLicenceDetails?.frontFileName ? driversLicenceDetails.frontFileName : <span className="text-red-500 italic">Missing</span>} </p> <p className="text-xs text-gray-500"> Back: {driversLicenceDetails?.backFileName ? driversLicenceDetails.backFileName : <span className="text-red-500 italic">Missing</span>} </p> </div> <button type="button" onClick={openLicenceEditor} className="ml-4 p-1 text-indigo-600 hover:text-indigo-800" aria-label="Edit Licence Details">
  <span>{FaEdit({ size: 16 })}</span>
</button> </div> </div> );
  const renderPrdpEditor = (): JSX.Element => ( <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 shadow-sm animate-fade-in"> <h4 className="text-md font-medium text-gray-900 mb-3">PrDP Details</h4> <div className="space-y-4"> <div> <label className="block text-sm font-medium text-gray-700 mb-2">PrDP Categories Held *</label> <div className="space-y-1"> {prdpCategoryOptions.map(category => ( <label key={category} className="flex items-center"> <input type="checkbox" value={category} checked={editorPrdpData.categories.includes(category)} onChange={handlePrdpCategoryChange} className="form-checkbox h-4 w-4 text-indigo-600 checkbox-class"/> <span className="ml-2 text-sm text-gray-700">{category}</span> </label> ))} </div> </div> <div> <label htmlFor="prdpExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">PrDP Expiry Date *</label> <input id="prdpExpiryDate" name="expiryDate" type="date" value={editorPrdpData.expiryDate} onChange={handlePrdpEditorInputChange} className="input-class" required/> </div> {error && <p className="text-sm text-red-600 mt-2">{error}</p>} <div className="flex justify-end space-x-3 mt-4"> <button type="button" onClick={cancelPrdpEditor} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"> Cancel </button> <button type="button" onClick={savePrdpDetails} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md shadow-sm text-sm hover:bg-indigo-700"> Save Details </button> </div> </div> </div> );
  const renderPrdpSummary = (): JSX.Element => ( <div className="mt-4 p-3 border border-gray-200 rounded-md bg-white shadow-sm"> <div className="flex justify-between items-start"> <div className="text-sm"> <p><span className="font-medium text-gray-700">Categories:</span> {prdpDetails?.categories?.join(', ') || 'None Selected'}</p> <p><span className="font-medium text-gray-700">Expiry Date:</span> {prdpDetails?.expiryDate}</p> </div> <button type="button" onClick={openPrdpEditor} className="ml-4 p-1 text-indigo-600 hover:text-indigo-800" aria-label="Edit PrDP Details"> <span>{FaEdit({ size: 16 })}</span> </button> </div> </div> );
  const renderDriverTrainingEditor = (): JSX.Element => ( <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 shadow-sm animate-fade-in mb-4"> <h4 className="text-md font-medium text-gray-900 mb-3"> {editingDriverTrainingId ? 'Edit Driver Training' : 'Add Driver Training'} </h4> <div className="space-y-4"> <div> <label htmlFor="driverTrainingName" className="block text-sm font-medium text-gray-700 mb-1">Training Type *</label> <select id="driverTrainingName" name="trainingName" value={editorDriverTrainingData.trainingName} onChange={handleDriverTrainingInputChange} className="select-class" required> <option value="" disabled>Select training type</option> {commonDriverTrainingOptions.map(type => ( <option key={type} value={type}>{type}</option> ))} </select> </div> {editorDriverTrainingData.trainingName === 'Other' && ( <div> <label htmlFor="otherTrainingName" className="block text-sm font-medium text-gray-700 mb-1">Specify Other Training *</label> <input id="otherTrainingName" name="otherTrainingName" type="text" value={editorDriverTrainingData.otherTrainingName || ''} onChange={handleDriverTrainingInputChange} required className="input-class" placeholder="Enter training name" /> </div> )} <div> <label htmlFor="driverTrainingProvider" className="block text-sm font-medium text-gray-700 mb-1">Training Provider *</label> <input id="driverTrainingProvider" name="provider" type="text" value={editorDriverTrainingData.provider} onChange={handleDriverTrainingInputChange} required className="input-class" placeholder="Enter provider name" /> </div> <div> <label htmlFor="driverTrainingDateCompleted" className="block text-sm font-medium text-gray-700 mb-1">Date Completed *</label> <input id="driverTrainingDateCompleted" name="dateCompleted" type="date" value={editorDriverTrainingData.dateCompleted} onChange={handleDriverTrainingInputChange} required className="input-class" /> </div> <div> <label htmlFor="unitStandardTitle" className="block text-sm font-medium text-gray-700 mb-1">Unit Standard Title (Optional)</label> <input id="unitStandardTitle" name="unitStandardTitle" type="text" value={editorDriverTrainingData.unitStandardTitle || ''} onChange={handleDriverTrainingInputChange} className="input-class"/> </div> <div> <label htmlFor="unitStandardId" className="block text-sm font-medium text-gray-700 mb-1">Unit Standard ID (Optional)</label> <input id="unitStandardId" name="unitStandardId" type="text" value={editorDriverTrainingData.unitStandardId || ''} onChange={handleDriverTrainingInputChange} className="input-class"/> </div> <div> <label htmlFor="trainingFile" className="block text-sm font-medium text-gray-700 mb-1"> Upload Certificate (Optional) {(editingDriverTrainingId && driverTrainingList.find(i => i.id === editingDriverTrainingId)?.fileName && !editorDriverTrainingFile) && ` (Current: ${driverTrainingList.find(i => i.id === editingDriverTrainingId)?.fileName})`} </label> <input id="trainingFile" type="file" onChange={handleDriverTrainingFileChange} className="file-input-class" accept=".pdf,.jpg,.jpeg,.png"/> {editorDriverTrainingFile && <p className="mt-1 text-xs text-gray-500">Selected: {editorDriverTrainingFile.name}</p>} <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG (Max 5MB)</p> </div> {error && <p className="text-sm text-red-600 mt-2">{error}</p>} <div className="flex justify-end space-x-3 mt-4"> <button type="button" onClick={cancelDriverTrainingEditor} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"> Cancel </button> <button type="button" onClick={saveDriverTraining} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md shadow-sm text-sm hover:bg-indigo-700"> {editingDriverTrainingId ? 'Update' : 'Save'} Training </button> </div> </div> </div> );
  const renderDriverTrainingSummaryList = (): JSX.Element => ( <div className="mt-4 space-y-4"> {driverTrainingList.length > 0 && <h4 className="text-sm font-medium text-gray-600">Added Training:</h4>} {driverTrainingList.length > 0 ? ( <div className="space-y-3"> {driverTrainingList.map(item => { const displayName = item.trainingName === 'Other' ? item.otherTrainingName : item.trainingName; return ( <div key={item.id} className="p-3 border border-gray-200 rounded-md bg-white shadow-sm"> <div className="flex justify-between items-start gap-4"> <div className="text-sm flex-grow"> <p className="font-medium text-gray-900">{displayName}</p> <p className="text-gray-600">Provider: {item.provider}</p> <p className="text-gray-600">Completed: {item.dateCompleted}</p> {item.unitStandardTitle && <p className="text-xs text-gray-500">Unit Std: {item.unitStandardTitle} {item.unitStandardId && `(${item.unitStandardId})`}</p>} {item.fileName && <p className="text-xs text-gray-500 mt-1">File: {item.fileName}</p>} {!item.fileName && <p className="text-xs text-gray-500 italic mt-1">No certificate uploaded.</p>} </div> <div className="flex space-x-2 flex-shrink-0"> <button type="button" onClick={() => openDriverTrainingEditor(item.id)} className="p-1 text-indigo-600 hover:text-indigo-800" aria-label={`Edit ${displayName}`}> <span>{FaEdit({ size: 16 })}</span> </button> <button type="button" onClick={() => removeDriverTraining(item.id)} className="p-1 text-red-600 hover:text-red-800" aria-label={`Remove ${displayName}`}> <span>{FaTrash({ size: 16 })}</span> </button> </div> </div> </div> ); })} </div> ) : ( <p className="text-sm text-gray-500 italic mb-4">No additional driver training added yet.</p> )} <div className="flex justify-start pt-2"> <button type="button" onClick={() => openDriverTrainingEditor()} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"> + Add Driver Training </button> </div> </div> );
 // Section 5 Render Functions
  const renderPsiraDetailsEditor = (): JSX.Element => (
    <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 shadow-sm animate-fade-in">
      <h4 className="text-md font-medium text-gray-900 mb-3">PSIRA Registration Details</h4>
      <div className="space-y-4">
        <div> <label htmlFor="psiraNumber" className="block text-sm font-medium text-gray-700 mb-1">PSIRA Number *</label> <input id="psiraNumber" name="psiraNumber" type="text" value={editorPsiraData.psiraNumber} onChange={handlePsiraDetailsInputChange} className="input-class" placeholder="Enter your PSIRA number" required/> </div>
        <div> <label htmlFor="psiraTrainingProvider" className="block text-sm font-medium text-gray-700 mb-1">Training Provider (for highest grade) *</label> <input id="psiraTrainingProvider" name="trainingProvider" type="text" value={editorPsiraData.trainingProvider} onChange={handlePsiraDetailsInputChange} className="input-class" placeholder="Enter training provider name" required/> </div>
        <div> <label htmlFor="psiraIssueDate" className="block text-sm font-medium text-gray-700 mb-1">Registration Issue Date *</label> <input id="psiraIssueDate" name="issueDate" type="date" value={editorPsiraData.issueDate} onChange={handlePsiraDetailsInputChange} className="input-class" required/> </div>
        <div> <label htmlFor="psiraExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">Registration Expiry Date *</label> <input id="psiraExpiryDate" name="expiryDate" type="date" value={editorPsiraData.expiryDate} onChange={handlePsiraDetailsInputChange} className="input-class" required/> </div>
        <div> <label htmlFor="psiraFile" className="block text-sm font-medium text-gray-700 mb-1"> Upload Certificate/Card Copy * {psiraDetails?.fileName && !editorPsiraFile && `(Current: ${psiraDetails.fileName})`} </label> <input id="psiraFile" type="file" onChange={handlePsiraDetailsFileChange} className="file-input-class" accept=".pdf,.jpg,.jpeg,.png"/> {editorPsiraFile && <p className="mt-1 text-xs text-gray-500">Selected: {editorPsiraFile.name}</p>} {!editorPsiraFile && !psiraDetails?.fileName && <p className="mt-1 text-xs text-red-500">Required.</p>} <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG (Max 5MB)</p> </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        <div className="flex justify-end space-x-3 mt-4"> <button type="button" onClick={cancelPsiraDetailsEditor} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"> Cancel </button> <button type="button" onClick={savePsiraDetails} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md shadow-sm text-sm hover:bg-indigo-700"> Save Details </button> </div>
      </div>
    </div>
  ); // Make sure semicolon is outside parenthesis

  const renderPsiraDetailsSummary = (): JSX.Element => (
    <div className="mt-4 p-3 border border-gray-200 rounded-md bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div className="text-sm">
          <p><span className="font-medium text-gray-700">Grade:</span> {highestPsiraGrade}</p>
          <p><span className="font-medium text-gray-700">PSIRA No:</span> {psiraDetails?.psiraNumber}</p>
          <p><span className="font-medium text-gray-700">Expires:</span> {psiraDetails?.expiryDate}</p>
          <p className="text-xs text-gray-500 mt-1"> File: {psiraDetails?.fileName ? psiraDetails.fileName : <span className="text-red-500 italic">Missing</span>} </p>
        </div>
        <button type="button" onClick={openPsiraDetailsEditor} className="ml-4 p-1 text-indigo-600 hover:text-indigo-800" aria-label="Edit PSIRA Details"> <FaEdit size={16} /> </button>
      </div>
    </div>
  ); // Make sure semicolon is outside parenthesis

  const renderSpecialisedPsiraEditor = (): JSX.Element => (
    <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 shadow-sm animate-fade-in mb-4">
      <h4 className="text-md font-medium text-gray-900 mb-3"> {editingSpecialisedPsiraId ? 'Edit Specialised Qualification' : 'Add Specialised Qualification'} </h4>
      <div className="space-y-4">
        <div> <label htmlFor="specialisedQualName" className="block text-sm font-medium text-gray-700 mb-1">Qualification Name *</label> <select id="specialisedQualName" name="qualificationName" value={editorSpecialisedPsiraData.qualificationName} onChange={handleSpecialisedPsiraInputChange} className="select-class" required> <option value="" disabled>Select type...</option> {specialisedPsiraOptions.map(type => ( <option key={type} value={type}>{type}</option> ))} </select> </div>
        {editorSpecialisedPsiraData.qualificationName === 'Other' && ( <div> <label htmlFor="otherSpecialisedQualName" className="block text-sm font-medium text-gray-700 mb-1">Please Specify *</label> <input id="otherSpecialisedQualName" name="otherQualificationName" type="text" value={editorSpecialisedPsiraData.otherQualificationName || ''} onChange={handleSpecialisedPsiraInputChange} required className="input-class" placeholder="Enter other qualification name"/> </div> )}
        <div> <label htmlFor="specialisedPsiraProvider" className="block text-sm font-medium text-gray-700 mb-1">Training Provider / Institution *</label> <input id="specialisedPsiraProvider" name="provider" type="text" value={editorSpecialisedPsiraData.provider} onChange={handleSpecialisedPsiraInputChange} required className="input-class" placeholder="Enter provider name"/> </div>
        <div> <label htmlFor="specialisedPsiraDateCompleted" className="block text-sm font-medium text-gray-700 mb-1">Date Completed / Issued *</label> <input id="specialisedPsiraDateCompleted" name="dateCompleted" type="date" value={editorSpecialisedPsiraData.dateCompleted} onChange={handleSpecialisedPsiraInputChange} required className="input-class"/> </div>
        <div> <label htmlFor="specialisedPsiraExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label> <input id="specialisedPsiraExpiryDate" name="expiryDate" type="date" value={editorSpecialisedPsiraData.expiryDate || ''} onChange={handleSpecialisedPsiraInputChange} className="input-class"/> </div>
        <div> <label htmlFor="specialisedPsiraFile" className="block text-sm font-medium text-gray-700 mb-1"> Upload Certificate * {(editingSpecialisedPsiraId && specialisedPsiraList.find(i => i.id === editingSpecialisedPsiraId)?.fileName && !editorSpecialisedPsiraFile) && ` (Current: ${specialisedPsiraList.find(i => i.id === editingSpecialisedPsiraId)?.fileName})`} </label> <input id="specialisedPsiraFile" type="file" onChange={handleSpecialisedPsiraFileChange} className="file-input-class" accept=".pdf,.jpg,.jpeg,.png"/> {editorSpecialisedPsiraFile && <p className="mt-1 text-xs text-gray-500">Selected: {editorSpecialisedPsiraFile.name}</p>} <p className="mt-1 text-xs text-gray-500"> Required. PDF, JPG, PNG (Max 5MB). </p> {!(editingSpecialisedPsiraId && specialisedPsiraList.find(i => i.id === editingSpecialisedPsiraId)?.fileName) && !editorSpecialisedPsiraFile && <p className="mt-1 text-xs text-red-500">File upload is required.</p> } </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        <div className="flex justify-end space-x-3 mt-4"> <button type="button" onClick={cancelSpecialisedPsiraEditor} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"> Cancel </button> <button type="button" onClick={saveSpecialisedPsiraQualification} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md shadow-sm text-sm hover:bg-indigo-700"> {editingSpecialisedPsiraId ? 'Save Changes' : 'Save Qualification'} </button> </div>
      </div>
    </div>
  ); // Make sure semicolon is outside parenthesis

  const renderSpecialisedPsiraSummaryList = (): JSX.Element => (
    <div className="mt-4 space-y-4">
      {specialisedPsiraList.length > 0 && <h4 className="text-sm font-medium text-gray-600">Added Qualifications:</h4>}
      {specialisedPsiraList.length > 0 ? (
        <div className="space-y-3"> {specialisedPsiraList.map(item => { const displayName = item.qualificationName === 'Other' ? item.otherQualificationName : item.qualificationName; return ( <div key={item.id} className="p-3 border border-gray-200 rounded-md bg-white shadow-sm"> <div className="flex justify-between items-start gap-4"> <div className="text-sm flex-grow"> <p className="font-medium text-gray-900">{displayName}</p> <p className="text-gray-600">Provider: {item.provider}</p> <p className="text-gray-600"> Completed: {item.dateCompleted} {item.expiryDate && `| Expires: ${item.expiryDate}`} </p> <p className="text-xs text-gray-500 mt-1"> File: {item.fileName ? item.fileName : <span className="text-red-500 italic">Missing</span>} </p> </div> <div className="flex space-x-2 flex-shrink-0"> <button type="button" onClick={() => openSpecialisedPsiraEditor(item.id)} className="p-1 text-indigo-600 hover:text-indigo-800" aria-label={`Edit ${displayName}`}> <span>{FaEdit({ size: 16 })}</span> </button> <button type="button" onClick={() => removeSpecialisedPsiraQualification(item.id)} className="p-1 text-red-600 hover:text-red-800" aria-label={`Remove ${displayName}`}> <span>{FaTrash({ size: 16 })}</span> </button> </div> </div> </div> ); })} </div>
      ) : ( <p className="text-sm text-gray-500 italic mb-4">No specialised PSIRA qualifications added yet.</p> )}
      <div className="flex justify-start pt-2"> <button type="button" onClick={() => openSpecialisedPsiraEditor()} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"> + Add Specialised Qualification </button> </div>
    </div>
  ); // Make sure semicolon is outside parenthesis

  // --- Section 6: Role-Specific Industry Qualifications ---
  const renderRoleSpecificEditor = (): JSX.Element => {
    // Get available qualifications based on the category selected *in the editor data*
    const qualificationOptions = getRoleQualificationOptions(editorRoleSpecificData.category);
    const isOtherSelected = editorRoleSpecificData.qualificationName === 'Other';

    return (
        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 shadow-sm animate-fade-in mb-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">
                {editingRoleSpecificId ? 'Edit Role-Specific Qualification' : 'Add Role-Specific Qualification'}
            </h4>
            <div className="space-y-4">
                {/* Category Dropdown */}
                <div>
                    <label htmlFor="roleCategory" className="block text-sm font-medium text-gray-700 mb-1">Security Field/Role *</label>
                    <select
                        id="roleCategory"
                        name="category" // Matches key in editorRoleSpecificData
                        value={editorRoleSpecificData.category || ''}
                        onChange={handleRoleSpecificInputChange}
                        className="select-class"
                        required
                        // Disable category change when editing to avoid complexity
                        disabled={!!editingRoleSpecificId}
                    >
                        <option value="" disabled>Select Field...</option>
                        {roleSpecificCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                    {!!editingRoleSpecificId && <p className="mt-1 text-xs text-gray-500 italic">Field cannot be changed during edit.</p>}
                </div>

                {/* Qualification Dropdown (Dependent) - Only show if category is selected */}
                {editorRoleSpecificData.category && (
                    <div>
                        <label htmlFor="roleQualName" className="block text-sm font-medium text-gray-700 mb-1">Specific Qualification/Certification *</label>
                        <select
                            id="roleQualName"
                            name="qualificationName" // Matches key in editorRoleSpecificData
                            value={editorRoleSpecificData.qualificationName || ''}
                            onChange={handleRoleSpecificInputChange}
                            className="select-class"
                            required
                        >
                            <option value="" disabled>Select Qualification...</option>
                            {/* Populate options based on selected category */}
                            {qualificationOptions.map(qual => (
                                <option key={qual} value={qual}>{qual}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* "Other" Name Input (Conditional) - Only show if category and 'Other' qualification selected */}
                {editorRoleSpecificData.category && isOtherSelected && (
                    <div>
                        <label htmlFor="otherRoleQualName" className="block text-sm font-medium text-gray-700 mb-1">Specify Qualification Name *</label>
                        <input
                            id="otherRoleQualName"
                            name="otherQualificationName" // Matches key in editorRoleSpecificData
                            type="text"
                            value={editorRoleSpecificData.otherQualificationName || ''}
                            onChange={handleRoleSpecificInputChange}
                            className="input-class"
                            placeholder="Enter specific qualification name"
                            required
                        />
                    </div>
                )}

                {/* Details Section - Only show if a qualification has been selected */}
                {editorRoleSpecificData.qualificationName && (
                    <>
                        {/* Training Provider Input */}
                        <div>
                            <label htmlFor="roleProvider" className="block text-sm font-medium text-gray-700 mb-1">Training Provider / Issuing Body *</label>
                            <input id="roleProvider" name="provider" type="text" value={editorRoleSpecificData.provider || ''} onChange={handleRoleSpecificInputChange} required className="input-class"/>
                        </div>
                        {/* Date Completed Input */}
                        <div>
                            <label htmlFor="roleDateCompleted" className="block text-sm font-medium text-gray-700 mb-1">Date Completed / Issued *</label>
                            <input id="roleDateCompleted" name="dateCompleted" type="date" value={editorRoleSpecificData.dateCompleted || ''} onChange={handleRoleSpecificInputChange} required className="input-class"/>
                        </div>
                        {/* Expiry Date Input (Optional) */}
                        <div>
                            <label htmlFor="roleExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                            <input id="roleExpiryDate" name="expiryDate" type="date" value={editorRoleSpecificData.expiryDate || ''} onChange={handleRoleSpecificInputChange} className="input-class"/>
                        </div>
                        {/* Certificate Number Input (Optional) */}
                        <div>
                            <label htmlFor="roleCertNumber" className="block text-sm font-medium text-gray-700 mb-1">Certificate/Reg Number (Optional)</label>
                            <input id="roleCertNumber" name="certificateNumber" type="text" value={editorRoleSpecificData.certificateNumber || ''} onChange={handleRoleSpecificInputChange} className="input-class"/>
                        </div>
                        {/* File Upload Input (Required) */}
                        <div>
                            <label htmlFor="roleCertFile" className="block text-sm font-medium text-gray-700 mb-1">
                                Upload Certificate/Proof *
                                {/* Show existing filename if editing and no new file selected */}
                                {(editingRoleSpecificId && editorRoleSpecificData.fileName && !editorRoleSpecificFile) &&
                                ` (Current: ${editorRoleSpecificData.fileName})`
                                }
                            </label>
                            <input id="roleCertFile" type="file" onChange={handleRoleSpecificFileChange} className="file-input-class" accept=".pdf,.jpg,.jpeg,.png"/>
                            {editorRoleSpecificFile && <p className="mt-1 text-xs text-gray-500">Selected: {editorRoleSpecificFile.name}</p>}
                            <p className="mt-1 text-xs text-gray-500"> Required. Upload clear original scan or recent SAPS certified copy. PDF, JPG, PNG (Max 5MB). </p>
                            {/* Show required message indicator */}
                            {!(editingRoleSpecificId && editorRoleSpecificData.fileName) && !editorRoleSpecificFile &&
                                <p className="mt-1 text-xs text-red-500">File upload is required.</p>
                            }
                        </div>
                    </>
                )}

                {/* Error Display */}
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-4">
                    <button type="button" onClick={cancelRoleSpecificEditor} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                    {/* Disable save until category & qualification are selected */}
                    <button type="button" onClick={saveRoleSpecificQualification} disabled={!editorRoleSpecificData.qualificationName || !editorRoleSpecificData.category} className={`px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 ${(!editorRoleSpecificData.qualificationName || !editorRoleSpecificData.category) ? 'opacity-50 cursor-not-allowed' : ''}`}> {editingRoleSpecificId ? 'Save Changes' : 'Save Qualification'} </button>
                </div>
            </div>
        </div>
    );
  }; // End of renderRoleSpecificEditor

  const renderRoleSpecificSummaryList = (): JSX.Element => {
     // Access memoized sorted/grouped data from component scope
     // Note: Renamed destructured variables to avoid potential naming conflicts
     const { sortedCategories: localSortedCategories, grouped: localGroupedQuals } = { sortedCategories: sortedRoleCategories, grouped: groupedRoleQualifications };

     return (
        <div className="mt-4 space-y-4">
            {roleSpecificQualificationsList.length > 0 ? (
                <div className="space-y-6 mb-4"> {/* Space between categories */}
                    {localSortedCategories.map((category: string) => ( // Added type for category
                        <div key={category}>
                            <h4 className="text-md font-semibold text-gray-700 mb-2 border-b pb-1">{category}</h4>
                            <div className="space-y-3">
                                {localGroupedQuals[category].map((item: RoleSpecificQualification) => { // Added type for item
                                    const displayName = item.qualificationName === 'Other' ? item.otherQualificationName : item.qualificationName;
                                    return (
                                        <div key={item.id} className="p-3 border border-gray-200 rounded-md bg-white shadow-sm">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="text-sm flex-grow">
                                                    <p className="font-medium text-gray-900">{displayName}</p>
                                                    <p className="text-gray-600">Provider: {item.provider}</p>
                                                    <p className="text-gray-600"> Completed: {item.dateCompleted} {item.expiryDate && `| Expires: ${item.expiryDate}`} </p>
                                                    {item.certificateNumber && <p className="text-xs text-gray-500">Cert/Reg No: {item.certificateNumber}</p>}
                                                    <p className="text-xs text-gray-500 mt-1"> File: {item.fileName ? item.fileName : <span className="text-red-500 italic">Missing</span>} </p>
                                                </div>
                                                <div className="flex space-x-2 flex-shrink-0">
                                                    <button type="button" onClick={() => openRoleSpecificEditor(item.id)} className="p-1 text-indigo-600 hover:text-indigo-800" aria-label={`Edit ${displayName} for ${category}`}> <span>{FaEdit({ size: 16 })}</span> </button>
                                                    <button type="button" onClick={() => removeRoleSpecificQualification(item.id)} className="p-1 text-red-600 hover:text-red-800" aria-label={`Remove ${displayName} for ${category}`}> <span>{FaTrash({ size: 16 })}</span> </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : ( <p className="text-sm text-gray-500 italic mb-4">No role-specific qualifications added yet.</p> )}
            {/* Add New Button */}
            <div className="flex justify-start pt-2">
                <button
                    type="button"
                    onClick={() => openRoleSpecificEditor()} // Opens the editor to start Add flow
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
                >
                    + Add Role Qualification
                </button>
            </div>
        </div>
    );
  }; // End of renderRoleSpecificSummaryList

  // Section 7 Render Functions
  const renderMedicalEditor = (): JSX.Element => {
    const isOtherSelected = editorMedicalData.certificationName === 'Other';
    return (
        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 shadow-sm animate-fade-in mb-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">
                {editingMedicalId ? 'Edit Medical Training' : 'Add Medical Training'}
            </h4>
            <div className="space-y-4">
                {/* Certification Name Dropdown */}
                <div>
                    <label htmlFor="medCertName" className="block text-sm font-medium text-gray-700 mb-1">Training/Certification Name *</label>
                    <select id="medCertName" name="certificationName" value={editorMedicalData.certificationName || ''} onChange={handleMedicalInputChange} className="select-class" required >
                        <option value="" disabled>Select type...</option>
                        {medicalTrainingOptions.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                </div>
                {/* Other Name Input */}
                {isOtherSelected && (
                    <div>
                        <label htmlFor="otherMedCertName" className="block text-sm font-medium text-gray-700 mb-1">Specify Other Name *</label>
                        <input id="otherMedCertName" name="otherCertificationName" type="text" value={editorMedicalData.otherCertificationName || ''} onChange={handleMedicalInputChange} className="input-class" placeholder="Enter specific name" required />
                    </div>
                )}
                 {/* Provider */}
                <div> <label htmlFor="medProvider" className="block text-sm font-medium text-gray-700 mb-1">Training Provider *</label> <input id="medProvider" name="provider" type="text" value={editorMedicalData.provider || ''} onChange={handleMedicalInputChange} required className="input-class"/> </div>
                {/* Date Completed */}
                <div> <label htmlFor="medDateCompleted" className="block text-sm font-medium text-gray-700 mb-1">Date Completed *</label> <input id="medDateCompleted" name="dateCompleted" type="date" value={editorMedicalData.dateCompleted || ''} onChange={handleMedicalInputChange} required className="input-class"/> </div>
                {/* Expiry Date */}
                <div> <label htmlFor="medExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label> <input id="medExpiryDate" name="expiryDate" type="date" value={editorMedicalData.expiryDate || ''} onChange={handleMedicalInputChange} className="input-class"/> </div>
                {/* HPCSA Number */}
                <div> <label htmlFor="medHpcsa" className="block text-sm font-medium text-gray-700 mb-1">HPCSA Reg Number (Optional)</label> <input id="medHpcsa" name="hpcsaNumber" type="text" value={editorMedicalData.hpcsaNumber || ''} onChange={handleMedicalInputChange} className="input-class" placeholder="If applicable"/> </div>
                 {/* File Upload */}
                <div>
                    <label htmlFor="medFile" className="block text-sm font-medium text-gray-700 mb-1"> Upload Certificate/Card * {(editingMedicalId && editorMedicalData.fileName && !editorMedicalFile) && `(Current: ${editorMedicalData.fileName})`} </label>
                    <input id="medFile" type="file" onChange={handleMedicalFileChange} className="file-input-class" accept=".pdf,.jpg,.jpeg,.png"/>
                    {editorMedicalFile && <p className="mt-1 text-xs text-gray-500">Selected: {editorMedicalFile.name}</p>}
                    <p className="mt-1 text-xs text-gray-500"> Required. Upload clear original scan or recent SAPS certified copy. PDF, JPG, PNG (Max 5MB). </p>
                    {!(editingMedicalId && editorMedicalData.fileName) && !editorMedicalFile && <p className="mt-1 text-xs text-red-500">File upload is required.</p> }
                </div>

                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                <div className="flex justify-end space-x-3 mt-4">
                    <button type="button" onClick={cancelMedicalEditor} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="button" onClick={saveMedicalTraining} className={`px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700`}> {editingMedicalId ? 'Save Changes' : 'Save Training'} </button>
                </div>
            </div>
        </div>
    );
};

const renderMedicalSummaryList = (): JSX.Element => (
    <div className="mt-4 space-y-4">
        {medicalTrainingList.length > 0 && <h4 className="text-sm font-medium text-gray-600">Added Medical Training:</h4>}
        {medicalTrainingList.length > 0 ? (
            <div className="space-y-3">
                {medicalTrainingList.map((item: MedicalTraining) => { // Explicit type
                    const displayName = item.certificationName === 'Other' ? item.otherCertificationName : item.certificationName;
                    return (
                        <div key={item.id} className="p-3 border border-gray-200 rounded-md bg-white shadow-sm">
                            <div className="flex justify-between items-start gap-4">
                                <div className="text-sm flex-grow">
                                    <p className="font-medium text-gray-900">{displayName}</p>
                                    <p className="text-gray-600">Provider: {item.provider}</p>
                                    <p className="text-gray-600"> Completed: {item.dateCompleted} {item.expiryDate && `| Expires: ${item.expiryDate}`} </p>
                                    {item.hpcsaNumber && <p className="text-xs text-gray-500">HPCSA No: {item.hpcsaNumber}</p>}
                                    <p className="text-xs text-gray-500 mt-1"> File: {item.fileName ? item.fileName : <span className="text-red-500 italic">Missing</span>} </p>
                                </div>
                                <div className="flex space-x-2 flex-shrink-0">
                                    <button type="button" onClick={() => openMedicalEditor(item.id)} className="p-1 text-indigo-600 hover:text-indigo-800" aria-label={`Edit ${displayName}`}> <span>{FaEdit({ size: 16 })}</span> </button>
                                    <button type="button" onClick={() => removeMedicalTraining(item.id)} className="p-1 text-red-600 hover:text-red-800" aria-label={`Remove ${displayName}`}> <span>{FaTrash({ size: 16 })}</span> </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        ) : ( <p className="text-sm text-gray-500 italic mb-4">No medical training added yet.</p> )}
        <div className="flex justify-start pt-2">
            <button type="button" onClick={() => openMedicalEditor()} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"> + Add Medical Training </button>
        </div>
    </div>
);

  // Section 8 Render Functions
  const renderK9TrainingEditor = (): JSX.Element => (
    <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 shadow-sm animate-fade-in mb-4">
      <h4 className="text-md font-medium text-gray-900 mb-3">
        {editingK9Id ? 'Edit K9 Training' : 'Add K9 Training'}
      </h4>
      <div className="space-y-4">
        {/* Certification Name Dropdown */}
        <div>
          <label htmlFor="k9CertName" className="block text-sm font-medium text-gray-700 mb-1">Certification/Training *</label>
          <select
            id="k9CertName"
            name="certificationName"
            value={editorK9Data.certificationName || ''}
            onChange={handleK9InputChange}
            className="select-class"
            required
          >
            <option value="" disabled>Select certification type</option>
            {k9TrainingOptions.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        {/* Other Certification Name (conditional) */}
        {editorK9Data.certificationName === 'Other' && (
          <div>
            <label htmlFor="otherK9CertName" className="block text-sm font-medium text-gray-700 mb-1">Specify Other Name *</label>
            <input
              id="otherK9CertName"
              name="otherCertificationName"
              type="text"
              value={editorK9Data.otherCertificationName || ''}
              onChange={handleK9InputChange}
              className="input-class"
              placeholder="Enter specific name"
              required
            />
          </div>
        )}
        
        {/* Detection Type (conditional) */}
        {editorK9Data.certificationName === 'Detection Dog Handler (Specify Type)' && (
          <div>
            <label htmlFor="detectionType" className="block text-sm font-medium text-gray-700 mb-1">Detection Type *</label>
            <input
              id="detectionType"
              name="detectionType"
              type="text"
              value={editorK9Data.detectionType || ''}
              onChange={handleK9InputChange}
              className="input-class"
              placeholder="e.g., Narcotics, Explosives, etc."
              required
            />
          </div>
        )}
        
        {/* Provider */}
        <div>
          <label htmlFor="k9Provider" className="block text-sm font-medium text-gray-700 mb-1">Training Provider *</label>
          <input
            id="k9Provider"
            name="provider"
            type="text"
            value={editorK9Data.provider || ''}
            onChange={handleK9InputChange}
            className="input-class"
            placeholder="Enter provider name"
            required
          />
        </div>
        
        {/* Date Completed */}
        <div>
          <label htmlFor="k9DateCompleted" className="block text-sm font-medium text-gray-700 mb-1">Date Completed *</label>
          <input
            id="k9DateCompleted"
            name="dateCompleted"
            type="date"
            value={editorK9Data.dateCompleted || ''}
            onChange={handleK9InputChange}
            className="input-class"
            required
          />
        </div>
        
        {/* Expiry Date (optional) */}
        <div>
          <label htmlFor="k9ExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
          <input
            id="k9ExpiryDate"
            name="expiryDate"
            type="date"
            value={editorK9Data.expiryDate || ''}
            onChange={handleK9InputChange}
            className="input-class"
          />
        </div>
        
        {/* File Upload */}
        <div>
          <label htmlFor="k9File" className="block text-sm font-medium text-gray-700 mb-1">
            Upload Certificate
            {editingK9Id && k9TrainingList.find(i => i.id === editingK9Id)?.fileName && !editorK9File 
              ? ` (Current: ${k9TrainingList.find(i => i.id === editingK9Id)?.fileName})` 
              : ' *'}
          </label>
          <input
            id="k9File"
            type="file"
            onChange={handleK9FileChange}
            className="file-input-class"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          {editorK9File && <p className="mt-1 text-xs text-gray-500">Selected: {editorK9File.name}</p>}
          <p className="mt-1 text-xs text-gray-500">Accepted formats: PDF, JPG, PNG (max 5MB)</p>
        </div>
        
        {/* Error display */}
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-3 mt-4">
          <button
            type="button"
            onClick={cancelK9Editor}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveK9Training}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-md shadow-sm text-sm hover:bg-indigo-700"
          >
            {editingK9Id ? 'Update' : 'Save'} K9 Training
          </button>
        </div>
      </div>
    </div>
  );

  const renderK9TrainingSummaryList = (): JSX.Element => (
    <div className="mt-4 space-y-4">
        {k9TrainingList.length > 0 && <h4 className="text-sm font-medium text-gray-600">Added K9 Training:</h4>}
        {k9TrainingList.length > 0 ? (
            <div className="space-y-3"> {k9TrainingList.map(item => { const displayName = item.certificationName === 'Other' ? item.otherCertificationName : item.certificationName; return ( <div key={item.id} className="p-3 border border-gray-200 rounded-md bg-white shadow-sm"> <div className="flex justify-between items-start gap-4"> <div className="text-sm flex-grow"> <p className="font-medium text-gray-900">{displayName}</p> <p className="text-gray-600">Provider: {item.provider}</p> <p className="text-gray-600"> Completed: {item.dateCompleted} {item.expiryDate && `| Expires: ${item.expiryDate}`} </p> <p className="text-xs text-gray-500 mt-1"> File: {item.fileName ? item.fileName : <span className="text-red-500 italic">Missing</span>} </p> </div> <div className="flex space-x-2 flex-shrink-0"> <button type="button" onClick={() => openK9Editor(item.id)} className="p-1 text-indigo-600 hover:text-indigo-800" aria-label={`Edit ${displayName}`}> <span>{FaEdit({ size: 16 })}</span> </button> <button type="button" onClick={() => removeK9Training(item.id)} className="p-1 text-red-600 hover:text-red-800" aria-label={`Remove ${displayName}`}> <span>{FaTrash({ size: 16 })}</span> </button> </div> </div> </div> ); })} </div>
        ) : ( <p className="text-sm text-gray-500 italic mb-4">No K9 training added yet.</p> )}
        <div className="flex justify-start pt-2"> <button type="button" onClick={() => openK9Editor()} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"> + Add K9 Training </button> </div>
    </div>
  );

  // --- Section 9 Handlers: Computer Efficiency Training ---

  /** Renders the editor form for adding/editing computer training details. */
  const renderComputerTrainingEditor = (): JSX.Element => (
    <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 shadow-sm animate-fade-in mb-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">
            {editingComputerTrainingId ? 'Edit Computer Training' : 'Add Computer Training'}
        </h4>
        <div className="space-y-4">
            {/* Training Area Dropdown */}
            <div>
                <label htmlFor="compTrainingArea" className="block text-sm font-medium text-gray-700 mb-1">Training Area *</label>
                <select
                    id="compTrainingArea"
                    name="trainingArea" // Matches key in editorComputerTrainingData
                    value={editorComputerTrainingData.trainingArea || ''}
                    onChange={handleComputerTrainingInputChange}
                    className="select-class"
                    required
                >
                    <option value="" disabled>Select area...</option>
                    {computerTrainingAreaOptions.map(area => (
                        <option key={area} value={area}>{area}</option>
                    ))}
                </select>
            </div>

            {/* Specific Skill Detail Input */}
            <div>
                <label htmlFor="compSpecificSkill" className="block text-sm font-medium text-gray-700 mb-1">Specific Software / Skill Detail *</label>
                <input
                    id="compSpecificSkill"
                    name="specificSkill" // Matches key
                    type="text"
                    value={editorComputerTrainingData.specificSkill || ''}
                    onChange={handleComputerTrainingInputChange}
                    className="input-class"
                    placeholder="e.g., MS Excel Advanced, Listener Operator, Typing 60 WPM"
                    required
                />
            </div>

            {/* Training Provider Input */}
            <div>
                <label htmlFor="compProvider" className="block text-sm font-medium text-gray-700 mb-1">Training Provider / Institution *</label>
                <input
                    id="compProvider"
                    name="provider" // Matches key
                    type="text"
                    value={editorComputerTrainingData.provider || ''}
                    onChange={handleComputerTrainingInputChange}
                    className="input-class"
                    placeholder="Enter provider or institution name"
                    required
                />
            </div>

            {/* Date Completed Input */}
            <div>
                <label htmlFor="compDateCompleted" className="block text-sm font-medium text-gray-700 mb-1">Date Completed *</label>
                <input
                    id="compDateCompleted"
                    name="dateCompleted" // Matches key
                    type="date"
                    value={editorComputerTrainingData.dateCompleted || ''}
                    onChange={handleComputerTrainingInputChange}
                    className="input-class"
                    required
                />
            </div>

            {/* Level / Certification Achieved Input (Optional) */}
            <div>
                <label htmlFor="compLevelAchieved" className="block text-sm font-medium text-gray-700 mb-1">Level / Certification Achieved (Optional)</label>
                <input
                    id="compLevelAchieved"
                    name="levelAchieved" // Matches key
                    type="text"
                    value={editorComputerTrainingData.levelAchieved || ''}
                    onChange={handleComputerTrainingInputChange}
                    className="input-class"
                    placeholder="e.g., Intermediate, Certified Professional"
                />
            </div>

            {/* File Upload Input (Required as per spec) */}
            <div>
                <label htmlFor="compCertFile" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Certificate *
                    {/* Show existing filename if editing and no new file selected */}
                    {(editingComputerTrainingId && editorComputerTrainingData.fileName && !editorComputerTrainingFile) &&
                     ` (Current: ${editorComputerTrainingData.fileName})`
                    }
                </label>
                <input
                    id="compCertFile"
                    type="file"
                    onChange={handleComputerTrainingFileChange}
                    className="file-input-class"
                    accept=".pdf,.jpg,.jpeg,.png"
                />
                {editorComputerTrainingFile && <p className="mt-1 text-xs text-gray-500">Selected: {editorComputerTrainingFile.name}</p>}
                <p className="mt-1 text-xs text-gray-500">
                    Required (if applicable, e.g., for formal certifications). PDF, JPG, PNG (Max 5MB).
                </p>
                {/* Show required message indicator if adding new or editing without existing file */}
                {!(editingComputerTrainingId && editorComputerTrainingData.fileName) && !editorComputerTrainingFile &&
                    <p className="mt-1 text-xs text-red-500">File upload is required.</p>
                }
            </div>

            {/* Error Display */}
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-4">
                <button type="button" onClick={cancelComputerTrainingEditor} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="button" onClick={saveComputerTraining} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">
                    {editingComputerTrainingId ? 'Save Changes' : 'Save Training'}
                </button>
            </div>
        </div>
    </div>
);

/** Renders the summary list of added computer training items. */
const renderComputerTrainingSummaryList = (): JSX.Element => (
    <div className="mt-4 space-y-4">
        {/* Heading for the list if items exist */}
        {computerTrainingList.length > 0 && <h4 className="text-sm font-medium text-gray-600">Added Computer Training:</h4>}

        {/* Display list or 'None added' message */}
        {computerTrainingList.length > 0 ? (
            <div className="space-y-3">
                {computerTrainingList.map((item: ComputerTraining) => ( // Explicit type
                    <div key={item.id} className="p-3 border border-gray-200 rounded-md bg-white shadow-sm">
                        <div className="flex justify-between items-start gap-4">
                            {/* Details Column */}
                            <div className="text-sm flex-grow">
                                <p className="font-medium text-gray-900">{item.specificSkill}</p>
                                <p className="text-gray-600">Area: {item.trainingArea}</p>
                                <p className="text-gray-600">Provider: {item.provider}</p>
                                <p className="text-gray-600">Completed: {item.dateCompleted}</p>
                                {item.levelAchieved && <p className="text-xs text-gray-500">Level: {item.levelAchieved}</p>}
                                <p className="text-xs text-gray-500 mt-1">
                                    File: {item.fileName ? item.fileName : <span className="text-red-500 italic">Missing</span>}
                                </p>
                            </div>
                            {/* Action Buttons Column */}
                            <div className="flex space-x-2 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => openComputerTrainingEditor(item.id)}
                                    className="p-1 text-indigo-600 hover:text-indigo-800"
                                    aria-label={`Edit ${item.specificSkill}`}
                                >
                                    <span>{FaEdit({ size: 16 })}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeComputerTraining(item.id)}
                                    className="p-1 text-red-600 hover:text-red-800"
                                    aria-label={`Remove ${item.specificSkill}`}
                                >
                                    <span>{FaTrash({ size: 16 })}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-sm text-gray-500 italic mb-4">No computer efficiency training added yet.</p>
        )}

        {/* Add New Button */}
        <div className="flex justify-start pt-2">
            <button
                type="button"
                onClick={() => openComputerTrainingEditor()} // Opens the editor for adding
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
            >
                + Add Computer Training
            </button>
        </div>
    </div>
);
// Inside the Step5Qualifications component function...
// ... (Render Functions for Section 9 - Computer Training)

// --- Section 10 Render Functions: Strikes and Riot Training ---

/** Renders the editor form for adding/editing Strikes/Riot training. */
const renderStrikesRiotEditor = (): JSX.Element => {
    const isOtherSelected = editorStrikesRiotData.trainingName === 'Other';
    return (
        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 shadow-sm animate-fade-in mb-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">
                {editingStrikesRiotId ? 'Edit Strikes/Riot Training' : 'Add Strikes/Riot Training'}
            </h4>
            <div className="space-y-4">
                {/* Training Name Dropdown */}
                <div>
                    <label htmlFor="srTrainingName" className="block text-sm font-medium text-gray-700 mb-1">Training/Certification Name *</label>
                    <select
                        id="srTrainingName"
                        name="trainingName"
                        value={editorStrikesRiotData.trainingName || ''}
                        onChange={handleStrikesRiotInputChange}
                        className="select-class"
                        required
                    >
                        <option value="" disabled>Select type...</option>
                        {strikesRiotTrainingOptions.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Other Name Input (Conditional) */}
                {isOtherSelected && (
                    <div>
                        <label htmlFor="srOtherName" className="block text-sm font-medium text-gray-700 mb-1">Specify Other Name *</label>
                        <input
                            id="srOtherName"
                            name="otherName"
                            type="text"
                            value={editorStrikesRiotData.otherName || ''}
                            onChange={handleStrikesRiotInputChange}
                            className="input-class"
                            placeholder="Enter specific training name"
                            required
                        />
                    </div>
                )}

                {/* Training Provider Input */}
                <div>
                    <label htmlFor="srProvider" className="block text-sm font-medium text-gray-700 mb-1">Training Provider *</label>
                    <input
                        id="srProvider"
                        name="provider"
                        type="text"
                        value={editorStrikesRiotData.provider || ''}
                        onChange={handleStrikesRiotInputChange}
                        className="input-class"
                        placeholder="Enter provider name"
                        required
                    />
                </div>

                {/* Date Completed Input */}
                <div>
                    <label htmlFor="srDateCompleted" className="block text-sm font-medium text-gray-700 mb-1">Date Completed *</label>
                    <input
                        id="srDateCompleted"
                        name="dateCompleted"
                        type="date"
                        value={editorStrikesRiotData.dateCompleted || ''}
                        onChange={handleStrikesRiotInputChange}
                        className="input-class"
                        required
                    />
                </div>

                {/* Expiry Date Input (Optional) */}
                <div>
                    <label htmlFor="srExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                    <input
                        id="srExpiryDate"
                        name="expiryDate"
                        type="date"
                        value={editorStrikesRiotData.expiryDate || ''}
                        onChange={handleStrikesRiotInputChange}
                        className="input-class"
                    />
                </div>

                {/* File Upload Input */}
                <div>
                    <label htmlFor="srCertFile" className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Certificate *
                        {(editingStrikesRiotId && editorStrikesRiotData.fileName && !editorStrikesRiotFile) &&
                         ` (Current: ${editorStrikesRiotData.fileName})`
                        }
                    </label>
                    <input
                        id="srCertFile"
                        type="file"
                        onChange={handleStrikesRiotFileChange}
                        className="file-input-class"
                        accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {editorStrikesRiotFile && <p className="mt-1 text-xs text-gray-500">Selected: {editorStrikesRiotFile.name}</p>}
                    <p className="mt-1 text-xs text-gray-500">Required. Upload clear original scan or recent SAPS certified copy. PDF, JPG, PNG (Max 5MB).</p>
                    {!(editingStrikesRiotId && editorStrikesRiotData.fileName) && !editorStrikesRiotFile &&
                        <p className="mt-1 text-xs text-red-500">File upload is required.</p>
                    }
                </div>

                {/* Error Display */}
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-4">
                    <button type="button" onClick={cancelStrikesRiotEditor} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="button" onClick={saveStrikesRiotTraining} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">
                        {editingStrikesRiotId ? 'Save Changes' : 'Save Training'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/** Renders the summary list of added Strikes/Riot training items. */
const renderStrikesRiotSummaryList = (): JSX.Element => (
    <div className="mt-4 space-y-4">
        {strikesRiotTrainingList.length > 0 && <h4 className="text-sm font-medium text-gray-600">Added Strikes/Riot Training:</h4>}

        {strikesRiotTrainingList.length > 0 ? (
            <div className="space-y-3">
                {strikesRiotTrainingList.map((item: StrikesRiotTraining) => {
                    const displayName = item.trainingName === 'Other' ? item.otherName : item.trainingName;
                    return (
                        <div key={item.id} className="p-3 border border-gray-200 rounded-md bg-white shadow-sm">
                            <div className="flex justify-between items-start gap-4">
                                {/* Details */}
                                <div className="text-sm flex-grow">
                                    <p className="font-medium text-gray-900">{displayName}</p>
                                    <p className="text-gray-600">Provider: {item.provider}</p>
                                    <p className="text-gray-600">
                                        Completed: {item.dateCompleted}
                                        {item.expiryDate && ` | Expires: ${item.expiryDate}`}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        File: {item.fileName ? item.fileName : <span className="text-red-500 italic">Missing</span>}
                                    </p>
                                </div>
                                {/* Actions */}
                                <div className="flex space-x-2 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => openStrikesRiotEditor(item.id)}
                                        className="p-1 text-indigo-600 hover:text-indigo-800"
                                        aria-label={`Edit ${displayName}`}
                                    >
                                        <span>{FaEdit({ size: 16 })}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeStrikesRiotTraining(item.id)}
                                        className="p-1 text-red-600 hover:text-red-800"
                                        aria-label={`Remove ${displayName}`}
                                    >
                                        <span>{FaTrash({ size: 16 })}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        ) : (
            <p className="text-sm text-gray-500 italic mb-4">No strikes/riot training added yet.</p>
        )}

        {/* Add Button */}
        <div className="flex justify-start pt-2">
            <button
                type="button"
                onClick={() => openStrikesRiotEditor()}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
            >
                + Add Strikes/Riot Training
            </button>
        </div>
    </div>
);

// --- Section 11 Render Functions: Security Technician Training ---

/** Renders the editor form for adding/editing Security Technician training. */
const renderSecurityTechnicianEditor = (): JSX.Element => (
    <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 shadow-sm animate-fade-in mb-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">
            {editingSecurityTechnicianId ? 'Edit Technician Training' : 'Add Technician Training'}
        </h4>
        <div className="space-y-4">
            {/* Technology Area Dropdown */}
            <div>
                <label htmlFor="stTechArea" className="block text-sm font-medium text-gray-700 mb-1">Technology Area *</label>
                <select
                    id="stTechArea"
                    name="technologyArea"
                    value={editorSecurityTechnicianData.technologyArea || ''}
                    onChange={handleSecurityTechnicianInputChange}
                    className="select-class"
                    required
                >
                    <option value="" disabled>Select area...</option>
                    {securityTechAreaOptions.map(area => (
                        <option key={area} value={area}>{area}</option>
                    ))}
                </select>
            </div>

            {/* Specific System/Certification Input */}
            <div>
                <label htmlFor="stSpecificSystem" className="block text-sm font-medium text-gray-700 mb-1">Specific System / Certification *</label>
                <input
                    id="stSpecificSystem"
                    name="specificSystem"
                    type="text"
                    value={editorSecurityTechnicianData.specificSystem || ''}
                    onChange={handleSecurityTechnicianInputChange}
                    className="input-class"
                    placeholder='e.g., "SAIDSA Level 2", "Hikvision HCSA", "Paxton Net2 Advanced"'
                    required
                />
            </div>

            {/* Provider/Issuing Body Input */}
            <div>
                <label htmlFor="stProvider" className="block text-sm font-medium text-gray-700 mb-1">Provider / Issuing Body *</label>
                <input
                    id="stProvider"
                    name="provider"
                    type="text"
                    value={editorSecurityTechnicianData.provider || ''}
                    onChange={handleSecurityTechnicianInputChange}
                    className="input-class"
                    placeholder="Enter provider or issuing body name"
                    required
                />
            </div>

            {/* Date Completed Input */}
            <div>
                <label htmlFor="stDateCompleted" className="block text-sm font-medium text-gray-700 mb-1">Date Completed *</label>
                <input
                    id="stDateCompleted"
                    name="dateCompleted"
                    type="date"
                    value={editorSecurityTechnicianData.dateCompleted || ''}
                    onChange={handleSecurityTechnicianInputChange}
                    className="input-class"
                    required
                />
            </div>

            {/* Expiry Date Input (Optional) */}
            <div>
                <label htmlFor="stExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                <input
                    id="stExpiryDate"
                    name="expiryDate"
                    type="date"
                    value={editorSecurityTechnicianData.expiryDate || ''}
                    onChange={handleSecurityTechnicianInputChange}
                    className="input-class"
                />
            </div>

             {/* Registration/Certification Number Input (Optional) */}
             <div>
                <label htmlFor="stRegNumber" className="block text-sm font-medium text-gray-700 mb-1">Registration/Certification Number (Optional)</label>
                <input
                    id="stRegNumber"
                    name="registrationNumber"
                    type="text"
                    value={editorSecurityTechnicianData.registrationNumber || ''}
                    onChange={handleSecurityTechnicianInputChange}
                    className="input-class"
                    placeholder="e.g., SAIDSA Reg No, SAQCC No"
                />
            </div>

            {/* File Upload Input */}
            <div>
                <label htmlFor="stCertFile" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Certificate/Proof *
                    {(editingSecurityTechnicianId && editorSecurityTechnicianData.fileName && !editorSecurityTechnicianFile) &&
                     ` (Current: ${editorSecurityTechnicianData.fileName})`
                    }
                </label>
                <input
                    id="stCertFile"
                    type="file"
                    onChange={handleSecurityTechnicianFileChange}
                    className="file-input-class"
                    accept=".pdf,.jpg,.jpeg,.png"
                />
                {editorSecurityTechnicianFile && <p className="mt-1 text-xs text-gray-500">Selected: {editorSecurityTechnicianFile.name}</p>}
                <p className="mt-1 text-xs text-gray-500">Required. Upload clear original scan or recent SAPS certified copy. PDF, JPG, PNG (Max 5MB).</p>
                {!(editingSecurityTechnicianId && editorSecurityTechnicianData.fileName) && !editorSecurityTechnicianFile &&
                    <p className="mt-1 text-xs text-red-500">File upload is required.</p>
                }
            </div>

            {/* Error Display */}
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-4">
                <button type="button" onClick={cancelSecurityTechnicianEditor} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="button" onClick={saveSecurityTechnicianTraining} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">
                    {editingSecurityTechnicianId ? 'Save Changes' : 'Save Training'}
                </button>
            </div>
        </div>
    </div>
);

/** Renders the summary list of added Security Technician training items. */
const renderSecurityTechnicianSummaryList = (): JSX.Element => (
    <div className="mt-4 space-y-4">
        {securityTechnicianTrainingList.length > 0 && <h4 className="text-sm font-medium text-gray-600">Added Technician Training:</h4>}

        {securityTechnicianTrainingList.length > 0 ? (
            <div className="space-y-3">
                {securityTechnicianTrainingList.map((item: SecurityTechnicianTraining) => (
                    <div key={item.id} className="p-3 border border-gray-200 rounded-md bg-white shadow-sm">
                        <div className="flex justify-between items-start gap-4">
                            {/* Details */}
                            <div className="text-sm flex-grow">
                                <p className="font-medium text-gray-900">{item.specificSystem}</p>
                                <p className="text-gray-600">Area: {item.technologyArea}</p>
                                <p className="text-gray-600">Provider: {item.provider}</p>
                                <p className="text-gray-600">
                                    Completed: {item.dateCompleted}
                                    {item.expiryDate && ` | Expires: ${item.expiryDate}`}
                                </p>
                                {item.registrationNumber && <p className="text-xs text-gray-500">Reg/Cert No: {item.registrationNumber}</p>}
                                <p className="text-xs text-gray-500 mt-1">
                                    File: {item.fileName ? item.fileName : <span className="text-red-500 italic">Missing</span>}
                                </p>
                            </div>
                            {/* Actions */}
                            <div className="flex space-x-2 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => openSecurityTechnicianEditor(item.id)}
                                    className="p-1 text-indigo-600 hover:text-indigo-800"
                                    aria-label={`Edit ${item.specificSystem}`}
                                >
                                    <span>{FaEdit({ size: 16 })}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeSecurityTechnicianTraining(item.id)}
                                    className="p-1 text-red-600 hover:text-red-800"
                                    aria-label={`Remove ${item.specificSystem}`}
                                >
                                    <span>{FaTrash({ size: 16 })}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-sm text-gray-500 italic mb-4">No security technician training added yet.</p>
        )}

        {/* Add Button */}
        <div className="flex justify-start pt-2">
            <button
                type="button"
                onClick={() => openSecurityTechnicianEditor()}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
            >
                + Add Technician Training
            </button>
        </div>
    </div>
);

// --- Section 12 Render Function: Other Skills, Licenses & Certifications (Corrected) ---

/** Renders the summary list and inline input form for other qualifications. */
const renderOtherQualifications = (): JSX.Element => (
    <div className="mt-4 space-y-6"> {/* Increased spacing for list + form */}
        {/* Summary List Area */}
        <div className="space-y-3">
            {otherQualifications.length > 0 && <h4 className="text-sm font-medium text-gray-600">Added Items:</h4>}
            {otherQualifications.length > 0 ? (
                otherQualifications.map((item: OtherQualification) => (
                    <div key={item.id} className="p-3 border border-gray-200 rounded-md bg-white shadow-sm">
                        <div className="flex justify-between items-start gap-4">
                            {/* Details */}
                            <div className="text-sm flex-grow">
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-gray-600">Authority: {item.authority}</p>
                                {item.certNumber && <p className="text-xs text-gray-500">Cert/Lic No: {item.certNumber}</p>}
                                {item.expiryDate && <p className="text-xs text-gray-500">Expires: {item.expiryDate}</p>}
                                {/* Display File Name */}
                                <p className="text-xs text-gray-500 mt-1"> {/* <-- ADDED File display */}
                                   File: {item.fileName ? item.fileName : <span className="text-red-500 italic">Missing</span>}
                                </p>
                            </div>
                            {/* Remove Action */}
                            <div className="flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => removeOtherQualification(item.id)}
                                    className="p-1 text-red-600 hover:text-red-800"
                                    aria-label={`Remove ${item.name}`}
                                >
                                    <span>{FaTrash({ size: 16 })}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-sm text-gray-500 italic">No other skills, licenses, or certifications added yet.</p>
            )}
        </div>

        {/* Inline Input Form Area */}
        <div className="pt-4 border-t border-gray-200">
             <h4 className="text-md font-medium text-gray-900 mb-3">Add New Qualification</h4>
             <div className="space-y-4">
                 {/* Name Input */}
                 <div>
                    <label htmlFor="otherQualName" className="block text-sm font-medium text-gray-700 mb-1">Skill/License/Cert Name *</label>
                    <input
                        id="otherQualName"
                        name="name"
                        type="text"
                        value={newQualification.name}
                        onChange={handleNewQualificationInputChange}
                        className="input-class"
                        placeholder="Enter name"
                        required
                    />
                </div>
                 {/* Authority Input */}
                <div>
                    <label htmlFor="otherQualAuthority" className="block text-sm font-medium text-gray-700 mb-1">Issuing Authority/Org *</label>
                    <input
                        id="otherQualAuthority"
                        name="authority"
                        type="text"
                        value={newQualification.authority}
                        onChange={handleNewQualificationInputChange}
                        className="input-class"
                        placeholder="Enter issuing body"
                        required
                    />
                </div>
                 {/* Cert/License Number Input (Optional) */}
                <div>
                    <label htmlFor="otherQualCertNumber" className="block text-sm font-medium text-gray-700 mb-1">Certificate/License Number (Optional)</label>
                    <input
                        id="otherQualCertNumber"
                        name="certNumber"
                        type="text"
                        value={newQualification.certNumber || ''}
                        onChange={handleNewQualificationInputChange}
                        className="input-class"
                    />
                </div>
                 {/* Expiry Date Input (Optional) */}
                <div>
                    <label htmlFor="otherQualExpiry" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                    <input
                        id="otherQualExpiry"
                        name="expiryDate"
                        type="date"
                        value={newQualification.expiryDate || ''}
                        onChange={handleNewQualificationInputChange}
                        className="input-class"
                    />
                </div>

                 {/* File Upload Input */}
                 <div> {/* <-- ADDED File Input Block */}
                    <label htmlFor="otherQualFile" className="block text-sm font-medium text-gray-700 mb-1">Upload Certificate/Proof *</label>
                    <input
                        id="otherQualFile"
                        type="file"
                        onChange={handleNewQualificationFileChange} // Use the new handler
                        className="file-input-class"
                        accept=".pdf,.jpg,.jpeg,.png"
                        // key={newQualificationFile ? 'file-selected' : 'file-empty'} // Optional: force re-render on state change to clear visually
                    />
                    {newQualificationFile && <p className="mt-1 text-xs text-gray-500">Selected: {newQualificationFile.name}</p>}
                     <p className="mt-1 text-xs text-gray-500">Required. PDF, JPG, PNG (Max 5MB).</p>
                </div>


                {/* Inline Error Display */}
                {otherError && <p className="text-sm text-red-600 mt-2">{otherError}</p>}

                {/* Add Button */}
                <div className="flex justify-end">
                     <button
                        type="button"
                        onClick={addOtherQualification}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Add Qualification
                    </button>
                </div>
             </div>
        </div>
    </div>
);

// (End of render functions)

// ... rest of existing code ...

  // --- Main Content Render --- (Includes Sections 2, 3, 4, 5)
  const renderMainContent = (): JSX.Element => (
    <div className="space-y-8">
        {/* --- Section 2: Basic Education --- */}
        <div className="p-4 border rounded-md shadow-sm bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-1">Basic Education</h3>
            <p className="text-sm text-gray-500 mb-4">Please indicate your highest level of basic education completed.</p>
            <div className="space-y-2"> {basicEducationLevelOptions.map(level => ( <label key={level} className="flex items-center cursor-pointer"> <input type="radio" name="basicEducationLevel" value={level} checked={basicEducationLevel === level} onChange={handleLevelChange} className="form-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 radio-class" /> <span className="ml-3 block text-sm font-medium text-gray-700">{level}</span> </label> ))} </div>
            {levelsRequiringDetails.includes(basicEducationLevel) && ( <> {isBasicEducationEditorOpen ? renderBasicEducationEditor() : basicEducationDetails ? renderBasicEducationSummary() : ( <div className="mt-4 flex justify-start"> <button type="button" onClick={openBasicEducationEditor} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"> + Add Education Details </button> </div> )} </> )}
        </div>

        <hr className="my-6 border-gray-200"/>

        {/* --- Section 3: Tertiary Education --- */}
        <div className="p-4 border rounded-md shadow-sm bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-1">Tertiary Education</h3>
            <p className="text-sm text-gray-500 mb-4">Please indicate if you have completed any qualifications from a university, college, or other tertiary institution.</p>
            <div className="flex items-center space-x-6 mb-4">
              <label className="inline-flex items-center cursor-pointer"> <input type="radio" name="hasTertiaryEducation" value="yes" checked={hasTertiaryEducation === 'yes'} onChange={handleHasTertiaryChange} className="form-radio h-4 w-4 text-indigo-600 radio-class"/> <span className="ml-2 text-sm text-gray-700">Yes</span> </label>
              <label className="inline-flex items-center cursor-pointer"> <input type="radio" name="hasTertiaryEducation" value="no" checked={hasTertiaryEducation === 'no'} onChange={handleHasTertiaryChange} className="form-radio h-4 w-4 text-indigo-600 radio-class"/> <span className="ml-2 text-sm text-gray-700">No</span> </label>
            </div>
            {hasTertiaryEducation === 'yes' && ( isTertiaryEditorOpen ? renderTertiaryEditor() : renderTertiarySummaryList() )}
        </div>

        <hr className="my-6 border-gray-200"/>

        {/* --- Section 4: Driver's Licence & Related --- */}
        <div className="p-4 border rounded-md shadow-sm bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-1">Driver's Licence & Related Qualifications</h3>
            {/* Part A: Licence */}
            <div className="mb-6 border-b border-gray-200 pb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Do you hold a valid South African driver's licence? *</label>
                <div className="flex items-center space-x-6">
                    <label className="inline-flex items-center cursor-pointer"> <input type="radio" name="hasDriversLicence" value="yes" checked={hasDriversLicence === 'yes'} onChange={handleHasLicenceChange} className="form-radio h-4 w-4 text-indigo-600 radio-class"/> <span className="ml-2 text-sm">Yes</span> </label>
                    <label className="inline-flex items-center cursor-pointer"> <input type="radio" name="hasDriversLicence" value="no" checked={hasDriversLicence === 'no'} onChange={handleHasLicenceChange} className="form-radio h-4 w-4 text-indigo-600 radio-class"/> <span className="ml-2 text-sm">No</span> </label>
                </div>
                {hasDriversLicence === 'yes' && ( isLicenceEditorOpen ? renderLicenceEditor() : driversLicenceDetails ? renderLicenceSummary() : <div className="mt-4"><button type="button" onClick={openLicenceEditor} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm shadow-sm hover:bg-gray-300"> + Add Licence Details </button></div> )}
            </div>
            {/* Parts B & C only shown if Licence is Yes */}
            {hasDriversLicence === 'yes' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Part B: PrDP */}
                    <div className="border-b border-gray-200 pb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Do you hold a valid South African Professional Driving Permit (PrDP)? *</label>
                        <div className="flex items-center space-x-6">
                            <label className="inline-flex items-center cursor-pointer"> <input type="radio" name="hasPrdp" value="yes" checked={hasPrdp === 'yes'} onChange={handleHasPrdpChange} className="form-radio h-4 w-4 text-indigo-600 radio-class"/> <span className="ml-2 text-sm">Yes</span> </label>
                            <label className="inline-flex items-center cursor-pointer"> <input type="radio" name="hasPrdp" value="no" checked={hasPrdp === 'no'} onChange={handleHasPrdpChange} className="form-radio h-4 w-4 text-indigo-600 radio-class"/> <span className="ml-2 text-sm">No</span> </label>
                        </div>
                         {hasPrdp === 'yes' && ( isPrdpEditorOpen ? renderPrdpEditor() : prdpDetails ? renderPrdpSummary() : <div className="mt-4"><button type="button" onClick={openPrdpEditor} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm shadow-sm hover:bg-gray-300"> + Add PrDP Details </button></div> )}
                    </div>
                    {/* Part C: Driver Training */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Do you have any additional driver-related training or certifications? *</label>
                        <div className="flex items-center space-x-6 mb-4">
                            <label className="inline-flex items-center cursor-pointer"> <input type="radio" name="hasDriverTraining" value="yes" checked={hasDriverTraining === 'yes'} onChange={handleHasDriverTrainingChange} className="form-radio h-4 w-4 text-indigo-600 radio-class"/> <span className="ml-2 text-sm">Yes</span> </label>
                            <label className="inline-flex items-center cursor-pointer"> <input type="radio" name="hasDriverTraining" value="no" checked={hasDriverTraining === 'no'} onChange={handleHasDriverTrainingChange} className="form-radio h-4 w-4 text-indigo-600 radio-class"/> <span className="ml-2 text-sm">No</span> </label>
                        </div>
                         {hasDriverTraining === 'yes' && ( isDriverTrainingEditorOpen ? renderDriverTrainingEditor() : renderDriverTrainingSummaryList() )}
                    </div>
                </div>
            )}
        </div> {/* End Section 4 Div */}

        <hr className="my-6 border-gray-200"/> {/* Divider */}

        {/* --- Section 5: PSIRA Registration & Qualifications --- */}
        <div className="p-4 border rounded-md shadow-sm bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-1">PSIRA Registration & Qualifications</h3>
            {/* Part A: Highest PSIRA Grade */}
            <div className="mb-6 border-b border-gray-200 pb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Highest PSIRA Grade Achieved *</label>
                <div className="flex flex-wrap gap-x-6 gap-y-2"> {psiraGradeOptions.map(grade => ( <label key={grade} className="inline-flex items-center cursor-pointer"> <input type="radio" name="highestPsiraGrade" value={grade} checked={highestPsiraGrade === grade} onChange={handlePsiraGradeChange} className="form-radio h-4 w-4 text-indigo-600 radio-class" /> <span className="ml-2 text-sm">Grade {grade}</span> </label> ))} </div>
                {psiraGradeOptions.includes(highestPsiraGrade) && ( isPsiraDetailsEditorOpen ? renderPsiraDetailsEditor() : psiraDetails ? renderPsiraDetailsSummary() : <div className="mt-4"> <button type="button" onClick={openPsiraDetailsEditor} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm shadow-sm hover:bg-gray-300"> + Add PSIRA Details </button> </div> )}
            </div>
            {/* Part B: Specialised PSIRA Qualifications */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Do you hold any Specialised PSIRA qualifications (e.g., NKP, CIT, Armed Response)? *</label>
                <div className="flex items-center space-x-6 mb-4">
                    <label className="inline-flex items-center cursor-pointer"> <input type="radio" name="hasSpecialisedPsira" value="yes" checked={hasSpecialisedPsira === 'yes'} onChange={handleHasSpecialisedPsiraChange} className="form-radio h-4 w-4 text-indigo-600 radio-class"/> <span className="ml-2 text-sm">Yes</span> </label>
                    <label className="inline-flex items-center cursor-pointer"> <input type="radio" name="hasSpecialisedPsira" value="no" checked={hasSpecialisedPsira === 'no'} onChange={handleHasSpecialisedPsiraChange} className="form-radio h-4 w-4 text-indigo-600 radio-class"/> <span className="ml-2 text-sm">No</span> </label>
                </div>
                {hasSpecialisedPsira === 'yes' && ( isSpecialisedPsiraEditorOpen ? renderSpecialisedPsiraEditor() : renderSpecialisedPsiraSummaryList() )}
            </div>
        </div> {/* End Section 5 Div */}

        {/* --- Section 6: Role-Specific Industry Qualifications --- */}
        <div className="p-4 border rounded-md shadow-sm bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-1">Role-Specific Industry Qualifications</h3>
            <p className="text-sm text-gray-500 mb-4"> Add qualifications directly related to specific security roles (e.g., CPO, CIT, AVSEC, Technician). </p>
            {/* Conditionally render editor or summary list */}
            {isRoleSpecificEditorOpen
                ? renderRoleSpecificEditor()
                : renderRoleSpecificSummaryList()
            }
        </div>
        <hr className="my-6 border-gray-200"/> {/* Divider */}

        {/* --- Section 7: Medical Training --- */}
        <div className="p-4 border rounded-md shadow-sm bg-white">
             <h3 className="text-lg font-medium leading-6 text-gray-900 mb-1">Medical Training</h3>
             <p className="text-sm text-gray-500 mb-4"> Add relevant first aid or other medical certifications. </p>
             {/* Conditionally render editor or summary list */}
             {isMedicalEditorOpen
                 ? renderMedicalEditor()
                 : renderMedicalSummaryList()
             }
         </div>
        <hr className="my-6 border-gray-200"/> {/* Divider */}

        {/* --- Section 8: K9 Training --- */}
        <div className="p-4 border rounded-md shadow-sm bg-white">
             <h3 className="text-lg font-medium leading-6 text-gray-900 mb-1">K9 Training</h3>
             <p className="text-sm text-gray-500 mb-4"> Add any relevant canine handling or K9 unit certifications. </p>
             {/* Conditionally render editor or summary list */}
             {isK9EditorOpen
                 ? renderK9TrainingEditor()
                 : renderK9TrainingSummaryList()
             }
         </div>
        <hr className="my-6 border-gray-200"/> {/* Divider */}

        {/* --- Section 9: Computer Efficiency Training --- */}
        <div className="p-4 border rounded-md shadow-sm bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-1">Computer Efficiency Training</h3>
            <p className="text-sm text-gray-500 mb-4">
                Add your computer and software proficiency training, including certificates, formal courses, or demonstrated skills like WPM typing speed.
            </p>
            {/* Conditionally render editor or summary list */}
            {isComputerTrainingEditorOpen
                ? renderComputerTrainingEditor()
                : renderComputerTrainingSummaryList()
            }
        </div>
        <hr className="my-6 border-gray-200"/> {/* Divider after Section 9 */}

        {/* --- Section 10: Strikes and Riot Training --- */}
        <div className="p-4 border rounded-md shadow-sm bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-1">Strikes and Riot Training</h3>
            <p className="text-sm text-gray-500 mb-4">
                Add training related to public order policing, crowd control, use-of-force, or related legal aspects.
            </p>
            {/* Conditionally render editor or summary list */}
            {isStrikesRiotEditorOpen
                ? renderStrikesRiotEditor()
                : renderStrikesRiotSummaryList()
            }
        </div>
        <hr className="my-6 border-gray-200"/> {/* Divider after Section 10 */}

        {/* --- Section 11: Security Technician Training --- */}
        <div className="p-4 border rounded-md shadow-sm bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-1">Security Technician Training</h3>
            <p className="text-sm text-gray-500 mb-4">
                Add certifications or training related to the installation, maintenance, or configuration of security systems (e.g., alarms, CCTV, access control, fire detection, networking).
            </p>
            {/* Conditionally render editor or summary list */}
            {isSecurityTechnicianEditorOpen
                ? renderSecurityTechnicianEditor()
                : renderSecurityTechnicianSummaryList()
            }
        </div>
        <hr className="my-6 border-gray-200"/> {/* Divider after Section 11 */}

        {/* --- Section 12: Other Skills, Licenses & Certifications --- */}
        <div className="p-4 border rounded-md shadow-sm bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-1">Other Skills, Licenses & Certifications</h3>
            <p className="text-sm text-gray-500 mb-4">
                Use this section to add any other relevant qualifications, skills, licenses, or certifications not covered in the previous sections (e.g., specific non-security software, trade skills, language proficiency certs, etc.). Remember to upload proof.
            </p>
            {/* Render the combined list and inline form */}
            {renderOtherQualifications()} {/* Ensure this calls the corrected function */}
        </div>
        {/* No more dividers or placeholders after the last section */}

    </div> // End Main Content div
  );

  // --- Main Component Return ---
  return (
    <div>
      {!disclaimerAccepted ? renderDisclaimer() : renderMainContent()}
      <div className="flex justify-between pt-6 mt-8 border-t border-gray-200">
        <button type="button" onClick={onBack} className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"> Back </button>
        <button type="button" onClick={onNext} disabled={!disclaimerAccepted} className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${!disclaimerAccepted ? 'opacity-50 cursor-not-allowed' : ''}`} > Next </button>
      </div>
      <style>{` /* ... CSS styles ... */ `}</style>
    </div>
  );
};

export default Step5Qualifications;

