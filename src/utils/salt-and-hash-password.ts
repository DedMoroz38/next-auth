import bcrypt from 'bcryptjs'

export const saltAndHashPassword = (plainPassword: string) => {
  const salt = bcrypt.genSaltSync(10)
  const encryptedPassword = bcrypt.hashSync(plainPassword, salt)

  return encryptedPassword
}

export const comparePassword = (plainPassword: string, hashedPassword: string) => {
  return bcrypt.compareSync(plainPassword, hashedPassword)
}