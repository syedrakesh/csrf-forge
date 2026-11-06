import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../../components/ui/Badge';

describe('Badge', () => {
  it('renders badge text correctly', () => {
    render(<Badge severity="critical">CRITICAL</Badge>);
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });

  it('applies critical severity classes', () => {
    const { container } = render(<Badge severity="critical">CRITICAL</Badge>);
    expect(container.firstChild).toHaveClass('text-red-400');
  });

  it('applies secure severity classes', () => {
    const { container } = render(<Badge severity="secure">SECURE</Badge>);
    expect(container.firstChild).toHaveClass('text-cyber-400');
  });

  it('renders small size variant', () => {
    const { container } = render(<Badge size="sm">SMALL</Badge>);
    expect(container.firstChild).toHaveClass('text-xs');
  });
});
