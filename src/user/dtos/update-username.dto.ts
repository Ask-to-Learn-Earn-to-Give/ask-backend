import { IsId } from '@/common/validations/is-object-id.decorator'
import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateUsernameDto {
  @IsId()
  _id: string

  @IsString()
  @IsNotEmpty()
  username: string
}
