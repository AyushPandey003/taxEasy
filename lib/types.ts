// User related interfaces
export interface User {
  id: string;
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
  role: UserRole;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

// Tax related interfaces
export interface TaxReturn {
  id: string;
  userId: string;
  year: number;
  status: TaxStatus;
  totalIncome: number;
  deductions: number;
  taxPaid: number;
  refundDue?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  userId: string;
  taxReturnId?: string;
  name: string;
  type: DocType;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

// Community related interfaces
export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

// Enums
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  TAX_PROFESSIONAL = 'TAX_PROFESSIONAL'
}

export enum TaxStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export enum DocType {
  INCOME_STATEMENT = 'INCOME_STATEMENT',
  DEDUCTION_PROOF = 'DEDUCTION_PROOF',
  TAX_RETURN = 'TAX_RETURN',
  OTHER = 'OTHER'
} 