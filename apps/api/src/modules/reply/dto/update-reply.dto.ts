import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateReplyDto {
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @IsUUID()
  specialistId?: string;

  @IsOptional()
  @IsDateString()
  replyDate?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  updatedBy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;
}
