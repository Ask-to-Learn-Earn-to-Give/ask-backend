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
    this.startConnection()
  }

  setUpEventListeners() {
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
        bidOnchainId: bigint,
        expertAddress: string,
        amount: bigint,
      ) => {
        this.eventEmitter.emit('problem.bid.created', {
          problemOnchainId: Number(problemOnchainId),
          bidOnchainId: Number(bidOnchainId),
          expertAddress: expertAddress.toLowerCase(),
          amount: amount.toString(),
        })
      },
    )

    this.problemContract.on(
      'ExpertSelected',
      (problemOnchainId: bigint, expertAddress: string) => {
        this.eventEmitter.emit('problem.expert.selected', {
          problemOnchainId: Number(problemOnchainId),
          expertAddress: expertAddress.toLowerCase(),
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

  startConnection() {
    let pingTimeout = null
    let keepAliveInterval = null

    this.provider = new WebSocketProvider(process.env.NODE_WS_URL)
    this.wallet = new Wallet(process.env.PRIVATE_KEY, this.provider)

    const websocket = this.provider.websocket as any

    this.setUpEventListeners()

    websocket.on('open', () => {
      keepAliveInterval = setInterval(() => {
        websocket.ping()
        pingTimeout = setTimeout(() => {
          websocket.terminate()
        }, Number(process.env.NODE_WS_PING_TIMEOUT))
      }, Number(process.env.NODE_WS_PING_INTERVAL))
    })

    websocket.on('close', () => {
      console.log('The websocket connection was closed, restarting it')
      clearInterval(keepAliveInterval)
      clearTimeout(pingTimeout)
      this.startConnection()
    })

    websocket.on('pong', () => {
      clearInterval(pingTimeout)
    })
  }
}
