import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const widthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full ${widthClasses[maxWidth]} bg-dark-900 border border-dark-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-800 bg-dark-950/50">
          <h2 id="modal-title" className="text-sm font-semibold text-dark-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyber-500 animate-pulse"></span>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-md text-dark-400 hover:text-dark-200 hover:bg-dark-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto text-sm text-dark-300">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-dark-800 bg-dark-950/40">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
