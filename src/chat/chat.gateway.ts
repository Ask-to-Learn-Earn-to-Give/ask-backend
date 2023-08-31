import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JoinChatGroupDto } from './dtos/join-chat-group.dto'
import { ChatWsService } from './services/chat-ws.service'

@WebSocketGateway({
  namespace: 'chat',
  cors: true,
  transports: ['websocket'],
})
export class ChatGateway {
  @WebSocketServer()
  private readonly server: Server

  constructor(private readonly chatWsService: ChatWsService) {}

  @SubscribeMessage('chat/join')
  async joinChatGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() { chatGroupId }: JoinChatGroupDto,
  ) {
    const userId = this.chatWsService.getUserId(client.id)
    await this.chatWsService.addUserToChatRoom(userId, chatGroupId)
  }

  @SubscribeMessage('chat/new-message')
  async handleNewMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() { chatGroupId, content }: any,
  ) {
    const userId = this.chatWsService.getUserId(client.id)
    await this.chatWsService.handleNewMessage(chatGroupId, userId, content)
  }
}
