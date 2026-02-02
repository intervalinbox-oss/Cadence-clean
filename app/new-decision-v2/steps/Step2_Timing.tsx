"use client";

import React from "react";

type Step2Props = {
  data: Record<string, any>;
  update: (patch: Record<string, any>) => void;
};

const DECISION_TYPE_OPTIONS = [
  "inform",
  "align",
  "decide",
  "escalate",
  "unblock",
  "update",
  "brainstorm",
];

export default function Step2_Timing({ data, update }: Step2Props) {
  const urgency = data?.urgency ?? "none";
  const complexity = data?.complexity ?? "simple";
  const decisionTypes: string[] = Array.isArray(data?.decisionTypes) ? data.decisionTypes : [];

  function toggleDecisionType(value: string, checked: boolean) {
    const set = new Set(decisionTypes);
    if (checked) set.add(value); else set.delete(value);
    update({ decisionTypes: Array.from(set) });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <label>Urgency</label>
        <div>
          <select value={urgency} onChange={(e) => update({ urgency: (e.target as HTMLSelectElement).value })}>
            <option value="none">none</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
          </select>
        </div>
      </div>

      <div>
        <label>Complexity</label>
        <div>
          <select value={complexity} onChange={(e) => update({ complexity: (e.target as HTMLSelectElement).value })}>
            <option value="simple">simple</option>
            <option value="moderate">moderate</option>
            <option value="complex">complex</option>
            <option value="highly_complex">highly_complex</option>
          </select>
        </div>
      </div>

      <div>
        <label>Decision Types</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {DECISION_TYPE_OPTIONS.map((opt) => (
            <label key={opt}>
              <input
                type="checkbox"
                checked={decisionTypes.includes(opt)}
                onChange={(e) => toggleDecisionType(opt, (e.target as HTMLInputElement).checked)}
              />
              {" "}{opt}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

