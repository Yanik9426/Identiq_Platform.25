import { db } from '../config/firebase'; // Import from the correct path
import { MetricsCurrent, MetricsSnapshot, UsagePattern } from '../types/analytics';
import { collection, doc, setDoc, addDoc, Timestamp } from 'firebase/firestore';
import { logAuditEvent } from './auditService';

async function createMetricsCurrent(metricsData: MetricsCurrent): Promise<void> {
  // === Validation Checks for MetricsCurrent ===

  // 1. Required Non-negative Numbers
  if (typeof metricsData.mrr !== 'number' || metricsData.mrr < 0) {
    throw new Error('Monthly Recurring Revenue (MRR) must be a non-negative number.');
  }
  if (typeof metricsData.arr !== 'number' || metricsData.arr < 0) {
    throw new Error('Annual Recurring Revenue (ARR) must be a non-negative number.');
  }
  if (typeof metricsData.churnRate !== 'number' || metricsData.churnRate < 0) {
    throw new Error('Churn Rate must be a non-negative number.');
  }
  if (typeof metricsData.cltv !== 'number' || metricsData.cltv < 0) {
    throw new Error('Customer Lifetime Value (CLTV) must be a non-negative number.');
  }

  // 2. Optional Non-negative Number
  if (metricsData.activeCustomers !== undefined && (typeof metricsData.activeCustomers !== 'number' || metricsData.activeCustomers < 0)) {
    throw new Error('Active Customers must be a non-negative number.');
  }

  // 3. Required Timestamp
  if (!metricsData.lastUpdated || !(metricsData.lastUpdated instanceof Timestamp)) {
    throw new Error('Last Updated Timestamp is required and must be a valid Firestore Timestamp.');
  }

  // === End Validation ===

  try {
    await setDoc(doc(db, 'metrics', 'current'), metricsData); // Assuming a single document named 'current'
    await logAuditEvent('system', 'metrics_snapshot_generated', { type: 'system', id: 'analytics' }, { /* details like time range */ });
  } catch (error) {
    console.error('Error creating MetricsCurrent:', error);
    throw new Error('Failed to create MetricsCurrent data.');
  }
}

async function updateMetricsCurrent(updates: Partial<MetricsCurrent>): Promise<void> {
  // === Validation Checks for Updates (Partial Data) ===

  // 1. Non-negative Numbers (if present)
  if (updates.mrr !== undefined && (typeof updates.mrr !== 'number' || updates.mrr < 0)) {
    throw new Error('Monthly Recurring Revenue (MRR) must be a non-negative number.');
  }
  if (updates.arr !== undefined && (typeof updates.arr !== 'number' || updates.arr < 0)) {
    throw new Error('Annual Recurring Revenue (ARR) must be a non-negative number.');
  }
   if (updates.churnRate !== undefined && (typeof updates.churnRate !== 'number' || updates.churnRate < 0)) {
    throw new Error('Churn Rate must be a non-negative number.');
  }
  if (updates.cltv !== undefined && (typeof updates.cltv !== 'number' || updates.cltv < 0)) {
    throw new Error('Customer Lifetime Value (CLTV) must be a non-negative number.');
  }

  // 2. Optional Non-negative Number (if present)
  if (updates.activeCustomers !== undefined && (typeof updates.activeCustomers !== 'number' || updates.activeCustomers < 0)) {
    throw new Error('Active Customers must be a non-negative number.');
  }

  // 3. Timestamp (if present)
  if (updates.lastUpdated !== undefined && !(updates.lastUpdated instanceof Timestamp)) {
    throw new Error('Last Updated Timestamp must be a valid Firestore Timestamp.');
  }

  // === End Validation ===

  try {
    // Ensure we update the timestamp if other fields are updated
    const updatesWithTimestamp = { ...updates };
    if (Object.keys(updates).length > 0 && !updates.lastUpdated) {
      updatesWithTimestamp.lastUpdated = Timestamp.now();
    }
    await setDoc(doc(db, 'metrics', 'current'), updatesWithTimestamp, { merge: true });
    await logAuditEvent('system', 'metrics_snapshot_generated', { type: 'system', id: 'analytics' }, { /* details like time range */ });
  } catch (error) {
     console.error('Error updating MetricsCurrent:', error);
    throw new Error('Failed to update MetricsCurrent data.');
  }
}

async function createMetricsSnapshot(snapshotData: MetricsSnapshot): Promise<string> {
  // === Validation Checks for MetricsSnapshot ===

  // 1. Required Timestamp
  if (!snapshotData.date || !(snapshotData.date instanceof Timestamp)) {
    throw new Error('Snapshot Date is required and must be a valid Firestore Timestamp.');
  }

  // 2. Required Non-negative Numbers
  if (typeof snapshotData.mrr !== 'number' || snapshotData.mrr < 0) {
    throw new Error('Monthly Recurring Revenue (MRR) must be a non-negative number.');
  }
  if (typeof snapshotData.arr !== 'number' || snapshotData.arr < 0) {
    throw new Error('Annual Recurring Revenue (ARR) must be a non-negative number.');
  }
   if (typeof snapshotData.churnRate !== 'number' || snapshotData.churnRate < 0) {
    throw new Error('Churn Rate must be a non-negative number.');
  }
  if (typeof snapshotData.cltv !== 'number' || snapshotData.cltv < 0) {
    throw new Error('Customer Lifetime Value (CLTV) must be a non-negative number.');
  }

  // 3. Optional Non-negative Number
  if (snapshotData.activeCustomers !== undefined && (typeof snapshotData.activeCustomers !== 'number' || snapshotData.activeCustomers < 0)) {
    throw new Error('Active Customers must be a non-negative number.');
  }

  // === End Validation ===

  try {
    const docRef = await addDoc(collection(db, 'metricsSnapshots'), snapshotData);
    await logAuditEvent('system', 'metrics_snapshot_generated', { type: 'system', id: 'analytics' }, { /* details like time range */ });
    return docRef.id;
  } catch (error) {
     console.error('Error creating MetricsSnapshot:', error);
    throw new Error('Failed to create MetricsSnapshot data.');
  }
}

async function createUsagePattern(patternData: UsagePattern): Promise<string> {
  // === Validation Checks for UsagePattern ===

  // 1. Required Timestamp
  if (!patternData.date || !(patternData.date instanceof Timestamp)) {
    throw new Error('Date is required and must be a valid Firestore Timestamp.');
  }

  // 2. Required Non-negative Number
  if (typeof patternData.totalDownloads !== 'number' || patternData.totalDownloads < 0) {
    throw new Error('Total Downloads must be a non-negative number.');
  }

  // 3. Validate Hourly Counts Object and Keys
  if (!patternData.hourlyCounts || typeof patternData.hourlyCounts !== 'object') {
    throw new Error('Hourly Counts must be a valid object.');
  } else {
    for (const hour in patternData.hourlyCounts) {
      const hourNum = Number(hour);
      if (isNaN(hourNum) || hourNum < 0 || hourNum > 23 || !Number.isInteger(hourNum)) {
        throw new Error(`Hourly Counts keys must be integers between 0 and 23. Found: ${hour}`);
      }
      if (typeof patternData.hourlyCounts[hourNum] !== 'number' || patternData.hourlyCounts[hourNum] < 0) {
        throw new Error(`Hourly Counts values must be non-negative numbers. Found for hour ${hour}: ${patternData.hourlyCounts[hourNum]}`);
      }
    }
  }

  // 4. Validate Day of Week Counts Object and Keys
  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  if (!patternData.dayOfWeekCounts || typeof patternData.dayOfWeekCounts !== 'object') {
    throw new Error('Day of Week Counts must be a valid object.');
  } else {
    for (const day in patternData.dayOfWeekCounts) {
      if (!validDays.includes(day)) {
        throw new Error(`Day of Week Counts keys must be valid day names (e.g., 'Monday'). Found: ${day}`);
      }
      if (typeof patternData.dayOfWeekCounts[day] !== 'number' || patternData.dayOfWeekCounts[day] < 0) {
        throw new Error(`Day of Week Counts values must be non-negative numbers. Found for day ${day}: ${patternData.dayOfWeekCounts[day]}`);
      }
    }
  }

  // 5. Validate By Profile Type Counts Object and Keys
  if (!patternData.byProfileTypeCounts || typeof patternData.byProfileTypeCounts !== 'object') {
     throw new Error('By Profile Type Counts must be a valid object.');
  } else {
    for (const profileType in patternData.byProfileTypeCounts) {
      if (typeof profileType !== 'string' || profileType.trim() === '') {
        throw new Error('By Profile Type Counts keys must be non-empty strings.');
      }
      if (typeof patternData.byProfileTypeCounts[profileType] !== 'number' || patternData.byProfileTypeCounts[profileType] < 0) {
        throw new Error(`By Profile Type Counts values must be non-negative numbers. Found for type ${profileType}: ${patternData.byProfileTypeCounts[profileType]}`);
      }
    }
  }

  // 6. Required Timestamp
  if (!patternData.createdAt || !(patternData.createdAt instanceof Timestamp)) {
    throw new Error('Created At Timestamp is required and must be a valid Firestore Timestamp.');
  }

  // === End Validation ===

  try {
    const docRef = await addDoc(collection(db, 'usagePatterns'), patternData);
    await logAuditEvent('system', 'usage_patterns_aggregated', { type: 'system', id: 'analytics' }, { /* details */ });
    return docRef.id;
  } catch (error) {
     console.error('Error creating UsagePattern:', error);
    throw new Error('Failed to create UsagePattern data.');
  }
}

export { createMetricsCurrent, updateMetricsCurrent, createMetricsSnapshot, createUsagePattern };