import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { CacheModule } from '@nestjs/cache-manager'
import { ProblemModule } from './problem/problem.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { BlockchainModule } from './blockchain/blockchain.module'

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI, { dbName: 'askify' }),
    CacheModule.register({
      isGlobal: true,
    }),
    UserModule,
    AuthModule,
    ProblemModule,
    BlockchainModule,
  ],
  providers: [],
})
export class AppModule {}
