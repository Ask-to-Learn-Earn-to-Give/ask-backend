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

@Injectable()
export class ProblemService {
  constructor(
    @InjectModel(Problem.name)
    private readonly problemModel: Model<ProblemDocument>,
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
}
