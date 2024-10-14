import prisma from '@/db'
import { comparePassword } from '@/utils/salt-and-hash-password'
import { NextResponse } from 'next/server'
import { generateAccessToken } from '@/utils/token-generate'

export async function POST(req: Request) {
  const body = await req.json()
  let arePasswordsEqual

  const user = await prisma.user.findFirst({
    where: {
      email: body.email,
    },
    select: {
      password: true,
      id: true,
    },
  })

  if (user.password) arePasswordsEqual = comparePassword(body.password, user!.password)

  if (!user || !arePasswordsEqual) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }

  const accessToken = generateAccessToken({ id: user.id })
  const refreshToken = generateAccessToken({ id: user.id })

  return NextResponse.json({
    message: 'success', data: {
      id: user.id,
      accessToken,
      refreshToken,
    },
  }, { status: 200 })
}
