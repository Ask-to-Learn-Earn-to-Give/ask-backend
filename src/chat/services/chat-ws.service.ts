import { Id } from '@/common'
import { WsService } from '@/common/services/ws.service'
import { Injectable } from '@nestjs/common'
import { ChatService } from './chat.service'

@Injectable()
export class ChatWsService extends WsService {
  constructor(private readonly chatService: ChatService) {
    super('chat')
  }

  async addUserToChatRoom(userId: Id, chatGroupId: Id) {
    if (!(await this.chatService.isUserInChatGroup(chatGroupId, userId))) {
      throw new Error('User is not in chat group')
    }
    this.addUserToRoom(userId, `chat/room:${chatGroupId}`)
  }

  async handleNewMessage(chatGroupId: Id, senderId: Id, content: string) {
    const message = await this.chatService.createMessage(
      chatGroupId,
      senderId,
      content,
    )

    this.emitToRoom(`chat/room:${chatGroupId}`, 'chat/new-message', message)
  }
}
