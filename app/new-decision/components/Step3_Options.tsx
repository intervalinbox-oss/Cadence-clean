"use client";

import React from "react";

export default function Step3_Options({ options, setOptions }: any) {
  function updateOption(idx: number, field: string, value: string) {
    const copy = [...options];
    copy[idx] = { ...copy[idx], [field]: value };
    setOptions(copy);
  }

  function addOption() {
    if (options.length >= 5) return;
    setOptions([...options, { title: "", pros: "", cons: "" }]);
  }

  function removeOption(idx: number) {
    const copy = options.filter((_: any, i: number) => i !== idx);
    setOptions(copy);
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Options</h2>
      {options.map((opt: any, idx: number) => (
        <div key={idx} className="mb-4 border rounded p-3">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium">Option {idx + 1}</div>
            <button type="button" onClick={() => removeOption(idx)} className="text-sm text-red-500">Remove</button>
          </div>

          <label className="block mb-2">
            <div className="text-sm text-gray-600">Title</div>
            <input className="mt-1 w-full border rounded px-2 py-1" value={opt.title} onChange={(e) => updateOption(idx, "title", e.target.value)} />
          </label>

          <label className="block mb-2">
            <div className="text-sm text-gray-600">Pros</div>
            <textarea className="mt-1 w-full border rounded px-2 py-1" rows={2} value={opt.pros} onChange={(e) => updateOption(idx, "pros", e.target.value)} />
          </label>

          <label className="block mb-2">
            <div className="text-sm text-gray-600">Cons</div>
            <textarea className="mt-1 w-full border rounded px-2 py-1" rows={2} value={opt.cons} onChange={(e) => updateOption(idx, "cons", e.target.value)} />
          </label>
        </div>
      ))}

      <div>
        <button type="button" onClick={addOption} disabled={options.length >= 5} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
          Add New Option
        </button>
      </div>
    </div>
  );
}
