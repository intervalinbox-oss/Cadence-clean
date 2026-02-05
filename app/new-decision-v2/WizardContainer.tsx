"use client";

import React, { useState } from "react";
import QuickMode from "./QuickMode";
import FullWizard from "./FullWizard";
import Summary from "./Summary";

interface WizardContainerProps {
  initialMode: "quick" | "full";
  onBackToSelection: () => void;
}

export default function WizardContainer({ initialMode, onBackToSelection }: WizardContainerProps) {
  const [mode, setMode] = useState<"quick" | "full" | "summary">(initialMode);
  const [data, setData] = useState<Record<string, any>>({ mode: initialMode });

  // Quick-mode completion
  function handleQuickComplete(d: any) {
    setData((prev) => ({ ...prev, ...d, mode: "quick" }));
    setMode("summary");
  }

  // Full wizard completion
  function handleFullComplete(d: any) {
    setData((prev) => ({ ...prev, ...d, mode: "full" }));
    setMode("summary");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {mode === "quick" && (
        <QuickMode
          onComplete={handleQuickComplete}
          onBack={onBackToSelection}
        />
      )}

      {mode === "full" && (
        <FullWizard
          onComplete={handleFullComplete}
          onBack={onBackToSelection}
        />
      )}

      {mode === "summary" && (
        <Summary
          data={data}
          onBack={() => {
            // Go back to the wizard mode that was used
            setMode(data.mode === "quick" ? "quick" : "full");
          }}
        />
      )}
    </div>
  );
}
