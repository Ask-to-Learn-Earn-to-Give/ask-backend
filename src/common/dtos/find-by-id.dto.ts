import { Type } from 'class-transformer'
import { IsId } from '../validations/is-object-id.decorator'
import { Id } from '@/common'

export class FindByIdDto {
  @IsId()
  @Type(() => Id)
  _id: Id
}
