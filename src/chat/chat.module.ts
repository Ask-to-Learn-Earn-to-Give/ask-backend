import { Module } from '@nestjs/common'
import { ChatService } from './services/chat.service'
import { ChatController } from './controllers/chat.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { ChatMessage, ChatMessageSchema } from './models/chat-message.model'
import { ChatGroup, ChatGroupSchema } from './models/chat-group.model'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatGroup.name, schema: ChatGroupSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
    ]),
  ],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
