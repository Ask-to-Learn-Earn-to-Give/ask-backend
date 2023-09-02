import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UserModule } from './user/user.module'
import { AuthModule } from '../auth/auth.module'
import { redisStore } from 'cache-manager-redis-yet'
import { CacheModule } from '@nestjs/cache-manager'
import { ProblemModule } from './problem/problem.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { BlockchainModule } from './blockchain/blockchain.module'

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          ttl: 5000,
          socket: {
            host: process.env.REDIS_HOST,
            port: +process.env.REDIS_PORT,
          },
        }),
      }),
    }),
    UserModule,
    AuthModule,
    ProblemModule,
    BlockchainModule,
  ],
  providers: [],
})
export class AppModule {}
