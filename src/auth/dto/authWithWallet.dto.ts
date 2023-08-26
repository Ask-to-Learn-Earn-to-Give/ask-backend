import { IsAddress } from '@/common/validations/isAddress.decorator'

export class AuthWithWalletDto {
  /**
   * Address of the wallet
   */
  @IsAddress()
  address: string
}
