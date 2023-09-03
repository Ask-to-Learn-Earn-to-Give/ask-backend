import { Id } from '@/common'
import { User } from '@/user/user.model'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema()
export class ProblemBid {
  _id: Id

  @Prop({ type: Number, required: true })
  onchainId: number

  @Prop({ type: Id, required: true })
  problemId: Id

  @Prop({ type: Id, required: true, ref: 'User' })
  expert: User

  @Prop({ required: true })
  amount: string

  @Prop()
  description: string
}

export type ProblemBidDocument = HydratedDocument<ProblemBid>

export const ProblemBidSchema = SchemaFactory.createForClass(ProblemBid)
