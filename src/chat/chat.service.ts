import { ForbiddenException, Injectable } from '@nestjs/common'
import { ChatMessage, ChatMessageDocument } from './models/chat-message.model'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { ChatGroup, ChatGroupDocument } from './models/chat-group.model'
import { Id } from '@/common'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatGroup.name)
    private readonly chatGroupModel: Model<ChatGroupDocument>,
    @InjectModel(ChatMessage.name)
    private readonly chatMessageModel: Model<ChatMessageDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createChatGroup(
    name: string,
    ownerId: Id,
    isDirectChat = false,
    members: Id[] = [],
  ) {
    if (isDirectChat && members.length != 2) {
      throw new Error('Direct chat must have exactly 2 members')
    }

    const chatGroup = await this.chatGroupModel.create({
      name,
      ownerId,
      members,
      isDirectChat,
    })

    return chatGroup
  }

  async findChatGroupById(id: Id) {
    const chatGroup = await this.chatGroupModel.findById(id).populate('members')
    return chatGroup
  }

  async createMessage(chatGroupId: Id, senderId: Id, content: string) {
    await this.checkUserInChatGroup(chatGroupId, senderId)

    const chatMessage = await this.chatMessageModel.create({
      chatGroupId,
      senderId,
      content,
    })

    this.eventEmitter.emit('chat.message.created', chatMessage)

    return chatMessage
  }

  async findMessagesByUser(
    userId: Id,
    chatGroupId: Id,
    limit: number,
    skip: number,
  ) {
    await this.checkUserInChatGroup(chatGroupId, userId)
    return await this.findMessages(chatGroupId, limit, skip)
  }

  async findMessages(chatGroupId: Id, limit: number, skip: number) {
    const messages = await this.chatMessageModel
      .find({ chatGroupId })
      .limit(limit)
      .skip(skip)
    return messages
  }

  async checkUserInChatGroup(chatGroupId: Id, userId: Id) {
    if (!this.isUserInChatGroup(chatGroupId, userId)) {
      throw new ForbiddenException('User is not in chat group')
    }
  }

  async isUserInChatGroup(chatGroupId: Id, userId: Id) {
    const count = await this.chatGroupModel.count({
      _id: chatGroupId,
      members: {
        $in: [userId],
      },
    })

    return count > 0
  }
}
