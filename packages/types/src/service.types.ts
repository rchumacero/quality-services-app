export type QualityServiceStatus = 'active' | 'in_review' | 'inactive' | 'archived';

export type QualityServiceCategory = 'audit' | 'inspection' | 'certification' | 'consulting';

export interface QualityService {
  id: string;
  name: string;
  description: string;
  category: QualityServiceCategory;
  status: QualityServiceStatus;
  slaHours: number;
  price: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDto {
  name: string;
  description: string;
  category: QualityServiceCategory;
  status?: QualityServiceStatus;
  slaHours: number;
  price: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  category?: QualityServiceCategory;
  status?: QualityServiceStatus;
  slaHours?: number;
  price?: number;
  metadata?: Record<string, unknown>;
}

export interface ServiceFilterParams {
  category?: QualityServiceCategory;
  status?: QualityServiceStatus;
  search?: string;
}
