import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../components/ui/Button';

describe('Button', () => {
  it('renders button with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is passed', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
  });

  it('renders loading state and disables interaction', () => {
    render(<Button isLoading>Processing</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders with custom variant and size', () => {
    const { container } = render(
      <Button variant="danger" size="lg">
        Delete
      </Button>
    );
    expect(container.firstChild).toHaveClass('bg-red-600/20');
  });
});
