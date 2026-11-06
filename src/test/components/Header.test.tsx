import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../../components/layout/Header';

describe('Header', () => {
  it('renders system status badge', () => {
    render(<Header />);
    expect(screen.getByText('ANALYZER ACTIVE')).toBeInTheDocument();
  });

  it('renders isolation info', () => {
    render(<Header />);
    expect(screen.getByText('ISOLATION: SECURE SANDBOX')).toBeInTheDocument();
  });

  it('opens help modal on clicking guide button', () => {
    render(<Header />);
    const guideBtn = screen.getByRole('button', { name: /guide/i });
    fireEvent.click(guideBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByText('CSRF Forge — Security Testing Guide')
    ).toBeInTheDocument();
  });
});
