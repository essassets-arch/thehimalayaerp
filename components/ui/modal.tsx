import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const getMaxWidthClass = () => {
    switch (size) {
      case 'sm': return 'max-w-sm';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-4xl';
      case 'full': return 'max-w-[95vw] w-[95vw]';
      case 'md':
      default: return 'max-w-md';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-4">
      <div 
        className={cn(
          "bg-white rounded-none shadow-lg w-full h-dvh max-h-dvh flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 sm:h-auto sm:max-h-[90vh] sm:rounded-xl",
          getMaxWidthClass(),
          size === 'full' ? 'sm:h-[95vh]' : ''
        )}
        style={{ maxWidth: size === 'xl' ? '896px' : undefined }}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
            <span className="sr-only">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </Button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden flex-1">
          <div className="w-full pb-2">
            {children}
          </div>
        </div>
        {footer && (
          <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
