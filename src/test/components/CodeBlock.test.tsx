import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CodeBlock } from '../../components/ui/CodeBlock';

describe('CodeBlock', () => {
  it('renders code snippet and custom title', () => {
    render(<CodeBlock code="const a = 10;" title="SAMPLE SCRIPT" />);
    expect(screen.getByText('SAMPLE SCRIPT')).toBeInTheDocument();
    expect(screen.getByText('const a = 10;')).toBeInTheDocument();
  });

  it('renders line numbers when showLineNumbers is true', () => {
    render(<CodeBlock code={`line 1\nline 2`} showLineNumbers />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('handles copy button interaction', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<CodeBlock code="test copy" />);
    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('Copied')).toBeInTheDocument();
    });
  });
});
