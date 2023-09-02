import { IsNotEmpty, IsString } from 'class-validator'

export class UploadDataDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  image: string

  @IsString()
  @IsNotEmpty()
  description: string
}
