import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from '../../pages/Dashboard';

describe('Dashboard Component', () => {
  it('renders dashboard heading and stat cards', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: /Security Operations Dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Requests Parsed')).toBeInTheDocument();
    expect(screen.getByText('PoCs Generated')).toBeInTheDocument();
  });

  it('allows toggling between HTTP request and PoC inspection preview', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const pocBtn = screen.getByRole('button', { name: 'Forged PoC' });
    fireEvent.click(pocBtn);
    expect(screen.getByText(/GENERATED EXPLOIT/i)).toBeInTheDocument();

    const reqBtn = screen.getByRole('button', { name: 'HTTP Request' });
    fireEvent.click(reqBtn);
    expect(screen.getByText(/RAW CAPTURE/i)).toBeInTheDocument();
  });

  it('renders vulnerability vectors list', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Missing Anti-CSRF Token')).toBeInTheDocument();
    expect(screen.getByText('SameSite Cookie None/Lax')).toBeInTheDocument();
  });
});
