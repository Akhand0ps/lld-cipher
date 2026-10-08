import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./highlighters.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LLD Studio | Diagnostic Low-Level Design Practice Platform",
  description: "Practice object-oriented low-level design with structured rubric evaluation, progression tracking, and senior architect diagnostics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full bg-[#faf8f5] text-[#1c1917] font-sans selection:bg-[#1c1917] selection:text-[#faf8f5]`}>
        {children}
      </body>
    </html>
  );
}
