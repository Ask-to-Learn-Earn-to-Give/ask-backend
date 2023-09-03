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
import { ProblemBidParamDto } from './dtos/problem-bid-param.dto'
import { UploadProblemBidDataDto } from './dtos/upload-problem-bid-data.dto'
import { ProblemParamDto } from './dtos/problem-param.dro'

@Controller()
export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get('/problem')
  async find(@Query() { limit, skip, author }: FindProblemDto) {
    const problems = await (author
      ? this.problemService.findByAuthor(limit, skip, author)
      : this.problemService.find(limit, skip))
    return { problems }
  }

  @Get('/problem/:problemId')
  async findById(@Param() { problemId }: ProblemParamDto) {
    const problem = await this.problemService.findById(problemId)
    return { problem }
  }

  @Get('/problem/:problemId/bid')
  async findBidsByProblemId(@Param() { problemId }: ProblemParamDto) {
    const problemBids = await this.problemService.findAllBids(problemId)
    return { problemBids }
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
  @Post('/problem/:_id/upload-data')
  async uploadData(
    @TokenPayload() payload: ITokenPayload,
    @Param() { _id }: FindByIdDto,
    @Body() data: UploadDataDto,
  ) {
    const problem = await this.problemService.uploadDataByAuthor(
      _id,
      payload._id,
      {
        title: data.title,
        description: data.description,
        image: data.image,
      },
    )

    console.log('Problem uploaded: ', problem._id)

    return { problem }
  }

  @UseGuards(AuthGuard)
  @Post('/problem-bid/:problemBidId/upload-data')
  async uploadBidData(
    @TokenPayload() payload: ITokenPayload,
    @Param() { problemBidId }: ProblemBidParamDto,
    @Body() data: UploadProblemBidDataDto,
  ) {
    const problemBid = await this.problemService.uploadBidDataByExpert(
      problemBidId,
      payload._id,
      {
        description: data.description,
      },
    )

    console.log('Problem bid uploaded: ', problemBid._id)

    return { problemBidId }
  }
}
