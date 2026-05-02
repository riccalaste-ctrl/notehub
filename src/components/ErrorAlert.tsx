'use client';

import { AlertTriangle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
  title?: string;
}

export default function ErrorAlert({ message, onClose, title }: ErrorAlertProps) {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in fade-in slide-in-from-right-2 duration-300">
      <div className="bg-[#EF4444] border-2 border-[#DC2626] rounded-neu shadow-lg overflow-hidden">
        <div className="flex items-start gap-4 p-4">
          <div className="flex-shrink-0 pt-0.5">
            <AlertTriangle className="size-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            {title && <h3 className="font-semibold text-white mb-1">{title}</h3>}
            <p className="text-sm text-white/90 break-words">{message}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 text-white hover:text-white/70 transition"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
