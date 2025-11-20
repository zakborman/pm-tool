'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from './KanbanBoard'

interface TaskCardProps {
  task: Task
}

const priorityColors = {
  low: 'bg-blue-900/50 text-blue-300 border border-blue-700',
  medium: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700',
  high: 'bg-red-900/50 text-red-300 border border-red-700',
}

export default function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const truncateText = (text: string | null, maxLength: number = 100) => {
    if (!text) return ''
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-gray-700 rounded-lg shadow-md p-4 cursor-move hover:shadow-lg transition-all duration-200 border border-gray-600 hover:border-blue-500"
    >
      <h3 className="font-semibold text-white mb-2">{task.title}</h3>

      {task.description && (
        <p className="text-sm text-gray-300 mb-3">{truncateText(task.description)}</p>
      )}

      <div className="flex items-center justify-between mt-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </span>

        {task.due_date && (
          <span className="text-xs text-gray-400">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {task.assigned_to_id && (
        <div className="mt-2 flex items-center gap-1">
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs text-gray-400">Assigned</span>
        </div>
      )}
    </div>
  )
}
