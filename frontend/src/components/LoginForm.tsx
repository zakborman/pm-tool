'use client'

import { useState, FormEvent, ChangeEvent } from 'react'

/**
 * Props for the LoginForm component
 */
interface LoginFormProps {
  /** Callback function called with access token upon successful login */
  onSuccess: (accessToken: string) => void
}

/**
 * Structure for form validation errors
 */
interface FormErrors {
  email?: string
  password?: string
  general?: string
}

/**
 * Response structure from the login API
 */
interface LoginResponse {
  access_token: string
  token_type: string
}

/**
 * Error response structure from the login API
 */
interface LoginErrorResponse {
  detail?: string
}

// Constants
const API_BASE_URL = 'http://localhost:8000/api/v1'
const LOGIN_ENDPOINT = `${API_BASE_URL}/auth/login`
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * LoginForm component provides user authentication interface
 * Handles email/password validation and submission to backend API
 */
const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Validates email format using regex pattern
   */
  const validateEmail = (emailValue: string): boolean => {
    return EMAIL_REGEX.test(emailValue)
  }

  /**
   * Validates all form fields and returns validation status
   */
  const validateForm = (): boolean => {
    const validationErrors: FormErrors = {}

    if (!email) {
      validationErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      validationErrors.email = 'Invalid email'
    }

    if (!password) {
      validationErrors.password = 'Password is required'
    }

    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }

  /**
   * Handles form submission and authentication
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    setErrors({})

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data: LoginResponse | LoginErrorResponse = await response.json()

      if (!response.ok) {
        const errorData = data as LoginErrorResponse
        setErrors({ general: errorData.detail || 'Login failed' })
        return
      }

      const successData = data as LoginResponse
      onSuccess(successData.access_token)
    } catch (error) {
      setErrors({ general: 'Failed to connect to the server' })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handles email input changes
   */
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value)
  }

  /**
   * Handles password input changes
   */
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value)
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
          placeholder="••••••••"
        />
        {errors.password && (
          <div id="password-error" role="alert" className="text-red-400 text-sm mt-2">
            {errors.password}
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
        {isLoading ? 'Logging in...' : 'Sign In'}
      </button>
    </form>
  )
}

export default LoginForm
