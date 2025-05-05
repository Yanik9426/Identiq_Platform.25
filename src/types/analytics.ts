import { Timestamp } from 'firebase/firestore'; // Import Timestamp type

/**
 * Represents the current key financial and performance metrics for the SaaS platform.
 * Stored likely as a single document (e.g., in metrics/current).
 * Ref:
 */
export interface MetricsCurrent {
  mrr: number;                // Monthly Recurring Revenue
  arr: number;                // Annual Recurring Revenue
  churnRate: number;          // Customer churn rate (percentage) over the relevant period
  cltv: number;               // Average Customer Lifetime Value
  activeCustomers?: number;   // Optional: Count of active paying customers
  lastUpdated: Timestamp;     // Timestamp of the last calculation
}

/**
 * Represents a historical snapshot of key metrics at a specific point in time.
 * Used for tracking trends and reporting. Stored in a collection like metricsSnapshots.
 * Ref:
 */
export interface MetricsSnapshot {
  snapshotId?: string;        // Optional: Firestore document ID (e.g., "2025-04-23")
  date: Timestamp;            // Timestamp representing the point in time of the snapshot (e.g., midnight UTC)
  mrr: number;
  arr: number;
  churnRate: number;
  cltv: number;
  activeCustomers?: number;   // Optional: Count of active paying customers at snapshot time
}

/**
 * Represents aggregated usage patterns, specifically for profile downloads, over a period (e.g., daily).
 * Stored in a collection like usagePatterns.
 * Ref:
 */
export interface UsagePattern {
  patternId?: string;         // Optional: Firestore document ID (e.g., "2025-04-23")
  date: Timestamp;            // Timestamp representing the period (e.g., midnight UTC for a daily pattern)
  totalDownloads: number;     // Total downloads during this period
  hourlyCounts: {             // Map where key is hour (0-23) and value is count
    [hour: number]: number;
  };
  dayOfWeekCounts: {          // Map where key is day ('Monday', 'Tuesday', etc.) and value is count
    [day: string]: number;
  };
  byProfileTypeCounts: {      // Map where key is profile type (e.g., 'security_guard') and value is count
    [profileType: string]: number;
  };
  createdAt: Timestamp;       // Timestamp when this pattern document was created/aggregated
}

interface BaseEvent {
  eventId?: string;
  timestamp: Timestamp;
  userId?: string; // Encrypted // User performing the action (if logged in)
  companyId?: string; // Encrypted // Company context (if applicable)
  ipAddress?: string; // Encrypted
  userAgent?: string; // Encrypted
  geoLocation?: { // Encrypted
    latitude: number; // Encrypted
    longitude: number; // Encrypted
    city?: string; // Encrypted
    country?: string; // Encrypted
  };
  sessionId?: string; // Usually not PII itself, used for linking events
}

export interface SearchEvent extends BaseEvent {
  eventType: 'search';
  searchQuery: string; // Encrypted - Could contain PII
  filtersApplied?: Record<string, any>;
  resultsCount: number;
}

export interface ProfileViewEvent extends BaseEvent {
  eventType: 'profile_view';
  candidateId: string; // Encrypted
}

export interface AssessmentCompletionEvent extends BaseEvent {
  eventType: 'assessment_completion';
  candidateId: string; // Encrypted
  assessmentId: string;
  score?: number; // Score itself might not be PII, but context links it
  durationSeconds?: number;
}

export interface FeatureUsageEvent extends BaseEvent {
  eventType: 'feature_usage';
  featureName: string; // e.g., 'endorsement_request', 'vacancy_create'
  details?: Record<string, any>; // Could potentially hold PII depending on feature
}