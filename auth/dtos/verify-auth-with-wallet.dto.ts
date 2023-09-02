import { IsAddress } from '@/common/validations/is-address.decorator'
import { Transform } from 'class-transformer'
import { IsString } from 'class-validator'

export class VerifyAuthWithWalletDto {
  /**
   * Address of the wallet
   */
  @IsAddress()
  @Transform(({ value }) => value.toLowerCase())
  address: string

  /**
   * Signed nonce number
   */
  @IsString()
  signedNonce: string
}
