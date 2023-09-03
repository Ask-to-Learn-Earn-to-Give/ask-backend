import { IsNotEmpty, IsString } from 'class-validator'

export class UploadProblemBidDataDto {
  @IsString()
  @IsNotEmpty()
  description: string
}
