"use client";

import React, { useState } from "react";
import { ArrowRight, Search, Code2, Layers, CheckCircle } from "lucide-react";
import { Problem } from "@/domain/models/Problem";

interface LandingViewProps {
  problems: Problem[];
  onSelectProblemAndStart: (problem: Problem) => void;
  onNavigateToStudio: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  problems,
  onSelectProblemAndStart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "ALL", label: "All Problems" },
    { id: "OOD", label: "Object-Oriented" },
    { id: "STATE", label: "State Machines" },
    { id: "CONCURRENCY", label: "Concurrency & Events" },
  ];

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === "OOD") return p.category.toLowerCase().includes("object");
    if (selectedCategory === "STATE") return p.category.toLowerCase().includes("state");
    if (selectedCategory === "CONCURRENCY") return p.category.toLowerCase().includes("concurrency") || p.category.toLowerCase().includes("observer");

    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Header (Minimal, Developer-Native) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-zinc-200 gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
              Problems
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Select a low-level design problem to draft class boundaries and run rubric evaluation.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter problems..."
                className="pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 w-full sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 py-4 border-b border-zinc-100 text-xs overflow-x-auto scrollbar-none min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer font-medium whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.id
                    ? "bg-zinc-950 text-white"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <span className="text-zinc-300 ml-auto font-mono text-[11px] shrink-0 pl-2">
            {filteredProblems.length} {filteredProblems.length === 1 ? "problem" : "problems"}
          </span>
        </div>

        {/* Problems Table / Directory (Linear / GitHub style) */}
        <div className="divide-y divide-zinc-200 border-b border-zinc-200">
          {filteredProblems.map((problem, idx) => (
            <div
              key={problem.id}
              onClick={() => onSelectProblemAndStart(problem)}
              className="py-4 px-2 -mx-2 rounded-lg hover:bg-zinc-50/90 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              {/* Left Column: Number + Title + Description */}
              <div className="flex items-start gap-4">
                <span className="font-mono text-xs text-zinc-400 mt-0.5 shrink-0 w-5">
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-950 group-hover:underline">
                      {problem.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {problem.difficulty}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
                    {problem.tagline}
                  </p>
                </div>
              </div>

              {/* Right Column: Metadata + Action */}
              <div className="flex items-center gap-5 sm:shrink-0 text-xs text-zinc-500 pl-9 sm:pl-0">
                <span className="font-mono text-[11px] hidden md:inline">
                  {problem.category.split("&")[0].trim()}
                </span>
                <span className="font-mono text-[11px] hidden sm:inline">
                  {problem.functionalRequirements.length} reqs
                </span>
                <div className="inline-flex items-center gap-1 text-xs font-medium text-zinc-950 group-hover:translate-x-0.5 transition-transform">
                  <span>Solve</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          ))}

          {filteredProblems.length === 0 && (
            <div className="py-12 text-center text-xs text-zinc-500">
              No problems match your search criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
