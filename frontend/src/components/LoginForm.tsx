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
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="text"
          value={email}
          onChange={handleEmailChange}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <div id="email-error" role="alert">
            {errors.email}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <div id="password-error" role="alert">
            {errors.password}
          </div>
        )}
      </div>

      {errors.general && (
        <div role="alert" aria-live="polite">
          {errors.general}
        </div>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  )
}

export default LoginForm
