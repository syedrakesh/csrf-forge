import { describe, it, expect, beforeEach, vi } from 'vitest';
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

  it('generates copyable cookie injection URL for Burp Suite Repeater', async () => {
    // Mock navigator.clipboard
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

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

    const customBuilderBtn = screen.getByRole('button', { name: /Custom Builder/i });
    fireEvent.click(customBuilderBtn);

    expect(screen.getByText(/Cookie Injection URL Generator/i)).toBeInTheDocument();
    expect(screen.getByText(/For Burp Repeater & PoC/i)).toBeInTheDocument();

    const searchUrlInput = screen.getByPlaceholderText('https://example.net/?search=Hello+World');
    fireEvent.change(searchUrlInput, {
      target: { value: 'https://example.net/?search=Hello+World' },
    });

    const copyRepeaterBtn = screen.getByRole('button', { name: /Copy URL for Repeater/i });
    fireEvent.click(copyRepeaterBtn);

    expect(writeTextMock).toHaveBeenCalledWith(
      expect.stringContaining('https://example.net/?search=Hello+World%0d%0aSet-Cookie:%20csrfKey=YOUR-KEY%3b%20SameSite=None')
    );

    const insertPocBtn = screen.getByRole('button', { name: /Insert into PoC/i });
    fireEvent.click(insertPocBtn);

    const mainPreflightInput = screen.getByPlaceholderText(/victim\.com/i) as HTMLInputElement;
    expect(mainPreflightInput.value).toContain(
      'https://example.net/?search=Hello+World%0d%0aSet-Cookie:%20csrfKey=YOUR-KEY%3b%20SameSite=None'
    );
  });

  it('switches to Top-Level Redirect format', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <GeneratorPage />
        </AppProvider>
      </MemoryRouter>
    );

    const loadBtn = screen.getByRole('button', { name: /Load Sample Bank Transfer/i });
    fireEvent.click(loadBtn);

    const redirectTab = screen.getByText('Top-Level Redirect');
    fireEvent.click(redirectTab);

    expect(screen.getByText(/Top-level window\.location navigation payload/i)).toBeInTheDocument();
  });

  it('edits parameter values via Parameter Values editor and updates PoC', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <GeneratorPage />
        </AppProvider>
      </MemoryRouter>
    );

    const loadBtn = screen.getByRole('button', { name: /Load Sample Bank Transfer/i });
    fireEvent.click(loadBtn);

    expect(screen.getByText('Parameter Values')).toBeInTheDocument();
    const recipientInput = screen.getByDisplayValue('attacker_wallet_99');
    fireEvent.change(recipientInput, { target: { value: 'custom_wallet_123' } });

    expect(recipientInput).toHaveValue('custom_wallet_123');
  });
});
