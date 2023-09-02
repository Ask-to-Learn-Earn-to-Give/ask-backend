import { Injectable, OnModuleInit } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import {
  Contract,
  JsonRpcProvider,
  Network,
  Wallet,
  WebSocketProvider,
} from 'ethers'
import PROBLEM_ABI from '@/assets/ABI/ProblemSolverAddress.json'

@Injectable()
export class BlockchainService implements OnModuleInit {
  private provider: WebSocketProvider
  private wallet: Wallet
  private problemContract: Contract

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async onModuleInit() {
    this.provider = new WebSocketProvider(process.env.NODE_WS_URL)
    this.wallet = new Wallet(process.env.PRIVATE_KEY, this.provider)

    this.problemContract = new Contract(
      process.env.PROBLEM_CONTRACT_ADDRESS,
      PROBLEM_ABI,
      this.provider,
    )

    this.problemContract.on(
      'ProblemCreated',
      (problemOnchainId: bigint, title: string, authorAddress: string) => {
        this.eventEmitter.emit('problem.created', {
          problemOnchainId,
          authorAddress: authorAddress.toLowerCase(),
        })
      },
    )

    this.problemContract.on(
      'BidPlaced',
      (
        problemOnchainId: bigint,
        bidId: bigint,
        expertAddress: string,
        amount: bigint,
      ) => {
        this.eventEmitter.emit('problem.bid.created', {
          problemOnchainId,
          bidId,
          expertAddress: expertAddress.toLowerCase(),
          amount,
        })
      },
    )

    this.problemContract.on(
      'ExpertSelected',
      (problemOnchainId: bigint, expert: string) => {
        this.eventEmitter.emit('problem.expert.selected', {
          problemOnchainId,
          expert,
        })
      },
    )

    this.problemContract.on('ProblemSolved', (problemOnchainId: bigint) => {
      this.eventEmitter.emit('problem.solved', {
        problemOnchainId,
      })
    })

    this.problemContract.on('ProblemUnsolved', (problemOnchainId: bigint) => {
      this.eventEmitter.emit('problem.unsolved', {
        problemOnchainId,
      })
    })
  }
}
