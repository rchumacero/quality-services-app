import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateEvaluationDto {
  @IsOptional()
  @IsUUID()
  replyId?: string;

  @IsOptional()
  @IsUUID()
  teamLeadId?: string;

  @IsOptional()
  @IsDateString()
  evaluationDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  score?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  errorTags?: string;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  updatedBy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;
}
