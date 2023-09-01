import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ProblemService } from './problem.service'
import { TokenPayload } from '@/auth/token-payload.decorator'
import { ITokenPayload } from '@/auth/token-payload.interface'
import { UploadDataDto } from './dtos/upload-data.dto'
import { FindByIdDto } from '@/common/dtos/find-by-id.dto'
import { AuthGuard } from '@/auth/auth.guard'
import { FindProblemDto } from './dtos/find-problems.dto'

@Controller('problem')
export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get('/')
  async find(@Query() { limit, skip, author }: FindProblemDto) {
    const problems = await (author
      ? this.problemService.findByAuthor(limit, skip, author)
      : this.problemService.find(limit, skip))
    return { problems }
  }

  @UseGuards(AuthGuard)
  @Post('/')
  async create(@TokenPayload() payload: ITokenPayload, @Body() data: any) {
    const problem = await this.problemService.create(
      payload._id,
      data.onchainId,
    )
    return { problem }
  }

  /**
   * Upload nessessary fields to be stored off-chain.
   *
   * @description
   * The problem will be available after this call.
   * Status will be set to `WAITING`.
   *
   * @param data Object containing the description and title of the problem.
   */
  @UseGuards(AuthGuard)
  @Post('/:_id/upload-data')
  async uploadData(
    @TokenPayload() payload: ITokenPayload,
    @Param() { _id }: FindByIdDto,
    @Body() data: UploadDataDto,
  ) {
    const problem = await this.problemService.uploadDataByAuthor(
      payload._id,
      _id,
      {
        title: data.title,
        description: data.description,
      },
    )

    return { problem }
  }
}
