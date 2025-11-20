'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import KanbanBoard, { Task } from '@/components/KanbanBoard'
import TaskModal, { TaskFormData } from '@/components/TaskModal'

const API_BASE_URL = 'http://localhost:8000/api/v1'

export default function DashboardPage() {
  const { user, token, logout } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)

  useEffect(() => {
    if (token) {
      fetchTasks()
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
        throw new Error('Failed to create task')
      }

      const newTask = await response.json()
      setTasks((prevTasks) => [...prevTasks, newTask])
      setIsModalOpen(false)
    } catch (err) {
      console.error('Error creating task:', err)
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
        throw new Error('Failed to update task')
      }

      const updatedTask = await response.json()
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      )
      setIsModalOpen(false)
      setEditingTask(undefined)
    } catch (err) {
      console.error('Error updating task:', err)
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
                <p className="text-sm text-gray-600">Welcome, {user?.full_name || user?.email}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  New Task
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading tasks...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
              <button
                onClick={fetchTasks}
                className="mt-2 text-red-600 hover:text-red-700 font-medium"
              >
                Try again
              </button>
            </div>
          ) : (
            <KanbanBoard tasks={tasks} onTaskMove={handleTaskMove} />
          )}
        </main>

        <TaskModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={editingTask ? handleEditTask : handleCreateTask}
          task={editingTask}
        />
      </div>
    </ProtectedRoute>
  )
}
