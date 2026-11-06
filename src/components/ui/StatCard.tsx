import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './Card';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  color?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  glow?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  subtext,
  color = 'text-cyber-400',
  trend,
  glow = false,
}) => {
  return (
    <Card glow={glow} className="relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-mono uppercase tracking-wider text-dark-400">{label}</p>
          <p className="text-3xl font-extrabold text-dark-100 font-mono tracking-tight">{value}</p>
        </div>
        <div
          className={`p-2.5 rounded-lg bg-dark-950/80 border border-dark-800 group-hover:border-dark-700 transition-colors ${color}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-3 pt-3 border-t border-dark-800/80 flex items-center justify-between text-xs">
          {subtext && <span className="text-dark-400">{subtext}</span>}
          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-mono font-medium ${
                trend.positive ? 'text-cyber-400' : 'text-red-400'
              }`}
            >
              {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
