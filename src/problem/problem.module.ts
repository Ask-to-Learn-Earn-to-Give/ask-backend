import { Module } from '@nestjs/common'
import { ProblemController } from './problem.controller'
import { ProblemService } from './problem.service'
import { MongooseModule } from '@nestjs/mongoose'
import { Problem, ProblemSchema } from './models/problem.model'
import { UserModule } from '@/user/user.module'
import { ChatModule } from '@/chat/chat.module'
import { ProblemGateway } from './problem.gateway'
import { ProblemBid, ProblemBidSchema } from './models/problem-bid.model'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Problem.name, schema: ProblemSchema },
      { name: ProblemBid.name, schema: ProblemBidSchema },
    ]),
    UserModule,
    ChatModule,
  ],
  controllers: [ProblemController],
  providers: [ProblemService, ProblemGateway],
})
export class ProblemModule {}
