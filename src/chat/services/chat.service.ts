import { ForbiddenException, Injectable } from '@nestjs/common'
import { ChatMessage, ChatMessageDocument } from '../models/chat-message.model'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { ChatGroup, ChatGroupDocument } from '../models/chat-group.model'
import { Id } from '@/common'

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatGroup.name)
    private readonly chatGroupModel: Model<ChatGroupDocument>,
    @InjectModel(ChatMessage.name)
    private readonly chatMessageModel: Model<ChatMessageDocument>,
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
    const chatGroup = await this.chatMessageModel
      .findById(id)
      .populate('members')
    return chatGroup
  }

  async sendMessage(chatGroupId: Id, senderId: Id, content: string) {
    await this.checkUserInChatGroup(chatGroupId, senderId)

    const chatMessage = await this.chatMessageModel.create({
      chatGroupId,
      senderId,
      content,
    })

    return chatMessage
  }

  async checkUserInChatGroup(chatGroupId: Id, userId: Id) {
    const chatGroup = await this.chatGroupModel.findById(chatGroupId)

    if (!chatGroup.members.some((member: any) => member.equals(userId))) {
      throw new ForbiddenException('User is not in chat group')
    }
  }
}
