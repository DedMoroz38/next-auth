'use server'

import { signIn } from 'next-auth/react'

export async function authenticate(formData: FormData) {
  console.log('formData', formData)
  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (error) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.'
        default:
          return 'Something went wrong.'
      }
    }
    throw error
  }
}
