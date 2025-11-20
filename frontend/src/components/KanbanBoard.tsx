'use client'

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'
import TaskCard from './TaskCard'

export interface Task {
  id: number
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  owner_id: number
  assigned_to_id: number | null
  created_at: string
  updated_at: string
  due_date?: string | null
}

interface KanbanBoardProps {
  tasks: Task[]
  onTaskMove: (taskId: number, newStatus: 'todo' | 'in_progress' | 'done') => void
}

const COLUMNS = [
  { id: 'todo', title: 'To Do', status: 'todo' as const },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress' as const },
  { id: 'done', title: 'Done', status: 'done' as const },
]

export default function KanbanBoard({ tasks, onTaskMove }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const taskId = active.id as number
    const newStatus = over.id as 'todo' | 'in_progress' | 'done'

    const task = tasks.find((t) => t.id === taskId)
    if (task && task.status !== newStatus) {
      onTaskMove(taskId, newStatus)
    }

    setActiveId(null)
  }

  const getTasksByStatus = (status: 'todo' | 'in_progress' | 'done') => {
    return tasks.filter((task) => task.status === status)
  }

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.status)

          return (
            <div key={column.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700" data-testid={`column-${column.id}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">{column.title}</h2>
                <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-sm font-medium border border-gray-600">
                  {columnTasks.length}
                </span>
              </div>

              <SortableContext
                id={column.id}
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3 min-h-[200px] transition-all duration-200">
                  {columnTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      No tasks yet
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))
                  )}
                </div>
              </SortableContext>

              {/* Droppable area */}
              <div
                className="h-4"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {}}
                data-status={column.status}
              />
            </div>
          )
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-80">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
