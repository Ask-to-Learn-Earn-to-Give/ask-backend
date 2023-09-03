import { Id } from '@/common'
import { IsId } from '@/common/validations/is-id.decorator'
import { Transform } from 'class-transformer'

export class ProblemParamDto {
  @IsId()
  @Transform(({ value }) => new Id(value))
  problemId: Id
}
