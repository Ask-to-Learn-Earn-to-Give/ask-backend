import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common'
import { UserService } from './user.service'
import { FindByIdDto } from '@/common/dtos/find-by-id.dto'
import { FindByUsernameOrAddressDto } from './dtos/find-by-username-or-address.dto'
import { UpdateCommonFields } from './dtos/update-common-field.dto'
import { AuthGuard } from '@/auth/auth.guard'
import { TokenPayload } from '@/auth/token-payload.decorator'
import { ITokenPayload } from '@/auth/token-payload.interface'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/:_id')
  async getUserById(@Param() { _id }: FindByIdDto) {
    const user = await this.userService.findById(_id)
    this.userService.create
    if (!user) {
      throw new NotFoundException('User not found')
    }

    return { user }
  }

  @Get('/')
  async getUserByField(
    @Query() { username, address }: FindByUsernameOrAddressDto,
  ) {
    if (!username && !address) {
      const users = await this.userService.findAll()
      return { users }
    }

    const user = await (username
      ? this.userService.findByUsername(username)
      : this.userService.findAll())

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return { user }
  }

  @UseGuards(AuthGuard)
  @Patch('/common-fields')
  async updateCommonFields(
    @TokenPayload() { _id }: ITokenPayload,
    @Body() { fullName }: UpdateCommonFields,
  ) {
    try {
      return await this.userService.updateCommonFields(_id, { fullName })
    } catch (error) {
      throw new BadRequestException('User not found')
    }
  }
}
