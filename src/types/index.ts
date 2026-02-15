// ============================================
// ENROL - Type Definitions
// ============================================

// Field Types
export type FieldType = 'text' | 'textarea' | 'email' | 'phone' | 'select' | 'file';

export interface BaseField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
}

export interface TextField extends BaseField {
  type: 'text';
  maxLength?: number;
}

export interface TextareaField extends BaseField {
  type: 'textarea';
  maxLength?: number;
  rows?: number;
}

export interface EmailField extends BaseField {
  type: 'email';
}

export interface PhoneField extends BaseField {
  type: 'phone';
}

export interface SelectField extends BaseField {
  type: 'select';
  options: { label: string; value: string }[];
  multiple?: boolean;
}

export interface FileField extends BaseField {
  type: 'file';
  accept?: string;
  maxSizeMB?: number;
}

export type FormField = TextField | TextareaField | EmailField | PhoneField | SelectField | FileField;

// Pipeline Stages
export interface PipelineStage {
  id: string;
  form_id: string;
  name: string;
  slug: string;
  color: string;
  position: number;
}

export const DEFAULT_STAGES: Omit<PipelineStage, 'id' | 'form_id'>[] = [
  { name: 'New', slug: 'new', color: '#6B7280', position: 0 },
  { name: 'Reviewing', slug: 'reviewing', color: '#F59E0B', position: 1 },
  { name: 'Accepted', slug: 'accepted', color: '#10B981', position: 2 },
  { name: 'Enrolled', slug: 'enrolled', color: '#3B82F6', position: 3 },
];

// Form
export interface Form {
  id: string;
  workspace_id: string;
  title: string;
  description?: string;
  slug: string;
  fields: FormField[];
  settings: FormSettings;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormSettings {
  confirmationMessage?: string;
  notifyEmail?: string;
  redirectUrl?: string;
}

// Submission (Applicant)
export interface Submission {
  id: string;
  form_id: string;
  stage_id: string;
  data: Record<string, unknown>;
  notes?: string;
  email?: string;
  name?: string;
  created_at: string;
  updated_at: string;
  // Joined
  stage?: PipelineStage;
}

// Stage History
export interface StageHistory {
  id: string;
  submission_id: string;
  from_stage_id?: string;
  to_stage_id: string;
  changed_by?: string;
  changed_at: string;
  // Joined
  from_stage?: PipelineStage;
  to_stage?: PipelineStage;
}

// Workspace
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// User (from Supabase Auth)
export interface User {
  id: string;
  email: string;
  created_at: string;
}

// Tags
export interface Tag {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface SubmissionTag {
  id: string;
  submission_id: string;
  tag_id: string;
  created_at: string;
  tag?: Tag;
}
