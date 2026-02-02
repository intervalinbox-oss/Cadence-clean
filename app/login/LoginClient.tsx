"use client";

import { useEffect, useState } from "react";
import { auth } from "@/app/lib/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || "/";
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push(next);
    }
  }, [loading, user, router, next]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setValidation(null);

    if (!email) return setValidation("Email is required");
    if (!password) return setValidation("Password is required");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push(next);
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  }

  async function handleGoogle() {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push(next);
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 20 }}>Login</h1>

      <form
        onSubmit={handleLogin}
        style={{ display: "flex", flexDirection: "column", width: 340, gap: 12 }}
      >
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        {validation && <p style={{ color: "orange" }}>{validation}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" style={{ padding: 10, cursor: "pointer" }}>
          Login
        </button>
      </form>

      <div style={{ marginTop: 16 }}>
        <button onClick={handleGoogle} style={{ padding: 8, cursor: "pointer" }}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
