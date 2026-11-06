import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../../context/AppContext';
import { ReportsPage } from '../../pages/ReportsPage';
import { AppContext } from '../../context/context';
import { ParsedRequest, AnalysisResult, GeneratedPoc } from '../../types';

describe('ReportsPage UI', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
    if (!window.URL.createObjectURL) {
      window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    }
    if (!window.URL.revokeObjectURL) {
      window.URL.revokeObjectURL = vi.fn();
    }
  });

  it('renders empty state when no analysis or request is loaded', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <ReportsPage />
        </AppProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/No Active Assessment Data Loaded/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Load Sample Bank Transfer Audit/i })
    ).toBeInTheDocument();
  });

  it('loads sample demo analysis when clicking the sample button', async () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <ReportsPage />
        </AppProvider>
      </MemoryRouter>
    );

    const demoBtn = screen.getByRole('button', { name: /Load Sample Bank Transfer Audit/i });
    fireEvent.click(demoBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/bank\.local\.internal/i).length).toBeGreaterThan(0);
    });

    expect(screen.getByText(/Export Format/i)).toBeInTheDocument();
    expect(screen.getByText(/Report Customization/i)).toBeInTheDocument();
  });

  it('allows switching export format between Markdown, HTML, and JSON', async () => {
    const mockReq: ParsedRequest = {
      id: 'req-test',
      method: 'POST',
      url: 'https://app.corp.io/api/action',
      headers: { Host: 'app.corp.io', Cookie: 'sid=123' },
      body: 'a=1',
      contentType: 'application/x-www-form-urlencoded',
      cookies: { sid: '123' },
      timestamp: Date.now(),
    };

    const mockAnalysis: AnalysisResult = {
      requestId: 'req-test',
      isVulnerable: true,
      riskScore: 8.0,
      timestamp: Date.now(),
      findings: [
        {
          id: 'f-test',
          title: 'Missing CSRF Token',
          description: 'No token',
          severity: 'high',
          category: 'Token',
          recommendation: 'Fix token',
        },
      ],
    };

    const mockPoc: GeneratedPoc = {
      id: 'p-test',
      requestId: 'req-test',
      format: 'html-form',
      code: '<form></form>',
      description: 'PoC Form',
      timestamp: Date.now(),
    };

    render(
      <MemoryRouter>
        <AppContext.Provider
          value={{
            currentRequest: mockReq,
            setCurrentRequest: vi.fn(),
            currentAnalysis: mockAnalysis,
            setCurrentAnalysis: vi.fn(),
            generatedPocs: [mockPoc],
            addGeneratedPoc: vi.fn(),
            projects: [],
            setProjects: vi.fn(),
            clearCurrentSession: vi.fn(),
          }}
        >
          <ReportsPage />
        </AppContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getAllByText(/app\.corp\.io/i).length).toBeGreaterThan(0);

    // Default is markdown
    expect(screen.getByText(/Download MARKDOWN/i)).toBeInTheDocument();

    // Switch to HTML
    const htmlBtn = screen.getByRole('button', { name: /Standalone HTML/i });
    fireEvent.click(htmlBtn);
    expect(screen.getByText(/Download HTML/i)).toBeInTheDocument();

    // Switch to JSON
    const jsonBtn = screen.getByRole('button', { name: /Structured JSON/i });
    fireEvent.click(jsonBtn);
    expect(screen.getByText(/Download JSON/i)).toBeInTheDocument();
  });

  it('triggers clipboard copy and shows confirmation alert', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });

    const mockReq: ParsedRequest = {
      id: 'req-copy',
      method: 'POST',
      url: 'https://copy.io/api',
      headers: { Host: 'copy.io', Cookie: 'sid=1' },
      body: 'b=2',
      contentType: 'application/x-www-form-urlencoded',
      cookies: { sid: '1' },
      timestamp: Date.now(),
    };

    const mockAnalysis: AnalysisResult = {
      requestId: 'req-copy',
      isVulnerable: true,
      riskScore: 7.0,
      timestamp: Date.now(),
      findings: [],
    };

    render(
      <MemoryRouter>
        <AppContext.Provider
          value={{
            currentRequest: mockReq,
            setCurrentRequest: vi.fn(),
            currentAnalysis: mockAnalysis,
            setCurrentAnalysis: vi.fn(),
            generatedPocs: [],
            addGeneratedPoc: vi.fn(),
            projects: [],
            setProjects: vi.fn(),
            clearCurrentSession: vi.fn(),
          }}
        >
          <ReportsPage />
        </AppContext.Provider>
      </MemoryRouter>
    );

    const copyBtn = screen.getByRole('button', { name: /^Copy$/i });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(screen.getByText(/Report copied to clipboard!/i)).toBeInTheDocument();
    });
  });
});
