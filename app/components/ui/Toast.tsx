"use client";

import React, { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-foreground text-background px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const showToast = (message: string) => {
    setToast({ message });
  };

  const ToastComponent = toast ? (
    <Toast message={toast.message} onClose={() => setToast(null)} />
  ) : null;

  return { showToast, ToastComponent };
}
