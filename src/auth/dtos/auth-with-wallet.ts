import { IsAddress } from '@/common/validations/is-address.decorator'
import { Transform } from 'class-transformer'

export class AuthWithWalletDto {
  /**
   * Address of the wallet
   */
  @IsAddress()
  @Transform(({ value }) => value.toLowerCase())
  address: string
}
