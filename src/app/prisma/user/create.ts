import prisma from '@/db'

export const createUser = async (email: string, password: string = '') => {
  await prisma.user.create({
    data: {
      email: email,
      password: password
    }
  });
}