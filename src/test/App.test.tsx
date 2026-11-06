import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

describe('App', () => {
  it('renders the dashboard page', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('renders the quick start section', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Quick Start')).toBeInTheDocument();
  });

  it('renders the sidebar navigation', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Request Parser')).toBeInTheDocument();
    expect(screen.getByText('Analyzer')).toBeInTheDocument();
    expect(screen.getByText('PoC Generator')).toBeInTheDocument();
  });

  it('shows 404 for unknown routes', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-page']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('404 — Page Not Found')).toBeInTheDocument();
  });
});
