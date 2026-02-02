"use client";

import React, { useState } from "react";

export default function QuickMode({ onComplete }: { onComplete: (data: any) => void }) {
  const [form, setForm] = useState({
    title: "",
    purpose: "",
    urgency: "",
    stakeholderCount: "",
    sensitivity: "",
  });

  const setField = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const requiredFilled = form.title.trim() && form.purpose.trim() && form.urgency && form.stakeholderCount;

  return (
    <div style={{ border: '1px solid #e5e7eb', padding: 16, borderRadius: 8, maxWidth: 720 }}>
      <h2 style={{ marginBottom: 12 }}>Quick Mode</h2>

      <label style={{ display: 'block', marginBottom: 8 }}>
        <div style={{ fontSize: 13, marginBottom: 4 }}>Title (required)</div>
        <input value={form.title} onChange={(e) => setField('title', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db' }} />
      </label>

      <label style={{ display: 'block', marginBottom: 8 }}>
        <div style={{ fontSize: 13, marginBottom: 4 }}>Purpose (required)</div>
        <textarea value={form.purpose} onChange={(e) => setField('purpose', e.target.value)} rows={4} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db' }} />
      </label>

      <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
        <label style={{ flex: 1 }}>
          <div style={{ fontSize: 13, marginBottom: 4 }}>Urgency (required)</div>
          <select value={form.urgency} onChange={(e) => setField('urgency', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db' }}>
            <option value="">Select urgency</option>
            <option value="none">none</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
          </select>
        </label>

        <label style={{ flex: 1 }}>
          <div style={{ fontSize: 13, marginBottom: 4 }}>Stakeholder Count (required)</div>
          <select value={form.stakeholderCount} onChange={(e) => setField('stakeholderCount', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db' }}>
            <option value="">Select stakeholders</option>
            <option value="1–2">1–2</option>
            <option value="3–5">3–5</option>
            <option value="6–10">6–10</option>
            <option value="10+">10+</option>
          </select>
        </label>
      </div>

      <label style={{ display: 'block', marginBottom: 12 }}>
        <div style={{ fontSize: 13, marginBottom: 4 }}>Sensitivity (optional)</div>
        <select value={form.sensitivity} onChange={(e) => setField('sensitivity', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db' }}>
          <option value="">(none)</option>
          <option value="none">none</option>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
      </label>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" disabled={!requiredFilled} onClick={() => onComplete(form)} style={{ padding: '8px 14px', background: requiredFilled ? '#2563eb' : '#9ca3af', color: '#fff', border: 'none', borderRadius: 6 }}>
          Next
        </button>
      </div>
    </div>
  );
}
