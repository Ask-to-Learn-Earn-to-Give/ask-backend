import { Body, Controller, Inject, Post } from '@nestjs/common'
import { AuthWithWalletDto } from './dto/authWithWallet.dto'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { VerifySignInDto } from './dto/verifySignIn.dto'

@Controller('auth')
export class AuthController {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * Authenticate using wallet address
   *
   * @description
   * Authentication flow:
   * - CLient sends a sign in request with wallet address
   * - Server responds with a nonce number
   * - Client signs the nonece number with their private key & resends it to the server
   * - Server verifies the signature & signs a JWT token
   */
  @Post('/wallet')
  async authWithWallet(@Body() { address }: AuthWithWalletDto) {
    // generate a random nonce number
    const nonce = Math.floor(Math.random() * 1000000)

    // store the nonce number in redis with the wallet address as key
    await this.cacheManager.set('auth:' + address, nonce, 2000)

    return { data: { nonce } }
  }

  /**
   * Verify the signature of the nonce number and sign a JWT token
   *
   * @returns {string} JWT token
   */
  @Post('/wallet/verify')
  async verifyWalletSignature(
    @Body() { address, signedNonce }: VerifySignInDto,
  ) {
    const nonce = await this.cacheManager.get('auth:' + address)

    return nonce
  }
}
