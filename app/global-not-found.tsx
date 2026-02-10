import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "404 - Cadence",
  description: "The page you are looking for does not exist.",
};

/**
 * Global 404: used for unmatched URLs. Does NOT use the root layout,
 * so Firebase is never loaded during build (fixes auth/invalid-api-key prerender error).
 */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
          <p className="text-foreground-muted mb-6">The page you are looking for does not exist.</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-accent-blue px-4 py-2 text-white font-medium hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </body>
    </html>
  );
}
