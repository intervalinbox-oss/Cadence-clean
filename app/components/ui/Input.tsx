import React, { useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  id,
  className = "",
  required,
  ...props
}: InputProps) {
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
          {required && <span className="text-error ml-1" aria-label="required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={inputStyles}
        aria-invalid={hasError}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        required={required}
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
