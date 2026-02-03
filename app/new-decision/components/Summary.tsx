import React from "react";

export default function Summary({ data }: any) {
  const title = data.title || (data.options && data.options[0] && data.options[0].title) || "(no title)";

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Summary</h2>
      <div className="p-3 border rounded bg-gray-50">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-600 mt-2">{data.goal}</div>
      </div>
    </div>
  );
}
