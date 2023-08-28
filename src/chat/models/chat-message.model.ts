import { Id } from '@/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({ timestamps: true })
export class ChatMessage {
  _id: Id

  @Prop({ type: Id, required: true })
  chatGroupId: Id

  @Prop({ type: Id, required: true })
  senderId: Id

  @Prop({ required: true })
  content: string
}

export type ChatMessageDocument = HydratedDocument<ChatMessage>

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage)
