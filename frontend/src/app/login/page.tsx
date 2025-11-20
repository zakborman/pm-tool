'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoginForm from '@/components/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { setAuthToken, loginAsGuest } = useAuth()

  const handleSuccess = async (accessToken: string) => {
    // Update auth context with the token
    await setAuthToken(accessToken)

    // Redirect to dashboard
    router.push('/dashboard')
  }

  const handleGuestLogin = async () => {
    try {
      await loginAsGuest()
      router.push('/dashboard')
    } catch (error) {
      console.error('Guest login failed:', error)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        <div className="bg-white p-8 shadow-xl rounded-2xl border border-gray-100">
          <LoginForm onSuccess={handleSuccess} />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <button
              onClick={handleGuestLogin}
              className="mt-4 w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
