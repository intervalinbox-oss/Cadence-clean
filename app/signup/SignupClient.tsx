"use client";

import { useEffect, useRef, useState } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/providers/AuthProvider";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";

export default function SignupClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || "/dashboard";
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push(next);
    }
  }, [authLoading, user, router, next]);

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          router.push(next);
        }
      })
      .catch(() => {});
  }, [router, next]);

  useEffect(() => {
    return () => {
      if (googleTimeoutRef.current) clearTimeout(googleTimeoutRef.current);
    };
  }, []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setValidation(null);

    if (!email.trim()) {
      return setValidation("Email is required");
    }
    if (!password) {
      return setValidation("Password is required");
    }
    if (password.length < 6) {
      return setValidation("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      router.push(next);
    } catch (err: any) {
      const errorCode = err.code;
      let errorMessage = "Sign up failed. Please try again.";
      
      if (errorCode === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (errorCode === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (errorCode === "auth/weak-password") {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (errorCode === "auth/operation-not-allowed") {
        errorMessage = "Email/password accounts are not enabled. Please contact support.";
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
    setGoogleLoading(true);

    googleTimeoutRef.current = setTimeout(() => {
      setGoogleLoading(false);
      setError(
        "Sign-in did not redirect. Add this site's domain in Firebase Console → Authentication → Settings → Authorized domains, then try again."
      );
      googleTimeoutRef.current = null;
    }, 4000);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      if (googleTimeoutRef.current) {
        clearTimeout(googleTimeoutRef.current);
        googleTimeoutRef.current = null;
      }
      const errorCode = err.code;
      let errorMessage = "Google sign-in failed.";
      
      if (errorCode === "auth/unauthorized-domain") {
        errorMessage =
          "This domain is not authorized. Add it in Firebase Console → Authentication → Settings → Authorized domains.";
      } else if (errorCode === "auth/popup-blocked") {
        errorMessage = "Sign-in was blocked. Please try again.";
      } else if (errorCode === "auth/invalid-credential") {
        errorMessage = "Google sign-in is not properly configured. Please contact support or use email/password sign up.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      if (googleTimeoutRef.current) {
        clearTimeout(googleTimeoutRef.current);
        googleTimeoutRef.current = null;
      }
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-foreground-muted">Get started with Cadence</p>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-sm p-8 space-y-6">
          <form onSubmit={handleSignup} className="space-y-4">
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

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              error={validation && (!password || password.length < 6) ? validation : undefined}
              autoComplete="new-password"
              helperText="Must be at least 6 characters"
            />

            {validation && (
              <p className="text-sm text-warning" role="alert">
                {validation}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
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

          {error && (
            <p className="text-sm text-error text-center -mt-2" role="alert">
              {error}
            </p>
          )}

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleGoogle}
            disabled={googleLoading}
          >
            {googleLoading ? "Connecting..." : "Sign up with Google"}
          </Button>

          <div className="text-center text-sm text-foreground-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-accent-blue hover:text-accent-cyan font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 rounded"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
