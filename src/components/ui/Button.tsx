import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-cyber-600 text-dark-950 font-semibold hover:bg-cyber-500 active:bg-cyber-700 shadow-sm shadow-cyber-500/20 border border-cyber-400/40',
  secondary:
    'bg-dark-800 text-dark-200 border border-dark-700 hover:bg-dark-700 hover:text-dark-100 hover:border-dark-600',
  danger:
    'bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30 hover:border-red-500/50',
  outline:
    'bg-transparent text-cyber-400 border border-cyber-500/50 hover:bg-cyber-950/40 hover:border-cyber-400',
  ghost:
    'bg-transparent text-dark-400 hover:text-dark-200 hover:bg-dark-900 border border-transparent',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-2.5 py-1 text-xs gap-1.5 rounded',
  md: 'px-4 py-2 text-sm gap-2 rounded-md',
  lg: 'px-6 py-2.5 text-base gap-2.5 rounded-lg',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
