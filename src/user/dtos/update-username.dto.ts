import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateUsernameDto {
  @IsString()
  @IsNotEmpty()
  username: string
}
