import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pills';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className = '',
}) => {
  if (variant === 'pills') {
    return (
      <div className={`flex gap-1.5 p-1 bg-dark-950/80 border border-dark-800 rounded-lg ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyber-600/20 text-cyber-300 border border-cyber-500/30 shadow-sm'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-900 border border-transparent'
              }`}
            >
              {tab.icon && <span className="inline-flex shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-cyber-500/30 text-cyber-300' : 'bg-dark-800 text-dark-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex border-b border-dark-800 space-x-4 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 pb-2.5 text-xs font-medium border-b-2 transition-all -mb-px ${
              isActive
                ? 'border-cyber-400 text-cyber-400'
                : 'border-transparent text-dark-400 hover:text-dark-200 hover:border-dark-700'
            }`}
          >
            {tab.icon && <span className="inline-flex shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  isActive ? 'bg-cyber-950 text-cyber-400 border border-cyber-500/30' : 'bg-dark-800 text-dark-400'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
