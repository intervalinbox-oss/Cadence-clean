import React from "react";

type BadgeVariant = "default" | "success" | "warning" | "error";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  const variantStyles = {
    default: "bg-surface border border-border text-foreground",
    success: "bg-success/10 text-success border border-success/20",
    warning: "bg-warning/10 text-warning border border-warning/20",
    error: "bg-error/10 text-error border border-error/20",
  };
  
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`.trim();
  
  return (
    <span className={combinedClassName}>
      {children}
    </span>
  );
}
