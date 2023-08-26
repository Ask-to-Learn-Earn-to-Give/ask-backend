import { IsAddress } from '@/common/validations/isAddress.decorator'
import { IsString } from 'class-validator'

export class VerifySignInDto {
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
