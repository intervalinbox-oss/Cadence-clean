"use client";

import { useEffect, useState } from "react";
import { auth } from "@/app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        const next = pathname || "/";
        router.replace(`/login?next=${encodeURIComponent(next)}`);
      } else {
        setUser(firebaseUser);
      }
      setLoading(false);
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (loading)
    return (
      <div style={{ padding: 24 }}>
        <div>Loading...</div>
      </div>
    );
  if (!user) return null;

  return <>{children}</>;
}

