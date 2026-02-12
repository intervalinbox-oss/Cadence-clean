"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FloatingQuickButton() {
  const pathname = usePathname();

  // Don't show on new-decision pages
  if (pathname?.startsWith("/new-decision")) return null;

  return (
    <Link
      href="/new-decision"
      className="fixed bottom-6 right-6 z-50 rounded-full bg-accent-blue text-white p-4 shadow-lg hover:scale-110 transition-transform hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2"
      aria-label="Start a quick decision"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </Link>
  );
}
