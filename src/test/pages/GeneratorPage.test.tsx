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

  it('enables cookie injection toggle and updates compiled PoC code', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <GeneratorPage />
        </AppProvider>
      </MemoryRouter>
    );

    const loadBtn = screen.getByRole('button', { name: /Load Sample Bank Transfer/i });
    fireEvent.click(loadBtn);

    const preflightCheckbox = screen.getByLabelText(/Cookie \/ CRLF Injection/i);
    expect(preflightCheckbox).not.toBeChecked();

    fireEvent.click(preflightCheckbox);
    expect(preflightCheckbox).toBeChecked();

    const loadTemplateBtn = screen.getByRole('button', { name: /Load Template/i });
    fireEvent.click(loadTemplateBtn);

    const urlInput = screen.getByPlaceholderText(/victim\.com/i) as HTMLInputElement;
    expect(urlInput.value).toContain('YOUR-LAB-ID.web-security-academy.net');

    expect(screen.getByText('STANDALONE HTML EXPLOIT')).toBeInTheDocument();
  });

  it('opens custom builder, updates parameters, and generates custom CRLF URL', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <GeneratorPage />
        </AppProvider>
      </MemoryRouter>
    );

    const loadBtn = screen.getByRole('button', { name: /Load Sample Bank Transfer/i });
    fireEvent.click(loadBtn);

    const preflightCheckbox = screen.getByLabelText(/Cookie \/ CRLF Injection/i);
    fireEvent.click(preflightCheckbox);

    const openBuilderBtn = screen.getByRole('button', { name: /Custom Builder/i });
    fireEvent.click(openBuilderBtn);

    expect(screen.getByText(/Construct custom CRLF payload for any target endpoint/i)).toBeInTheDocument();

    const applyBtn = screen.getByRole('button', { name: /Generate & Apply URL/i });
    fireEvent.click(applyBtn);

    const urlInput = screen.getByPlaceholderText(/victim\.com/i) as HTMLInputElement;
    expect(urlInput.value).toContain('test%0d%0aSet-Cookie:%20csrfKey=YOUR-KEY%3b%20SameSite=None');
  });
});
