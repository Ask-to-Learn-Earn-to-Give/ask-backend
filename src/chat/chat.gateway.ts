import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { JoinChatGroupDto } from './dtos/join-chat-group.dto'
import { ChatService } from './chat.service'
import { BaseGateway } from '@/common/base.gateway'
import { JwtService } from '@nestjs/jwt'

@WebSocketGateway({
  namespace: 'chat',
  cors: true,
  transports: ['websocket'],
})
export class ChatGateway extends BaseGateway {
  constructor(
    private readonly chatService: ChatService,
    jwtService: JwtService,
  ) {
    super(jwtService, {
      namespace: 'chat',
      requireAuth: true,
    })
  }

  @SubscribeMessage('chat/join')
  async joinChatGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() { chatGroupId }: JoinChatGroupDto,
  ) {
    const userId = this.getUserId(client.id)

    if (!(await this.chatService.isUserInChatGroup(chatGroupId, userId))) {
      throw new Error('User is not in chat group')
    }

    this.addUserToRoom(userId, `chat/room:${chatGroupId}`)
  }

  @SubscribeMessage('chat/new-message')
  async handleNewMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() { chatGroupId, content }: any,
  ) {
    const senderId = this.getUserId(client.id)

    const message = await this.chatService.createMessage(
      chatGroupId,
      senderId,
      content,
    )

    this.emitToRoom(`chat/room:${chatGroupId}`, 'chat/new-message', message)
  }
}
