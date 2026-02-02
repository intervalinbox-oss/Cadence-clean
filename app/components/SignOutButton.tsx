"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Sign out failed", err);
    }
  }

  return (
    <button onClick={handleSignOut} style={{ marginLeft: 8 }}>
      Sign Out
    </button>
  );
}
