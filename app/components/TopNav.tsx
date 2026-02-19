"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/app/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import Button from "./ui/Button";
import NavLink from "./NavLink";

const NAV_ITEMS = [
  { href: "/", label: "Home", primary: false, iconPath: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/new-decision", label: "Start a new cadence", primary: true, iconPath: "M13 10V3L4 14h7v7l9-11h-7z" },
  { href: "/dashboard", label: "Dashboard", primary: false, iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { href: "/history", label: "History", primary: false, iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/feedback", label: "Suggest an improvement", primary: false, iconPath: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
];

function NavIcon({ path }: { path: string }) {
  return (
    <svg className="size-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  );
}

export default function TopNav() {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!menuOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [menuOpen]);

  async function handleSignOut() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c3ffbf4b-2e94-4f0e-98bd-ef087cba20e6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TopNav.tsx:handleSignOut:start',message:'Sign out clicked',data:{},hypothesisId:'signout',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    try {
      await signOut(auth);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c3ffbf4b-2e94-4f0e-98bd-ef087cba20e6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TopNav.tsx:handleSignOut:success',message:'signOut completed',data:{},hypothesisId:'signout',timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      // Do NOT router.push("/login") - auth state hasn't propagated yet. ProtectedRoute will redirect when user becomes null.
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c3ffbf4b-2e94-4f0e-98bd-ef087cba20e6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TopNav.tsx:handleSignOut:error',message:'signOut threw',data:{msg:(err as Error).message},hypothesisId:'signout',timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      console.error("Sign out error", err);
    }
  }

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="w-full border-b border-border bg-surface" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-lg text-foreground hover:opacity-80 transition-opacity"
              aria-label="Cadence home"
            >
              <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Cadence</span>
            </Link>
          </div>

          <div className="flex-1 md:hidden" aria-hidden="true" />

          <div className="hidden md:flex flex-wrap items-center gap-1 flex-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={<NavIcon path={item.iconPath} />}
                isActive={isActive(item.href)}
                primary={item.primary}
              />
            ))}
          </div>

          {/* User Menu (desktop: always; mobile: only when not logged in, so Sign In shows) */}
          <div className={`flex items-center gap-3 ${user ? "hidden md:flex" : ""}`}>
            {loading ? (
              <span className="text-sm text-foreground-muted">Loading...</span>
            ) : user ? (
              <>
                <span className="text-sm text-foreground-muted hidden sm:inline" aria-label={`Signed in as ${user.email}`}>
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
                  aria-label="Sign out"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link href="/login">
                <Button size="small" variant="secondary">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Hamburger (mobile only, rightmost) */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="p-2 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            id="mobile-nav-menu"
            className="md:hidden border-t border-border bg-surface py-2"
            role="navigation"
            aria-label="Main menu"
          >
            <ul className="flex flex-col px-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    label={item.href === "/new-decision" ? "Start A New Cadence" : item.label}
                    icon={<NavIcon path={item.iconPath} />}
                    isActive={isActive(item.href)}
                    primary={item.primary}
                    mobile
                    onClick={() => setMenuOpen(false)}
                  />
                </li>
              ))}
              {user && (
                <li className="border-t border-border mt-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center gap-3 px-3 py-3 w-full rounded-md text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-surface transition-colors min-h-[44px]"
                    aria-label="Sign out"
                  >
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
