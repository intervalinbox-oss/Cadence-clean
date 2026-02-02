"use client";

import React from "react";

type Step1Props = {
  data: Record<string, any>;
  update: (patch: Record<string, any>) => void;
};

export default function Step1_Context({ data, update }: Step1Props) {
  const title = data?.title ?? "";
  const isRecurring = Boolean(data?.is_recurring);
  const recurringType = data?.recurring_type ?? "";
  const projectLength = data?.project_length ?? "";
  const purpose = data?.purpose ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => update({ title: (e.target as HTMLInputElement).value })}
        />
      </div>

      <div>
        <label>Is recurring?</label>
        <div>
          <label style={{ marginRight: 8 }}>
            <input
              type="radio"
              name="is_recurring"
              checked={isRecurring === true}
              onChange={() => update({ is_recurring: true })}
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="is_recurring"
              checked={isRecurring === false}
              onChange={() => update({ is_recurring: false })}
            />
            No
          </label>
        </div>
      </div>

      {isRecurring && (
        <div>
          <label>Recurring type</label>
          <select
            value={recurringType}
            onChange={(e) => update({ recurring_type: (e.target as HTMLSelectElement).value })}
          >
            <option value="">Select...</option>
            <option value="project">project</option>
            <option value="team">team</option>
            <option value="company">company</option>
          </select>

          {recurringType === "project" && (
            <div style={{ marginTop: 8 }}>
              <label>Project length</label>
              <select
                value={projectLength}
                onChange={(e) => update({ project_length: (e.target as HTMLSelectElement).value })}
              >
                <option value="">Select...</option>
                <option value="1-3_months">1-3_months</option>
                <option value="3-6_months">3-6_months</option>
                <option value="6-12_months">6-12_months</option>
                <option value="12+_months">12+_months</option>
              </select>
            </div>
          )}
        </div>
      )}

      <div>
        <label>Purpose</label>
        <textarea
          value={purpose}
          onChange={(e) => update({ purpose: (e.target as HTMLTextAreaElement).value })}
        />
      </div>
    </div>
  );
}

