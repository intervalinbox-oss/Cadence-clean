import React from "react";

interface ProgressProps {
  current: number;
  total: number;
  showText?: boolean;
  className?: string;
}

export default function Progress({
  current,
  total,
  showText = true,
  className = "",
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  
  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex justify-between items-center mb-2 text-sm text-foreground-muted">
          <span>Step {current} of {total}</span>
          <span>{Math.round(percentage)}% complete</span>
        </div>
      )}
      <div className="w-full h-2 bg-surface border border-border rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-teal transition-all duration-300"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={`Progress: ${current} of ${total} steps completed`}
        />
      </div>
    </div>
  );
}
