import { db } from '../config/firebase'; // Existing import
import { collection, addDoc, serverTimestamp, Timestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { Coupon } from '../types/billing'; // Import the Coupon interface
import { logAuditEvent } from './auditService'; // Import the logAuditEvent function

// Type for data needed to create a new coupon (excluding auto-generated fields)
type CreateCouponData = Omit<Coupon, 'couponId' | 'createdAt' | 'updatedAt'>;

// Define allowed values (consider using Enums from types/billing.ts if created)
const allowedCouponTypes = ['percentage', 'fixed'];
const allowedCouponDurations = ['one_time'];
const allowedCouponApplicabilities = ['base_fee', 'download_fee', 'entire_invoice'];

/**
 * Creates a new coupon document in the 'coupons' collection with an auto-generated ID.
 * @param couponData Data for the new coupon, matching the CreateCouponData type.
 * @returns The ID of the newly created coupon or null if an error occurs.
 */
export const createCoupon = async (couponData: CreateCouponData): Promise<string | null> => {
  // *** VALIDATION CHECKS ***

  // 1. Non-Empty String Check for Code
  if (!couponData.code || typeof couponData.code !== 'string' || couponData.code.trim() === '') {
    console.error('Validation Error: Coupon code is required and must be a non-empty string.');
    return null;
  }
  const trimmedCode = couponData.code.trim(); // Use trimmed code going forward

  // 3. Specific Enum/String Value Checks
  if (!couponData.type || !allowedCouponTypes.includes(couponData.type)) {
    console.error(`Validation Error: Coupon type must be one of: ${allowedCouponTypes.join(', ')}.`);
    return null;
  }
  if (!couponData.duration || !allowedCouponDurations.includes(couponData.duration)) {
     // Currently only 'one_time' is expected
     console.error(`Validation Error: Coupon duration must be 'one_time'.`);
     return null;
  }
  if (!couponData.applicability || !allowedCouponApplicabilities.includes(couponData.applicability)) {
    console.error(`Validation Error: Coupon applicability must be one of: ${allowedCouponApplicabilities.join(', ')}.`);
    return null;
  }

  // Check Value based on Type
  if (typeof couponData.value !== 'number' || couponData.value <= 0) {
    console.error('Validation Error: Coupon value must be a positive number.');
    return null;
  }
  // 4. Percentage Value Range
  if (couponData.type === 'percentage' && couponData.value > 100) {
    console.error('Validation Error: Percentage coupon value cannot exceed 100.');
    return null;
  }

  // 2. Timestamp Validation
  if (!couponData.expirationDate || !(couponData.expirationDate instanceof Timestamp)) {
    console.error('Validation Error: Coupon expiration date is required and must be a valid Firestore Timestamp.');
    return null;
  }
  // Optional: Check if expiration date is in the future
  if (couponData.expirationDate.toMillis() <= Date.now()) {
    console.error('Validation Error: Coupon expiration date must be in the future.');
    return null;
  }

  // 5. Integer Checks
  if (typeof couponData.usageLimitPerCustomer !== 'number' || !Number.isInteger(couponData.usageLimitPerCustomer) || couponData.usageLimitPerCustomer <= 0) {
    console.error('Validation Error: Usage limit per customer must be a positive integer.');
    return null;
  }
  // 6. Optional Field Validation (Integer Check)
  if (couponData.totalUsesAllowed !== undefined) {
     if (typeof couponData.totalUsesAllowed !== 'number' || !Number.isInteger(couponData.totalUsesAllowed) || couponData.totalUsesAllowed <= 0) {
       console.error('Validation Error: Total uses allowed must be a positive integer, if provided.');
       return null;
     }
  }

  // 7. (Advanced/Optional) Check for Code Uniqueness before creating
  try {
      const couponsCollectionRef = collection(db, 'coupons');
      const q = query(couponsCollectionRef, where("code", "==", trimmedCode), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
          console.error(`Validation Error: Coupon code "${trimmedCode}" already exists.`);
          return null; // Code already exists
      }
  } catch (error) {
      console.error("Error checking for existing coupon code: ", error);
      // Decide if you want to proceed or fail here. Failing is safer.
      return null;
  }

  // Prepare final data, using trimmed code
  const finalCouponData = {
      ...couponData,
      code: trimmedCode, // Use the trimmed code
  };

  try {
    const couponsCollectionRef = collection(db, 'coupons');
    // Use addDoc to add a new document with an auto-generated ID.
    // Add timestamps here.
    const docRef = await addDoc(couponsCollectionRef, {
      ...finalCouponData, // Use the validated and potentially modified data
      createdAt: serverTimestamp(), // Use server timestamp for creation time
      updatedAt: serverTimestamp()  // Use server timestamp for initial update time
    });

    console.log("Coupon created with ID: ", docRef.id);
    await logAuditEvent('system', 'coupon_created', { type: 'coupon', id: docRef.id }, { code: trimmedCode });
    return docRef.id; // Return the new document's ID
  } catch (error) {
    console.error("Error creating coupon: ", error);
    return null;
  }
};