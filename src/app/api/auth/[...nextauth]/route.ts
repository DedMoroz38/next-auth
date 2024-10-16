import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'
import { decode } from 'jsonwebtoken'
import { generateAccessToken, generateRefreshToken, validateAndReturnRefreshToken } from '@/utils/token-generate'
import prisma from '@/db'
import { comparePassword } from '@/utils/salt-and-hash-password'
import { NextResponse } from 'next/server'

const tokenExpiresIn = (token: string) => {
  const decoded = decode(token, { json: true })
  if (!decoded) throw new Error('TOKEN_DECODE_ERROR')
  return decoded.exp! - Date.now() / 1000
}

export const authOptions = {
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: async ({ token, user, account }) => {
      // if (account && account.type === 'github') {
      //   try {
      //     checkIfUserExistsAndCreate(account.email)
      //   } catch {
      //     return null
      //   }
      // }
      //
      let isAuthorized = true
      let refreshToken
      let accessToken

      if (user) {
        console.log(1)
        refreshToken = user.refreshToken
        accessToken = user.accessToken
      } else {
        refreshToken = token.refreshToken
        accessToken = token.accessToken
      }
      const refreshETA = tokenExpiresIn(refreshToken)
      const accessETA = tokenExpiresIn(accessToken)

      if (refreshETA < 60) {
        isAuthorized = false
      }

      if (accessETA < 30) {
        try {
          const { sub } = validateAndReturnRefreshToken(refreshToken)
          token.accessToken = generateAccessToken({ id: sub })
        } catch {
          isAuthorized = false
        }
      }

      token.accessToken = accessToken
      token.refreshToken = refreshToken
      token.isAuthorized = isAuthorized

      if (!isAuthorized) {
        return null
      }

      return token
    },
  },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          let arePasswordsEqual
          if (!credentials) return Promise.resolve(null)

          const user = await prisma.user.findFirst({
            where: {
              email: credentials.email,
            },
            select: {
              password: true,
              id: true,
            },
          })

          if (user && user.password) arePasswordsEqual = comparePassword(credentials.password, user!.password)

          if (!user || !arePasswordsEqual) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
          }

          const accessToken = generateAccessToken({ id: String(user.id) })
          const refreshToken = generateRefreshToken({ id: String(user.id) })

          return {
            id: user.id,
            accessToken,
            refreshToken,
          }
        } catch {
          return Promise.resolve(null)
        }
      },
    }),
  ],
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
