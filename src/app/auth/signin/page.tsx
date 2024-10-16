'use client'

import { useForm } from 'react-hook-form'
import { signIn, useSession } from 'next-auth/react'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type LoginFormFields = {
  email: string;
  password: string;
}

const schema = yup.object({
  email: yup
    .string()
    .email()
    .required('Can not be empty'),
  password: yup.string().required('Can not be empty'),
})

export default function SignIn() {
  const router = useRouter();

  const session = useSession()

  const {
    register,
    handleSubmit,
    setError,
    formState: {
      errors,
    },
  } = useForm({
    reValidateMode: 'onSubmit',
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: LoginFormFields) => {
    const r = await signIn('credentials', { redirect: false, callbackUrl: undefined, ...data })

    if (!r) return

    if (r?.status === 401) {
      setError('email', { message: 'Incorrect email' })
      setError('password', { message: 'Incorrect password' })
    }
  }

  const loginWithExternalProvider = async (provider: string) => {
    const r = await signIn(provider)

    if (!r) return

    if (r.status === 401) alert('Error')
    else if (r.url) {
      const redirectTo = new URL(r.url).searchParams.get('callbackUrl')
      console.log('redirecting to:', redirectTo)
      router.push(redirectTo || '/')
    }
  }

  useEffect(() => {
    console.log('session in client: ', session)
  }, [])
  return (
    <div className="font-[sans-serif]">
      <div className="min-h-screen flex fle-col items-center justify-center py-6 px-4">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto">
          <h3 className="text-gray-800 text-3xl font-extrabold mb-8">Sign in</h3>
          <div className="space-y-4">
            <div>
              {errors.email && <p className="text-red">{errors.email.message}</p>}
              <input
                {...register('email')}
                name="email"
                className="bg-gray-100 w-full text-sm text-gray-800 px-4 py-3.5 rounded-md outline-blue-600 focus:bg-transparent"
                placeholder="Email address"
              />
            </div>
            <div>
              {errors.password && <p className="text-red">{errors.password.message}</p>}
              <input
                {...register('password')}
                name="password"
                className="bg-gray-100 w-full text-sm text-gray-800 px-4 py-3.5 rounded-md outline-blue-600 focus:bg-transparent"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="!mt-8">
            <button
              type="submit"
              className="w-full shadow-xl py-2.5 px-4 text-sm font-semibold rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Log in
            </button>
          </div>

          <div className="flex justify-between">
            <button onClick={() => loginWithExternalProvider('github')} type="button" className="h-10 border border-solid border-black">
              GitHub
            </button>
            <button onClick={() => loginWithExternalProvider('google')} type="button" className="h-10 border border-solid border-black">
              Google
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
