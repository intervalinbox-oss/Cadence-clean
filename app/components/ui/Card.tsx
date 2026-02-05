import React from "react";

type CardSize = "small" | "medium" | "large";

interface CardProps {
  size?: CardSize;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  role?: string;
  "aria-label"?: string;
}

export default function Card({
  size = "medium",
  children,
  className = "",
  onClick,
  role,
  "aria-label": ariaLabel,
}: CardProps) {
  const baseStyles = "bg-card border border-border rounded-lg shadow-sm transition-all";
  
  const sizeStyles = {
    small: "p-4",
    medium: "p-6",
    large: "p-8",
  };
  
  const interactiveStyles = onClick ? "cursor-pointer hover:shadow-md active:shadow-sm" : "";
  
  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${interactiveStyles} ${className}`.trim();
  
  const Component = onClick ? "button" : "div";
  
  return (
    <Component
      className={combinedClassName}
      onClick={onClick}
      role={role || (onClick ? "button" : undefined)}
      aria-label={ariaLabel}
    >
      {children}
    </Component>
  );
}
