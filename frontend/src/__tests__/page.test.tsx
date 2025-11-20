import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from '../app/page';

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { name: /PM Tool/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<Home />);
    const description = screen.getByText(/Real-time project management with collaboration/i);
    expect(description).toBeInTheDocument();
  });
});
