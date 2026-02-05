"use client";

import React from "react";
import Input from "@/app/components/ui/Input";
import Textarea from "@/app/components/ui/Textarea";
import Select from "@/app/components/ui/Select";
import Button from "@/app/components/ui/Button";

type Step1Props = {
  data: Record<string, any>;
  update: (patch: Record<string, any>) => void;
};

export default function Step1_Context({ data, update }: Step1Props) {
  const title = data?.title ?? "";
  const isRecurring = data?.is_recurring ?? null;
  const recurringType = data?.recurring_type ?? "";
  const projectLength = data?.project_length ?? "";
  const purpose = data?.purpose ?? "";
  const timeSensitivity = data?.time_sensitivity ?? "";

  const recurringTypeOptions = [
    { value: "project", label: "Project-based meetings" },
    { value: "team", label: "Regular team syncs" },
    { value: "company", label: "Company-wide meetings" },
  ];

  const projectLengthOptions = [
    { value: "1-3_months", label: "1–3 months" },
    { value: "3-6_months", label: "3–6 months" },
    { value: "6-12_months", label: "6–12 months" },
    { value: "12+_months", label: "12+ months" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Set the context</h2>
        <p className="text-foreground-muted">Let&apos;s start with the basics—what are you trying to communicate?</p>
      </div>

      {/* Topic */}
      <Input
        label="What's the topic? *"
        helperText="Give this a short, clear title"
        value={title}
        onChange={(e) => update({ title: e.target.value })}
        placeholder="e.g., Q2 Budget Approval, Product Launch Alignment"
        required
        id="step1-topic"
      />

      {/* Recurring vs One-off */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Is this a one-time thing or recurring? *
        </label>
        <p className="text-sm text-foreground-muted mb-3">Help us understand the cadence you need</p>
        <div className="flex gap-3">
          <Button
            variant={isRecurring === false ? "primary" : "secondary"}
            onClick={() => update({ is_recurring: false })}
            className="flex-1"
            aria-pressed={isRecurring === false}
            role="button"
          >
            One-off
          </Button>
          <Button
            variant={isRecurring === true ? "primary" : "secondary"}
            onClick={() => update({ is_recurring: true })}
            className="flex-1"
            aria-pressed={isRecurring === true}
            role="button"
          >
            Recurring
          </Button>
        </div>
      </div>

      {/* Recurring Type (conditional) */}
      {isRecurring === true && (
        <Select
          label="What type of recurring meeting? *"
          helperText="This helps us recommend the right cadence"
          options={recurringTypeOptions}
          value={recurringType}
          onChange={(e) => update({ recurring_type: e.target.value })}
          placeholder="Choose one..."
          required
          id="step1-recurring-type"
        />
      )}

      {/* Project Length (conditional) */}
      {isRecurring === true && recurringType === "project" && (
        <Select
          label="Project length"
          helperText="This helps us recommend meeting frequency"
          options={projectLengthOptions}
          value={projectLength}
          onChange={(e) => update({ project_length: e.target.value })}
          placeholder="Select project length"
          id="step1-project-length"
        />
      )}

      {/* Purpose */}
      <Textarea
        label="What outcome do you need? *"
        helperText="Be specific about what you're trying to achieve"
        value={purpose}
        onChange={(e) => update({ purpose: e.target.value })}
        placeholder="e.g., Get sign-off from finance on Q2 spending, Align engineering and product on roadmap priorities..."
        rows={4}
        required
        id="step1-purpose"
      />

      {/* Timeline (optional) */}
      <Input
        label="When does this need to happen?"
        helperText="Optional—helps us prioritize urgency"
        value={timeSensitivity}
        onChange={(e) => update({ time_sensitivity: e.target.value })}
        placeholder="e.g., By Friday EOD, Before next board meeting, No rush"
        id="step1-timeline"
      />
    </div>
  );
}
