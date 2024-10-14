import type { Metadata } from 'next'
import { getSession } from 'next-auth/react'
import SessionProvider from '../components/session-provider'
import './globals.css'
export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default async function asuRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession()

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  )
}
