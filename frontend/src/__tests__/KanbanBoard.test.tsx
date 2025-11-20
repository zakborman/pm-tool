import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import KanbanBoard from '../components/KanbanBoard'

const mockTasks = [
  {
    id: 1,
    title: 'Task 1',
    description: 'Description 1',
    status: 'todo',
    priority: 'high',
    owner_id: 1,
    assigned_to_id: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Task 2',
    description: 'Description 2',
    status: 'in_progress',
    priority: 'medium',
    owner_id: 1,
    assigned_to_id: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 3,
    title: 'Task 3',
    description: 'Description 3',
    status: 'done',
    priority: 'low',
    owner_id: 1,
    assigned_to_id: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
]

describe('KanbanBoard', () => {
  const mockOnTaskMove = vi.fn()

  beforeEach(() => {
    mockOnTaskMove.mockClear()
  })

  it('renders three columns: To Do, In Progress, Done', () => {
    render(<KanbanBoard tasks={[]} onTaskMove={mockOnTaskMove} />)

    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('displays tasks in their respective columns', () => {
    render(<KanbanBoard tasks={mockTasks} onTaskMove={mockOnTaskMove} />)

    const todoColumn = screen.getByTestId('column-todo')
    const inProgressColumn = screen.getByTestId('column-in_progress')
    const doneColumn = screen.getByTestId('column-done')

    expect(within(todoColumn).getByText('Task 1')).toBeInTheDocument()
    expect(within(inProgressColumn).getByText('Task 2')).toBeInTheDocument()
    expect(within(doneColumn).getByText('Task 3')).toBeInTheDocument()
  })

  it('displays task count in each column header', () => {
    render(<KanbanBoard tasks={mockTasks} onTaskMove={mockOnTaskMove} />)

    const todoColumn = screen.getByTestId('column-todo')
    const inProgressColumn = screen.getByTestId('column-in_progress')
    const doneColumn = screen.getByTestId('column-done')

    expect(within(todoColumn).getByText('To Do')).toBeInTheDocument()
    expect(within(todoColumn).getByText('1')).toBeInTheDocument()
    expect(within(inProgressColumn).getByText('In Progress')).toBeInTheDocument()
    expect(within(inProgressColumn).getByText('1')).toBeInTheDocument()
    expect(within(doneColumn).getByText('Done')).toBeInTheDocument()
    expect(within(doneColumn).getByText('1')).toBeInTheDocument()
  })

  it('shows empty state when column has no tasks', () => {
    render(<KanbanBoard tasks={[]} onTaskMove={mockOnTaskMove} />)

    const todoColumn = screen.getByTestId('column-todo')
    expect(within(todoColumn).getByText(/no tasks/i)).toBeInTheDocument()
  })

  it('displays task priority badges', () => {
    render(<KanbanBoard tasks={mockTasks} onTaskMove={mockOnTaskMove} />)

    expect(screen.getByText('high')).toBeInTheDocument()
    expect(screen.getByText('medium')).toBeInTheDocument()
    expect(screen.getByText('low')).toBeInTheDocument()
  })

  it('truncates long task descriptions', () => {
    const longDescriptionTask = {
      ...mockTasks[0],
      description: 'This is a very long description that should be truncated to avoid taking up too much space in the card',
    }

    render(<KanbanBoard tasks={[longDescriptionTask]} onTaskMove={mockOnTaskMove} />)

    const description = screen.getByText(/This is a very long description/)
    expect(description.textContent?.length).toBeLessThan(longDescriptionTask.description.length + 10)
  })
})
