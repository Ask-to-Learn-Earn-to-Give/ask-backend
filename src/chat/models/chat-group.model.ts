import { Id } from '@/common'
import { User } from '@/user/user.model'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({ timestamps: true })
export class ChatGroup {
  _id: Id

  @Prop({ type: Id, required: true })
  ownerId: Id

  @Prop({ required: true })
  name: string

  @Prop({ required: true, default: 0 })
  numberOfMembers: number

  @Prop({ required: true, default: false })
  isDirectChat: boolean

  @Prop({
    type: [{ type: Id, ref: 'User' }],
    required: true,
    default: [],
  })
  members: User[]
}

export type ChatGroupDocument = HydratedDocument<ChatGroup>

export const ChatGroupSchema = SchemaFactory.createForClass(ChatGroup)
