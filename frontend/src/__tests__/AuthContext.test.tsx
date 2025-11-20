import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../contexts/AuthContext'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('provides initial state with no user', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('sets user and token after successful login', async () => {
    const mockToken = 'mock-jwt-token'
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      full_name: 'Test User',
    }

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: mockToken }),
    })
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await act(async () => {
      await result.current.login('test@example.com', 'password123')
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.token).toBe(mockToken)
    expect(localStorage.getItem('access_token')).toBe(mockToken)
  })

  it('throws error when login fails', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Incorrect email or password' }),
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await act(async () => {
      await expect(
        result.current.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Incorrect email or password')
    })
  })

  it('clears user and token on logout', async () => {
    const mockToken = 'mock-jwt-token'
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      full_name: 'Test User',
    }

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: mockToken }),
    })
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await act(async () => {
      await result.current.login('test@example.com', 'password123')
    })

    expect(result.current.user).toEqual(mockUser)

    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(localStorage.getItem('access_token')).toBeNull()
  })

  it('restores session from localStorage on mount', async () => {
    const mockToken = 'stored-jwt-token'
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      full_name: 'Test User',
    }

    localStorage.setItem('access_token', mockToken)

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.token).toBe(mockToken)
    })
  })

  it('handles invalid token by clearing session', async () => {
    const mockToken = 'invalid-token'

    localStorage.setItem('access_token', mockToken)

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => {
      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(localStorage.getItem('access_token')).toBeNull()
    })
  })

  it('provides loading state during authentication', async () => {
    const mockToken = 'mock-jwt-token'

    ;(global.fetch as any).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ access_token: mockToken }),
              }),
            100
          )
        )
    )

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    act(() => {
      result.current.login('test@example.com', 'password123')
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })
})
