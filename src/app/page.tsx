import { getSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await getSession()

  if (session === null ){
    redirect('auth/signin')
  }

  return (
    <div>
      <h1>Main page </h1>
    </div>
  )
}
