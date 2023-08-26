import { registerDecorator } from 'class-validator'

import mongoose from 'mongoose'

export function IsObjectId() {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsObjectId',
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate(value: any) {
          return mongoose.Types.ObjectId.isValid(value)
        },
        defaultMessage() {
          return '$property must be a valid ObjectId'
        },
      },
    })
  }
}
