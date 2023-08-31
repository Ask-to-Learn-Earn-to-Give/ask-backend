import { Type } from 'class-transformer'
import { IsId } from '../validations/is-id.decorator'
import { Id } from '@/common'

export class FindByIdDto {
  @IsId()
  @Type(() => Id)
  _id: Id
}
