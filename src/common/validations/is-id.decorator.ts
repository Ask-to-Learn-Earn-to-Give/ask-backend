import { Id } from '@/common'
import { registerDecorator } from 'class-validator'

export function IsId() {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsId',
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate(value: any) {
          return Id.isValid(value)
        },
        defaultMessage() {
          return '$property must be a valid Id'
        },
      },
    })
  }
}
