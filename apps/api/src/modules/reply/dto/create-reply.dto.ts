import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateReplyDto {
  @IsUUID()
  @IsNotEmpty()
  brandId!: string;

  @IsUUID()
  @IsNotEmpty()
  specialistId!: string;

  @IsDateString()
  @IsNotEmpty()
  replyDate!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  createdBy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;
}
