import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../../context';
import { ProjectsPage } from '../../pages/ProjectsPage';

describe('ProjectsPage UI', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  const renderPage = () => {
    return render(
      <MemoryRouter>
        <AppProvider>
          <ProjectsPage />
        </AppProvider>
      </MemoryRouter>
    );
  };

  it('renders projects header and empty state', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /Project & Template Manager/i })).toBeInTheDocument();
    expect(screen.getByText('No Projects Found')).toBeInTheDocument();
  });

  it('opens new project modal and creates a project', () => {
    renderPage();
    const newBtn = screen.getByRole('button', { name: /New Project/i });
    fireEvent.click(newBtn);

    expect(screen.getByRole('heading', { name: 'Create New Project' })).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(/e\.g\. Q4 Internal Portal/i);
    fireEvent.change(nameInput, { target: { value: 'Production CSRF Review' } });

    const saveBtn = screen.getByRole('button', { name: /Save Project/i });
    fireEvent.click(saveBtn);

    expect(screen.getByText('Production CSRF Review')).toBeInTheDocument();
  });

  it('switches to Exploit Templates tab and displays templates', () => {
    renderPage();
    const tplTab = screen.getByText('Exploit Templates');
    fireEvent.click(tplTab);

    expect(screen.getByText('Auto-Submit Wire Transfer')).toBeInTheDocument();
    expect(screen.getByText('Stealth Iframe Form Submission')).toBeInTheDocument();
  });
});
