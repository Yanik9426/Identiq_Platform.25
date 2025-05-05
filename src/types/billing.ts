import { Timestamp } from 'firebase/firestore'; // Import Timestamp type if using Firebase v9+

/**
 * Represents a log entry for when a company downloads a candidate profile.
 * Used for tracking usage for billing purposes.
 * Ref: [cite: 32, 151, 182]
 */
export interface ProfileDownloadLog {
  downloadId?: string;         // Optional: Firestore document ID
  companyId: string;          // Encrypted // ID of the company that downloaded the profile
  candidateId: string;        // Encrypted // ID of the candidate profile downloaded
  timestamp: Timestamp;       // Firestore Timestamp of when the download occurred
  cost: number;               // Cost associated with this download (e.g., 250) [cite: 17, 145]
}

/**
 * Represents a discount coupon that can be applied to invoices.
 * Ref: [cite: 164, 210]
 */
export interface Coupon {
  couponId?: string;          // Optional: Firestore document ID
  code: string;               // Encrypted // Unique code for the coupon (e.g., "WELCOME10") [cite: 164] - Consider encryption
  type: 'percentage' | 'fixed'; // Type of discount [cite: 164]
  value: number;              // Discount value (e.g., 10 for 10%, 200 for R200) [cite: 164]
  duration: 'one_time';       // How often the coupon can be used (currently only one_time) [cite: 164]
  applicability: 'base_fee' | 'download_fee' | 'entire_invoice'; // What the coupon applies to [cite: 164]
  expirationDate: Timestamp;  // Date when the coupon expires [cite: 164]
  usageLimitPerCustomer: number; // Max times one customer can use it (default 1) [cite: 164]
  totalUsesAllowed?: number;  // Optional: Max total uses across all customers [cite: 164]
  createdAt: Timestamp;       // Timestamp of coupon creation [cite: 164]
  updatedAt: Timestamp;       // Timestamp of last update [cite: 164]
  // Consider adding an 'isActive' boolean field for deactivation without deletion
}

/**
 * Represents an instance of a coupon being used on a specific invoice.
 * Ref: [cite: 164, 210]
 */
export interface CouponUsage {
  usageId?: string;           // Optional: Firestore document ID
  couponId: string;           // Encrypted // ID of the coupon used [cite: 164]
  companyId: string;          // Encrypted // ID of the company that used the coupon [cite: 164]
  invoiceId: string;          // Encrypted // ID of the invoice the coupon was applied to [cite: 164]
  usedAt: Timestamp;          // Timestamp of when the coupon was used [cite: 164]
}

/**
 * Represents a billing invoice sent to a company.
 * Includes details of charges, payments, and any applied coupons.
 * Ref: [cite: 32, 125, 141, 153, 182]
 */
export interface Invoice {
  invoiceId?: string;         // Optional: Firestore document ID
  companyId: string;          // Encrypted // ID of the company being invoiced
  invoiceNumber: string;      // Encrypted // Unique identifier for the invoice (e.g., INV-2025-001)
  issueDate: Timestamp;       // Date the invoice was generated [cite: 147]
  dueDate: Timestamp;         // Date the payment is due [cite: 147]
  periodStartDate: Timestamp; // Start date of the billing cycle covered
  periodEndDate: Timestamp;   // End date of the billing cycle covered
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled'; // Current status [cite: 126, 142]
  baseFee: number;            // Base subscription fee for the period [cite: 144, 148]
  downloadCharges: number;    // Total charges from profile downloads during the period
  lineItems: {                // Detailed list of charges (optional, could be derived or stored)
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;           // Total before discount and tax
  discountAmount?: number;    // Amount deducted from a coupon
  couponId?: string;          // Encrypted // ID of the coupon applied (if any)
  couponCode?: string;        // Encrypted // Code of the coupon applied (if any) - Redundant if couponId is used?
  taxAmount?: number;         // Tax amount (if applicable)
  totalAmount: number;        // Final amount due [cite: 125, 141]
  amountPaid?: number;        // Amount already paid
  paymentDate?: Timestamp;    // Date the payment was received/recorded
  notes?: string;             // Any additional notes for the client
  pdfUrl?: string;            // Link to the generated PDF invoice in Firebase Storage [cite: 153]
}