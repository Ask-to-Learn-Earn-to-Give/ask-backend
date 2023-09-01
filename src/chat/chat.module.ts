import { Module } from '@nestjs/common'
import { ChatService } from './chat.service'
import { ChatController } from './chat.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { ChatMessage, ChatMessageSchema } from './models/chat-message.model'
import { ChatGroup, ChatGroupSchema } from './models/chat-group.model'
import { ChatGateway } from './chat.gateway'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatGroup.name, schema: ChatGroupSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
    ]),
  ],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
