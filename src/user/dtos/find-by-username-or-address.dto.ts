import { IsAddress } from '@/common/validations/is-address.decorator'
import { Transform } from 'class-transformer'
import { IsOptional, IsString } from 'class-validator'

export class FindByUsernameOrAddressDto {
  @IsString()
  @IsOptional()
  username?: string

  @IsAddress()
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  address?: string
}
