"use client";

import React from "react";
import Link from "next/link";

type NavLinkProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  primary?: boolean;
  mobile?: boolean;
  onClick?: () => void;
};

export default function NavLink({ href, label, icon, isActive, primary, mobile, onClick }: NavLinkProps) {
  const baseClass = "flex items-center rounded-md text-sm font-medium transition-colors";
  const desktopClass = mobile ? "gap-3 px-3 py-3 min-h-[44px]" : "gap-1.5 px-3 py-2";
  const iconSize = mobile ? "w-5 h-5 shrink-0" : "w-4 h-4";
  const activeClass = primary && isActive
    ? "bg-accent-blue text-white"
    : isActive
      ? "bg-accent-blue/10 text-accent-blue"
      : "text-foreground-muted hover:text-foreground hover:bg-surface";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${baseClass} ${desktopClass} ${activeClass}`}
      aria-current={isActive ? "page" : undefined}
    >
      <span className={iconSize}>{icon}</span>
      {label}
    </Link>
  );
}
