"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Highlighter, HighlightBlock } from "./Highlighter";

interface LandingHeroProps {
  onOpenDocs?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onOpenDocs }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#faf8f5] flex flex-col justify-center">
      {/* Centered Hero Block */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-20 my-auto w-full text-center">
        <div className="space-y-5 sm:space-y-8">
          {/* Main Headline */}
          <h1 className="text-2xl sm:text-5xl font-bold tracking-tight text-[#1c1917] leading-[1.3] sm:leading-[1.2] max-w-xl mx-auto font-serif">
            Low-Level Design practice has a{" "}
            <Highlighter variant="yellow">feedback problem</Highlighter>.
          </h1>

          {/* Developer-native Monospace Paragraph */}
          <div className="space-y-4 sm:space-y-5 max-w-xl mx-auto text-center">
            <p className="text-xs sm:text-base text-[#57534e] leading-relaxed font-mono">
              Two valid designs can look completely different. Most engineers prepare by reading static blogs—unaware if their solutions introduce{" "}
              <Highlighter variant="yellow">God Objects</Highlighter>,{" "}
              <Highlighter variant="yellow">tight coupling</Highlighter>, or{" "}
              <Highlighter variant="yellow">race conditions</Highlighter>.
            </p>

            {/* Blue Highlighter Callout Block matching reference typography */}
            <HighlightBlock variant="blue" className="max-w-lg mx-auto text-center shadow-xs">
              <span className="text-[#1e3a8a] font-medium text-xs sm:text-sm">
                Objective rubric grading, verbatim evidence citations, & multi-attempt progression tracking.
              </span>
            </HighlightBlock>

            {/* Editorial Serif Accent */}
            <p className="font-serif italic text-xs sm:text-sm text-[#78716c] pt-0.5 text-center">
              Class contracts over buzzwords. Measure every iteration.
            </p>
          </div>

          {/* Action Links with Balanced Mobile Layout */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 max-w-xs sm:max-w-none mx-auto w-full">
            <Link
              href="/problems"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1c1917] text-[#faf8f5] text-xs font-semibold hover:bg-black transition cursor-pointer shadow-xs active:scale-95"
            >
              <span>Browse Problems</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            {onOpenDocs ? (
              <button
                type="button"
                onClick={onOpenDocs}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#e7e5e4] bg-white text-[#1c1917] hover:bg-[#f0eee9] text-xs font-medium transition cursor-pointer shadow-2xs active:scale-95"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#78716c]" />
                <span>Architecture Notes & Rubric</span>
              </button>
            ) : (
              <Link
                href="/problems/parking-lot-system"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#e7e5e4] bg-white text-[#1c1917] hover:bg-[#f0eee9] text-xs font-medium transition cursor-pointer shadow-2xs active:scale-95"
              >
                <span>Launch Parking Lot Challenge</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#78716c]" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
