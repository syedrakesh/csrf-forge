import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '../../components/layout/Header';

describe('Header', () => {
  it('renders the application name', () => {
    render(<Header />);
    expect(screen.getByText('CSRF')).toBeInTheDocument();
    expect(screen.getByText('Forge')).toBeInTheDocument();
  });

  it('renders the version number', () => {
    render(<Header />);
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });
});
