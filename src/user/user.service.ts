import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { User } from '@/user/user.model'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findById(id: mongoose.Types.ObjectId): Promise<User | null> {
    return await this.userModel.findById(id)
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userModel.findOne({ username })
  }

  async findByAddress(address: string): Promise<User | null> {
    return await this.userModel.findOne({ address })
  }
}
