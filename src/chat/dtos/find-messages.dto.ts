import { Type } from 'class-transformer'
import { IsNumber } from 'class-validator'

export class FindMessagesDto {
  @IsNumber()
  @Type(() => Number)
  skip: number

  @IsNumber()
  @Type(() => Number)
  limit: number
}
