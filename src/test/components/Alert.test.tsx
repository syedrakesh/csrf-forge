import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from '../../components/ui/Alert';

describe('Alert', () => {
  it('renders alert title and body content', () => {
    render(
      <Alert title="Security Warning" type="warning">
        Possible token bypass found.
      </Alert>
    );

    expect(screen.getByText('Security Warning')).toBeInTheDocument();
    expect(screen.getByText('Possible token bypass found.')).toBeInTheDocument();
  });

  it('triggers dismiss handler when close button is clicked', () => {
    const handleDismiss = vi.fn();
    render(
      <Alert onDismiss={handleDismiss}>Dismissable notification</Alert>
    );

    const closeBtn = screen.getByRole('button', { name: /dismiss alert/i });
    fireEvent.click(closeBtn);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });
});
