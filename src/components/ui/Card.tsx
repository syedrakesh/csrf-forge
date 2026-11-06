import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  borderVariant?: 'default' | 'accent' | 'danger' | 'warning';
}

const borderVariants = {
  default: 'border-dark-800 hover:border-dark-700',
  accent: 'border-cyber-500/30 hover:border-cyber-400/50',
  danger: 'border-red-500/30 hover:border-red-400/50',
  warning: 'border-amber-500/30 hover:border-amber-400/50',
};

export const Card: React.FC<CardProps> = ({
  children,
  glow = false,
  borderVariant = 'default',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-dark-900/90 backdrop-blur-sm border rounded-lg p-5 transition-all duration-200 ${
        borderVariants[borderVariant]
      } ${
        glow ? 'shadow-lg shadow-cyber-500/5 border-cyber-500/40' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`flex items-center justify-between pb-3 mb-4 border-b border-dark-800 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3 className={`text-base font-semibold text-dark-100 flex items-center gap-2 ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-xs text-dark-400 mt-0.5 ${className}`} {...props}>
    {children}
  </p>
);
