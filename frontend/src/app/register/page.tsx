'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import RegisterForm from '@/components/RegisterForm'
import Link from 'next/link'

interface UserRegistrationResponse {
  id: number
  email: string
  full_name: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [successMessage, setSuccessMessage] = useState('')

  const handleSuccess = (user: UserRegistrationResponse) => {
    setSuccessMessage(`Welcome, ${user.full_name || user.email}! Redirecting to login...`)

    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <div className="bg-white p-8 shadow-md rounded-lg">
          {successMessage ? (
            <div
              role="alert"
              className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md"
            >
              {successMessage}
            </div>
          ) : (
            <RegisterForm onSuccess={handleSuccess} />
          )}
        </div>

        <p className="text-center text-xs text-gray-500">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  )
}
