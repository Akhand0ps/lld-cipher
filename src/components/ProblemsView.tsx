"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  X,
  CheckCircle2,
  ShieldCheck,
  LayoutGrid,
  List,
} from "lucide-react";
import { Problem } from "@/domain/models/Problem";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProblemsViewProps {
  problems: Problem[];
  onSelectProblemAndStart?: (problem: Problem) => void;
}

export const ProblemsView: React.FC<ProblemsViewProps> = ({
  problems,
  onSelectProblemAndStart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === "OOD")
      return p.category.toLowerCase().includes("object");
    if (selectedCategory === "STATE")
      return p.category.toLowerCase().includes("state");
    if (selectedCategory === "CONCURRENCY")
      return (
        p.category.toLowerCase().includes("concurrency") ||
        p.category.toLowerCase().includes("observer")
      );

    return true;
  });

  const getProblemPatternBadges = (problem: Problem): string[] => {
    if (problem.id === "parking-lot-system") {
      return ["Strategy Pattern", "Factory Method", "Concurrency Locks"];
    }
    if (problem.id === "elevator-dispatch-system") {
      return ["State Machine", "Dispatch Algorithm", "Edge Boundary"];
    }
    if (problem.id === "in-memory-pubsub-service") {
      return ["Observer Pattern", "Producer-Consumer", "Topic Partitions"];
    }
    return [problem.category.split("&")[0].trim()];
  };

  const getDifficultyVariant = (
    diff: string
  ): "purple" | "warning" | "success" => {
    switch (diff.toUpperCase()) {
      case "ADVANCED":
        return "purple";
      case "INTERMEDIATE":
        return "warning";
      default:
        return "success";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#faf8f5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-5 sm:space-y-6">
        {/* Page Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[#e7e5e4]">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#f0eee9] text-[#57534e] border border-[#e7e5e4]">
                Deliberate LLD Rehearsal
              </span>
              <span className="text-xs text-[#a8a29e] font-mono">
                5-Dimensional Rubrics
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1c1917] font-serif">
              Design Problems
            </h1>
            <p className="text-xs sm:text-sm text-[#57534e] max-w-xl leading-relaxed">
              Select a low-level design challenge to model class contracts, declare boundaries, and test against Senior Architect diagnostic rubrics.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3 w-full md:w-auto shrink-0">
            <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white border border-[#e7e5e4] shadow-2xs text-center">
              <div className="text-sm sm:text-base font-bold font-mono text-[#1c1917]">
                {problems.length}
              </div>
              <div className="text-[9px] sm:text-[10px] font-mono text-[#78716c] uppercase">
                Challenges
              </div>
            </div>
            <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white border border-[#e7e5e4] shadow-2xs text-center">
              <div className="text-sm sm:text-base font-bold font-mono text-emerald-700">
                100 pts
              </div>
              <div className="text-[9px] sm:text-[10px] font-mono text-[#78716c] uppercase">
                Per Rubric
              </div>
            </div>
            <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white border border-[#e7e5e4] shadow-2xs text-center">
              <div className="text-sm sm:text-base font-bold font-mono text-blue-700">
                Δ Track
              </div>
              <div className="text-[9px] sm:text-[10px] font-mono text-[#78716c] uppercase">
                Multi-Attempt
              </div>
            </div>
          </div>
        </div>

        {/* Filter, Search & Layout Switcher Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segmented Category Filter */}
          <SegmentedTabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            items={[
              {
                value: "ALL",
                label: "All Problems",
              },
              {
                value: "OOD",
                label: "Object-Oriented",
              },
              {
                value: "STATE",
                label: "State Machines",
              },
              {
                value: "CONCURRENCY",
                label: "Concurrency",
              },
            ]}
          />

          {/* Right: Search Input + Grid/List View Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="h-3.5 w-3.5 text-[#78716c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problems, patterns..."
                className="pl-8.5 pr-8 py-1.5 text-xs font-mono bg-white border border-[#e7e5e4] rounded-xl text-[#1c1917] placeholder-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-[#1c1917] focus:border-[#1c1917] w-full shadow-2xs transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-[#a8a29e] hover:text-[#1c1917] transition cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Switcher (Grid vs Dense List) */}
            <div className="flex items-center p-0.5 rounded-lg bg-[#f0eee9] border border-[#e7e5e4] shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-md transition cursor-pointer",
                  viewMode === "grid"
                    ? "bg-white text-[#1c1917] shadow-2xs"
                    : "text-[#78716c] hover:text-[#1c1917]"
                )}
                title="Grid Cards View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-md transition cursor-pointer",
                  viewMode === "list"
                    ? "bg-white text-[#1c1917] shadow-2xs"
                    : "text-[#78716c] hover:text-[#1c1917]"
                )}
                title="Compact List View"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* LIST VIEW (Ultra-Compact LeetCode / Linear Style) */}
        {viewMode === "list" ? (
          <div className="bg-white border border-[#e7e5e4] rounded-xl overflow-hidden divide-y divide-[#f0eee9] shadow-2xs">
            {/* Header row */}
            <div className="hidden sm:flex items-center justify-between px-4 py-2 bg-[#faf8f5] text-[10px] font-mono text-[#78716c] uppercase tracking-wider border-b border-[#e7e5e4]">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="w-7 text-center">#</span>
                <span className="flex-1">Challenge & Architecture</span>
              </div>
              <div className="flex items-center gap-4 text-right shrink-0">
                <span className="w-20 text-center">Difficulty</span>
                <span className="w-40 text-left hidden lg:inline">Patterns</span>
                <span className="w-28 text-center hidden md:inline">Requirements</span>
                <span className="w-16 text-right">Action</span>
              </div>
            </div>

            {filteredProblems.map((problem, idx) => {
              const patterns = getProblemPatternBadges(problem);
              return (
                <Link
                  key={problem.id}
                  href={`/problems/${problem.id}`}
                  onClick={() => onSelectProblemAndStart?.(problem)}
                  className="group flex items-center justify-between gap-3 px-3.5 py-2.5 sm:px-4 sm:py-2.5 hover:bg-[#faf8f5] transition-colors cursor-pointer"
                >
                  {/* Left: Index + Title + Tagline */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="font-mono text-xs font-bold text-[#a8a29e] w-7 text-center shrink-0">
                      #{String(idx + 1).padStart(2, "0")}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-[#1c1917] group-hover:text-black group-hover:underline truncate">
                          {problem.title}
                        </span>
                        <span className="sm:hidden shrink-0">
                          <Badge variant={getDifficultyVariant(problem.difficulty)} className="text-[9px] px-1.5 py-0">
                            {problem.difficulty}
                          </Badge>
                        </span>
                      </div>
                      <p className="text-[11px] text-[#78716c] truncate max-w-lg hidden sm:block">
                        {problem.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Right: Difficulty + Patterns + Reqs + Solve */}
                  <div className="flex items-center gap-4 text-right shrink-0">
                    <div className="w-20 hidden sm:flex justify-center shrink-0">
                      <Badge variant={getDifficultyVariant(problem.difficulty)} className="text-[10px] px-2 py-0.5">
                        {problem.difficulty}
                      </Badge>
                    </div>

                    <div className="w-40 text-left hidden lg:flex items-center gap-1 shrink-0 overflow-hidden">
                      {patterns.slice(0, 2).map((pat) => (
                        <span
                          key={pat}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f0eee9] text-[#57534e] truncate max-w-[85px]"
                        >
                          {pat}
                        </span>
                      ))}
                      {patterns.length > 2 && (
                        <span className="text-[10px] font-mono text-[#a8a29e]">
                          +{patterns.length - 2}
                        </span>
                      )}
                    </div>

                    <div className="w-28 text-center hidden md:flex items-center justify-center gap-1 text-[10px] font-mono text-[#78716c] shrink-0">
                      <span>{problem.functionalRequirements.length} reqs</span>
                      <span>•</span>
                      <span>{problem.nonFunctionalConstraints.length} inv</span>
                    </div>

                    <div className="w-16 flex justify-end shrink-0">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#faf8f5] group-hover:bg-[#1c1917] text-[#1c1917] group-hover:text-[#faf8f5] text-xs font-semibold border border-[#e7e5e4] transition-all shadow-2xs">
                        <span>Solve</span>
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* GRID VIEW (Compact Bento Cards) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredProblems.map((problem, idx) => {
              const patterns = getProblemPatternBadges(problem);
              return (
                <Link
                  key={problem.id}
                  href={`/problems/${problem.id}`}
                  onClick={() => onSelectProblemAndStart?.(problem)}
                  className="group relative flex flex-col justify-between p-3.5 sm:p-4 bg-white hover:bg-white border border-[#e7e5e4] hover:border-[#1c1917] rounded-xl shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#faf8f5] border border-[#e7e5e4] text-[#78716c]">
                          #{String(idx + 1).padStart(2, "0")}
                        </span>
                        <Badge variant={getDifficultyVariant(problem.difficulty)}>
                          {problem.difficulty}
                        </Badge>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-[#a8a29e] group-hover:text-[#1c1917] group-hover:translate-x-0.5 transition-all" />
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-xs sm:text-sm font-bold text-[#1c1917] font-serif group-hover:text-black line-clamp-1 transition-colors">
                        {problem.title}
                      </h2>
                      <p className="text-[11px] sm:text-xs text-[#57534e] line-clamp-2 leading-relaxed">
                        {problem.tagline}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                      {patterns.slice(0, 2).map((pat) => (
                        <span
                          key={pat}
                          className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#faf8f5] border border-[#e7e5e4] text-[#44403c] truncate max-w-[130px]"
                        >
                          {pat}
                        </span>
                      ))}
                      {patterns.length > 2 && (
                        <span className="text-[10px] font-mono text-[#a8a29e] px-0.5">
                          +{patterns.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#f0eee9] flex items-center justify-between text-[10px] font-mono text-[#78716c]">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      <span>{problem.functionalRequirements.length} reqs</span>
                    </span>
                    <span className="flex items-center gap-1 text-blue-700">
                      <ShieldCheck className="h-3 w-3 shrink-0" />
                      <span>{problem.nonFunctionalConstraints.length} inv</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredProblems.length === 0 && (
          <div className="py-14 text-center bg-white border border-[#e7e5e4] rounded-xl p-8 space-y-3">
            <div className="h-9 w-9 mx-auto rounded-full bg-[#faf8f5] border border-[#e7e5e4] flex items-center justify-center text-[#78716c]">
              <Search className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-[#1c1917] font-serif">
              No matching design problems found
            </h3>
            <p className="text-xs text-[#78716c] max-w-sm mx-auto">
              No challenges matched your query &quot;{searchQuery}&quot;. Try searching for other keywords like &quot;parking&quot;, &quot;elevator&quot;, or &quot;pubsub&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
              }}
              className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#e7e5e4] text-xs font-medium text-[#1c1917] hover:bg-[#faf8f5] transition cursor-pointer"
            >
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
