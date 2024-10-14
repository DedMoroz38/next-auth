import { sign } from 'jsonwebtoken'

export const generateAccessToken = (payload: {
  id: number;
}) => {
  return sign(payload, process.env.JWT_ACCESS_SECRET!, {
    algorithm: 'HS512',
    expiresIn: 300,
  })
}

export const generateRefreshToken = (payload: {
  id: number;
}) => {
  return sign(payload, process.env.JWT_REFRESH_SECRET!, {
    algorithm: 'HS512',
    expiresIn: 60 * 60 * 24,
  })}