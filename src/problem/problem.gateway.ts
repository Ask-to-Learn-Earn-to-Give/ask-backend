import { BaseGateway } from '@/common/base.gateway'
import { UserService } from '@/user/user.service'
import { OnEvent } from '@nestjs/event-emitter'
import { JwtService } from '@nestjs/jwt'
import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets'
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
   * Emit to user who created the problem to upload remaining fields like
   * description, title, etc.
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
}
