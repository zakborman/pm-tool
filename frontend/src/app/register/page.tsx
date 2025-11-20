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

  const handleGuestMode = () => {
    router.push('/login')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <div className="bg-gray-800 p-8 shadow-xl rounded-2xl border border-gray-700">
          {successMessage ? (
            <div
              role="alert"
              className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {successMessage}
            </div>
          ) : (
            <>
              <RegisterForm onSuccess={handleSuccess} />

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-gray-800 text-gray-400">Or</span>
                  </div>
                </div>

                <button
                  onClick={handleGuestMode}
                  className="mt-4 w-full bg-gray-700 text-gray-200 font-medium py-3 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all"
                >
                  Continue as Guest
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-400">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  )
}
