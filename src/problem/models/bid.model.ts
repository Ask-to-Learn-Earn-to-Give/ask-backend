import { Id } from '@/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema()
export class Bid {
  _id: Id

  @Prop({ type: Id, required: true })
  problemId: Id

  @Prop({ type: Id, required: true, unique: true })
  expertId: Id

  @Prop({ required: true })
  amount: string

  @Prop()
  description: string
}

export type BidDocument = HydratedDocument<Bid>

export const BidSchema = SchemaFactory.createForClass(Bid)
