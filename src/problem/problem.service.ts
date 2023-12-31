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
import { UserService } from '@/user/user.service'

@Injectable()
export class ProblemService {
  constructor(
    @InjectModel(Problem.name)
    private readonly problemModel: Model<ProblemDocument>,
    @InjectModel(ProblemBid.name)
    private readonly problemBidModel: Model<ProblemBid>,
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  async findById(id: Id) {
    const problem = await this.problemModel
      .findById(id)
      .populate('author')
      .populate('expert')
    return problem
  }

  async find(limit: number, skip: number) {
    const problems = await this.problemModel
      .find()
      .populate('author')
      .populate('expert')
      .limit(limit)
      .skip(skip)
    return problems
  }

  async findByAuthor(limit: number, skip: number, authorId: Id) {
    const problems = await this.problemModel
      .find({ author: authorId })
      .limit(limit)
      .skip(skip)
      .populate('author')
      .populate('expert')
    return problems
  }

  async create(authorId: Id, onchainId: number) {
    const problem = await this.problemModel.create({
      onchainId: onchainId,
      author: authorId,
      status: ProblemStatus.PREPARING,
    })
    return problem
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
   * @param problemOnchainId
   * @param bidId
   * @returns Updated problem
   */
  async selectBid(problemOnchainId: number, expertAddress: string) {
    const problem = await this.problemModel.findOne({
      onchainId: problemOnchainId,
    })

    if (problem.status !== ProblemStatus.WAITING) {
      throw new BadRequestException('Expert cannot be selected at this time')
    }

    const expert = await this.userService.findByAddress(expertAddress)
    const bid = await this.problemBidModel.findOne({
      expert: expert._id,
      problemId: problem._id,
    })

    // create chat group for author and expert
    const chatGroup = await this.chatService.createChatGroup(
      `Problem ${problem.onchainId}`,
      problem.author as any,
      true,
      [problem.author as any, expert._id],
    )

    // update problem
    problem.status = ProblemStatus.ONPROGRESS
    problem.expert = expert._id as any
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
