import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../../context';
import { ParserPage } from '../../pages/ParserPage';

describe('ParserPage UI', () => {
  const renderPage = () => {
    return render(
      <MemoryRouter>
        <AppProvider>
          <ParserPage />
        </AppProvider>
      </MemoryRouter>
    );
  };

  it('renders parser headings and input area', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /HTTP & cURL Request Parser/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Parse Request/i })).toBeInTheDocument();
  });

  it('shows error alert on empty input submission', () => {
    renderPage();
    const parseBtn = screen.getByRole('button', { name: /Parse Request/i });
    fireEvent.click(parseBtn);

    expect(screen.getByText('Parsing Error')).toBeInTheDocument();
  });

  it('loads sample payload and updates parsed structure', () => {
    renderPage();
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'sample-bank-transfer' } });

    const matches = screen.getAllByText(/bank\.local\.internal/i);
    expect(matches.length).toBeGreaterThan(0);
    const postBadges = screen.getAllByText('POST');
    expect(postBadges.length).toBeGreaterThan(0);
  });

  it('parses manually entered cURL command', () => {
    renderPage();
    const textarea = screen.getByPlaceholderText(/Paste raw HTTP request/i);
    fireEvent.change(textarea, {
      target: { value: 'curl -X POST https://my-app.internal/api/action -d "foo=bar"' },
    });

    const parseBtn = screen.getByRole('button', { name: /Parse Request/i });
    fireEvent.click(parseBtn);

    expect(screen.getByText('https://my-app.internal/api/action')).toBeInTheDocument();
  });
});
