import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEvaluationDto {
  @IsUUID()
  @IsNotEmpty()
  replyId!: string;

  @IsUUID()
  @IsNotEmpty()
  teamLeadId!: string;

  @IsDateString()
  @IsNotEmpty()
  evaluationDate!: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  score!: number;

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
  createdBy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;
}
