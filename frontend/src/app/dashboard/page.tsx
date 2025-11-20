'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import KanbanBoard, { Task } from '@/components/KanbanBoard'
import TaskModal, { TaskFormData } from '@/components/TaskModal'
import { useWebSocket } from '@/hooks/useWebSocket'

const API_BASE_URL = 'http://localhost:8000/api/v1'

interface User {
  id: number
  email: string
  full_name: string
}

export default function DashboardPage() {
  const { user, token, isGuest, logout } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [onlineUsers, setOnlineUsers] = useState<number[]>([])

  const handleWebSocketMessage = useCallback((data: any) => {
    if (data.type === 'task_created') {
      setTasks((prevTasks) => [...prevTasks, data.task])
    } else if (data.type === 'task_updated') {
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === data.task.id ? data.task : task))
      )
    } else if (data.type === 'task_deleted') {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== data.task_id))
    }
  }, [])

  const handlePresenceUpdate = useCallback((activeUsers: number[]) => {
    setOnlineUsers(activeUsers)
  }, [])

  const { isConnected } = useWebSocket({
    token,
    onMessage: handleWebSocketMessage,
    onPresenceUpdate: handlePresenceUpdate,
  })

  useEffect(() => {
    if (token) {
      fetchTasks()
      fetchUsers()
    }
  }, [token])

  const fetchTasks = async () => {
    if (!token) return

    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }

      const data = await response.json()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data)
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  const handleTaskMove = async (taskId: number, newStatus: 'todo' | 'in_progress' | 'done') => {
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      // Optimistically update the UI
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
      )
    } catch (err) {
      console.error('Error updating task:', err)
      // Revert on error by refetching
      fetchTasks()
    }
  }

  const handleCreateTask = async (taskData: TaskFormData) => {
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create task')
      }

      const newTask = await response.json()
      // WebSocket will handle the update, but add optimistically for better UX
      setTasks((prevTasks) => [...prevTasks, newTask])
      setIsModalOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task'
      setError(errorMessage)
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleEditTask = async (taskData: TaskFormData) => {
    if (!token || !editingTask) return

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to update task')
      }

      const updatedTask = await response.json()
      // WebSocket will handle the update, but update optimistically for better UX
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      )
      setIsModalOpen(false)
      setEditingTask(undefined)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task'
      setError(errorMessage)
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingTask(undefined)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PM Tool</h1>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-600">
                    Welcome, {isGuest ? 'Guest' : (user?.full_name || user?.email)}
                    {isGuest && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                        Guest Mode
                      </span>
                    )}
                  </p>
                  {!isGuest && (
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs text-gray-500">
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                      {onlineUsers.length > 0 && (
                        <span className="text-xs text-gray-500 ml-2">
                          • {onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                {!isGuest && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    New Task
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
                >
                  {isGuest ? 'Exit Guest Mode' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isGuest && (
            <div className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-5 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-yellow-900 mb-1">Guest Mode - View Only</h3>
                  <p className="text-sm text-yellow-800 mb-3">
                    You're viewing the dashboard as a guest with limited features. Tasks are read-only and real-time collaboration is unavailable.
                  </p>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Create Free Account
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading tasks...</p>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <KanbanBoard tasks={tasks} onTaskMove={handleTaskMove} />
            </div>
          )}
        </main>

        <TaskModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={editingTask ? handleEditTask : handleCreateTask}
          task={editingTask}
          users={users}
        />
      </div>
    </ProtectedRoute>
  )
}
