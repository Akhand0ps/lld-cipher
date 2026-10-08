"use client";

import React, { useState } from "react";
import {
  Check,
  ShieldAlert,
  Award,
  History,
  TrendingUp,
  ArrowUpRight,
  BookOpen,
  Layers,
  Quote,
  Sparkles,
  Flame,
  GraduationCap,
  ArrowLeft,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Eye,
} from "lucide-react";
import { Problem } from "@/domain/models/Problem";
import { Evaluation } from "@/domain/models/Evaluation";
import { FormattedFeedback } from "@/domain/strategies/FeedbackToneStrategy";

export interface SubmissionHistoryItem {
  id: string;
  sequenceNumber: number;
  submittedAt: string;
  state: string;
  totalScore?: number;
  evaluation?: Evaluation;
  formattedFeedback?: FormattedFeedback;
  payload?: {
    requirementsAnalysis?: string;
    classDesign?: string;
    relationshipsAndPatterns?: string;
  };
}

export interface ProgressionDeltaData {
  hasProgression: boolean;
  overallScoreDelta: number;
  previousOverallScore: number;
  currentOverallScore: number;
  progressionHighlights: string[];
  criteriaDeltas: Array<{
    criterionId: string;
    criterionName: string;
    previousScore: number;
    currentScore: number;
    delta: number;
  }>;
}

interface ProblemPaneProps {
  problem: Problem;
  history: SubmissionHistoryItem[];
  selectedSubmissionId?: string | null;
  onSelectSubmission?: (subId: string) => void;
  progressionDelta?: ProgressionDeltaData | null;
  activeTab?: "requirements" | "rubric" | "attempts" | "submissions";
  onTabChange?: (tab: "requirements" | "rubric" | "attempts" | "submissions") => void;
  tone?: "MENTOR" | "ROAST";
  onToggleTone?: (tone: "MENTOR" | "ROAST") => void;
  onLoadSubmissionCode?: (payload: {
    requirementsAnalysis?: string;
    classDesign?: string;
    relationshipsAndPatterns?: string;
  }) => void;
}

const getCriterionMeta = (name: string, guideline: string) => {
  const n = name.toLowerCase();
  if (n.includes("responsibility") || n.includes("cohesion") || n.includes("modularity")) {
    return {
      ruleOfThumb: "Decompose into single-purpose domain classes",
      explanation:
        "Each class should maintain a single, cohesive responsibility. Core concerns such as state persistence, business rules, and external coordination should live in dedicated domain classes rather than coalescing into an unmaintainable monolithic controller.",
      aimFor: "Isolate distinct responsibilities into specialized domain classes with narrow, well-defined scopes.",
      avoid: "Consolidating state storage, business policies, and orchestration logic inside a single God Object.",
    };
  }
  if (n.includes("coupling") || n.includes("interface") || n.includes("polymorphism")) {
    return {
      ruleOfThumb: "Program to interfaces, not concrete implementations",
      explanation:
        "Domain models should interact through polymorphic abstractions rather than direct class couplings. Decoupling high-level orchestration from concrete algorithms ensures underlying policies can evolve or be swapped out without breaking callers.",
      aimFor: "Define clear interfaces for pluggable domain contracts and inject them as dependencies.",
      avoid: "Hardcoding concrete implementations directly inside callers with tight instantiation couplings.",
    };
  }
  if (n.includes("state") || n.includes("lifecycle")) {
    return {
      ruleOfThumb: "Model transitions with formal state machines",
      explanation:
        "Entities that transition through distinct operating phases require explicit state modeling. State changes must enforce strict transition rules to prevent illegal operations (such as opening doors while moving or servicing requests while in maintenance).",
      aimFor: "Encapsulate states and transition rules with a formal State pattern or finite state machine.",
      avoid: "Scattering boolean flags and mutable integer state variables across classes without transition validation.",
    };
  }
  if (n.includes("observer") || n.includes("subscription") || n.includes("pubsub")) {
    return {
      ruleOfThumb: "Decouple event publishers from downstream consumers",
      explanation:
        "Publishers should emit events without direct awareness of who is listening or how messages are processed. Decoupled subscriptions allow dynamic subscriber registration, isolated delivery lifecycles, and non-blocking asynchronous dispatch.",
      aimFor: "Establish clean Observer abstractions with dedicated topic registries and isolated delivery pipelines.",
      avoid: "Directly coupling publishers to concrete consumer handlers, blocking publication on slow listeners.",
    };
  }
  if (n.includes("fault") || n.includes("retry") || n.includes("dlq") || n.includes("error")) {
    return {
      ruleOfThumb: "Isolate consumer failures with resilient error policies",
      explanation:
        "System resilience depends on gracefully isolating faulty operations and slow consumers. Transient errors should trigger structured retry policies, while unrecoverable messages should route to dead-letter queues.",
      aimFor: "Provide explicit error isolation, bounded retry backoffs, and dead-letter queue routing.",
      avoid: "Allowing a single failed operation or consumer crash to bubble up and stall the entire pipeline.",
    };
  }
  if (n.includes("extensibility") || n.includes("pattern") || n.includes("strategy") || n.includes("dispatch") || n.includes("factory")) {
    return {
      ruleOfThumb: "Open for extension, closed for modification",
      explanation:
        "New requirements (such as new entity variants, pricing models, or dispatch algorithms) should be supported by adding new classes, not by modifying existing logic with growing conditional chains.",
      aimFor: "Leverage classic design patterns (Strategy, Factory) to make domain policies pluggable and extensible.",
      avoid: "Modifying core orchestration logic with nested if/else or switch branches whenever a new variant is introduced.",
    };
  }
  if (n.includes("concurrency") || n.includes("edge case") || n.includes("thread") || n.includes("safety") || n.includes("synchronization") || n.includes("offset")) {
    return {
      ruleOfThumb: "Guard shared mutable state against race conditions",
      explanation:
        "Systems handling concurrent events (such as simultaneous entry gates or parallel message consumers) must guarantee data integrity under load. Critical state modifications must be thread-safe to prevent race conditions.",
      aimFor: "Safeguard shared mutable state with atomic operations, synchronized locks, or thread-safe collections.",
      avoid: "Unsynchronized check-then-act sequences that permit concurrent race conditions or double-allocations.",
    };
  }
  return {
    ruleOfThumb: "Document architectural trade-offs and rationale",
    explanation:
      "A strong design balances flexibility against unnecessary complexity. Every pattern introduced should address a concrete constraint rather than over-engineering for speculative future needs.",
    aimFor: "Explicitly justify why chosen data structures and abstractions fit the problem scale and operational invariants.",
    avoid: "Introducing boilerplate layers or speculative abstractions without clear architectural justification.",
  };
};

export const ProblemPane: React.FC<ProblemPaneProps> = ({
  problem,
  history,
  selectedSubmissionId,
  onSelectSubmission,
  progressionDelta,
  activeTab: controlledTab,
  onTabChange,
  tone = "MENTOR",
  onToggleTone,
  onLoadSubmissionCode,
}) => {
  const [internalTab, setInternalTab] = useState<"requirements" | "rubric" | "attempts" | "submissions">("requirements");
  const rawTab = controlledTab ?? internalTab;
  const activeTab = rawTab === "submissions" ? "attempts" : rawTab;
  const setTab = (tab: "requirements" | "rubric" | "attempts" | "submissions") => {
    if (onTabChange) onTabChange(tab);
    else setInternalTab(tab);
  };

  const [checkedReqs, setCheckedReqs] = useState<Record<number, boolean>>({});
  const toggleReq = (idx: number) => {
    setCheckedReqs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const trackedCount = Object.values(checkedReqs).filter(Boolean).length;
  const totalCount = problem.functionalRequirements.length;
  const progressPercent = totalCount > 0 ? Math.round((trackedCount / totalCount) * 100) : 0;

  // Tree branch accordion states for requirements and constraints: folded by default
  const [reqsExpanded, setReqsExpanded] = useState(false);
  const [constraintsExpanded, setConstraintsExpanded] = useState(false);

  // Rubric accordion state: folded by default, toggleable per dimension
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({});

  const toggleCriterion = (id: string) => {
    setExpandedCriteria((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Resolve currently inspected submission (defaults to selected or latest)
  const activeSubmission =
    history.find((s) => s.id === selectedSubmissionId) ||
    history[history.length - 1] ||
    null;

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] overflow-hidden text-[#1c1917]">
      {/* Problem Header Info - Warm Editorial Style */}
      <div className="p-3.5 sm:p-5 border-b border-[#e7e5e4] bg-[#faf8f5] space-y-3">
        {/* Dedicated Elevated Problem Hero Card */}
        <div className="rounded-2xl border border-[#e7e5e4] bg-white p-4 sm:p-5.5 shadow-xs relative overflow-hidden transition-all hover:border-[#d6d3d1]">
          {/* Subtle architectural binding accent rule on top */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1c1917] via-[#78716c] to-[#d6d3d1]" />

          {/* Architectural Breadcrumb */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-mono text-[#78716c] flex items-center gap-1.5 min-w-0 truncate">
                <span className="text-[#a8a29e] shrink-0">CATALOG</span>
                <span className="text-[#d6d3d1] shrink-0">/</span>
                <span className="text-[#57534e] font-semibold truncate max-w-[200px] xs:max-w-none">
                  {problem.category.toUpperCase()}
                </span>
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[#78716c]">
              <span className="px-2 py-0.5 rounded-md bg-[#faf8f5] border border-[#e7e5e4]">
                {problem.functionalRequirements.length} Deliverables
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#faf8f5] border border-[#e7e5e4]">
                {problem.rubric.criteria.length} Rubrics
              </span>
            </div>
          </div>

          <h1 className="text-lg sm:text-2xl font-bold font-serif text-[#1c1917] tracking-tight mb-1.5">
            {problem.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#57534e] leading-relaxed font-sans mb-3">
            {problem.tagline}
          </p>

          {/* Problem Overview Description - Integrated Monograph Callout */}
          <div className="p-3 sm:p-4 rounded-xl bg-[#faf8f5] border border-[#e7e5e4] border-l-2 border-l-[#1c1917] text-xs sm:text-sm text-[#292524] leading-relaxed font-sans shadow-2xs">
            <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#78716c] mb-1">
              Problem Overview
            </span>
            <p>{problem.description}</p>
          </div>
        </div>

        {/* Tactile Inset Navigation Tabs (Requirements | Rubric | Submissions) */}
        <div className="flex items-center gap-1 p-1 bg-[#f0eee9] rounded-xl border border-[#e7e5e4] text-xs shadow-2xs overflow-x-auto scrollbar-none min-w-0">
          <button
            onClick={() => setTab("requirements")}
            className={`flex-1 min-w-0 py-1.5 px-2.5 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === "requirements"
                ? "bg-[#faf8f5] text-[#1c1917] shadow-[0_1px_2px_rgba(28,25,23,0.06)] border border-[#e7e5e4] font-semibold"
                : "text-[#78716c] hover:text-[#1c1917] hover:bg-[#eae7df]/50"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">Requirements</span>
          </button>
          <button
            onClick={() => setTab("rubric")}
            className={`flex-1 min-w-0 py-1.5 px-2.5 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === "rubric"
                ? "bg-[#faf8f5] text-[#1c1917] shadow-[0_1px_2px_rgba(28,25,23,0.06)] border border-[#e7e5e4] font-semibold"
                : "text-[#78716c] hover:text-[#1c1917] hover:bg-[#eae7df]/50"
            }`}
          >
            <Award className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">Rubric (5-D)</span>
          </button>
          <button
            onClick={() => setTab("attempts")}
            className={`flex-1 min-w-0 py-1.5 px-2.5 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === "attempts"
                ? "bg-[#faf8f5] text-[#1c1917] shadow-[0_1px_2px_rgba(28,25,23,0.06)] border border-[#e7e5e4] font-semibold"
                : "text-[#78716c] hover:text-[#1c1917] hover:bg-[#eae7df]/50"
            }`}
          >
            <History className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">Attempts</span>
            {history.length > 0 && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#e7e5e4] text-[#1c1917] shrink-0">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Contents: High readability, warm Lenny palette, zero modal interruption */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#fdfbf7]">
        {/* ======================================================== */}
        {/* TAB 1: REQUIREMENTS                                      */}
        {/* ======================================================== */}
        {activeTab === "requirements" && (
          <div className="space-y-6">
            {/* Functional Requirements - Tree Branch Accordion */}
            <div className="space-y-1">
              {/* Parent Trigger Card */}
              <button
                type="button"
                onClick={() => setReqsExpanded(!reqsExpanded)}
                className="w-full p-3.5 sm:p-4 rounded-xl bg-white border border-[#e7e5e4] shadow-xs flex items-center justify-between hover:bg-[#faf8f5] transition cursor-pointer text-left group gap-3"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="h-8 w-8 rounded-lg bg-[#f0eee9] border border-[#e7e5e4] flex items-center justify-center text-[#1c1917] group-hover:bg-[#e7e5e4] transition-colors shrink-0">
                    <CheckSquare className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h3 className="text-sm font-bold text-[#1c1917] tracking-tight">
                        Functional Requirements
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f0eee9] text-[#57534e] border border-[#e7e5e4] font-semibold whitespace-nowrap shrink-0">
                        {totalCount} Deliverables
                      </span>
                    </div>
                    <p className="text-xs text-[#78716c] mt-0.5 truncate">
                      {trackedCount}/{totalCount} verified • Click to {reqsExpanded ? "collapse" : "expand"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-[#e7e5e4] rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-[#1c1917] rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs font-bold text-[#57534e]">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="h-6 w-6 rounded-full flex items-center justify-center text-[#78716c] group-hover:text-[#1c1917] transition-colors">
                    {reqsExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* Branch Tree Items (After clicking on it) */}
              {reqsExpanded && (
                <div className="relative pl-7 sm:pl-9 pt-2.5 pb-1 space-y-2.5 animate-in fade-in duration-200">
                  {/* Stem line extending from bottom of parent card */}
                  <div className="absolute left-[13px] sm:left-[17px] top-0 h-3 w-[1.5px] bg-[#d6d3d1]" />

                  {problem.functionalRequirements.map((req, idx) => {
                    const isLast = idx === problem.functionalRequirements.length - 1;
                    const isChecked = !!checkedReqs[idx];

                    return (
                      <div key={idx} className="relative flex items-center">
                        {/* SVG Connector Branch */}
                        <svg
                          className="absolute -left-[15px] sm:-left-[19px] top-0 w-4 sm:w-5 h-full pointer-events-none overflow-visible"
                          fill="none"
                        >
                          {!isLast && (
                            <line
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="100%"
                              stroke="#d6d3d1"
                              strokeWidth="1.5"
                            />
                          )}
                          <path
                            d="M 0 0 V 14 Q 0 22 8 22 H 20"
                            stroke="#d6d3d1"
                            strokeWidth="1.5"
                          />
                        </svg>

                        {/* Child Card */}
                        <div
                          onClick={() => toggleReq(idx)}
                          className={`w-full p-3.5 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-3 shadow-2xs hover:shadow-xs ${
                            isChecked
                              ? "bg-[#faf8f5]/80 border-[#e7e5e4] text-[#78716c]"
                              : "bg-white border-[#e7e5e4] hover:border-[#d6d3d1] text-[#292524]"
                          }`}
                        >
                          <div
                            className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                              isChecked
                                ? "bg-[#1c1917] border-[#1c1917] text-[#faf8f5] shadow-xs"
                                : "border-[#d6d3d1] bg-[#faf8f5] hover:border-[#1c1917]"
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3 stroke-[2.5]" />}
                          </div>
                          <span
                            className={`text-xs sm:text-[13px] leading-relaxed font-sans ${
                              isChecked ? "line-through opacity-70" : ""
                            }`}
                          >
                            {req}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Architectural Constraints & Invariants - Tree Branch Accordion */}
            <div className="space-y-1">
              {/* Parent Trigger Card */}
              <button
                type="button"
                onClick={() => setConstraintsExpanded(!constraintsExpanded)}
                className="w-full p-3.5 sm:p-4 rounded-xl bg-white border border-[#e7e5e4] shadow-xs flex items-center justify-between hover:bg-[#faf8f5] transition cursor-pointer text-left group gap-3"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="h-8 w-8 rounded-lg bg-[#f0eee9] border border-[#e7e5e4] flex items-center justify-center text-[#1c1917] group-hover:bg-[#e7e5e4] transition-colors shrink-0">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h3 className="text-sm font-bold text-[#1c1917] tracking-tight">
                        Architectural Constraints & Invariants
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f0eee9] text-[#57534e] border border-[#e7e5e4] font-semibold whitespace-nowrap shrink-0">
                        {problem.nonFunctionalConstraints.length} Invariants
                      </span>
                    </div>
                    <p className="text-xs text-[#78716c] mt-0.5 truncate">
                      System guardrails & non-functional rules • Click to {constraintsExpanded ? "collapse" : "expand"}
                    </p>
                  </div>
                </div>

                <div className="h-6 w-6 rounded-full flex items-center justify-center text-[#78716c] group-hover:text-[#1c1917] transition-colors shrink-0">
                  {constraintsExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </button>

              {/* Branch Tree Items (After clicking on it) */}
              {constraintsExpanded && (
                <div className="relative pl-7 sm:pl-9 pt-2.5 pb-1 space-y-2.5 animate-in fade-in duration-200">
                  {/* Stem line extending from bottom of parent card */}
                  <div className="absolute left-[13px] sm:left-[17px] top-0 h-3 w-[1.5px] bg-[#d6d3d1]" />

                  {problem.nonFunctionalConstraints.map((constraint, idx) => {
                    const isLast = idx === problem.nonFunctionalConstraints.length - 1;
                    const cleaned = constraint.replace(
                      /^(concurrency|extensibility|loose coupling|thread safety):\s*/i,
                      ""
                    );

                    return (
                      <div key={idx} className="relative flex items-center">
                        {/* SVG Connector Branch */}
                        <svg
                          className="absolute -left-[15px] sm:-left-[19px] top-0 w-4 sm:w-5 h-full pointer-events-none overflow-visible"
                          fill="none"
                        >
                          {!isLast && (
                            <line
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="100%"
                              stroke="#d6d3d1"
                              strokeWidth="1.5"
                            />
                          )}
                          <path
                            d="M 0 0 V 14 Q 0 22 8 22 H 20"
                            stroke="#d6d3d1"
                            strokeWidth="1.5"
                          />
                        </svg>

                        {/* Child Card */}
                        <div className="w-full p-3.5 rounded-xl bg-white border border-[#e7e5e4] shadow-2xs hover:shadow-xs hover:border-[#d6d3d1] transition-all flex items-start gap-3">
                          <span className="font-mono text-[11px] font-bold text-[#a8a29e] shrink-0 mt-0.5 select-none w-5">
                            0{idx + 1}
                          </span>
                          <p className="flex-1 font-sans text-xs sm:text-[13px] text-[#292524] leading-relaxed">
                            {cleaned}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: RUBRIC (Clean 5-D Dimension Rail)                 */}
        {/* ======================================================== */}
        {activeTab === "rubric" && (
          <div className="space-y-3">
            {problem.rubric.criteria.map((c, i) => {
              const meta = getCriterionMeta(c.name, c.benchmarkGuideline);
              const isExpanded = !!expandedCriteria[c.id];

              return (
                <div
                  key={c.id}
                  id={`rubric-${c.id}`}
                  className="rounded-xl border border-[#e7e5e4] bg-white overflow-hidden shadow-xs transition"
                >
                  {/* Header Row (Always visible, ultra-scannable & clickable) */}
                  <button
                    onClick={() => toggleCriterion(c.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-[#faf8f5] transition cursor-pointer gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-bold text-[#a8a29e] shrink-0">
                        0{i + 1}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-[#1c1917] tracking-tight truncate">
                          {c.name}
                        </h3>
                        <p className="text-xs text-[#78716c] truncate mt-0.5 font-sans">
                          {meta.ruleOfThumb}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f0eee9] text-[#1c1917] border border-[#e7e5e4]">
                        {c.weight}% WEIGHT
                      </span>
                      <div className="h-6 w-6 rounded-full flex items-center justify-center text-[#78716c]">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expandable Details: High-signal, clean architectural card */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-[#f0eee9] space-y-3 bg-white">
                      {/* Thoughtful, readable architectural explanation */}
                      <p className="text-xs sm:text-[13px] text-[#44403c] leading-relaxed font-sans pt-1">
                        {meta.explanation}
                      </p>

                      {/* Clean Aim for vs Avoid guidance container (Warm paper, zero neon alerts, zero fake metrics) */}
                      <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#e7e5e4] space-y-2.5 text-xs sm:text-[13px]">
                        <div className="flex items-start gap-2.5">
                          <span className="font-mono text-[11px] font-bold text-[#1c1917] uppercase tracking-wider shrink-0 mt-0.5 select-none w-16">
                            Aim for:
                          </span>
                          <p className="text-[#292524] leading-relaxed flex-1">
                            {meta.aimFor}
                          </p>
                        </div>
                        <div className="flex items-start gap-2.5 pt-2 border-t border-[#e7e5e4]/70">
                          <span className="font-mono text-[11px] font-bold text-[#78716c] uppercase tracking-wider shrink-0 mt-0.5 select-none w-16">
                            Avoid:
                          </span>
                          <p className="text-[#78716c] leading-relaxed flex-1">
                            {meta.avoid}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ATTEMPTS LIST (LeetCode-Style Spans Table)        */}
        {/* ======================================================== */}
        {activeTab === "attempts" && (
          <div className="space-y-4">
            {/* If no attempts exist */}
            {history.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#78716c] border border-dashed border-[#d6d3d1] rounded-2xl bg-white space-y-2">
                <History className="h-6 w-6 text-[#a8a29e] mx-auto" />
                <p className="font-semibold text-[#292524]">No attempts yet</p>
                <p className="text-[#78716c] text-xs">
                  Write your class contracts on the right and click &quot;Evaluate Architecture&quot; (Ctrl+Enter) to record Attempt #1.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#e7e5e4] bg-white overflow-hidden shadow-xs divide-y divide-[#e7e5e4]">
                {/* Table Column Headers (Matching LeetCode Submissions Table) */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#faf8f5] text-[11px] font-mono font-semibold text-[#78716c] uppercase tracking-wider select-none">
                  <div className="w-28 sm:w-32 shrink-0">Status</div>
                  <div className="flex-1 min-w-[130px]">Submitted</div>
                  <div className="w-16 sm:w-20 shrink-0 hidden sm:block">Format</div>
                  <div className="w-20 sm:w-24 shrink-0 text-center">Score</div>
                  <div className="w-20 shrink-0 hidden md:block text-center">Delta</div>
                  <div className="w-10 shrink-0 text-right pr-1">View</div>
                </div>

                {/* Attempt Spans Rows (Latest First) */}
                {[...history]
                  .sort((a, b) => b.sequenceNumber - a.sequenceNumber)
                  .map((h) => {
                    const isSelected = activeSubmission?.id === h.id;
                    const hScore = h.totalScore ?? 0;
                    const dateObj = new Date(h.submittedAt);
                    const isValidDate = !isNaN(dateObj.getTime());
                    const dateStr = isValidDate
                      ? dateObj.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "October 8, 2026";
                    const timeStr = isValidDate
                      ? dateObj.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        })
                      : "07:38:34 PM";

                    return (
                      <div key={h.id} className="transition group">
                        <div
                          onClick={() => onSelectSubmission && onSelectSubmission(h.id)}
                          className={`flex items-center justify-between px-4 py-3 sm:py-3.5 cursor-pointer transition select-none ${
                            isSelected
                              ? "bg-[#faf8f5] border-l-2 border-l-[#1c1917]"
                              : "hover:bg-[#faf8f5]/60"
                          }`}
                        >
                          {/* 1. Status Span (LeetCode Green 'Accepted') */}
                          <div className="w-28 sm:w-32 shrink-0 flex items-center gap-2">
                            <span
                              className={`text-xs sm:text-[13px] font-bold ${
                                hScore >= 70
                                  ? "text-[#16a34a]"
                                  : hScore >= 50
                                  ? "text-[#d97706]"
                                  : "text-[#dc2626]"
                              }`}
                            >
                              {hScore >= 70
                                ? "Accepted"
                                : hScore >= 50
                                ? "Needs Work"
                                : "Revision"}
                            </span>
                            <span className="text-[10px] font-mono text-[#78716c] bg-[#f0eee9] px-1.5 py-0.5 rounded border border-[#e7e5e4] hidden sm:inline-block">
                              #{h.sequenceNumber}
                            </span>
                          </div>

                          {/* 2. Submitted Date & Time Span (Stacked Vertically like Image 3) */}
                          <div className="flex-1 min-w-[130px] flex flex-col justify-center">
                            <span className="text-xs sm:text-[13px] text-[#1c1917] font-sans font-medium leading-tight">
                              {dateStr}
                            </span>
                            <span className="text-[11px] text-[#78716c] font-mono leading-tight mt-0.5">
                              {timeStr}
                            </span>
                          </div>

                          {/* 3. Format / Lang Span */}
                          <div className="w-16 sm:w-20 shrink-0 hidden sm:block">
                            <span className="text-xs font-mono text-[#57534e]">
                              lld
                            </span>
                          </div>

                          {/* 4. Score Metric Span */}
                          <div className="w-20 sm:w-24 shrink-0 text-center">
                            <span className="text-xs sm:text-[13px] font-mono font-bold text-[#1c1917]">
                              {hScore}/100
                            </span>
                          </div>

                          {/* 5. Progression Delta Metric Span */}
                          <div className="w-20 shrink-0 hidden md:block text-center">
                            {progressionDelta && h.id === activeSubmission?.id ? (
                              <span
                                className={`text-xs font-mono font-bold ${
                                  progressionDelta.overallScoreDelta >= 0
                                    ? "text-emerald-700"
                                    : "text-rose-700"
                                }`}
                              >
                                {progressionDelta.overallScoreDelta >= 0 ? "+" : ""}
                                {progressionDelta.overallScoreDelta}%
                              </span>
                            ) : (
                              <span className="text-xs font-mono text-[#a8a29e]">
                                5 Rubrics
                              </span>
                            )}
                          </div>

                          {/* 6. Eye Icon Action Span (Blue Icon like Image 3) */}
                          <div className="w-10 shrink-0 flex justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectSubmission && onSelectSubmission(h.id);
                              }}
                              className="p-1.5 rounded-lg text-[#2563eb] hover:text-[#1d4ed8] hover:bg-blue-50 transition cursor-pointer"
                              title="Inspect attempt assessment in bottom drawer"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Interactive Sub-Strip when Selected */}
                        {isSelected && (
                          <div className="px-4 py-2 bg-[#f0eee9]/40 border-t border-[#e7e5e4] flex items-center justify-between text-xs text-[#57534e] animate-in fade-in duration-150">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#78716c]">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <span>Attempt #{h.sequenceNumber} active • Inspected in bottom console</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {onLoadSubmissionCode && h.payload && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onLoadSubmissionCode(h.payload!);
                                  }}
                                  className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#1c1917] hover:underline cursor-pointer"
                                  title="Load this attempt code into the editor"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                  <span>Load in Editor</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
