import { IsId } from '@/common/validations/is-id.decorator'
import { Id } from '@/common'
import { Type } from 'class-transformer'
import { IsNumber, IsOptional } from 'class-validator'

export class FindProblemDto {
  @IsId()
  @IsOptional()
  @Type(() => Id)
  author?: Id

  @IsNumber()
  @Type(() => Number)
  skip: number

  @IsNumber()
  @Type(() => Number)
  limit: number
}
