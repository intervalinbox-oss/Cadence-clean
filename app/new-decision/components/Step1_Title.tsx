"use client";

import React from "react";

export default function Step1_Title({ title, setTitle, goal, setGoal }: any) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Title & Purpose</h2>
      <label className="block mb-3">
        <div className="text-sm text-gray-600">Title (required)</div>
        <input
          className="mt-1 w-full border rounded px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <label className="block mb-3">
        <div className="text-sm text-gray-600">Goal / Purpose</div>
        <textarea
          className="mt-1 w-full border rounded px-3 py-2"
          rows={4}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
      </label>
    </div>
  );
}
