import { Id } from '@/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema()
export class User {
  _id: Id

  @Prop({ unique: true })
  address: string

  @Prop()
  fullName: string

  @Prop({ unique: true })
  username: string

  @Prop()
  avatarUrl: string

  @Prop()
  description: string
}

export const UserSchema = SchemaFactory.createForClass(User)
