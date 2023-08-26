import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema()
export class User {
  @Prop({ unique: true })
  address: string

  @Prop()
  fullName: string

  @Prop({ unique: true })
  username: string

  @Prop()
  avatar: string
}

export const UserSchema = SchemaFactory.createForClass(User)
