import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../../context';
import { AnalyzerPage } from '../../pages/AnalyzerPage';

describe('AnalyzerPage UI', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });
  it('renders empty state when no request is loaded', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <AnalyzerPage />
        </AppProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('No Request Loaded for Analysis')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Load Sample Bank Transfer/i })).toBeInTheDocument();
  });

  it('loads sample request and displays risk analysis score', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <AnalyzerPage />
        </AppProvider>
      </MemoryRouter>
    );

    const loadBtn = screen.getByRole('button', { name: /Load Sample Bank Transfer/i });
    fireEvent.click(loadBtn);

    expect(screen.getByText('VULNERABLE TO CSRF')).toBeInTheDocument();
    expect(screen.getByText('/ 10.0')).toBeInTheDocument();
    expect(screen.getByText(/Absence of Anti-CSRF Defense Token/i)).toBeInTheDocument();
  });

  it('allows expanding a finding to view remediation advice', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <AnalyzerPage />
        </AppProvider>
      </MemoryRouter>
    );

    const loadBtn = screen.getByRole('button', { name: /Load Sample Bank Transfer/i });
    fireEvent.click(loadBtn);

    const findingTitle = screen.getByText(/Absence of Anti-CSRF Defense Token/i);
    fireEvent.click(findingTitle);

    expect(screen.getByText(/Recommended Mitigation:/i)).toBeInTheDocument();
    expect(screen.getByText(/OWASP Remediation Standard/i)).toBeInTheDocument();
  });
});
