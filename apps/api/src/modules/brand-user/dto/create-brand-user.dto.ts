import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateBrandUserDto {
  @IsUUID()
  @IsNotEmpty()
  brandId!: string;

  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  createdBy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;
}
