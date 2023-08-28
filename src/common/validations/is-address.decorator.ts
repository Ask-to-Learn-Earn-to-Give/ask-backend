import { registerDecorator } from 'class-validator'

export function IsAddress() {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsAddress',
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate(value: any) {
          return (
            /^(0x)[a-fA-F0-9]{40}$/.test(value) && !/^(0x)?[0]{40}$/.test(value)
          )
        },
        defaultMessage() {
          return '$property must be a valid wallet address'
        },
      },
    })
  }
}
