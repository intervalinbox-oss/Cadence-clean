"use client";

import { useEffect, useState } from "react";
import { auth } from "@/app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SignOutButton from "./SignOutButton";

export default function Header() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

 

  return (
    <header style={{ padding: 12, borderBottom: "1px solid #eee", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Link href="/">
            <strong>Cadence</strong>
          </Link>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/new-decision">New Decision</Link>
          <Link href="/history">History</Link>

          {loading ? (
            <span>Checking session...</span>
          ) : user ? (
            <>
              <span style={{ fontSize: 14 }}>{user.email || user.uid}</span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login">Sign In</Link>
              <Link href="/signup">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
