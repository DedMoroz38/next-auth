import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'
import { decode } from 'jsonwebtoken'
import { generateAccessToken, validateAndReturnRefreshToken } from '@/utils/token-generate'
import { checkIfUserExistsAndCreate } from '@/app/prisma/user/create-user'

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
          console.log('refreshed token')
          const { sub } = validateAndReturnRefreshToken(refreshToken)
          token.accessToken = generateAccessToken({ id: sub })
        } catch {
          isAuthorized = false
        }
      }

      token.accessToken = accessToken
      token.refreshToken = refreshToken
      token.isAuthorized = isAuthorized

      if (!isAuthorized){
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
          const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { 'Content-Type': 'application/json' },
          })
          const rJson = await res.json()

          return {
            id: rJson.data.id,
            accessToken: rJson.data.accessToken,
            refreshToken: rJson.data.refreshToken,
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
