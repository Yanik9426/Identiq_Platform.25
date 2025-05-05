import { db } from '../config/firebase'; // Import from the correct path
import { collection, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Vacancy, VacancyStatus } from '../types/vacancy';
import { logAuditEvent } from './auditService';

async function createVacancy(
    companyUserId: string,
    vacancyData: Omit<Vacancy, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string | null> {
  // Validation checks for Vacancy creation
  if (!vacancyData.companyId || vacancyData.companyId.trim() === '') {
    console.error('Validation Error: Company ID is required within vacancy data.');
    return null;
  }
  if (!vacancyData.companyName || vacancyData.companyName.trim() === '') {
    console.error('Validation Error: Company name is required.');
    return null;
  }
  if (!vacancyData.title || vacancyData.title.trim() === '') {
    console.error('Validation Error: Title is required.');
    return null;
  }
  if (!vacancyData.description || vacancyData.description.trim() === '') {
    console.error('Validation Error: Description is required.');
    return null;
  }
  if (vacancyData.description.length < 20 || vacancyData.description.length > 2000) {
    console.error('Validation Error: Description must be between 20 and 2000 characters.');
    return null;
  }
  if (!vacancyData.status || !Object.values(VacancyStatus).includes(vacancyData.status)) {
    console.error('Validation Error: Status is required and must be a valid status.');
    return null;
  }
  if (!vacancyData.location) {
    console.error('Validation Error: Location is required.');
    return null;
  } else {
    // Validate location fields
    if (!vacancyData.location.city || vacancyData.location.city.trim() === '') {
      console.error('Validation Error: Location city is required.');
      return null;
    }
    if (!vacancyData.location.province || vacancyData.location.province.trim() === '') {
      console.error('Validation Error: Location province is required.');
      return null;
    }
  }
  if (!vacancyData.requirements) {
    console.error('Validation Error: Requirements are required.');
    return null;
  } else {
    // Basic check to ensure at least one requirement is specified
    const hasAtLeastOneRequirement = Object.values(vacancyData.requirements).some(value => value !== undefined);
    if (!hasAtLeastOneRequirement) {
      console.error('Validation Error: At least one requirement must be specified.');
      return null;
    }
  }

  // Validate salaryRange (if present)
  if (vacancyData.salaryRange !== undefined) {
    if (typeof vacancyData.salaryRange.min === 'number' && typeof vacancyData.salaryRange.max === 'number') {
      if (vacancyData.salaryRange.min > vacancyData.salaryRange.max) {
        console.error('Validation Error: Minimum salary cannot be greater than maximum salary.');
        return null;
      }
      if (vacancyData.salaryRange.min <= 0 || vacancyData.salaryRange.max <= 0) {
        console.error('Validation Error: Minimum and maximum salary must be positive numbers.');
        return null;
      }
    }
  }

  // Validate location coordinates (if present)
  if (
    (vacancyData.location.latitude !== undefined && vacancyData.location.longitude === undefined) ||
    (vacancyData.location.latitude === undefined && vacancyData.location.longitude !== undefined)
  ) {
    console.error('Validation Error: Both latitude and longitude must be provided.');
    return null;
  }

  try {
    const vacancyCollectionRef = collection(db, 'vacancies');
    const docRef = await addDoc(vacancyCollectionRef, {
      ...vacancyData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`Vacancy created with ID: ${docRef.id}`);
    await logAuditEvent(
        companyUserId,
        'vacancy_created',
        { type: 'vacancy', id: docRef.id },
        { companyId: vacancyData.companyId, title: vacancyData.title }
    );
    return docRef.id;
  } catch (error) {
    console.error('Error creating vacancy:', error);
    return null;
  }
}

async function updateVacancy(
    updatingUserId: string,
    vacancyId: string,
    updates: Partial<Vacancy>
): Promise<void> {
  // Validation checks for Vacancy updates
  if (updates.companyId !== undefined && (!updates.companyId || updates.companyId.trim() === '')) {
    console.error('Validation Error: Company ID cannot be empty.');
    return;
  }
  if (updates.companyName !== undefined && (!updates.companyName || updates.companyName.trim() === '')) {
    console.error('Validation Error: Company name cannot be empty.');
    return;
  }
  if (updates.title !== undefined && (!updates.title || updates.title.trim() === '')) {
    console.error('Validation Error: Title cannot be empty.');
    return;
  }
  if (updates.description !== undefined && (!updates.description || updates.description.trim() === '')) {
    console.error('Validation Error: Description cannot be empty.');
    return;
  }
  if (updates.description !== undefined && (updates.description.length < 20 || updates.description.length > 2000)) {
    console.error('Validation Error: Description must be between 20 and 2000 characters.');
    return;
  }
  if (updates.status !== undefined && !Object.values(VacancyStatus).includes(updates.status)) {
    console.error('Validation Error: Invalid status.');
    return;
  }
  if (updates.location !== undefined) {
    // Validate location fields if location is being updated
    if (updates.location.city !== undefined && (!updates.location.city || updates.location.city.trim() === '')) {
      console.error('Validation Error: Location city cannot be empty.');
      return;
    }
    if (updates.location.province !== undefined && (!updates.location.province || updates.location.province.trim() === '')) {
      console.error('Validation Error: Location province cannot be empty.');
      return;
    }
  }

  // Validate salaryRange (if being updated)
  if (updates.salaryRange !== undefined) {
    if (typeof updates.salaryRange.min === 'number' && typeof updates.salaryRange.max === 'number') {
      if (updates.salaryRange.min > updates.salaryRange.max) {
        console.error('Validation Error: Minimum salary cannot be greater than maximum salary.');
        return;
      }
      if (updates.salaryRange.min <= 0 || updates.salaryRange.max <= 0) {
        console.error('Validation Error: Minimum and maximum salary must be positive numbers.');
        return;
      }
    }
  }

  // Validate location coordinates (if being updated)
  if (updates.location !== undefined) {
    if (
      (updates.location.latitude !== undefined && updates.location.longitude === undefined) ||
      (updates.location.latitude === undefined && updates.location.longitude !== undefined)
    ) {
      console.error('Validation Error: Both latitude and longitude must be provided.');
      return;
    }
  }

  // Important: Ensure companyId isn't being changed if it's part of 'updates'
  // Usually, you wouldn't allow changing the companyId of an existing vacancy this way.
  if (updates.companyId !== undefined) {
      console.warn("Attempting to update companyId on a vacancy is usually not allowed. Ignoring companyId update.");
      delete updates.companyId; // Remove companyId from updates if present
  }

  try {
    const vacancyDocRef = doc(db, 'vacancies', vacancyId);
    await updateDoc(vacancyDocRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log(`Vacancy updated for ID: ${vacancyId}`);
    await logAuditEvent(
        updatingUserId,
        'vacancy_updated',
        { type: 'vacancy', id: vacancyId },
        { updatedFields: Object.keys(updates) }
    );
  } catch (error) {
    console.error('Error updating vacancy:', error);
  }
}

export { createVacancy, updateVacancy };