'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoginForm from '@/components/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { setAuthToken } = useAuth()

  const handleSuccess = async (accessToken: string) => {
    // Update auth context with the token
    await setAuthToken(accessToken)

    // Redirect to dashboard
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>

        <div className="bg-white p-8 shadow-md rounded-lg">
          <LoginForm onSuccess={handleSuccess} />
        </div>
      </div>
    </main>
  )
}
