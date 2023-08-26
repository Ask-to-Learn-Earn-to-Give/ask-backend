import { Type } from 'class-transformer'
import { IsObjectId } from '../validations/isObjectId.decorator'
import mongoose from 'mongoose'

export class FindByIdDto {
  @IsObjectId()
  @Type(() => mongoose.Types.ObjectId)
  id: mongoose.Types.ObjectId
}
