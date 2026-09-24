import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEvaluationDto {
  @Matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, {
    message: 'replyId must be a valid UUID',
  })
  @IsNotEmpty()
  replyId!: string;

  @Matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, {
    message: 'teamLeadId must be a valid UUID',
  })
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
