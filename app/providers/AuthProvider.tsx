"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { auth } from "@/app/lib/firebase";

type AuthContextValue = {
  user: any | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Process Google OAuth redirect result (when returning from signInWithRedirect)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/c3ffbf4b-2e94-4f0e-98bd-ef087cba20e6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthProvider.tsx:getRedirectResult',message:'Redirect result received',data:{uid:result.user.uid?.slice(0,8)},hypothesisId:'redirect',timestamp:Date.now()})}).catch(()=>{});
          // #endregion
        }
      })
      .catch((err) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c3ffbf4b-2e94-4f0e-98bd-ef087cba20e6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthProvider.tsx:getRedirectResult:error',message:'Redirect result error',data:{code:(err as {code?:string})?.code,msg:(err as Error)?.message},hypothesisId:'redirect',timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      });

    const unsub = onAuthStateChanged(auth, (u) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c3ffbf4b-2e94-4f0e-98bd-ef087cba20e6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthProvider.tsx:onAuthStateChanged',message:'Auth state changed',data:{hasUser:!!u,uid:u?.uid?.slice(0,8)},hypothesisId:'H2,H5',timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;
