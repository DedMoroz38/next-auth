import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { sign, decode } from 'jsonwebtoken'
import { cookies } from 'next/headers'

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
    jwt: async ({ token, user }) => {
      const payload = { sub: token.sub }
      token.accessToken = sign(payload, process.env.JWT_ACCESS_SECRET!, {
        algorithm: 'HS512',
        expiresIn: 300,
      })
      token.refreshToken = sign(payload, process.env.JWT_REFRESH_SECRET!, {
        algorithm: 'HS512',
        expiresIn: 60 * 60 * 24,
      })

      if (user) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
      }
      return token
    },
    session: async ({ session, token }) => {
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken

      const refreshETA = tokenExpiresIn(session.refreshToken)
      const accessETA = tokenExpiresIn(session.accessToken)
      console.debug('jwt refresh remaining time', refreshETA, Date.now())
      console.debug('jwt access remaining time', accessETA, Date.now())

      if (accessETA < 30) {
        const r = await fetch('http://localhost:3001/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: session.refreshToken }),
        })

        if (!r.ok) {
          console.debug('error during refresh', r.statusText)
          throw new Error('JWT_REFRESH_ERROR')
        }

        const accessToken = (await r.json()).accessToken
        console.debug('new access token received', accessToken)
        session.accessToken = accessToken
        token.accessToken = accessToken
      }

      session.refreshExpiresIn = refreshETA
      session.accessExpiresIn = tokenExpiresIn(session.accessToken)

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
        const res = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: { 'Content-Type': 'application/json' },
        })
        const rJson = await res.json()

        console.log('rJson: ', rJson)

        return {
          id: rJson.data.id,
          accessToken: null,
          refreshToken: null,
        }
        // const user = await res.json()
        //
        // if (res.ok && user) {
        //   return user
        // }
        //
        // return null
      },
    }),
  ],
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
