import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DecisionDetailClient from "./DecisionDetailClient";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  if (!id) {
    return <div style={{ padding: 24, color: "red" }}>Invalid decision id</div>;
  }

  // Load decision in the client so Firestore read runs with the user's auth token.
  // Server-side getDoc would run without auth and hit "Missing or insufficient permissions".
  return (
    <ProtectedRoute>
      <DecisionDetailClient id={id} />
    </ProtectedRoute>
  );
}
