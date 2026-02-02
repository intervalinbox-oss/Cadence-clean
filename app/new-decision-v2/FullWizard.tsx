"use client";

import React, { useState } from "react";
import Step1_Context from "./steps/Step1_Context";
import Step2_Timing from "./steps/Step2_Timing";
import Step3_Stakeholders from "./steps/Step3_Stakeholders";
import Step4_Sensitivity from "./steps/Step4_Sensitivity";

type FullWizardProps = {
  onComplete: (data: any) => void;
};

export default function FullWizard({ onComplete }: FullWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const update = (patch: Record<string, any>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  function renderStep() {
    if (step === 1) return <Step1_Context data={formData} update={update} />;
    if (step === 2) return <Step2_Timing data={formData} update={update} />;
    if (step === 3) return <Step3_Stakeholders data={formData} update={update} />;
    return <Step4_Sensitivity data={formData} update={update} />;
  }

  return (
    <div style={{ padding: 12 }}>
      <div style={{ marginBottom: 12 }}>{renderStep()}</div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step <= 1}
        >
          Back
        </button>

        {step < 4 ? (
          <button onClick={() => setStep((s) => Math.min(4, s + 1))}>Next</button>
        ) : (
          <button onClick={() => onComplete(formData)}>Submit</button>
        )}
      </div>
    </div>
  );
}
