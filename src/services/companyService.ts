import { db } from '../config/firebase'; // Import from the correct path
import { collection, doc, setDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { CompanyProfile, CompanyStatus } from '../types/company';
import { logAuditEvent } from './auditService';

async function createCompanyProfile(
    creatorUserId: string,
    companyData: Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string | null> {
  // Validation checks for CompanyProfile creation
  if (!companyData.name || companyData.name.trim() === '') {
    console.error('Validation Error: Company name is required.');
    return null;
  }
  if (!companyData.address) {
    console.error('Validation Error: Company address is required.');
    return null;
  } else {
    // Validate address fields
    if (!companyData.address.addressLine1 || companyData.address.addressLine1.trim() === '') {
      console.error('Validation Error: Address line 1 is required.');
      return null;
    }
    if (!companyData.address.suburb || companyData.address.suburb.trim() === '') {
      console.error('Validation Error: Suburb is required.');
      return null;
    }
    if (!companyData.address.city || companyData.address.city.trim() === '') {
      console.error('Validation Error: City is required.');
      return null;
    }
    if (!companyData.address.province || companyData.address.province.trim() === '') {
      console.error('Validation Error: Province is required.');
      return null;
    }
    if (!companyData.address.postalCode || companyData.address.postalCode.trim() === '') {
      console.error('Validation Error: Postal code is required.');
      return null;
    }
  }
  if (!companyData.contactNumber || companyData.contactNumber.trim() === '') {
    console.error('Validation Error: Contact number is required.');
    return null;
  }
  if (!companyData.contactEmail || companyData.contactEmail.trim() === '') {
    console.error('Validation Error: Contact email is required.');
    return null;
  }
  // Basic Email Format Validation (Regex - can be improved)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(companyData.contactEmail)) {
    console.error('Validation Error: Invalid email format.');
    return null;
  }
  if (!companyData.status || !Object.values(CompanyStatus).includes(companyData.status)) {
    console.error('Validation Error: Company status is required and must be a valid status.');
    return null;
  }

  // Validate specialistFields (if present)
  if (companyData.specialistFields !== undefined) {
    if (!Array.isArray(companyData.specialistFields)) {
      console.error('Validation Error: Specialist fields must be an array.');
      return null;
    }
  }

  // Validate branches (if present)
  if (companyData.branches !== undefined) {
    if (!Array.isArray(companyData.branches)) {
      console.error('Validation Error: Branches must be an array.');
      return null;
    } else if (companyData.branches.length > 0) {
      for (const branch of companyData.branches) {
        if (!branch.branchName || branch.branchName.trim() === '') {
          console.error('Validation Error: Branch name is required.');
          return null;
        }
        if (!branch.address) {
          console.error('Validation Error: Branch address is required.');
          return null;
        } else {
          // Validate branch address fields
          if (!branch.address.addressLine1 || branch.address.addressLine1.trim() === '') {
            console.error('Validation Error: Branch address line 1 is required.');
            return null;
          }
          if (!branch.address.suburb || branch.address.suburb.trim() === '') {
            console.error('Validation Error: Branch suburb is required.');
            return null;
          }
          if (!branch.address.city || branch.address.city.trim() === '') {
            console.error('Validation Error: Branch city is required.');
            return null;
          }
          if (!branch.address.province || branch.address.province.trim() === '') {
            console.error('Validation Error: Branch province is required.');
            return null;
          }
          if (!branch.address.postalCode || branch.address.postalCode.trim() === '') {
            console.error('Validation Error: Branch postal code is required.');
            return null;
          }
        }
      }
    }
  }

  try {
    const companyCollectionRef = collection(db, 'companies');
    const docRef = await addDoc(companyCollectionRef, {
      ...companyData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`Company profile created with ID: ${docRef.id}`);
    await logAuditEvent(
        creatorUserId,
        'company_profile_created',
        { type: 'company', id: docRef.id },
        { companyName: companyData.name }
    );
    return docRef.id;
  } catch (error) {
    console.error('Error creating company profile:', error);
    return null;
  }
}

async function updateCompanyProfile(
    updatingUserId: string,
    companyId: string,
    updates: Partial<CompanyProfile>
): Promise<void> {
  // Validation checks for CompanyProfile updates
  if (updates.name !== undefined && (!updates.name || updates.name.trim() === '')) {
    console.error('Validation Error: Company name cannot be empty.');
    return;
  }
  if (updates.address !== undefined) {
    // Validate address fields if address is being updated
    if (updates.address.addressLine1 !== undefined && (!updates.address.addressLine1 || updates.address.addressLine1.trim() === '')) {
      console.error('Validation Error: Address line 1 cannot be empty.');
      return;
    }
    if (updates.address.suburb !== undefined && (!updates.address.suburb || updates.address.suburb.trim() === '')) {
      console.error('Validation Error: Suburb cannot be empty.');
      return;
    }
    if (updates.address.city !== undefined && (!updates.address.city || updates.address.city.trim() === '')) {
      console.error('Validation Error: City cannot be empty.');
      return;
    }
    if (updates.address.province !== undefined && (!updates.address.province || updates.address.province.trim() === '')) {
      console.error('Validation Error: Province cannot be empty.');
      return;
    }
    if (updates.address.postalCode !== undefined && (!updates.address.postalCode || updates.address.postalCode.trim() === '')) {
      console.error('Validation Error: Postal code cannot be empty.');
      return;
    }
  }
  if (updates.contactNumber !== undefined && (!updates.contactNumber || updates.contactNumber.trim() === '')) {
    console.error('Validation Error: Contact number cannot be empty.');
    return;
  }
  if (updates.contactEmail !== undefined && (!updates.contactEmail || updates.contactEmail.trim() === '')) {
    console.error('Validation Error: Contact email cannot be empty.');
    return;
  }
  if (updates.contactEmail !== undefined) {
    // Basic Email Format Validation (Regex - can be improved)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updates.contactEmail)) {
      console.error('Validation Error: Invalid email format.');
      return;
    }
  }
  if (updates.status !== undefined && !Object.values(CompanyStatus).includes(updates.status)) {
    console.error('Validation Error: Invalid company status.');
    return;
  }

  // Validate specialistFields (if being updated)
  if (updates.specialistFields !== undefined) {
    if (!Array.isArray(updates.specialistFields)) {
      console.error('Validation Error: Specialist fields must be an array.');
      return;
    }
  }

  // Validate branches (if being updated)
  if (updates.branches !== undefined) {
    if (!Array.isArray(updates.branches)) {
      console.error('Validation Error: Branches must be an array.');
      return;
    } else if (updates.branches.length > 0) {
      for (const branch of updates.branches) {
        if (!branch.branchName || branch.branchName.trim() === '') {
          console.error('Validation Error: Branch name cannot be empty.');
          return;
        }
        if (!branch.address) {
          console.error('Validation Error: Branch address cannot be empty.');
          return;
        } else {
          // Validate branch address fields
          if (branch.address.addressLine1 !== undefined && (!branch.address.addressLine1 || branch.address.addressLine1.trim() === '')) {
            console.error('Validation Error: Branch address line 1 cannot be empty.');
            return;
          }
          if (branch.address.suburb !== undefined && (!branch.address.suburb || branch.address.suburb.trim() === '')) {
            console.error('Validation Error: Branch suburb cannot be empty.');
            return;
          }
          if (branch.address.city !== undefined && (!branch.address.city || branch.address.city.trim() === '')) {
            console.error('Validation Error: Branch city cannot be empty.');
            return;
          }
          if (branch.address.province !== undefined && (!branch.address.province || branch.address.province.trim() === '')) {
            console.error('Validation Error: Branch province cannot be empty.');
            return;
          }
          if (branch.address.postalCode !== undefined && (!branch.address.postalCode || branch.address.postalCode.trim() === '')) {
            console.error('Validation Error: Branch postal code cannot be empty.');
            return;
          }
        }
      }
    }
  }

  try {
    const companyDocRef = doc(db, 'companies', companyId);
    await updateDoc(companyDocRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log(`Company profile updated for ID: ${companyId}`);
    await logAuditEvent(
        updatingUserId,
        'company_profile_updated',
        { type: 'company', id: companyId },
        { updatedFields: Object.keys(updates) }
    );
  } catch (error) {
    console.error('Error updating company profile:', error);
  }
}

export { createCompanyProfile, updateCompanyProfile };