"use client";

import React from "react";

type Step3Props = {
  data: Record<string, any>;
  update: (patch: Record<string, any>) => void;
};

export default function Step3_Stakeholders({ data, update }: Step3Props) {
  const stakeholderCount = data?.stakeholderCount ?? "";
  const stakeholderGroups = data?.stakeholderGroups ?? "";
  const crossTeam = Boolean(data?.crossTeamDependencies);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label>Stakeholder Count</label>
        <div>
          <select
            value={stakeholderCount}
            onChange={(e) => update({ stakeholderCount: (e.target as HTMLSelectElement).value })}
          >
            <option value="">Select...</option>
            <option value={"1–2"}>1–2</option>
            <option value={"3–5"}>3–5</option>
            <option value={"6–10"}>6–10</option>
            <option value={"10+"}>10+</option>
          </select>
        </div>
      </div>

      <div>
        <label>Stakeholder Groups (comma-separated)</label>
        <div>
          <input
            type="text"
            value={stakeholderGroups}
            onChange={(e) => update({ stakeholderGroups: (e.target as HTMLInputElement).value })}
          />
        </div>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={crossTeam}
            onChange={(e) => update({ crossTeamDependencies: (e.target as HTMLInputElement).checked })}
          />
          {" "}Are other teams required to complete this work?
        </label>
      </div>
    </div>
  );
}

