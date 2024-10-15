import { generateAccessToken, validateRefreshToken } from '@/utils/token-generate'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const payload = validateRefreshToken(body.refreshToken)

    return NextResponse.json({
      message: 'success', data: {
        id: payload.sub,
        accessTokenToken: generateAccessToken({ id: payload.sub }),
      },
    }, { status: 200 })
  } catch {
    return NextResponse.json({
      message: 'failed',
    }, { status: 401 })
  }
}