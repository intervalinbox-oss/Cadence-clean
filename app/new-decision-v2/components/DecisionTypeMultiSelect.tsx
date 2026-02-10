"use client";

import React from "react";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";

export type DecisionType = "inform" | "align" | "decide" | "escalate" | "unblock" | "update" | "brainstorm";

interface DecisionTypeOption {
  value: DecisionType;
  label: string;
  description: string;
}

interface DecisionTypeMultiSelectProps {
  value: DecisionType[];
  onChange: (value: DecisionType[]) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  id?: string;
}

const decisionTypeOptions: DecisionTypeOption[] = [
  { value: "inform", label: "Inform", description: "Share information one-way" },
  { value: "align", label: "Align", description: "Build consensus across teams" },
  { value: "decide", label: "Decide", description: "Get approval or make a choice" },
  { value: "escalate", label: "Escalate", description: "Resolve conflict or blockage" },
  { value: "unblock", label: "Unblock", description: "Remove obstacles or dependencies" },
  { value: "update", label: "Update", description: "Status report or progress check" },
  { value: "brainstorm", label: "Brainstorm", description: "Generate ideas or explore options" },
];

export default function DecisionTypeMultiSelect({
  value = [],
  onChange,
  error,
  helperText,
  required,
  id,
}: DecisionTypeMultiSelectProps) {
  const toggleSelection = (optionValue: DecisionType) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const isSelected = (optionValue: DecisionType) => value.includes(optionValue);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-foreground mb-1.5">
        What type of decision are you making? *
      </label>
      {helperText && (
        <p className="text-sm text-foreground-muted mb-4">{helperText}</p>
      )}

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        role="group"
        aria-label="Decision type selection"
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
      >
        {decisionTypeOptions.map((option) => (
          <Card
            key={option.value}
            size="small"
            onClick={() => toggleSelection(option.value)}
            role="checkbox"
            aria-checked={isSelected(option.value)}
            aria-label={`${option.label}: ${option.description}`}
            className={`cursor-pointer transition-all ${
              isSelected(option.value)
                ? "border-accent-blue border-2 bg-accent-blue/5"
                : "border-border hover:border-accent-blue/50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{option.label}</h3>
                  {isSelected(option.value) && (
                    <svg
                      className="w-5 h-5 text-accent-blue"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-foreground-muted">{option.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Selected Summary */}
      {value.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-foreground mb-2">
            Selected ({value.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {value.map((selected) => {
              const option = decisionTypeOptions.find((o) => o.value === selected);
              return (
                <Badge key={selected} variant="default">
                  {option?.label || selected}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(value.filter((v) => v !== selected));
                    }}
                    className="ml-2 hover:text-error"
                    aria-label={`Remove ${option?.label || selected}`}
                  >
                    ×
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-error" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${id}-helper`} className="mt-2 text-sm text-foreground-muted">
          {helperText}
        </p>
      )}
    </div>
  );
}
