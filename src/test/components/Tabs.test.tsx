import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs } from '../../components/ui/Tabs';

describe('Tabs', () => {
  const mockTabs = [
    { id: 'tab1', label: 'Overview', badge: 2 },
    { id: 'tab2', label: 'Details' },
  ];

  it('renders tab items and handles selection', () => {
    const handleSelect = vi.fn();
    render(
      <Tabs tabs={mockTabs} activeTab="tab1" onChange={handleSelect} />
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Details'));
    expect(handleSelect).toHaveBeenCalledWith('tab2');
  });

  it('renders pills variant properly', () => {
    render(
      <Tabs tabs={mockTabs} activeTab="tab1" onChange={() => {}} variant="pills" />
    );
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });
});
