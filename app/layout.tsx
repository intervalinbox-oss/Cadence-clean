import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Prevent static prerender so Firebase SDK is never loaded during build (avoids auth/invalid-api-key)
export const dynamic = "force-dynamic";

const AppShell = dynamic(() => import("./AppShell"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 border-b border-border bg-surface flex items-center px-4">
        <span className="font-semibold text-lg text-foreground">Cadence</span>
      </header>
      <main className="min-h-[calc(100vh-4rem)] flex-1">{null}</main>
    </div>
  ),
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cadence - Communication Decision Engine",
  description: "Know when to meet, message, or email. AI-powered communication recommendations for executives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
