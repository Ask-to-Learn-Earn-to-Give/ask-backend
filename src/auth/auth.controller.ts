import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
} from '@nestjs/common'
import { AuthWithWalletDto } from './dtos/auth-with-wallet'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { JwtService } from '@nestjs/jwt'
import { UserService } from '@/user/user.service'
import { VerifyAuthWithWalletDto } from './dtos/verify-auth-with-wallet.dto'
import { ethers } from 'ethers'

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  /**
   * Authenticate using wallet address
   *
   * @description
   * Authentication flow:
   * - CLient sends a sign in request with wallet address
   * - Server responds with a nonce number
   * - Client signs the nonece number with their private key & resends it to the server
   * - Server verifies the signature & signs a JWT token
   *
   * Response:
   * ```json
   * {
   *  "data": {
   *    "nonce": "<nonce number>"
   *  }
   * }
   * ```
   */
  @Post('/wallet')
  async authWithWallet(@Body() { address }: AuthWithWalletDto) {
    // generate a random nonce number
    const nonce = Math.floor(Math.random() * 1000000).toString()

    // store the nonce number in redis with the wallet address as key
    await this.cacheManager.set('auth:' + address, nonce, 20000000)
    return { nonce }
  }

  /**
   * Verify the signature of the nonce number and sign a JWT token
   *
   * Response:
   * ```json
   * {
   *  "data": {
   *    "token": "<JWT token>"
   *  }
   * }
   * ```
   */
  @Post('/verify-wallet')
  async verifyWalletSignature(
    @Body() { address, signedNonce }: VerifyAuthWithWalletDto,
  ) {
    const nonce: string = await this.cacheManager.get('auth:' + address)

    if (!nonce) {
      throw new BadRequestException(
        'You must get a nonce number before verifying the signature',
      )
    }

    // verify the signed nonce number
    const verifiedAddress = ethers.verifyMessage(nonce, signedNonce)

    if (verifiedAddress.toLowerCase() !== address) {
      throw new BadRequestException('Invalid signed nonce number')
    }

    let user = await this.userService.findByAddress(address)

    if (!user) {
      user = await this.userService.create(address)
    }

    const token = this.jwtService.sign(
      { _id: user._id, address },
      { expiresIn: '100d' },
    )

    return { token }
  }
}
