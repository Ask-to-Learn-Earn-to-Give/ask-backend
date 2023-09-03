import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from '@/user/user.model'
import { Id } from '@/common'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /**
   * Find all users
   *
   * @returns All users
   */
  async findAll() {
    return await this.userModel.find()
  }

  /**
   * Find a user by id
   *
   * @param id The id of the user
   *
   * @returns The user if found, null if not found
   */
  async findById(id: Id): Promise<UserDocument | null> {
    return await this.userModel.findById(id)
  }

  /**
   * Find a user by username
   *
   * @param username The username of the user
   *
   * @returns The user if found, null if not found
   */
  async findByUsername(username: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ username })
  }

  /**
   * Find a user by address
   *
   * @param address The address of the user
   *
   * @returns The user if found, null if not found
   */
  async findByAddress(address: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ address })
  }

  /**
   * Create a new user
   *
   * @description
   * Only need address to create a new user.
   * The other fields will be filled later using the following methods:
   * - {@link updateUsername}
   * - {@link updateCommonFields}
   *
   * @param address The address of the user
   *
   * @returns The new user
   */
  async create(address: string): Promise<UserDocument> {
    return await this.userModel.create({ address })
  }

  /**
   * Update username of a user
   *
   * @param id The id of the user
   * @param username The new username
   *
   * @returns new user if success, null if the username is already taken
   */
  async updateUsername(id: Id, username: string): Promise<UserDocument | null> {
    // check if username is already taken
    const existUser = await this.userModel.findOne({ username })

    if (existUser) {
      return null
    }

    return await this.userModel.findByIdAndUpdate(id, { username })
  }

  /**
   * Update common fields of a user like fullName, etc.
   *
   * @param id The id of the user
   * @param fields The fields to update
   *
   * @returns new user if success, null if there is an error
   */
  async updateCommonFields(
    id: Id,
    fields: Pick<User, 'fullName' | 'avatarUrl' | 'description'>,
  ): Promise<UserDocument | null> {
    try {
      return await this.userModel.findByIdAndUpdate(
        id,
        {
          $set: {
            fullName: fields.fullName,
            avatarUrl: fields.avatarUrl,
            description: fields.description,
          },
        },
        { new: true },
      )
    } catch (error) {
      return null
    }
  }
}
