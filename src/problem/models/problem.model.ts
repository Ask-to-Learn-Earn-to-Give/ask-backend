import { Id } from '@/common'
import { User } from '@/user/user.model'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export enum ProblemStatus {
  PREPARING = 'preparing',
  WAITING = 'waiting',
  ONPROGRESS = 'onprogress',
  SOLVED = 'solved',
}

@Schema({ timestamps: true })
export class Problem {
  _id: Id

  /**
   * Id of the problem on smart contract
   */
  @Prop({ unique: true, required: true })
  onchainId: number

  @Prop({
    type: Id,
    ref: 'User',
    required: true,
  })
  author: User

  @Prop({
    type: Id,
    ref: 'User',
  })
  expert: User

  @Prop()
  title: string

  @Prop()
  description: string

  @Prop()
  image: string

  /**
   * @description
   * A problem is ready when author uploads all its other fields
   * - preparing: the problem is just created on blockchain, no data is uploaded to backend
   * - waiting: the data is uploaded to backend and waiting for expert to bid
   * - onprogress: the problem is being solved by an expert
   * - solved: the problem is solved
   */
  @Prop({
    enum: Object.values(ProblemStatus),
    required: true,
  })
  status: ProblemStatus

  @Prop({ type: Id })
  chatGroupId: Id
}

export type ProblemDocument = HydratedDocument<Problem>

export const ProblemSchema = SchemaFactory.createForClass(Problem)
