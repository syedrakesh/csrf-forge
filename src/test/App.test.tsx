import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

describe('App & Routing', () => {
  it('renders the dashboard page on root route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(
      screen.getByRole('heading', { name: /Security Operations Dashboard/i })
    ).toBeInTheDocument();
  });

  it('navigates to the Request Parser page', () => {
    render(
      <MemoryRouter initialEntries={['/parser']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /HTTP & cURL Request Parser/i })).toBeInTheDocument();
  });

  it('navigates to the Analyzer page', () => {
    render(
      <MemoryRouter initialEntries={['/analyzer']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /CSRF Vulnerability Analyzer/i })).toBeInTheDocument();
  });

  it('navigates to the Generator page', () => {
    render(
      <MemoryRouter initialEntries={['/generator']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /CSRF PoC Generator/i })).toBeInTheDocument();
  });

  it('navigates to the Playground page', () => {
    render(
      <MemoryRouter initialEntries={['/playground']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /PoC Editor & Playground/i })).toBeInTheDocument();
  });

  it('navigates to the Projects page', () => {
    render(
      <MemoryRouter initialEntries={['/projects']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /Project & Template Manager/i })).toBeInTheDocument();
  });

  it('navigates to the Reports page', () => {
    render(
      <MemoryRouter initialEntries={['/reports']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /Export & Vulnerability Reporting/i })).toBeInTheDocument();
  });

  it('renders 404 for non-existent routes', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-route-123']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('404 — Page Not Found')).toBeInTheDocument();
  });
});
