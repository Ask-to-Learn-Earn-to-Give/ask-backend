import { Id } from '@/common'
import { Namespace, Server } from 'socket.io'

export abstract class WsService {
  private io: Namespace
  private userToSockets: Map<string, Set<string>> = new Map()
  private socketToUser: Map<string, string> = new Map()
  private namespace: string

  constructor(namespace: string) {
    this.namespace = namespace
  }

  getUserId(socketId: string) {
    return new Id(this.socketToUser.get(socketId))
  }

  /**
   * Store the socket id of the user for later use
   *
   * @param userId Id of the user
   * @param socketId Id of the socket
   */
  addSocket(userId: Id, socketId: string) {
    const strUserId = userId.toString()

    if (!this.userToSockets.has(strUserId)) {
      this.userToSockets.set(strUserId, new Set())
    }

    this.userToSockets.get(strUserId).add(socketId)
    this.socketToUser.set(socketId, strUserId)
  }

  /**
   * Remove the socket id of the user
   *
   * @param socketId Id of the socket
   */
  removeSocket(socketId: string) {
    const userId = this.socketToUser.get(socketId)
    const sockets = this.userToSockets.get(userId)

    sockets.delete(socketId)

    if (sockets.size === 0) {
      this.userToSockets.delete(userId)
    }

    this.socketToUser.delete(socketId)
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

    if (!sockets) {
      throw new Error(`User ${strUserId} has no sockets`)
    }

    return sockets
  }

  init(server: Server) {
    this.io = server.of(this.namespace)
  }
}
