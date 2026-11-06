import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const alertConfig = {
  info: {
    icon: Info,
    styles: 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200',
    iconColor: 'text-cyan-400',
  },
  success: {
    icon: CheckCircle2,
    styles: 'bg-cyber-950/40 border-cyber-500/30 text-cyber-200',
    iconColor: 'text-cyber-400',
  },
  warning: {
    icon: AlertTriangle,
    styles: 'bg-amber-950/40 border-amber-500/30 text-amber-200',
    iconColor: 'text-amber-400',
  },
  error: {
    icon: AlertCircle,
    styles: 'bg-red-950/40 border-red-500/30 text-red-200',
    iconColor: 'text-red-400',
  },
};

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onDismiss,
  className = '',
}) => {
  const { icon: Icon, styles, iconColor } = alertConfig[type];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-3.5 rounded-lg border backdrop-blur-sm text-xs ${styles} ${className}`}
    >
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
      <div className="flex-1 space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        <div className="text-dark-300 leading-relaxed">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="text-dark-400 hover:text-dark-200 p-0.5 rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
