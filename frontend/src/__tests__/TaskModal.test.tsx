import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TaskModal from '../components/TaskModal'

describe('TaskModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSave = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
    mockOnSave.mockClear()
  })

  it('renders create task modal when no task is provided', () => {
    render(<TaskModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />)

    expect(screen.getByText('Create Task')).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
  })

  it('renders edit task modal when task is provided', () => {
    const task = {
      id: 1,
      title: 'Existing Task',
      description: 'Task description',
      status: 'in_progress' as const,
      priority: 'high' as const,
      owner_id: 1,
      assigned_to_id: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    }

    render(<TaskModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} task={task} />)

    expect(screen.getByText('Edit Task')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Task description')).toBeInTheDocument()
  })

  it('shows validation error for empty title', async () => {
    render(<TaskModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />)

    const saveButton = screen.getByRole('button', { name: /save|create/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    })

    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('calls onSave with form data when valid', async () => {
    render(<TaskModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />)

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'New Task' },
    })
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Task description' },
    })
    fireEvent.change(screen.getByLabelText(/priority/i), {
      target: { value: 'high' },
    })
    fireEvent.change(screen.getByLabelText(/status/i), {
      target: { value: 'in_progress' },
    })

    const saveButton = screen.getByRole('button', { name: /save|create/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Task description',
        priority: 'high',
        status: 'in_progress',
      })
    })
  })

  it('calls onClose when cancel button is clicked', () => {
    render(<TaskModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('does not render when isOpen is false', () => {
    render(<TaskModal isOpen={false} onClose={mockOnClose} onSave={mockOnSave} />)

    expect(screen.queryByText('Create Task')).not.toBeInTheDocument()
  })

  it('resets form when modal is closed and reopened', async () => {
    const { rerender } = render(
      <TaskModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    )

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Task' },
    })

    rerender(<TaskModal isOpen={false} onClose={mockOnClose} onSave={mockOnSave} />)
    rerender(<TaskModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />)

    expect(screen.getByLabelText(/title/i)).toHaveValue('')
  })
})
