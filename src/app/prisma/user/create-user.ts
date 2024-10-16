import prisma from '@/db'
import { createUser } from '@/app/prisma/user/create'

export const checkIfUserExistsAndCreate = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    await createUser(email)
  }
}