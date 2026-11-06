import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';

describe('Card', () => {
  it('renders card content with title and description', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>System Header</CardTitle>
          <CardDescription>Subtext details</CardDescription>
        </CardHeader>
        <div>Body content</div>
      </Card>
    );

    expect(screen.getByText('System Header')).toBeInTheDocument();
    expect(screen.getByText('Subtext details')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('applies glow effect when requested', () => {
    const { container } = render(<Card glow>Glow Card</Card>);
    expect(container.firstChild).toHaveClass('shadow-cyber-500/5');
  });
});
