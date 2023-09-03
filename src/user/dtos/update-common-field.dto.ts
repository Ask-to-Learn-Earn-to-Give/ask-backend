import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UpdateCommonFields {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fullName?: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  avatarUrl?: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string
}
