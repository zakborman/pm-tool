'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoginForm from '@/components/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { setAuthToken, loginAsGuest } = useAuth()
  const [guestError, setGuestError] = useState<string | null>(null)

  const handleSuccess = async (accessToken: string) => {
    // Update auth context with the token
    await setAuthToken(accessToken)

    // Redirect to dashboard
    router.push('/dashboard')
  }

  const handleGuestLogin = async () => {
    try {
      setGuestError(null)
      await loginAsGuest()
      router.push('/dashboard')
    } catch (error) {
      console.error('Guest login failed:', error)
      setGuestError('Failed to create guest session. Please ensure the backend is running.')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        <div className="bg-gray-800 p-8 shadow-xl rounded-2xl border border-gray-700">
          {guestError && (
            <div className="mb-4 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
              {guestError}
            </div>
          )}

          <LoginForm onSuccess={handleSuccess} />

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
              onClick={handleGuestLogin}
              className="mt-4 w-full bg-gray-700 text-gray-200 font-medium py-3 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
