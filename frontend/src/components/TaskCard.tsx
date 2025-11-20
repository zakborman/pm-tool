'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from './KanbanBoard'

interface TaskCardProps {
  task: Task
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
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
      className="bg-white rounded-lg shadow-sm p-4 cursor-move hover:shadow-md transition-shadow border border-gray-200"
    >
      <h3 className="font-semibold text-gray-900 mb-2">{task.title}</h3>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3">{truncateText(task.description)}</p>
      )}

      <div className="flex items-center justify-between">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </span>

        {task.due_date && (
          <span className="text-xs text-gray-500">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  )
}
