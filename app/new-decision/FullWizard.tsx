"use client";

import React, { useState, useEffect, useCallback } from "react";
import Step1_Context from "./steps/Step1_Context";
import Step2_Timing from "./steps/Step2_Timing";
import Step3_Stakeholders from "./steps/Step3_Stakeholders";
import Step4_Sensitivity from "./steps/Step4_Sensitivity";
import Progress from "@/app/components/ui/Progress";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";

type FullWizardProps = {
  onComplete: (data: any) => void;
  onBack?: () => void;
};

export default function FullWizard({ onComplete, onBack }: FullWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fade, setFade] = useState<"in" | "out">("in");

  const update = (patch: Record<string, any>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const goNext = useCallback(() => {
    if (step >= 4) return;
    setFade("out");
    setTimeout(() => {
      setStep((s) => Math.min(4, s + 1));
      setFade("in");
    }, 150);
  }, [step]);

  const goBack = useCallback(() => {
    if (step <= 1) return;
    setFade("out");
    setTimeout(() => {
      setStep((s) => Math.max(1, s - 1));
      setFade("in");
    }, 150);
  }, [step]);

  function renderStep() {
    if (step === 1) return <Step1_Context data={formData} update={update} />;
    if (step === 2) return <Step2_Timing data={formData} update={update} />;
    if (step === 3) return <Step3_Stakeholders data={formData} update={update} />;
    return <Step4_Sensitivity data={formData} update={update} />;
  }

  const canProceed = () => {
    // Basic validation - can be enhanced per step
    if (step === 1) return formData.title && formData.purpose;
    if (step === 2) return formData.urgency && formData.decisionTypes?.length > 0;
    if (step === 3) return formData.stakeholderCount;
    return true; // Step 4 is optional
  };

  return (
    <div className="w-full">
      {/* Progress Indicator */}
      <div className="mb-8">
        <Progress current={step} total={4} />
      </div>

      {/* Step Content with fade transition */}
      <Card
        size="large"
        className={`mb-6 transition-opacity duration-150 ${
          fade === "in" ? "opacity-100" : "opacity-0"
        }`}
      >
        {renderStep()}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div>
          {step === 1 && onBack ? (
            <Button variant="tertiary" onClick={onBack}>
              ← Back to selection
            </Button>
          ) : (
            <Button
              variant="tertiary"
              onClick={goBack}
              disabled={step <= 1}
            >
              ← Back
            </Button>
          )}
        </div>

        <div>
          {step < 4 ? (
            <Button
              variant="primary"
              onClick={goNext}
              disabled={!canProceed()}
            >
              Continue →
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => onComplete(formData)}
              disabled={!canProceed()}
            >
              ✨ Get my recommendation
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
