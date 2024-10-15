import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { decode } from 'jsonwebtoken'
import { generateAccessToken, generateRefreshToken } from '@/utils/token-generate'


const validateAndRefreshToken = async (refreshToken: string) => {
  console.log('session:', session)
  session.accessToken = token.accessToken

  const accessETA = tokenExpiresIn(session.accessToken)

  if (accessETA < 30) {
    const r = await fetch('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    })

    if (!r.ok) {
      console.debug('error during refresh', r.statusText)
      throw new Error('JWT_REFRESH_ERROR')
    }

    const rJson = await r.json()
    const accessToken = rJson.accessToken

    session.accessToken = accessToken
    token.accessToken = accessToken
  }
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
      console.log('user:', user)
      if (account && account.type !== 'credentials') {
        const payload = { id: token.sub }
        token.accessToken = generateAccessToken(payload)
        token.refreshToken = generateRefreshToken(payload)
      }

      if (user) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
      }
      return token
    },
    session: async ({ session, token, user }) => {
      console.log('session:', session)
      session.accessToken = token.accessToken

      const accessETA = tokenExpiresIn(session.accessToken)

      if (accessETA < 30) {
        const r = await fetch('http://localhost:3000/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: token.refreshToken }),
        })

        if (!r.ok) {
          console.debug('error during refresh', r.statusText)
          throw new Error('JWT_REFRESH_ERROR')
        }

        const rJson = await r.json()
        const accessToken = rJson.accessToken

        session.accessToken = accessToken
        token.accessToken = accessToken
      }

      return session
    }
    ,
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
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
