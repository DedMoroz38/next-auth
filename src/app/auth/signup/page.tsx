'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

type RegisterFormFields = {
  email: string;
  password: string;
}

const schema = yup.object({
  email: yup
    .string()
    .email()
    .required("Can not be empty"),
  password: yup.string().required("Can not be empty"),
})

export default function SignIn() {
  const {
    register,
    handleSubmit,
    setError,
    formState: {
      errors
    },
  } = useForm({
    reValidateMode: 'onSubmit',
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: RegisterFormFields) => {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res) return;

    if (res?.status === 401) {
      setError('email', {message: 'Incorrect email'})
      setError('password', {message: 'Incorrect password'})
    }
  }

  // const loginWithExternalProvider = async (provider: 'google') => {
  //   const r = await signIn(provider)
  //
  //   if (!r) return
  //
  //   if (r.status === 401) alert('Error')
  //   else if (r.url) {
  //     const redirectTo = new URL(r.url).searchParams.get('callbackUrl')
  //     router.push(redirectTo || '/')
  //   }
  // }
  return (
    <div className="font-[sans-serif]">
      <div className="min-h-screen flex fle-col items-center justify-center py-6 px-4">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto">
          <h3 className="text-gray-800 text-3xl font-extrabold mb-8">Registration</h3>
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
              Register
            </button>
          </div>

          <div className="space-x-6 flex justify-center mt-8">
            <button type="button" className="border-none outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="32px" viewBox="0 0 512 512">
                <path
                  fill="#1877f2"
                  d="M512 256c0 127.78-93.62 233.69-216 252.89V330h59.65L367 256h-71v-48.02c0-20.25 9.92-39.98 41.72-39.98H370v-63s-29.3-5-57.31-5c-58.47 0-96.69 35.44-96.69 99.6V256h-65v74h65v178.89C93.62 489.69 0 383.78 0 256 0 114.62 114.62 0 256 0s256 114.62 256 256z"
                  data-original="#1877f2"
                />
                <path
                  fill="#fff"
                  d="M355.65 330 367 256h-71v-48.021c0-20.245 9.918-39.979 41.719-39.979H370v-63s-29.296-5-57.305-5C254.219 100 216 135.44 216 199.6V256h-65v74h65v178.889c13.034 2.045 26.392 3.111 40 3.111s26.966-1.066 40-3.111V330z"
                  data-original="#ffffff"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
