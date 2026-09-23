import { QualityServiceCategory, QualityServiceStatus } from '@quality-services/types';

export const SERVICE_STATUS_LABELS: Record<QualityServiceStatus, string> = {
  active: 'Active',
  in_review: 'In Review',
  inactive: 'Inactive',
  archived: 'Archived',
};

export const SERVICE_STATUS_BADGE_CLASSES: Record<QualityServiceStatus, string> = {
  active: 'badge badge-success',
  in_review: 'badge badge-warning',
  inactive: 'badge badge-ghost',
  archived: 'badge badge-neutral',
};

export const SERVICE_CATEGORY_LABELS: Record<QualityServiceCategory, string> = {
  audit: 'Quality Audit',
  inspection: 'Product Inspection',
  certification: 'Compliance Certification',
  consulting: 'Advisory Consulting',
};

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
