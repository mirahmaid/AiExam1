import type { Role } from './enums';

/**
 * Wire shapes: what the API actually serialises over HTTP.
 *
 * Dates are `string` here, not `Date`, because that is what survives
 * JSON.stringify. The old hand-copied frontend interfaces disagreed with the
 * backend on exactly this point.
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  /** Serialised as `avatar` by the API. */
  avatar: string | null;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  branchId: string | null;
  branch?: BranchSummary | null;
}

export interface BranchSummary {
  id: string;
  name: string;
}

export interface Branch extends BranchSummary {
  createdAt: string;
  subjects?: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  branchId: string;
  bookPdfKey: string | null;
  bookPdfOriginalName: string | null;
  bookPdfSize: number | null;
  createdAt: string;
}

export interface Teacher {
  id: string;
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  imageKey?: string;
  subjectId: string | null;
  subject: Subject | null;
  yearsOfExperience?: number;
  isActive: boolean;
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
}
