"use client";

import { useEffect, useState } from "react";
import { getAuthInstance } from "@/app/lib/firebase";
import {
  signInWithRetry,
  sendPasswordResetWithRetry,
  getAuthErrorMessage,
} from "@/app/lib/authHelpers";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/providers/AuthProvider";
import { useGoogleSignIn } from "@/app/hooks/useGoogleSignIn";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || "/";
  const { user, loading: authLoading } = useAuth();
  const { handleGoogle, googleLoading } = useGoogleSignIn({
    router,
    next,
    setError,
    onClear: () => {
      setValidation(null);
      setResetEmailSent(false);
    },
  });

  useEffect(() => {
    if (!authLoading && user) {
      router.push(next);
    }
  }, [authLoading, user, router, next]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setValidation(null);
    setResetEmailSent(false);

    if (!email.trim()) {
      return setValidation("Email is required");
    }
    if (!password) {
      return setValidation("Password is required");
    }

    setLoading(true);
    try {
      await signInWithRetry(getAuthInstance(), email.trim(), password);
      // Don't navigate here - let the useEffect redirect when auth state propagates.
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code;
      const fallback = (err as { message?: string })?.message || "Login failed. Please try again.";
      setError(getAuthErrorMessage(errorCode, fallback, "login"));
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset(e: React.MouseEvent) {
    e.preventDefault();
    setError(null);
    setValidation(null);
    setResetEmailSent(false);

    if (!email.trim()) {
      return setValidation("Please enter your email address first");
    }

    try {
      await sendPasswordResetWithRetry(getAuthInstance(), email.trim());
      setResetEmailSent(true);
      setError(null);
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code;
      const fallback = (err as { message?: string })?.message || "Failed to send reset email.";
      setError(getAuthErrorMessage(errorCode, fallback, "reset"));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Sign In</h1>
          <p className="text-foreground-muted">Welcome back to Cadence</p>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-sm p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              error={validation && !email.trim() ? validation : undefined}
              autoComplete="email"
            />

            <div className="space-y-2">
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                error={validation && !password ? validation : undefined}
                autoComplete="current-password"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-sm text-accent-blue hover:text-accent-cyan transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 rounded"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {resetEmailSent && (
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-sm text-foreground" role="status">
                Password reset email sent! Check your inbox and follow the instructions.
              </div>
            )}

            {validation && !resetEmailSent && (
              <p className="text-sm text-warning" role="alert">
                {validation}
              </p>
            )}

            {error && (
              <p className="text-sm text-error" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-foreground-muted">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleGoogle}
            disabled={googleLoading}
          >
            {googleLoading ? "Connecting..." : "Sign in with Google"}
          </Button>

          <p className="text-xs text-foreground-muted text-center">
            If Google fails: add <code className="bg-surface px-1 rounded">{typeof window !== "undefined" ? window.location.origin : ""}</code> to Google Cloud → Credentials → OAuth Client → Authorized JavaScript origins
          </p>

          <div className="text-center text-sm text-foreground-muted">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-accent-blue hover:text-accent-cyan font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 rounded"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
