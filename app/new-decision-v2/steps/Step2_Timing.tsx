"use client";

import React from "react";
import Input from "@/app/components/ui/Input";
import Select from "@/app/components/ui/Select";
import DecisionTypeMultiSelect, { type DecisionType } from "../components/DecisionTypeMultiSelect";

type Step2Props = {
  data: Record<string, any>;
  update: (patch: Record<string, any>) => void;
};

export default function Step2_Timing({ data, update }: Step2Props) {
  const urgency = data?.urgency ?? "";
  const complexity = data?.complexity ?? "";
  const decisionTypes = (data?.decisionTypes || []) as DecisionType[];
  const timeSensitivity = data?.time_sensitivity ?? "";

  const urgencyOptions = [
    { value: "none", label: "No rush — can wait" },
    { value: "low", label: "Low urgency — within a week" },
    { value: "medium", label: "Pretty urgent — needs action within a few days" },
    { value: "high", label: "Very urgent — needs action today" },
    { value: "critical", label: "Critical — immediate action required" },
  ];

  const complexityOptions = [
    { value: "simple", label: "Simple — straightforward topic" },
    { value: "moderate", label: "Moderate — some nuance and trade-offs" },
    { value: "complex", label: "Complex — multiple factors to consider" },
    { value: "highly_complex", label: "Highly complex — many interdependencies" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Timing and decision type</h2>
        <p className="text-foreground-muted">Now tell us about timing and what type of decision you need to make.</p>
      </div>

      {/* Timeline */}
      <Input
        label="When do you need an outcome?"
        helperText="This tells Cadence the real-world deadline"
        value={timeSensitivity}
        onChange={(e) => update({ time_sensitivity: e.target.value })}
        placeholder="e.g., By Friday EOD, Before next board meeting, No rush"
        id="step2-timeline"
        onEnterKey={() => document.getElementById("step2-urgency")?.focus()}
      />

      {/* Urgency */}
      <Select
        label="How urgent does this feel? *"
        helperText="Be honest—urgency affects how direct and synchronous your communication should be"
        options={urgencyOptions}
        value={urgency}
        onChange={(e) => update({ urgency: e.target.value })}
        placeholder="Select urgency level"
        required
        id="step2-urgency"
        onEnterKey={() => document.getElementById("step2-complexity")?.focus()}
      />

      {/* Decision Types */}
      <DecisionTypeMultiSelect
        value={decisionTypes}
        onChange={(value) => update({ decisionTypes: value })}
        helperText="Select all that apply—this shapes the recommendation"
        required
        id="step2-decision-types"
      />

      {/* Complexity */}
      <Select
        label="How nuanced is this topic?"
        helperText="More complexity usually means you need more discussion"
        options={complexityOptions}
        value={complexity}
        onChange={(e) => update({ complexity: e.target.value })}
        placeholder="Select complexity level"
        id="step2-complexity"
      />
    </div>
  );
}
