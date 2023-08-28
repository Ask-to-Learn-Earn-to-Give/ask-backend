import { IsAddress } from '@/common/validations/is-address.decorator'

export class AuthWithWalletDto {
  /**
   * Address of the wallet
   */
  @IsAddress()
  address: string
}
