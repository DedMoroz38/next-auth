import { sign, verify } from 'jsonwebtoken'

export const generateAccessToken = (payload: {
  id: string;
}) => {
  return sign(payload, process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET!, {
    algorithm: 'HS512',
    expiresIn: 300,
  })
}

export const generateRefreshToken = (payload: {
  id: string;
}) => {
  return sign(payload, process.env.NEXT_PUBLIC_REFRESH_TOKEN_SECRET!, {
    algorithm: 'HS512',
    expiresIn: 60 * 60 * 24,
  })
}

export const validateAndReturnRefreshToken = (token: string) => {
  return verify(token, process.env.NEXT_PUBLIC_REFRESH_TOKEN_SECRET!)
}

export const validateAndReturnAccessToken = (token: string) => {
  return verify(token, process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET!)
}