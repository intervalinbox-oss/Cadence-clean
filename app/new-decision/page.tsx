"use client";

import React, { useState } from "react";
import ModeSelection from "./components/ModeSelection";
import WizardContainer from "./WizardContainer";

type WizardMode = "selection" | "quick" | "full";

export default function NewDecisionV2Page() {
  const [mode, setMode] = useState<WizardMode>("selection");

  if (mode === "selection") {
    return (
      <ModeSelection
        onSelectMode={(selectedMode) => {
          setMode(selectedMode);
        }}
      />
    );
  }

  return (
    <WizardContainer
      initialMode={mode}
      onBackToSelection={() => setMode("selection")}
    />
  );
}
