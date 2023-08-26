import { IsAddress } from '@/common/validations/isAddress.decorator'

export class FindByUsernameOrAddressDto {
  username?: string

  @IsAddress()
  address?: string
}
