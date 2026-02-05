import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-semibold">Welcome to Cadence</h1>
      </div>
    </ProtectedRoute>
  );
}
