import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Shield } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';

describe('StatCard', () => {
  it('renders label, value, and subtext', () => {
    render(
      <StatCard
        label="Vulnerabilities"
        value={42}
        icon={Shield}
        subtext="Detected in testing"
      />
    );

    expect(screen.getByText('Vulnerabilities')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Detected in testing')).toBeInTheDocument();
  });

  it('renders positive trend indicator', () => {
    render(
      <StatCard
        label="Scans"
        value={10}
        icon={Shield}
        trend={{ value: '+5%', positive: true }}
      />
    );

    expect(screen.getByText('+5%')).toBeInTheDocument();
  });
});
