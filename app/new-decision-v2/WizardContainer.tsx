"use client";

import React, { useState } from "react";
import QuickMode from "./QuickMode";
import Step1_Context from "./steps/Step1_Context";
import Step2_Timing from "./steps/Step2_Timing";
import Step3_Stakeholders from "./steps/Step3_Stakeholders";
import Step4_Sensitivity from "./steps/Step4_Sensitivity";
import Summary from "./Summary";

export default function WizardContainer() {
  const [mode, setMode] = useState<'quick' | 'full' | 'summary'>('quick');

  // Full wizard state
  const [step, setStep] = useState<number>(1);
  const [data, setData] = useState<Record<string, any>>({});

  function update(patch: Record<string, any>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  // Quick-mode completion uses the same `data` state and shows summary
  function handleQuickComplete(d: any) {
    setData(d || {});
    setMode('summary');
  }

  return (
    <div style={{ padding: 12 }}>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <button onClick={() => setMode('quick')} style={{ padding: '6px 10px', background: mode === 'quick' ? '#e5e7eb' : '#fff' }}>Quick Mode</button>
        <button onClick={() => setMode('full')} style={{ padding: '6px 10px', background: mode === 'full' ? '#e5e7eb' : '#fff' }}>Full Wizard</button>
      </div>

      <div>
        {mode === 'quick' && <QuickMode onComplete={handleQuickComplete} />}

        {mode === 'full' && (
          <div>
            {step === 1 && <Step1_Context data={data} update={update} />}
            {step === 2 && <Step2_Timing data={data} update={update} />}
            {step === 3 && <Step3_Stakeholders data={data} update={update} />}
            {step === 4 && <Step4_Sensitivity data={data} update={update} />}
            {step === 5 && <Summary data={data} onBack={() => setStep(4)} />}

            {step < 5 && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step <= 1}>Back</button>
                {step < 4 ? (
                  <button onClick={() => setStep((s) => Math.min(4, s + 1))}>Next</button>
                ) : (
                  <button onClick={() => { setData((prev) => ({ mode: "full", ...prev })); setStep(5); }}>Finish</button>
                )}
              </div>
            )}
          </div>
        )}

        {mode === 'summary' && <Summary data={data} onBack={() => { setMode('full'); setStep(4); }} />}
      </div>
    </div>
  );
}
