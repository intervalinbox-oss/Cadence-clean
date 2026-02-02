import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div style={{ padding: 24 }}>
        <h1>Dashboard — Protected</h1>

        <section style={{ marginTop: 16 }}>
          <h2>Metrics (placeholder)</h2>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ padding: 12, border: "1px solid #ddd" }}>
              <strong>Decisions</strong>
              <div>42</div>
            </div>
            <div style={{ padding: 12, border: "1px solid #ddd" }}>
              <strong>Active Users</strong>
              <div>7</div>
            </div>
          </div>
        </section>

        <p style={{ marginTop: 16 }}>
          TODO: add analytics components and Firestore-backed metrics.
        </p>
      </div>
    </ProtectedRoute>
  );
}
