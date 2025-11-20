'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Task } from './KanbanBoard'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (taskData: TaskFormData) => void
  task?: Task
  users?: User[]
}

export interface TaskFormData {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'done'
  assigned_to_id?: number | null
}

interface User {
  id: number
  email: string
  full_name: string
}

export default function TaskModal({ isOpen, onClose, onSave, task, users = [] }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done'>('todo')
  const [assignedToId, setAssignedToId] = useState<number | null>(null)
  const [errors, setErrors] = useState<{ title?: string }>({})

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setPriority(task.priority)
      setStatus(task.status)
      setAssignedToId(task.assigned_to_id)
    } else {
      // Reset form
      setTitle('')
      setDescription('')
      setPriority('medium')
      setStatus('todo')
      setAssignedToId(null)
    }
    setErrors({})
  }, [task, isOpen])

  const validateForm = (): boolean => {
    const validationErrors: { title?: string } = {}

    if (!title.trim()) {
      validationErrors.title = 'Title is required'
    }

    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSave({
      title,
      description: description || undefined,
      priority,
      status,
      assigned_to_id: assignedToId,
    })
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 animate-fade-in" style={{ zIndex: 9999 }} onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full transform transition-all border border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {task ? 'Edit Task' : 'Create Task'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as 'todo' | 'in_progress' | 'done')
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-300 mb-1">
              Assign To
            </label>
            <select
              id="assignedTo"
              value={assignedToId || ''}
              onChange={(e) => setAssignedToId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors border border-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors shadow-md hover:shadow-lg"
            >
              {task ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
