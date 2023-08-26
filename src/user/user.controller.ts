import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common'
import { UserService } from './user.service'
import { User } from './user.model'
import { FindByIdDto } from '@/common/dto/findById.dto'
import { FindByUsernameOrAddressDto } from './dto/findByUsernameOrAddress.dto'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get a user by id
   *
   * @param {string} id - The mongodb id of the user
   *
   * @throws {HttpException} 404 - If user is not found
   *
   * @example
   * GET /api/user/5f9d3b3b8b0c0f0017f7e8a0
   */
  @Get('/:id')
  async getUserById(@Param() { id }: FindByIdDto): Promise<User> {
    const user = await this.userService.findById(id)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  /**
   *
   * Get a user by username or address
   *
   * @param {string} username - The username of the user
   * @param {string} address - The address of the user
   *
   * @throws {HttpException} 400 - If neither username nor address is provided
   * @throws {HttpException} 404 - If user is not found
   *
   * @example
   * GET /api/user?username=alice
   * GET /api/user?address=0x1234567890
   */
  @Get('/')
  async getUserByField(
    @Query() { username, address }: FindByUsernameOrAddressDto,
  ): Promise<User> {
    if (!username && !address) {
      throw new BadRequestException(
        'Either username or address must be provided',
      )
    }

    const user = await (username
      ? this.userService.findByUsername(username)
      : this.userService.findByAddress(address))

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }
}
