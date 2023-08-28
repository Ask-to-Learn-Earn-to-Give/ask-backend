import { IsAddress } from '@/common/validations/is-address.decorator'

export class FindByUsernameOrAddressDto {
  username?: string

  @IsAddress()
  address?: string
}
