import { Module } from '@nestjs/common'
import { ProblemController } from './controllers/problem.controller'
import { ProblemService } from './services/problem.service'
import { MongooseModule } from '@nestjs/mongoose'
import { Problem, ProblemSchema } from './models/problem.model'
import { UserModule } from '@/user/user.module'
import { ChatModule } from '@/chat/chat.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Problem.name, schema: ProblemSchema }]),
    UserModule,
    ChatModule,
  ],
  controllers: [ProblemController],
  providers: [ProblemService],
})
export class ProblemModule {}
