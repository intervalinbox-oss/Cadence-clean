"use client";

import { useEffect, useState } from "react";
import { auth } from "@/app/lib/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/providers/AuthProvider";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || "/";
  const { user, loading: authLoading } = useAuth();

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
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push(next);
    } catch (err: any) {
      const errorCode = err.code;
      let errorMessage = "Login failed. Please try again.";
      
      if (errorCode === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (errorCode === "auth/wrong-password") {
        errorMessage = "Incorrect password. Try again or reset your password.";
      } else if (errorCode === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (errorCode === "auth/user-disabled") {
        errorMessage = "This account has been disabled.";
      } else if (errorCode === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later or reset your password.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setValidation(null);
    setResetEmailSent(false);
    setGoogleLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push(next);
    } catch (err: any) {
      const errorCode = err.code;
      let errorMessage = "Google sign-in failed.";
      
      if (errorCode === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in popup was closed. Please try again.";
      } else if (errorCode === "auth/popup-blocked") {
        errorMessage = "Popup was blocked by your browser. Please allow popups and try again.";
      } else if (errorCode === "auth/invalid-credential") {
        errorMessage = "Google sign-in is not properly configured. Please contact support or use email/password login.";
      } else if (errorCode === "auth/account-exists-with-different-credential") {
        errorMessage = "An account already exists with this email. Please sign in with email/password.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
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
      await sendPasswordResetEmail(auth, email.trim());
      setResetEmailSent(true);
      setError(null);
    } catch (err: any) {
      const errorCode = err.code;
      let errorMessage = "Failed to send reset email.";
      
      if (errorCode === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (errorCode === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
              <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-lg text-sm text-secondary-800">
                Password reset email sent! Check your inbox and follow the instructions.
              </div>
            )}

            {validation && !resetEmailSent && (
              <p className="text-sm text-orange-600" role="alert">
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
