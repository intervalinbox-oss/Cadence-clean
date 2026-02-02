"use client";

import React from "react";

export default function WizardLayout({ children, step, total }: { children: React.ReactNode; step: number; total: number; }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow p-6">
        <div className="mb-4 text-sm text-gray-500">Step {step + 1} / {total}</div>
        {children}
      </div>
    </div>
  );
}
