import { Id } from '@/common'
import { IsId } from '@/common/validations/is-id.decorator'
import { Type } from 'class-transformer'

export class ProblemBidParamDto {
  @IsId()
  @Type(() => Id)
  problemBidId: Id
}
