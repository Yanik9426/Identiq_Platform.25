import { db } from '../config/firebase'; // Existing import
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { CandidateProfile } from '../types/candidate'; // Import the interface
import { logAuditEvent } from './auditService'; // <-- Add this line

/**
 * Creates or overwrites a candidate profile document using the user's UID as the document ID.
 * @param uid The user's UID (will be the document ID).
 * @param profileData The initial data for the candidate profile, matching the CandidateProfile interface.
 * @returns True if successful, false otherwise.
 */
export const createCandidateProfile = async (
  uid: string,
  // Ensure profileData includes all fields *except* those auto-set (userId, timestamps, profileStatus)
  profileData: Omit<CandidateProfile, 'userId' | 'createdAt' | 'updatedAt' | 'profileStatus'>
): Promise<boolean> => {
  // *** ENHANCED VALIDATION CHECKS ***
  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    console.error('Validation Error: UID is required and must be a non-empty string.');
    return false;
  }

  // Helper Regex for YYYY-MM-DD date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  // Helper function for date validation (basic format check)
  const isValidDateString = (dateStr: string | undefined | null): boolean => {
      if (!dateStr || typeof dateStr !== 'string') return false;
      return dateRegex.test(dateStr);
      // Add more robust validation (e.g., using new Date() or a library) if needed
  };

  // --- Step 1: Personal Info Validation ---
  if (!profileData.personalInfo) {
    console.error('Validation Error: Personal info object is required.');
    return false;
  }
  const personalInfo = profileData.personalInfo; // Alias for brevity

  if (!personalInfo.firstName || typeof personalInfo.firstName !== 'string' || personalInfo.firstName.trim() === '') {
    console.error('Validation Error: First name is required.');
    return false;
  }
  if (!personalInfo.lastName || typeof personalInfo.lastName !== 'string' || personalInfo.lastName.trim() === '') {
    console.error('Validation Error: Last name is required.');
    return false;
  }
  if (!personalInfo.cellphoneNumber || typeof personalInfo.cellphoneNumber !== 'string' || personalInfo.cellphoneNumber.trim() === '') {
    console.error('Validation Error: Cellphone number is required.');
    return false;
  }
  if (typeof personalInfo.isWhatsappSameAsCell !== 'boolean') {
    console.error('Validation Error: isWhatsappSameAsCell must be a boolean.');
    return false;
  }
  // Only require whatsappNumber if isWhatsappSameAsCell is false (assuming it's pre-filled otherwise)
  if (!personalInfo.isWhatsappSameAsCell && (!personalInfo.whatsappNumber || typeof personalInfo.whatsappNumber !== 'string' || personalInfo.whatsappNumber.trim() === '')) {
    console.error('Validation Error: Whatsapp number is required when different from cellphone.');
    return false;
  }
  if (!personalInfo.email || typeof personalInfo.email !== 'string' || personalInfo.email.trim() === '') {
    console.error('Validation Error: Email is required.');
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(personalInfo.email)) {
    console.error('Validation Error: Invalid email format.');
    return false;
  }
  if (!personalInfo.idNumber || typeof personalInfo.idNumber !== 'string' || personalInfo.idNumber.trim() === '') {
    console.error('Validation Error: ID number is required.');
    return false;
    // Add ID number format validation here if needed (e.g., length for SA ID)
  }
  // 3. Date Format Validation
  if (!isValidDateString(personalInfo.dateOfBirth)) {
    console.error('Validation Error: Date of birth is required in YYYY-MM-DD format.');
    return false;
  }
  if (!personalInfo.homeLanguage || typeof personalInfo.homeLanguage !== 'string' || personalInfo.homeLanguage.trim() === '') {
    console.error('Validation Error: Home language is required.');
    return false;
  }
  // 4. Specific Value Validation
  const allowedGenders = ['male', 'female', 'other', 'prefer_not_to_say', '']; // Allow empty if not strictly required? Adjust as needed.
  if (personalInfo.gender === undefined || !allowedGenders.includes(personalInfo.gender)) {
    console.error(`Validation Error: Gender must be one of: ${allowedGenders.join(', ')}.`);
    return false;
  }
  const allowedYesNo = ['yes', 'no', '']; // Allow empty if not strictly required? Adjust as needed.
   if (personalInfo.visibleTattoos === undefined || !allowedYesNo.includes(personalInfo.visibleTattoos)) {
    console.error(`Validation Error: Visible tattoos must be one of: 'yes', 'no', ''.`);
    return false;
  }
  if (personalInfo.ownTransport === undefined || !allowedYesNo.includes(personalInfo.ownTransport)) {
    console.error(`Validation Error: Own transport must be one of: 'yes', 'no', ''.`);
    return false;
  }
  const allowedDisabilityStatus = ['prefer_not_to_say', 'yes', 'no'];
  if (!personalInfo.disabilityStatus || !allowedDisabilityStatus.includes(personalInfo.disabilityStatus)) {
     console.error(`Validation Error: Disability status must be one of: ${allowedDisabilityStatus.join(', ')}.`);
     return false;
  }

  // --- Step 2: Residential Address Validation ---
  // Optional Address, but if present, validate its fields
  if (profileData.residentialAddress) {
    const address = profileData.residentialAddress; // Alias
    if (!address.addressLine1 || typeof address.addressLine1 !== 'string' || address.addressLine1.trim() === '') {
      console.error('Validation Error: Residential address line 1 is required.');
      return false;
    }
    if (!address.suburb || typeof address.suburb !== 'string' || address.suburb.trim() === '') {
      console.error('Validation Error: Residential suburb is required.');
      return false;
    }
    if (!address.city || typeof address.city !== 'string' || address.city.trim() === '') {
      console.error('Validation Error: Residential city is required.');
      return false;
    }
    if (!address.province || typeof address.province !== 'string' || address.province.trim() === '') {
      console.error('Validation Error: Residential province is required.');
      return false;
    }
    if (!address.postalCode || typeof address.postalCode !== 'string' || address.postalCode.trim() === '') {
      console.error('Validation Error: Residential postal code is required.');
      return false;
    }
  }

  // --- Step 4: Employment Validation ---
  const allowedHasExperience = ['yes', 'no', '']; // Allow empty if not strictly required?
  if (profileData.hasExperience === undefined || !allowedHasExperience.includes(profileData.hasExperience)) {
      console.error(`Validation Error: Has experience must be one of: 'yes', 'no', ''.`);
      return false;
  }

  if (profileData.hasExperience === 'yes') {
    if (!profileData.yearsExperience || typeof profileData.yearsExperience !== 'string' || profileData.yearsExperience.trim() === '') {
      console.error('Validation Error: Years of experience is required when hasExperience is yes.');
      return false;
    }
    if (!profileData.fieldsOfExperience || !Array.isArray(profileData.fieldsOfExperience) || profileData.fieldsOfExperience.length === 0) {
      console.error('Validation Error: Fields of experience are required (non-empty array) when hasExperience is yes.');
      return false;
    }
    if (!profileData.employmentHistory || !Array.isArray(profileData.employmentHistory) || profileData.employmentHistory.length === 0) {
      console.error('Validation Error: Employment history is required (non-empty array) when hasExperience is yes.');
      return false;
    }
    // 2. Array Element Validation (Employment History)
    for (const job of profileData.employmentHistory) {
      if (!job.companyName || typeof job.companyName !== 'string' || job.companyName.trim() === '') {
        console.error('Validation Error: Company name is required in employment history entry.');
        return false;
      }
      if (!isValidDateString(job.startDate)) {
        console.error('Validation Error: Start date is required in YYYY-MM-DD format in employment history entry.');
        return false;
      }
       // Allow 'Present' or a valid date for endDate
      if (!job.endDate || (typeof job.endDate === 'string' && job.endDate.toLowerCase() !== 'present' && !isValidDateString(job.endDate))) {
           console.error('Validation Error: End date must be "Present" or a valid date (YYYY-MM-DD) in employment history entry.');
           return false;
      }
      if (!job.position || typeof job.position !== 'string' || job.position.trim() === '') {
          console.error('Validation Error: Position is required in employment history entry.');
          return false;
      }
       // Validate other required fields like refName, refNumber if they are strictly required
       if (!job.refName || typeof job.refName !== 'string' || job.refName.trim() === '') {
           console.error('Validation Error: Reference name is required in employment history entry.');
           return false;
       }
       if (!job.refNumber || typeof job.refNumber !== 'string' || job.refNumber.trim() === '') {
           console.error('Validation Error: Reference number is required in employment history entry.');
           return false;
       }
    }

    if (!profileData.interestedFields || !Array.isArray(profileData.interestedFields) || profileData.interestedFields.length === 0) {
      console.error('Validation Error: Interested fields are required (non-empty array) when hasExperience is yes.');
      return false;
    }
    if (!profileData.workTypePreference || !Array.isArray(profileData.workTypePreference) || profileData.workTypePreference.length === 0) {
      console.error('Validation Error: Work type preference is required (non-empty array) when hasExperience is yes.');
      return false;
    }
  }

  // --- Step 5: Qualifications Validation ---
   const allowedHasTertiary = ['yes', 'no', '']; // Allow empty if not strictly required?
   if (profileData.hasTertiaryEducation === undefined || !allowedHasTertiary.includes(profileData.hasTertiaryEducation)) {
       console.error(`Validation Error: Has tertiary education must be one of: 'yes', 'no', ''.`);
       return false;
   }
  if (profileData.hasTertiaryEducation === 'yes') {
    if (!profileData.tertiaryEducation || !Array.isArray(profileData.tertiaryEducation) || profileData.tertiaryEducation.length === 0) {
      console.error('Validation Error: Tertiary education list is required (non-empty array) when hasTertiaryEducation is yes.');
      return false;
    }
    // 2. Array Element Validation (Tertiary Education)
    for (const qual of profileData.tertiaryEducation) {
        if (!qual.type || typeof qual.type !== 'string' || qual.type.trim() === '') {
            console.error('Validation Error: Qualification type is required in tertiary education entry.');
            return false;
        }
        if (!qual.institution || typeof qual.institution !== 'string' || qual.institution.trim() === '') {
            console.error('Validation Error: Institution name is required in tertiary education entry.');
            return false;
        }
        if (!qual.qualificationName || typeof qual.qualificationName !== 'string' || qual.qualificationName.trim() === '') {
            console.error('Validation Error: Qualification name is required in tertiary education entry.');
            return false;
        }
         if (!qual.yearCompleted || typeof qual.yearCompleted !== 'string' || qual.yearCompleted.trim() === '') { // Could validate year format too
             console.error('Validation Error: Year completed is required in tertiary education entry.');
             return false;
         }
    }
  }

  // Driver's Licence & Related
   const allowedHasDrivers = ['yes', 'no', '']; // Allow empty if not strictly required?
   if (profileData.hasDriversLicence === undefined || !allowedHasDrivers.includes(profileData.hasDriversLicence)) {
       console.error(`Validation Error: Has driver's license must be one of: 'yes', 'no', ''.`);
       return false;
   }
  if (profileData.hasDriversLicence === 'yes') {
    if (!profileData.driversLicenceDetails) {
      console.error('Validation Error: Driver\'s license details object is required when hasDriversLicence is yes.');
      return false;
    }
    // 1. Nested Validation (Driver's License Details)
    const dlDetails = profileData.driversLicenceDetails;
    if (!dlDetails.code || typeof dlDetails.code !== 'string' || dlDetails.code.trim() === '') {
      console.error('Validation Error: Driver\'s license code is required.');
      return false;
    }
    if (!isValidDateString(dlDetails.issueDate)) {
      console.error('Validation Error: Driver\'s license issue date is required in YYYY-MM-DD format.');
      return false;
    }
     if (!isValidDateString(dlDetails.expiryDate)) {
       console.error('Validation Error: Driver\'s license expiry date is required in YYYY-MM-DD format.');
       return false;
     }
  }

   const allowedHasPrdp = ['yes', 'no', '']; // Allow empty if not strictly required?
   if (profileData.hasPrdp === undefined || !allowedHasPrdp.includes(profileData.hasPrdp)) {
       console.error(`Validation Error: Has PrDP must be one of: 'yes', 'no', ''.`);
       return false;
   }
  if (profileData.hasPrdp === 'yes') {
    if (!profileData.prdpDetails) {
      console.error('Validation Error: PrDP details object is required when hasPrdp is yes.');
      return false;
    }
    // 1. Nested Validation (PrDP Details)
    const prdp = profileData.prdpDetails;
     if (!prdp.categories || !Array.isArray(prdp.categories) || prdp.categories.length === 0) {
         console.error('Validation Error: PrDP categories are required (non-empty array).');
         return false;
     }
     if (!isValidDateString(prdp.expiryDate)) {
         console.error('Validation Error: PrDP expiry date is required in YYYY-MM-DD format.');
         return false;
     }
  }

   const allowedHasDriverTraining = ['yes', 'no', '']; // Allow empty if not strictly required?
   if (profileData.hasDriverTraining === undefined || !allowedHasDriverTraining.includes(profileData.hasDriverTraining)) {
       console.error(`Validation Error: Has driver training must be one of: 'yes', 'no', ''.`);
       return false;
   }
  if (profileData.hasDriverTraining === 'yes') {
    if (!profileData.driverTrainingList || !Array.isArray(profileData.driverTrainingList) || profileData.driverTrainingList.length === 0) {
      console.error('Validation Error: Driver training list is required (non-empty array) when hasDriverTraining is yes.');
      return false;
    }
     // 2. Array Element Validation (Driver Training)
     for (const training of profileData.driverTrainingList) {
         if (!training.trainingName || typeof training.trainingName !== 'string' || training.trainingName.trim() === '') {
             console.error('Validation Error: Training name is required in driver training entry.');
             return false;
         }
         if (training.trainingName === 'Other' && (!training.otherTrainingName || training.otherTrainingName.trim() === '')) {
              console.error('Validation Error: Other training name is required when "Other" is selected.');
              return false;
         }
         if (!training.provider || typeof training.provider !== 'string' || training.provider.trim() === '') {
              console.error('Validation Error: Training provider is required in driver training entry.');
              return false;
         }
          if (!isValidDateString(training.dateCompleted)) {
              console.error('Validation Error: Date completed is required in YYYY-MM-DD format in driver training entry.');
              return false;
          }
     }
  }

  // PSIRA
  // highestPsiraGrade is optional, only validate details if grade is provided
  if (profileData.highestPsiraGrade && typeof profileData.highestPsiraGrade === 'string' && profileData.highestPsiraGrade.trim() !== '') {
    if (!profileData.psiraDetails) {
      console.error('Validation Error: PSIRA details object is required when highestPsiraGrade is provided.');
      return false;
    }
     // 1. Nested Validation (PSIRA Details)
     const psira = profileData.psiraDetails;
     if (!psira.psiraNumber || typeof psira.psiraNumber !== 'string' || psira.psiraNumber.trim() === '') {
         console.error('Validation Error: PSIRA number is required.');
         return false;
     }
      if (!psira.trainingProvider || typeof psira.trainingProvider !== 'string' || psira.trainingProvider.trim() === '') {
          console.error('Validation Error: PSIRA training provider is required.');
          return false;
      }
      if (!isValidDateString(psira.issueDate)) {
          console.error('Validation Error: PSIRA issue date is required in YYYY-MM-DD format.');
          return false;
      }
      if (!isValidDateString(psira.expiryDate)) {
          console.error('Validation Error: PSIRA expiry date is required in YYYY-MM-DD format.');
          return false;
      }
  }

   const allowedHasSpecialisedPsira = ['yes', 'no', '']; // Allow empty if not strictly required?
   if (profileData.hasSpecialisedPsira === undefined || !allowedHasSpecialisedPsira.includes(profileData.hasSpecialisedPsira)) {
       console.error(`Validation Error: Has specialised PSIRA must be one of: 'yes', 'no', ''.`);
       return false;
   }
  if (profileData.hasSpecialisedPsira === 'yes') {
    if (!profileData.specialisedPsiraList || !Array.isArray(profileData.specialisedPsiraList) || profileData.specialisedPsiraList.length === 0) {
      console.error('Validation Error: Specialised PSIRA list is required (non-empty array) when hasSpecialisedPsira is yes.');
      return false;
    }
     // 2. Array Element Validation (Specialised PSIRA)
      for (const spQual of profileData.specialisedPsiraList) {
          if (!spQual.qualificationName || typeof spQual.qualificationName !== 'string' || spQual.qualificationName.trim() === '') {
              console.error('Validation Error: Qualification name is required in specialised PSIRA entry.');
              return false;
          }
          // Add other checks for provider, dateCompleted, etc. as needed
      }
  }

  // Add validation loops for other lists if needed:
  // roleSpecificQualificationsList, medicalTrainingList, k9TrainingList, computerTrainingList, strikesRiotTrainingList, securityTechnicianTrainingList, otherQualificationsList

  // --- Step 6: Firearms Validation ---
  const allowedHasProficiency = ['yes', 'no', ''];
  if (profileData.hasProficiencyCertificate === undefined || !allowedHasProficiency.includes(profileData.hasProficiencyCertificate)) {
       console.error(`Validation Error: Has proficiency certificate must be one of: 'yes', 'no', ''.`);
       return false;
  }
  if (profileData.hasProficiencyCertificate === 'yes') {
    if (!profileData.proficiencyCertificateList || !Array.isArray(profileData.proficiencyCertificateList) || profileData.proficiencyCertificateList.length === 0) {
      console.error('Validation Error: Proficiency certificate list required (non-empty array) when hasProficiencyCertificate is yes.');
      return false;
    }
     // 2. Array Element Validation (Proficiency Certs)
      for (const cert of profileData.proficiencyCertificateList) {
           if (!cert.category || typeof cert.category !== 'string' || cert.category.trim() === '') {
              console.error('Validation Error: Category is required in proficiency certificate entry.');
              return false;
          }
          // Add other checks for institutionName, issueDate, etc.
           if (!isValidDateString(cert.issueDate)) {
               console.error('Validation Error: Issue date required (YYYY-MM-DD) in proficiency certificate entry.');
               return false;
           }
      }
  }

  const allowedHasCompetency = ['yes', 'no', ''];
  if (profileData.hasCompetencyCertificate === undefined || !allowedHasCompetency.includes(profileData.hasCompetencyCertificate)) {
       console.error(`Validation Error: Has competency certificate must be one of: 'yes', 'no', ''.`);
       return false;
  }
  if (profileData.hasCompetencyCertificate === 'yes') {
    if (!profileData.competencyCertificateList || !Array.isArray(profileData.competencyCertificateList) || profileData.competencyCertificateList.length === 0) {
      console.error('Validation Error: Competency certificate list required (non-empty array) when hasCompetencyCertificate is yes.');
      return false;
    }
      // 2. Array Element Validation (Competency Certs)
      for (const cert of profileData.competencyCertificateList) {
           if (!cert.category || typeof cert.category !== 'string' || cert.category.trim() === '') {
              console.error('Validation Error: Category is required in competency certificate entry.');
              return false;
          }
           if (!isValidDateString(cert.issueDate)) {
               console.error('Validation Error: Issue date required (YYYY-MM-DD) in competency certificate entry.');
               return false;
           }
           if (!isValidDateString(cert.expiryDate)) {
                console.error('Validation Error: Expiry date required (YYYY-MM-DD) in competency certificate entry.');
                return false;
            }
            // Add check for sapsCompetencyNo
      }
  }

  const allowedHasAdditionalTraining = ['yes', 'no', ''];
   if (profileData.hasAdditionalTraining === undefined || !allowedHasAdditionalTraining.includes(profileData.hasAdditionalTraining)) {
        console.error(`Validation Error: Has additional firearm training must be one of: 'yes', 'no', ''.`);
        return false;
   }
  if (profileData.hasAdditionalTraining === 'yes') {
    if (!profileData.additionalFirearmTrainingList || !Array.isArray(profileData.additionalFirearmTrainingList) || profileData.additionalFirearmTrainingList.length === 0) {
      console.error('Validation Error: Additional firearm training list required (non-empty array) when hasAdditionalTraining is yes.');
      return false;
    }
     // 2. Array Element Validation (Additional Firearm Training)
      for (const training of profileData.additionalFirearmTrainingList) {
            if (!training.category || typeof training.category !== 'string' || training.category.trim() === '') {
                console.error('Validation Error: Category is required in additional firearm training entry.');
                return false;
            }
            // Add checks for trainingName, provider, dateCompleted
            if (!isValidDateString(training.dateCompleted)) {
                console.error('Validation Error: Date completed required (YYYY-MM-DD) in additional firearm training entry.');
                return false;
            }
      }
  }

  // *** END VALIDATION ***

  try {
    // Create a reference to the document path: candidateProfiles/{uid}
    const profileDocRef = doc(db, 'candidateProfiles', uid);

    // Prepare final data object including auto-set fields
    const finalProfileData = {
        ...profileData, // Spread the validated profile data
        userId: uid,    // Ensure userId field is set
        profileStatus: 'Incomplete', // 6. Set Default Profile Status
        createdAt: serverTimestamp(), // Use server timestamp for creation time
        updatedAt: serverTimestamp(), // Use server timestamp for initial update time
    };


    // Use setDoc to create (or overwrite!) the document at the specific path.
    await setDoc(profileDocRef, finalProfileData);

    console.log(`Candidate profile created/updated for UID: ${uid}`);

    await logAuditEvent(
      uid, // The user ID associated with this new profile
      'candidate_profile_created',
      { type: 'candidateProfile', id: uid },
      { /* Optional: maybe log initial sections filled */ }
    );

    return true;
  } catch (error) {
    console.error('Error creating candidate profile:', error);
    return false;
  }
};

/**
 * Finds candidate profiles considered inactive based on certain criteria
 * and anonymizes their personally identifiable information.
 * (Placeholder implementation)
 *
 * @returns {Promise<number>} A promise that resolves with the number of profiles anonymized.
 */
export async function findAndAnonymizeInactiveProfiles(): Promise<number> {
  console.log('Placeholder: Running findAndAnonymizeInactiveProfiles...');
  // TODO: Implement the actual logic:
  // 1. Define criteria for inactivity (e.g., last login > 1 year ago).
  // 2. Query the database (e.g., Firestore) for profiles matching the criteria.
  // 3. For each matching profile:
  //    - Update the profile document, replacing sensitive fields (name, email, phone, address, ID number etc.) with generic values (e.g., "anonymized", null).
  //    - Keep non-sensitive data if needed for aggregate stats.
  //    - Log the anonymization action for the specific profile using logAuditEvent.
  // 4. Count how many profiles were successfully anonymized.

  const anonymizedCount = 0; // Placeholder value
  console.log(`Placeholder: Would have anonymized ${anonymizedCount} profiles.`);

  // We still need to log the overall job completion in anonymizationJob.ts,
  // but you might also log individual anonymization events here if needed:
  // await logAuditEvent('system', 'profile_anonymized', { type: 'candidateProfile', id: profileId });

  return anonymizedCount; // Return the count
}