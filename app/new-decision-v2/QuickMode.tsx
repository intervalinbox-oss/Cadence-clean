"use client";

import React, { useState } from "react";
import Input from "@/app/components/ui/Input";
import Textarea from "@/app/components/ui/Textarea";
import Select from "@/app/components/ui/Select";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Progress from "@/app/components/ui/Progress";

interface QuickModeProps {
  onComplete: (data: any) => void;
  onBack?: () => void;
}

export default function QuickMode({ onComplete, onBack }: QuickModeProps) {
  const [form, setForm] = useState({
    title: "",
    purpose: "",
    urgency: "",
    stakeholderCount: "",
    sensitivity: "",
  });

  const setField = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const requiredFilled =
    form.title.trim() &&
    form.purpose.trim() &&
    form.urgency &&
    form.stakeholderCount;

  const urgencyOptions = [
    { value: "none", label: "No rush — can wait" },
    { value: "low", label: "Low urgency — within a week" },
    { value: "medium", label: "Pretty urgent — needs action within a few days" },
    { value: "high", label: "Very urgent — needs action today" },
    { value: "critical", label: "Critical — immediate action required" },
  ];

  const stakeholderOptions = [
    { value: "1–2", label: "Just me or 1–2 people" },
    { value: "3–5", label: "Small group (3–5 people)" },
    { value: "6–10", label: "Medium group (6–10 people)" },
    { value: "10+", label: "Large group (10+ people)" },
  ];

  const sensitivityOptions = [
    { value: "none", label: "No sensitivity — routine topic" },
    { value: "low", label: "Low sensitivity — minor concerns" },
    { value: "medium", label: "Moderate sensitivity — needs care" },
    { value: "high", label: "High sensitivity — very delicate topic" },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Find your Cadence
        </h1>
        <p className="text-lg text-foreground-muted">
          Answer a few questions and we&apos;ll recommend the best communication method, plus generate tailored content for you.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2 text-sm text-foreground-muted">
          <span>Quick Mode</span>
          <span>{requiredFilled ? "100% complete" : "In progress"}</span>
        </div>
        <Progress current={requiredFilled ? 5 : Object.values(form).filter(Boolean).length} total={5} showText={false} />
      </div>

      {/* Form Card */}
      <Card size="large" className="mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">Quick essentials</h2>
          <p className="text-foreground-muted">Answer these 5 questions to get your recommendation.</p>
        </div>

        <div className="space-y-6">
          {/* Question 1: Topic */}
          <Input
            label="What's the topic? *"
            helperText="Give this a short, clear title"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="e.g., Q2 Budget Review, Product Launch Alignment"
            required
            id="quick-topic"
          />

          {/* Question 2: Purpose */}
          <Textarea
            label="What outcome do you need? *"
            helperText="Be specific about what you're trying to achieve"
            value={form.purpose}
            onChange={(e) => setField("purpose", e.target.value)}
            placeholder="e.g., Get approval on Q2 spending priorities, Align engineering and product on roadmap priorities..."
            rows={4}
            required
            id="quick-purpose"
          />

          {/* Question 3: Urgency */}
          <Select
            label="How urgent is this? *"
            helperText="Be honest—urgency affects how direct and synchronous your communication should be"
            options={urgencyOptions}
            value={form.urgency}
            onChange={(e) => setField("urgency", e.target.value)}
            placeholder="Select urgency level"
            required
            id="quick-urgency"
          />

          {/* Question 4: Stakeholder Count */}
          <Select
            label="How many people are involved? *"
            helperText="Larger groups often require different communication approaches"
            options={stakeholderOptions}
            value={form.stakeholderCount}
            onChange={(e) => setField("stakeholderCount", e.target.value)}
            placeholder="Select number of stakeholders"
            required
            id="quick-stakeholders"
          />

          {/* Question 5: Sensitivity (Optional) */}
          <Select
            label="How sensitive is this topic?"
            helperText="Optional—helps us tailor the recommendation to emotional considerations"
            options={sensitivityOptions}
            value={form.sensitivity}
            onChange={(e) => setField("sensitivity", e.target.value)}
            placeholder="Select sensitivity level (optional)"
            id="quick-sensitivity"
          />
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div>
          {onBack && (
            <Button variant="tertiary" onClick={onBack}>
              ← Back to selection
            </Button>
          )}
        </div>

        <div>
          <Button
            variant="primary"
            onClick={() => onComplete(form)}
            disabled={!requiredFilled}
            aria-label={requiredFilled ? "Get recommendation" : "Please fill all required fields"}
          >
            ✨ Get my recommendation
          </Button>
        </div>
      </div>
    </div>
  );
}
