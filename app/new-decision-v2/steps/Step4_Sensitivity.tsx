"use client";

import React from "react";
import Select from "@/app/components/ui/Select";
import Textarea from "@/app/components/ui/Textarea";
import Card from "@/app/components/ui/Card";

type Step4Props = {
  data: Record<string, any>;
  update: (patch: Record<string, any>) => void;
};

export default function Step4_Sensitivity({ data, update }: Step4Props) {
  const emotionalRisk = data?.emotionalRisk ?? "";
  const changeImpact = data?.changeImpact ?? "";
  const communicationStyle = data?.communicationStyle ?? "";
  const additionalContext = data?.additionalContext ?? "";

  const emotionalRiskOptions = [
    { value: "none", label: "No sensitivity — routine topic" },
    { value: "low", label: "Low sensitivity — minor concerns" },
    { value: "medium", label: "Moderate sensitivity — needs care" },
    { value: "high", label: "High sensitivity — very delicate topic" },
  ];

  const changeImpactOptions = [
    { value: "none", label: "No change — business as usual" },
    { value: "low", label: "Small change — minor adjustments" },
    { value: "medium", label: "Moderate change — noticeable impact" },
    { value: "high", label: "Major change — significant disruption" },
  ];

  const communicationStyleOptions = [
    { value: "brief", label: "Brief & Direct — get to the point" },
    { value: "detailed", label: "Detailed & Thorough — full context" },
    { value: "directive", label: "Directive — clear instructions" },
    { value: "empathetic", label: "Empathetic — supportive tone" },
    { value: "executive", label: "Executive Summary — concise top-level view" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Tone, sensitivity, and style</h2>
        <p className="text-foreground-muted">Help Cadence tailor your recommendation to the sensitivity of the topic and the way you prefer to communicate.</p>
      </div>

      {/* Emotional Sensitivity */}
      <Card size="medium" className="bg-accent-blue/5 border-accent-blue/20">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-1">Emotional Sensitivity</h3>
          <p className="text-sm text-foreground-muted">Sensitive topics may benefit from face-to-face or synchronous communication.</p>
        </div>
        <Select
          options={emotionalRiskOptions}
          value={emotionalRisk}
          onChange={(e) => update({ emotionalRisk: e.target.value })}
          placeholder="Select sensitivity level"
          id="step4-emotional-risk"
        />
      </Card>

      {/* Change Impact */}
      <Card size="medium" className="bg-warning/5 border-warning/20">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-1">Change Impact</h3>
          <p className="text-sm text-foreground-muted">Bigger changes require more thoughtful communication planning.</p>
        </div>
        <Select
          options={changeImpactOptions}
          value={changeImpact}
          onChange={(e) => update({ changeImpact: e.target.value })}
          placeholder="Select change impact level"
          id="step4-change-impact"
        />
      </Card>

      {/* Communication Style */}
      <Card size="medium" className="bg-accent-purple/5 border-accent-purple/20">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-1">Communication Style</h3>
          <p className="text-sm text-foreground-muted">We&apos;ll tailor the tone and structure to match your preferred approach.</p>
        </div>
        <Select
          options={communicationStyleOptions}
          value={communicationStyle}
          onChange={(e) => update({ communicationStyle: e.target.value })}
          placeholder="Select communication style"
          id="step4-communication-style"
        />
      </Card>

      {/* Additional Context */}
      <Textarea
        label="Anything else we should know?"
        helperText="Optional—add any extra context that might help"
        value={additionalContext}
        onChange={(e) => update({ additionalContext: e.target.value })}
        placeholder="e.g., This ties to a larger initiative, there's political sensitivity, past attempts failed..."
        rows={4}
        id="step4-additional-context"
      />
    </div>
  );
}
