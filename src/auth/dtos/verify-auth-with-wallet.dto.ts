import { IsAddress } from '@/common/validations/is-address.decorator'
import { IsString } from 'class-validator'

export class VerifyAuthWithWalletDto {
  /**
   * Address of the wallet
   */
  @IsAddress()
  address: string

  /**
   * Signed nonce number
   */
  @IsString()
  signedNonce: string
}
