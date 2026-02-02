"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";

export default function LogoutButton() {
  return (
    <button
      onClick={() => {
        signOut(auth).catch((err) => console.error("Sign out failed", err));
      }}
    >
      Logout
    </button>
  );
}
