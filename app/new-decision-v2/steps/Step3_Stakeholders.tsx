"use client";

import React from "react";
import Input from "@/app/components/ui/Input";
import Select from "@/app/components/ui/Select";

type Step3Props = {
  data: Record<string, any>;
  update: (patch: Record<string, any>) => void;
};

export default function Step3_Stakeholders({ data, update }: Step3Props) {
  const stakeholderCount = data?.stakeholderCount ?? "";
  const stakeholderGroups = data?.stakeholderGroups ?? "";
  const crossTeam = Boolean(data?.crossTeamDependencies);

  const stakeholderCountOptions = [
    { value: "1–2", label: "Just me or 1–2 people" },
    { value: "3–5", label: "Small group (3–5 people)" },
    { value: "6–10", label: "Medium group (6–10 people)" },
    { value: "10+", label: "Large group (10+ people)" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Who&apos;s involved?</h2>
        <p className="text-foreground-muted">Who needs to be part of this conversation?</p>
      </div>

      {/* Stakeholder Count */}
      <Select
        label="How many people need to be involved? *"
        helperText="Larger groups often require different communication approaches"
        options={stakeholderCountOptions}
        value={stakeholderCount}
        onChange={(e) => update({ stakeholderCount: e.target.value })}
        placeholder="Select number of stakeholders"
        required
        id="step3-stakeholder-count"
      />

      {/* Stakeholder Groups */}
      <Input
        label="Which teams or groups are involved?"
        helperText="Optional—helps us tailor the recommendation"
        value={stakeholderGroups}
        onChange={(e) => update({ stakeholderGroups: e.target.value })}
        placeholder="e.g., Engineering, Product, Finance, Sales"
        id="step3-stakeholder-groups"
      />

      {/* Cross-team Dependencies */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={crossTeam}
            onChange={(e) => update({ crossTeamDependencies: e.target.checked })}
            className="mt-1 w-5 h-5 border-2 border-border rounded focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:outline-none transition-all appearance-none checked:bg-accent-blue checked:border-accent-blue checked:text-white relative"
            style={{
              backgroundImage: crossTeam ? 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 16 16\' fill=\'white\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z\'/%3E%3C/svg%3E")' : 'none',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            id="step3-cross-team"
          />
          <div className="flex-1">
            <span className="block text-sm font-medium text-foreground group-hover:text-accent-blue transition-colors">
              Multiple teams depend on this decision
            </span>
            <span className="block text-sm text-foreground-muted mt-1">
              Check this if cross-functional alignment is critical
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}
