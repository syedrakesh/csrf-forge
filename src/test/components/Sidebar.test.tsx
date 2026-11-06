import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';

describe('Sidebar', () => {
  it('renders all navigation items', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Request Parser')).toBeInTheDocument();
    expect(screen.getByText('Analyzer')).toBeInTheDocument();
    expect(screen.getByText('PoC Generator')).toBeInTheDocument();
    expect(screen.getByText('Playground')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('renders the brand section', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    expect(screen.getByText('PoC Generator & Analyzer')).toBeInTheDocument();
  });
});
