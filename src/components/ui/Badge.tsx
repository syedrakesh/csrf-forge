import React from 'react';
import { Severity } from '../../types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  severity?: Severity | 'secure' | 'neutral';
  variant?: 'solid' | 'outline' | 'glow';
  size?: 'sm' | 'md';
}

const severityStyles: Record<string, { solid: string; outline: string; glow: string }> = {
  critical: {
    solid: 'bg-red-500/20 text-red-400 border-red-500/30',
    outline: 'border-red-500/60 text-red-400 bg-transparent',
    glow: 'bg-red-950/60 text-red-300 border-red-500/50 shadow-sm shadow-red-500/30',
  },
  high: {
    solid: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    outline: 'border-orange-500/60 text-orange-400 bg-transparent',
    glow: 'bg-orange-950/60 text-orange-300 border-orange-500/50 shadow-sm shadow-orange-500/30',
  },
  medium: {
    solid: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    outline: 'border-amber-500/60 text-amber-400 bg-transparent',
    glow: 'bg-amber-950/60 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/30',
  },
  low: {
    solid: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    outline: 'border-blue-500/60 text-blue-400 bg-transparent',
    glow: 'bg-blue-950/60 text-blue-300 border-blue-500/50 shadow-sm shadow-blue-500/30',
  },
  info: {
    solid: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    outline: 'border-cyan-500/60 text-cyan-400 bg-transparent',
    glow: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/30',
  },
  secure: {
    solid: 'bg-cyber-500/20 text-cyber-400 border-cyber-500/30',
    outline: 'border-cyber-500/60 text-cyber-400 bg-transparent',
    glow: 'bg-cyber-950/60 text-cyber-300 border-cyber-500/50 shadow-sm shadow-cyber-500/30',
  },
  neutral: {
    solid: 'bg-dark-800 text-dark-300 border-dark-700',
    outline: 'border-dark-600 text-dark-300 bg-transparent',
    glow: 'bg-dark-900 text-dark-200 border-dark-600',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  severity = 'neutral',
  variant = 'solid',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  const defaultStyle = {
    solid: 'bg-dark-800 text-dark-300 border-dark-700',
    outline: 'border-dark-600 text-dark-300 bg-transparent',
    glow: 'bg-dark-900 text-dark-200 border-dark-600',
  };
  const styleConfig = severityStyles[severity] ?? defaultStyle;
  const variantClass = styleConfig[variant] ?? styleConfig.solid;

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded border uppercase tracking-wider ${sizeClasses} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
