import React from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary";
type ButtonSize = "default" | "small";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "default",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantStyles = {
    primary: "bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-teal text-white hover:opacity-90 active:opacity-80",
    secondary: "bg-surface border border-accent-blue text-accent-blue hover:bg-accent-blue/10 active:bg-accent-blue/20",
    tertiary: "bg-transparent text-foreground hover:bg-surface active:bg-card",
  };
  
  const sizeStyles = {
    default: "px-4 py-2.5 text-base",
    small: "px-3 py-1.5 text-sm",
  };
  
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();
  
  return (
    <button
      className={combinedClassName}
      disabled={disabled}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
