import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterForm from '../components/RegisterForm'

describe('RegisterForm', () => {
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    mockOnSuccess.mockClear()
    global.fetch = vi.fn()
  })

  it('renders registration form with email, password, and full name fields', () => {
    render(<RegisterForm onSuccess={mockOnSuccess} />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register|sign up/i })).toBeInTheDocument()
  })

  it('shows validation errors for invalid email', async () => {
    render(<RegisterForm onSuccess={mockOnSuccess} />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /register|sign up/i })

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('shows validation error for missing required fields', async () => {
    render(<RegisterForm onSuccess={mockOnSuccess} />)

    const submitButton = screen.getByRole('button', { name: /register|sign up/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('shows validation error for short password', async () => {
    render(<RegisterForm onSuccess={mockOnSuccess} />)

    const passwordInput = screen.getByLabelText(/^password/i)
    const submitButton = screen.getByRole('button', { name: /register|sign up/i })

    fireEvent.change(passwordInput, { target: { value: 'short' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password must be at least/i)).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('shows validation error when passwords do not match', async () => {
    render(<RegisterForm onSuccess={mockOnSuccess} />)

    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /register|sign up/i })

    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmInput, { target: { value: 'different123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('submits form successfully with valid data', async () => {
    const mockResponse = {
      id: 1,
      email: 'test@example.com',
      full_name: 'Test User',
    }

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<RegisterForm onSuccess={mockOnSuccess} />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: 'securepassword123' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'securepassword123' },
    })
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Test User' },
    })

    fireEvent.click(screen.getByRole('button', { name: /register|sign up/i }))

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse)
    })

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/auth/register',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'securepassword123',
          full_name: 'Test User',
        }),
      })
    )
  })

  it('shows error message when registration fails', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Email already registered' }),
    })

    render(<RegisterForm onSuccess={mockOnSuccess} />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: 'securepassword123' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'securepassword123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /register|sign up/i }))

    await waitFor(() => {
      expect(screen.getByText(/email already registered/i)).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('shows loading state during submission', async () => {
    ;(global.fetch as any).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    render(<RegisterForm onSuccess={mockOnSuccess} />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: 'securepassword123' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'securepassword123' },
    })

    const submitButton = screen.getByRole('button', { name: /register|sign up/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /registering|creating account/i })).toBeDisabled()
    })
  })

  it('handles network errors gracefully', async () => {
    ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

    render(<RegisterForm onSuccess={mockOnSuccess} />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: 'securepassword123' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'securepassword123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /register|sign up/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to connect to the server/i)).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })
})
