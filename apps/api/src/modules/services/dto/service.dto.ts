import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateServiceDto as ICreateServiceDto,
  UpdateServiceDto as IUpdateServiceDto,
  QualityServiceCategory,
  QualityServiceStatus,
} from '@quality-services/types';

export class CreateQualityServiceDto implements ICreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(['audit', 'inspection', 'certification', 'consulting'], {
    message: 'category must be one of: audit, inspection, certification, consulting',
  })
  category!: QualityServiceCategory;

  @IsOptional()
  @IsEnum(['active', 'in_review', 'inactive', 'archived'])
  status?: QualityServiceStatus;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  slaHours!: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class UpdateQualityServiceDto implements IUpdateServiceDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsEnum(['audit', 'inspection', 'certification', 'consulting'])
  category?: QualityServiceCategory;

  @IsOptional()
  @IsEnum(['active', 'in_review', 'inactive', 'archived'])
  status?: QualityServiceStatus;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  slaHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class ServiceFilterQueryDto {
  @IsOptional()
  @IsEnum(['audit', 'inspection', 'certification', 'consulting'])
  category?: QualityServiceCategory;

  @IsOptional()
  @IsEnum(['active', 'in_review', 'inactive', 'archived'])
  status?: QualityServiceStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
