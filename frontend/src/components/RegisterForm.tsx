'use client'

import { useState, FormEvent, ChangeEvent } from 'react'

interface RegisterFormProps {
  onSuccess: (user: UserRegistrationResponse) => void
}

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  fullName?: string
  general?: string
}

interface UserRegistrationResponse {
  id: number
  email: string
  full_name: string
}

interface ErrorResponse {
  detail?: string
}

const API_BASE_URL = 'http://localhost:8000/api/v1'
const REGISTER_ENDPOINT = `${API_BASE_URL}/auth/register`
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (emailValue: string): boolean => {
    return EMAIL_REGEX.test(emailValue)
  }

  const validateForm = (): boolean => {
    const validationErrors: FormErrors = {}

    if (!email) {
      validationErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      validationErrors.email = 'Invalid email'
    }

    if (!password) {
      validationErrors.password = 'Password is required'
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      validationErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    }

    if (!confirmPassword) {
      validationErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    setErrors({})

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(REGISTER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName || undefined,
        }),
      })

      const data: UserRegistrationResponse | ErrorResponse = await response.json()

      if (!response.ok) {
        const errorData = data as ErrorResponse
        setErrors({ general: errorData.detail || 'Registration failed' })
        return
      }

      const successData = data as UserRegistrationResponse
      onSuccess(successData)
    } catch (error) {
      setErrors({ general: 'Failed to connect to the server' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value)
  }

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value)
  }

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setConfirmPassword(e.target.value)
  }

  const handleFullNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFullName(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="text"
          value={email}
          onChange={handleEmailChange}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
          placeholder="you@example.com"
        />
        {errors.email && (
          <div id="email-error" role="alert" className="text-red-400 text-sm mt-2">
            {errors.email}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
          Full Name <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={handleFullNameChange}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
          placeholder="At least 8 characters"
        />
        {errors.password && (
          <div id="password-error" role="alert" className="text-red-400 text-sm mt-2">
            {errors.password}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
          placeholder="Re-enter your password"
        />
        {errors.confirmPassword && (
          <div id="confirm-password-error" role="alert" className="text-red-400 text-sm mt-2">
            {errors.confirmPassword}
          </div>
        )}
      </div>

      {errors.general && (
        <div role="alert" aria-live="polite" className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
          {errors.general}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  )
}

export default RegisterForm
