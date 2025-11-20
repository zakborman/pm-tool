'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const API_BASE_URL = 'http://localhost:8000/api/v1'

interface User {
  id: number
  email: string
  full_name: string
  is_guest?: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isGuest: boolean
  login: (email: string, password: string) => Promise<void>
  setAuthToken: (token: string) => Promise<void>
  loginAsGuest: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGuest, setIsGuest] = useState(false)

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token')

    if (storedToken) {
      setIsLoading(true)
      fetchCurrentUser(storedToken)
        .then((userData) => {
          setUser(userData)
          setToken(storedToken)
          // Set isGuest based on user data from backend
          if (userData.is_guest) {
            setIsGuest(true)
          }
        })
        .catch(() => {
          // Invalid token, clear it
          localStorage.removeItem('access_token')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [])

  const fetchCurrentUser = async (authToken: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user')
    }

    return response.json()
  }

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true)

    try {
      // Login to get token
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json()
        throw new Error(errorData.detail || 'Login failed')
      }

      const { access_token } = await loginResponse.json()

      // Fetch user data
      const userData = await fetchCurrentUser(access_token)

      // Store token and user
      localStorage.setItem('access_token', access_token)
      setToken(access_token)
      setUser(userData)
    } finally {
      setIsLoading(false)
    }
  }

  const setAuthToken = async (authToken: string): Promise<void> => {
    setIsLoading(true)

    try {
      // Fetch user data with the provided token
      const userData = await fetchCurrentUser(authToken)

      // Store token and user
      localStorage.setItem('access_token', authToken)
      setToken(authToken)
      setUser(userData)
    } finally {
      setIsLoading(false)
    }
  }

  const loginAsGuest = async () => {
    setIsLoading(true)

    try {
      // Call backend to create guest user
      const response = await fetch(`${API_BASE_URL}/auth/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to create guest session')
      }

      const { access_token } = await response.json()

      // Fetch user data (will have guest name)
      const userData = await fetchCurrentUser(access_token)

      // Store token and user
      localStorage.setItem('access_token', access_token)
      setToken(access_token)
      setUser(userData)
      setIsGuest(userData.is_guest || true)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setToken(null)
    setUser(null)
    setIsGuest(false)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isGuest, login, setAuthToken, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
