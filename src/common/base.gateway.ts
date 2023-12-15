import { Id } from '@/common'
import { JwtService } from '@nestjs/jwt'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets'
import { Namespace, Socket } from 'socket.io'

type GatewayOptions = {
  namespace: string
  requireAuth: boolean
}

export abstract class BaseGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private io: Namespace
  private userToSockets: Map<string, Set<string>> = new Map()
  private socketToUser: Map<string, string> = new Map()

  constructor(
    private readonly jwtService: JwtService,
    private readonly options: GatewayOptions,
  ) {}

  handleConnection(socket: Socket) {
    const token = socket.handshake.query.token as string

    if (!token) {
      if (this.options.requireAuth) {
        socket.disconnect(true)
      }
    }

    try {
      const { _id: userId } = this.jwtService.verify(token)

      if (!this.userToSockets.has(userId)) {
        this.userToSockets.set(userId, new Set())
      }

      this.userToSockets.get(userId).add(socket.id)
      this.socketToUser.set(socket.id, userId)

      console.log(`User ${userId} connected`)
    } catch (e) {
      if (this.options.requireAuth) {
        socket.disconnect(true)
      }
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = this.socketToUser.get(socket.id)
    const sockets = this.userToSockets.get(userId)

    if (!userId) {
      return
    }

    sockets.delete(socket.id)

    if (sockets.size === 0) {
      this.userToSockets.delete(userId)
    }

    console.log(`User ${userId} disconnected`)
  }

  afterInit(io: Namespace) {
    this.io = io
  }

  getUserId(socketId: string) {
    return new Id(this.socketToUser.get(socketId))
  }

  /**
   * Emit an event to all sockets of the user
   *
   * @param userId Id of the user
   * @param event Name of the event
   * @param data Data to send
   */
  emitToUser(userId: Id, event: string, data: any) {
    const sockets = this.getSockets(userId)
    console.log(sockets)
    for (const socketId of sockets) {
      this.io.to(socketId).emit(event, data)
    }
  }

  /**
   * Emit an event to all sockets in a room
   *
   * @param room Name of the room
   * @param event Name of the event
   * @param data Data to send
   */
  emitToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data)
  }

  /**
   * Add a user to a room in a namespace
   *
   * @param userId Id of the user
   * @param room Name of the room
   */
  addUserToRoom(userId: Id, room: string) {
    const sockets = this.getSockets(userId)

    for (const socketId of sockets) {
      this.io.sockets.get(socketId).join(room)
    }
  }

  /**
   * Remove a user from a room in a namespace
   *
   * @param userId Id of the user
   * @param room Name of the room
   */
  removeUserFromRoom(userId: Id, room: string) {
    const sockets = this.getSockets(userId)

    for (const socketId of sockets) {
      this.io.sockets.get(socketId).leave(room)
    }
  }

  /**
   * Check if a user is online
   *
   * @param userId Id of the user
   * @returns True if the user is online
   */
  isUserOnline(userId: Id) {
    return this.userToSockets.has(userId.toString())
  }

  getSockets(userId: Id) {
    const strUserId = userId.toString()
    const sockets = this.userToSockets.get(strUserId)

    return sockets || []
  }
}
