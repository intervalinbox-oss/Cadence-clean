import React, { useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  onEnterKey?: () => void;
}

export default function Input({
  label,
  error,
  helperText,
  id,
  className = "",
  required,
  onEnterKey,
  onKeyDown,
  ...props
}: InputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onEnterKey) {
      e.preventDefault();
      onEnterKey();
    }
    onKeyDown?.(e);
  };
  // Use React's useId() hook for stable SSR-safe IDs
  const generatedId = useId();
  const inputId = id || generatedId;
  const hasError = !!error;
  
  const inputStyles = `w-full px-3 py-2 bg-surface border rounded-lg text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all ${
    hasError ? "border-error focus:ring-error" : "border-border"
  } ${className}`;
  
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={inputStyles}
        aria-invalid={hasError}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        required={required}
        onKeyDown={handleKeyDown}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-error" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-foreground-muted">
          {helperText}
        </p>
      )}
    </div>
  );
}
