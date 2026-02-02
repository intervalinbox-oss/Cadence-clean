"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/app/lib/firebase";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function TopNav() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  async function handleSignOut() {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Sign out error", err);
    }
  }

  return (
    <nav className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold">Cadence</Link>
          <Link href="/new-decision" className="text-sm text-gray-600 hover:text-gray-900">New Decision</Link>
          <Link href="/history" className="text-sm text-gray-600 hover:text-gray-900">History</Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-700">{user.email}</span>
              <button onClick={handleSignOut} className="px-3 py-1 text-sm bg-gray-100 rounded">Sign Out</button>
            </>
          ) : (
            <Link href="/login" className="px-3 py-1 text-sm bg-gray-100 rounded">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
