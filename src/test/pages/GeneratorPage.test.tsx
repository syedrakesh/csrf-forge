import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../../context';
import { GeneratorPage } from '../../pages/GeneratorPage';

describe('GeneratorPage UI', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders empty state when no request is loaded', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <GeneratorPage />
        </AppProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('No Request Loaded')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Load Sample Bank Transfer/i })).toBeInTheDocument();
  });

  it('loads sample and displays compiled PoC code', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <GeneratorPage />
        </AppProvider>
      </MemoryRouter>
    );

    const loadBtn = screen.getByRole('button', { name: /Load Sample Bank Transfer/i });
    fireEvent.click(loadBtn);

    expect(screen.getByText('HTML Auto-Form')).toBeInTheDocument();
    expect(screen.getByText(/Test in Playground/i)).toBeInTheDocument();
  });

  it('switches between format tabs (HTML Form -> Python Script)', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <GeneratorPage />
        </AppProvider>
      </MemoryRouter>
    );

    const loadBtn = screen.getByRole('button', { name: /Load Sample Bank Transfer/i });
    fireEvent.click(loadBtn);

    const pythonTab = screen.getByText('Python Script');
    fireEvent.click(pythonTab);

    expect(screen.getByText('PYTHON SCRIPT')).toBeInTheDocument();
  });
});
