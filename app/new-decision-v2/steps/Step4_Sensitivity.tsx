"use client";

import React from "react";

type Step4Props = {
  data: Record<string, any>;
  update: (patch: Record<string, any>) => void;
};

export default function Step4_Sensitivity({ data, update }: Step4Props) {
  const emotionalRisk = data?.emotionalRisk ?? "none";
  const changeImpact = data?.changeImpact ?? "none";
  const communicationStyle = data?.communicationStyle ?? "brief";
  const additionalContext = data?.additionalContext ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label>Emotional Risk</label>
        <div>
          <select
            value={emotionalRisk}
            onChange={(e) => update({ emotionalRisk: (e.target as HTMLSelectElement).value })}
          >
            <option value="none">none</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </div>
      </div>

      <div>
        <label>Change Impact</label>
        <div>
          <select
            value={changeImpact}
            onChange={(e) => update({ changeImpact: (e.target as HTMLSelectElement).value })}
          >
            <option value="none">none</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </div>
      </div>

      <div>
        <label>Communication Style</label>
        <div>
          <select
            value={communicationStyle}
            onChange={(e) => update({ communicationStyle: (e.target as HTMLSelectElement).value })}
          >
            <option value="brief">brief</option>
            <option value="detailed">detailed</option>
            <option value="directive">directive</option>
            <option value="empathetic">empathetic</option>
            <option value="executive">executive</option>
          </select>
        </div>
      </div>

      <div>
        <label>Additional Context</label>
        <div>
          <textarea
            rows={4}
            value={additionalContext}
            onChange={(e) => update({ additionalContext: (e.target as HTMLTextAreaElement).value })}
          />
        </div>
      </div>
    </div>
  );
}

