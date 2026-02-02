"use client";

import React from "react";

export default function Step2_Details({ context, setContext, urgency, setUrgency, stakeholders, setStakeholders }: any) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Scenario Details</h2>

      <label className="block mb-3">
        <div className="text-sm text-gray-600">Context</div>
        <textarea
          className="mt-1 w-full border rounded px-3 py-2"
          rows={4}
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
      </label>

      <label className="block mb-3">
        <div className="text-sm text-gray-600">Urgency</div>
        <select className="mt-1 w-full border rounded px-3 py-2" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>

      <label className="block mb-3">
        <div className="text-sm text-gray-600">Stakeholders</div>
        <input
          className="mt-1 w-full border rounded px-3 py-2"
          value={stakeholders}
          onChange={(e) => setStakeholders(e.target.value)}
        />
      </label>
    </div>
  );
}
