"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Flame,
  GraduationCap,
  ArrowLeft,
  ChevronDown,
  BookOpen,
  SlidersHorizontal,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { Problem } from "@/domain/models/Problem";
import { SEED_PROBLEMS } from "@/domain/repositories/ProblemRepository";
import { StudioOnboardingModal } from "./StudioOnboardingModal";
import { DocsDrawerModal } from "./DocsDrawerModal";
import { cn } from "@/lib/utils";

interface HeaderProps {
  problems?: Problem[];
  activeProblem?: Problem | null;
  tone?: "MENTOR" | "ROAST";
  onToggleTone?: (tone: "MENTOR" | "ROAST") => void;
  submissionCount?: number;
  onOpenDocs?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  problems = SEED_PROBLEMS,
  activeProblem,
  tone = "MENTOR",
  onToggleTone,
  submissionCount = 0,
  onOpenDocs,
}) => {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [internalDocsOpen, setInternalDocsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Natural first-time onboarding: Automatically open modal if not completed yet
  useEffect(() => {
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem("lld_onboarding_completed");
      if (!completed) {
        const timer = setTimeout(() => {
          setIsOnboardingOpen(true);
        }, 350);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isStudio = pathname.startsWith("/problems/") && pathname !== "/problems";
  const isProblemsList = pathname === "/problems";
  const isOverview = pathname === "/";

  const handleOpenDocs = () => {
    if (onOpenDocs) {
      onOpenDocs();
    } else {
      setInternalDocsOpen(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#e7e5e4] bg-[#faf8f5]/95 backdrop-blur-md px-2.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-4 select-none">
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-6 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer group shrink-0"
            title="LLD Studio Home"
          >
            <div className="h-7 w-7 rounded-lg bg-[#1c1917] text-[#faf8f5] flex items-center justify-center font-bold text-xs tracking-tighter shadow-2xs group-hover:scale-105 transition-transform">
              LS
            </div>
            {/* In Studio mode, hide "LLD Studio" text on mobile so Problem dropdown has plenty of space */}
            <div className={cn("items-center gap-1.5", isStudio ? "hidden sm:flex" : "flex")}>
              <span className="font-semibold text-sm tracking-tight text-[#1c1917] font-serif">
                LLD Studio
              </span>
              <span className="hidden md:inline-flex text-[9px] font-mono uppercase font-semibold px-1.5 py-0.5 rounded bg-[#f0eee9] text-[#78716c] border border-[#e7e5e4]">
                v1.0
              </span>
            </div>
          </Link>

          {isStudio ? (
            <div className="flex items-center gap-1 sm:gap-3 pl-1 sm:pl-3 border-l border-[#e7e5e4] min-w-0 flex-1">
              <Link
                href="/problems"
                className="flex items-center gap-1 text-xs text-[#78716c] hover:text-[#1c1917] transition cursor-pointer font-medium shrink-0 p-1 rounded-md hover:bg-[#efece6]"
                title="Back to all problems"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Problems</span>
              </Link>

              {/* Styled Problem Dropdown Selector - Expanded so title is never cut off */}
              <div className="relative inline-flex items-center flex-1 min-w-[125px] max-w-[175px] xs:max-w-[210px] sm:max-w-[240px] md:max-w-xs">
                <select
                  value={activeProblem?.id || ""}
                  onChange={(e) => {
                    const targetId = e.target.value;
                    if (targetId) router.push(`/problems/${targetId}`);
                  }}
                  className="w-full appearance-none bg-[#f0eee9] hover:bg-white border border-[#e7e5e4] hover:border-[#1c1917]/30 text-xs text-[#1c1917] font-medium rounded-lg pl-2 pr-6 py-1 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1c1917] transition cursor-pointer truncate shadow-2xs"
                >
                  {problems.map((p, idx) => (
                    <option key={p.id} value={p.id}>
                      #{idx + 1} {p.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 sm:right-2 h-3.5 w-3.5 text-[#78716c] pointer-events-none" />
              </div>
            </div>
          ) : (
            /* Desktop-only Navigation Links (Hidden on mobile to prevent clutter & overlap) */
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium">
              <Link
                href="/"
                className={cn(
                  "px-2.5 py-1 rounded-md transition cursor-pointer",
                  isOverview
                    ? "bg-[#efece6] text-[#1c1917] font-semibold"
                    : "text-[#78716c] hover:text-[#1c1917] hover:bg-[#f5f3ef]"
                )}
              >
                Overview
              </Link>
              <Link
                href="/problems"
                className={cn(
                  "px-2.5 py-1 rounded-md transition cursor-pointer",
                  isProblemsList
                    ? "bg-[#efece6] text-[#1c1917] font-semibold"
                    : "text-[#78716c] hover:text-[#1c1917] hover:bg-[#f5f3ef]"
                )}
              >
                Catalog
              </Link>
              <button
                type="button"
                onClick={handleOpenDocs}
                className="px-2.5 py-1 rounded-md text-[#78716c] hover:text-[#1c1917] hover:bg-[#f5f3ef] transition cursor-pointer flex items-center gap-1.5"
                title="View Research & Architecture Notes"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#78716c]" />
                <span>Architecture Notes</span>
              </button>
            </nav>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {isStudio ? (
            <>
              {/* Attempt Count Tag (Desktop only) */}
              {submissionCount > 0 && (
                <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold px-2 py-1 rounded-md bg-[#efece6] border border-[#e7e5e4] text-[#57534e]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Attempt #{String(submissionCount + 1).padStart(2, "0")}
                </span>
              )}

              {/* Tone Persona Switcher */}
              {onToggleTone && (
                <div className="flex items-center bg-[#f0eee9] p-0.5 rounded-lg border border-[#e7e5e4]">
                  <button
                    onClick={() => onToggleTone("MENTOR")}
                    className={cn(
                      "flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer",
                      tone === "MENTOR"
                        ? "bg-white text-[#1c1917] shadow-2xs font-semibold"
                        : "text-[#78716c] hover:text-[#1c1917]"
                    )}
                    title="Constructive architectural critique"
                  >
                    <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                    <span className="hidden sm:inline">Mentor</span>
                  </button>
                  <button
                    onClick={() => onToggleTone("ROAST")}
                    className={cn(
                      "flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer",
                      tone === "ROAST"
                        ? "bg-[#c2410c] text-white shadow-2xs font-semibold"
                        : "text-[#78716c] hover:text-[#1c1917]"
                    )}
                    title="Sarcastic senior engineer critique"
                  >
                    <Flame className="h-3.5 w-3.5 text-orange-400" />
                    <span className="hidden sm:inline">Roast</span>
                  </button>
                </div>
              )}

              {/* Specs & Rubric Trigger */}
              <button
                type="button"
                onClick={handleOpenDocs}
                className="p-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-[#e7e5e4] bg-white hover:bg-[#f0eee9] text-xs font-medium text-[#1c1917] transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                title="View Problem Specifications & Grading Rubric"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#78716c]" />
                <span className="hidden md:inline">Specs & Rubric</span>
              </button>

              {/* Calibration Preferences Button */}
              <button
                type="button"
                onClick={() => setIsOnboardingOpen(true)}
                className="p-1 sm:p-1.5 rounded-lg border border-[#e7e5e4] bg-white hover:bg-[#f0eee9] text-[#78716c] hover:text-[#1c1917] transition cursor-pointer shadow-2xs"
                title="Studio Calibration & Onboarding"
                aria-label="Studio Calibration"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="hidden lg:inline-flex text-[11px] font-mono text-[#78716c] mr-1">
                {problems.length} Challenges
              </span>

              {/* Desktop Calibration Preferences Button */}
              <button
                type="button"
                onClick={() => setIsOnboardingOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#e7e5e4] bg-white hover:bg-[#f0eee9] text-xs font-medium text-[#78716c] hover:text-[#1c1917] transition cursor-pointer shadow-2xs"
                title="Studio Calibration Preferences"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Calibration</span>
              </button>

              {/* Open Studio CTA */}
              <Link
                href="/problems/parking-lot-system"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#1c1917] text-[#faf8f5] text-xs font-semibold hover:bg-black transition cursor-pointer shadow-xs active:scale-95 shrink-0"
              >
                <span>Open Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              {/* Mobile Hamburger Menu Toggle (< md) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-lg border border-[#e7e5e4] bg-white hover:bg-[#f0eee9] text-[#1c1917] transition cursor-pointer shadow-2xs"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Drawer Navigation (Only rendered when hamburger menu is toggled) */}
      {mobileMenuOpen && !isStudio && (
        <div className="md:hidden border-b border-[#e7e5e4] bg-[#faf8f5] px-4 py-3 space-y-1.5 shadow-md animate-in slide-in-from-top-2 duration-150 select-none">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer",
              isOverview
                ? "bg-[#1c1917] text-[#faf8f5] font-semibold"
                : "text-[#1c1917] hover:bg-[#efece6]"
            )}
          >
            <span>Overview</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-60" />
          </Link>
          <Link
            href="/problems"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer",
              isProblemsList
                ? "bg-[#1c1917] text-[#faf8f5] font-semibold"
                : "text-[#1c1917] hover:bg-[#efece6]"
            )}
          >
            <span>Problems Catalog ({problems.length})</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-60" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              handleOpenDocs();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#1c1917] hover:bg-[#efece6] transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-[#78716c]" />
              <span>Architecture Notes & Rubric</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 opacity-60" />
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setIsOnboardingOpen(true);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#1c1917] hover:bg-[#efece6] transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#78716c]" />
              <span>Studio Calibration & Setup</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 opacity-60" />
          </button>
        </div>
      )}

      {/* Global Onboarding Calibration Modal */}
      <StudioOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSelectTone={onToggleTone}
      />

      {/* Global Specs & Architecture Notes Modal (Fallback if not externally controlled) */}
      {!onOpenDocs && (
        <DocsDrawerModal
          isOpen={internalDocsOpen}
          onClose={() => setInternalDocsOpen(false)}
        />
      )}
    </>
  );
};
