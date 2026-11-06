import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../../context';
import { PlaygroundPage } from '../../pages/PlaygroundPage';

describe('PlaygroundPage UI', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  const renderPage = () => {
    return render(
      <MemoryRouter>
        <AppProvider>
          <PlaygroundPage />
        </AppProvider>
      </MemoryRouter>
    );
  };

  it('renders code editor and sandbox iframe with strict attributes', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /PoC Editor & Playground/i })).toBeInTheDocument();

    const iframe = screen.getByTitle('CSRF PoC Sandbox Runtime');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts allow-forms');
  });

  it('allows editing exploit code and clicking run', () => {
    renderPage();
    const textarea = screen.getByRole('textbox', { name: /Exploit code editor/i });
    fireEvent.change(textarea, { target: { value: '<html><body>custom test</body></html>' } });

    const runBtn = screen.getByRole('button', { name: /Run Sandbox/i });
    fireEvent.click(runBtn);

    expect(textarea).toHaveValue('<html><body>custom test</body></html>');
  });

  it('allows loading pre-built playground templates', () => {
    renderPage();
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'tpl-stealth-iframe' } });

    const textarea = screen.getByRole('textbox', { name: /Exploit code editor/i }) as HTMLTextAreaElement;
    expect(textarea.value).toContain('Stealth CSRF (Hidden Target Iframe)');
  });
});
