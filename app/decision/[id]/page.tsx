import React from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import DecisionDetailClient from "./DecisionDetailClient";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  if (!id) {
    return <div style={{ padding: 24, color: "red" }}>Invalid decision id</div>;
  }

  try {
    const snap = await getDoc(doc(db, "decisions", id));
    if (!snap.exists()) {
      return <div style={{ padding: 24 }}>Decision not found.</div>;
    }
  } catch (err: any) {
    return <div style={{ padding: 24, color: "red" }}>Error loading decision: {String(err?.message || err)}</div>;
  }

  return (
    <ProtectedRoute>
      <DecisionDetailClient id={id} />
    </ProtectedRoute>
  );
}
