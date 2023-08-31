import { AuthGuard } from '@/auth/auth.guard'
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { FindMessagesDto } from '../dtos/find-messages.dto'
import { FindByIdDto } from '@/common/dtos/find-by-id.dto'
import { ChatService } from '../services/chat.service'
import { TokenPayload } from '@/auth/token-payload.decorator'
import { ITokenPayload } from '@/auth/token-payload.interface'

@UseGuards(AuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/:_id/messages')
  async findMessages(
    @Param() { _id: chatGroupId }: FindByIdDto,
    @Query() { limit, skip }: FindMessagesDto,
    @TokenPayload() { _id: userId }: ITokenPayload,
  ) {
    const messages = await this.chatService.findMessagesByUser(
      userId,
      chatGroupId,
      limit,
      skip,
    )
    return messages
  }
}
