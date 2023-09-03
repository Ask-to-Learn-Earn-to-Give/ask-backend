import { BaseGateway } from '@/common/base.gateway'
import { UserService } from '@/user/user.service'
import { OnEvent } from '@nestjs/event-emitter'
import { JwtService } from '@nestjs/jwt'
import { WebSocketGateway } from '@nestjs/websockets'
import { ProblemService } from './problem.service'

@WebSocketGateway({
  namespace: 'problem',
  cors: true,
  transports: ['websocket'],
})
export class ProblemGateway extends BaseGateway {
  constructor(
    private readonly userService: UserService,
    private readonly problemService: ProblemService,
    jwtService: JwtService,
  ) {
    super(jwtService, { namespace: 'problem', requireAuth: true })
  }

  /**
   * Excuting when a new problem is created in smart contract.
   * Emit to user who created the problem to notify client to
   * upload remaining fields like description, title, etc.
   *
   * @todo Implement event type
   */
  @OnEvent('problem.created')
  async handleProblemCreatedEvent({ problemOnchainId, authorAddress }: any) {
    const user = await this.userService.findByAddress(authorAddress)

    const problem = await this.problemService.create(
      user._id,
      Number(problemOnchainId),
    )

    this.emitToUser(user._id, 'problem.created', {
      problemId: problem.id,
    })

    console.log(`Problem created: ${problem.id}`)
  }

  /**
   * Executing when a new bid is placed in smart contract.
   * Emit to expert who placed the bid to notify client to update remaining
   * fields.
   *
   * @todo Implement event type
   */
  @OnEvent('problem.bid.created')
  async handleProblemBidCreatedEvent({
    problemOnchainId,
    bidOnchainId,
    expertAddress,
    amount,
  }: any) {
    const expert = await this.userService.findByAddress(expertAddress)

    const bid = await this.problemService.createBid(
      problemOnchainId,
      bidOnchainId,
      expert._id,
      amount,
    )

    this.emitToUser(expert._id, 'problem.bid.created', {
      problemBidId: bid.id,
    })

    console.log(`Problem bid created: ${bidOnchainId}`)
  }

  @OnEvent('problem.bid.selected')
  async handleProblemExpertSelectedEvent({
    problemOnchainId,
    expertAddress,
  }: any) {
    const problem = await this.problemService.selectBid(
      problemOnchainId,
      expertAddress,
    )

    console.log(`Problem bid selected: ${problemOnchainId}`)
  }
}
