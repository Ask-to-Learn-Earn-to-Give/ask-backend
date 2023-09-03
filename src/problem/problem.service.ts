import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Problem, ProblemDocument, ProblemStatus } from './models/problem.model'
import { Id } from '@/common'
import { ChatService } from '@/chat/chat.service'
import { ProblemBid } from './models/problem-bid.model'

@Injectable()
export class ProblemService {
  constructor(
    @InjectModel(Problem.name)
    private readonly problemModel: Model<ProblemDocument>,
    @InjectModel(ProblemBid.name)
    private readonly problemBidModel: Model<ProblemBid>,
    private readonly chatService: ChatService,
  ) {}

  async findById(id: Id) {
    const problem = await this.problemModel.findById(id).populate('author')
    return problem
  }

  async find(limit: number, skip: number) {
    const problems = await this.problemModel
      .find()
      .populate('author')
      .limit(limit)
      .skip(skip)
    return problems
  }

  async findByAuthor(limit: number, skip: number, authorId: Id) {
    const problems = await this.problemModel
      .find(
        { author: authorId },
        { author: 0 }, // this field is unnecessary
      )
      .limit(limit)
      .skip(skip)
    return problems
  }

  async create(authorId: Id, onchainId: number) {
    try {
      const problem = await this.problemModel.create({
        onchainId: onchainId,
        author: authorId,
        status: ProblemStatus.PREPARING,
      })
      return problem
    } catch (err) {
      if (err.code === 11000) {
        throw new ConflictException(
          'Problem with given onchainId is already exist',
        )
      }
      throw err
    }
  }

  async uploadDataByAuthor(
    problemId: Id,
    authorId: Id,
    data: Pick<Problem, 'description' | 'title' | 'image'>,
  ) {
    const problem = await this.findByIdAndVerifyAuthor(problemId, authorId)

    if (problem.status !== ProblemStatus.PREPARING) {
      throw new BadRequestException('Data cannot be uploaded at this time')
    }

    problem.description = data.description
    problem.title = data.title
    problem.image = data.image
    problem.status = ProblemStatus.WAITING

    await problem.save()

    return problem
  }

  /**
   * Select expert for problem.
   *
   * @description
   * This method will update problem status to `ProblemStatus.PREPARING` and
   * create chat group for author and expert.
   *
   * @param problemId
   * @param authorId
   * @param expertId
   * @returns Updated problem
   */
  async selectExpert(problemId: Id, authorId: Id, expertId: Id) {
    const problem = await this.findByIdAndVerifyAuthor(problemId, authorId)

    if (problem.status !== ProblemStatus.WAITING) {
      throw new BadRequestException('Expert cannot be selected at this time')
    }

    // create chat group for author and expert
    const chatGroup = await this.chatService.createChatGroup(
      `Problem ${problem.onchainId}`,
      authorId,
      true,
      [authorId, expertId],
    )

    // update problem
    problem.status = ProblemStatus.PREPARING
    problem.expert = expertId as any
    problem.chatGroupId = chatGroup._id

    await problem.save()

    return problem
  }

  private async findByIdAndVerifyAuthor(problemId: Id, authorId: Id) {
    const problem = await this.problemModel.findById(problemId)

    if (!problem) {
      throw new NotFoundException('Problem with given id is not exist')
    }

    if (!authorId.toString() == (problem.author as any).toString()) {
      throw new ForbiddenException('You are not the author of this problem')
    }
    return problem
  }

  async findBidById(id: Id) {
    const bid = await this.problemBidModel.findById(id).populate('expert')
    return bid
  }

  async findAllBids(problemId: Id) {
    const bids = await this.problemBidModel
      .find({ problemId })
      .populate('expert')
    return bids
  }

  async createBid(
    problemOnchainId: number,
    problemBidOnchainId: number,
    expertId: Id,
    amount: string,
  ) {
    const problem = await this.problemModel.findOne({
      onchainId: problemOnchainId,
    })

    if (!problem) {
      throw new NotFoundException('Problem with given id is not exist')
    }

    if (problem.status !== ProblemStatus.WAITING) {
      throw new BadRequestException('Bid cannot be created at this time')
    }

    const bid = await this.problemBidModel.create({
      problemId: problem._id,
      onchainId: problemBidOnchainId,
      expert: expertId,
      amount,
    })

    return bid
  }

  async uploadBidDataByExpert(
    problemBidId: Id,
    expertId: Id,
    data: Pick<ProblemBid, 'description'>,
  ) {
    const bid = await this.problemBidModel.findById(problemBidId)

    if (!bid) {
      throw new NotFoundException('Bid with given id is not exist')
    }

    if (bid.expert.toString() !== expertId.toString()) {
      throw new ForbiddenException('You are not the expert of this bid')
    }

    bid.description = data.description

    await bid.save()

    return bid
  }
}
