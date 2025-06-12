import { UserRole, TaxStatus, DocType } from './types';

// Tax calculation constants
export const TAX_BRACKETS = [
  { min: 0, max: 10000, rate: 0.10 },
  { min: 10001, max: 40000, rate: 0.15 },
  { min: 40001, max: 100000, rate: 0.25 },
  { min: 100001, max: Infinity, rate: 0.30 }
];

// Standard deduction amounts
export const STANDARD_DEDUCTIONS = {
  SINGLE: 12550,
  MARRIED: 25100,
  HEAD_OF_HOUSEHOLD: 18800
};

// Document type descriptions
export const DOCUMENT_TYPE_DESCRIPTIONS: Record<DocType, string> = {
  [DocType.INCOME_STATEMENT]: 'Proof of income from employer or business',
  [DocType.DEDUCTION_PROOF]: 'Documentation supporting tax deductions',
  [DocType.TAX_RETURN]: 'Official tax return document',
  [DocType.OTHER]: 'Other supporting documentation'
};

// User role descriptions
export const USER_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.USER]: 'Regular user with basic access',
  [UserRole.ADMIN]: 'Administrator with full system access',
  [UserRole.TAX_PROFESSIONAL]: 'Certified tax professional'
};

// Tax status descriptions
export const TAX_STATUS_DESCRIPTIONS: Record<TaxStatus, string> = {
  [TaxStatus.DRAFT]: 'Tax return is in draft mode',
  [TaxStatus.SUBMITTED]: 'Tax return has been submitted',
  [TaxStatus.PROCESSING]: 'Tax return is being processed',
  [TaxStatus.COMPLETED]: 'Tax return has been completed',
  [TaxStatus.REJECTED]: 'Tax return has been rejected'
};

// Tax filing deadlines
export const TAX_FILING_DEADLINES = {
  REGULAR: 'April 15',
  EXTENSION: 'October 15'
};

// Maximum file sizes (in bytes)
export const MAX_FILE_SIZES = {
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  IMAGE: 5 * 1024 * 1024, // 5MB
};

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  DOCUMENTS: ['.pdf', '.doc', '.docx'],
  IMAGES: ['.jpg', '.jpeg', '.png']
}; 