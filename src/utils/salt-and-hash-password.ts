import bcrypt from 'bcryptjs'

export const saltAndHashPassword = (plainPassword: string) => {
  const salt = bcrypt.genSaltSync(10)
  const encryptedPassword = bcrypt.hashSync(plainPassword, salt)

  return encryptedPassword
}
