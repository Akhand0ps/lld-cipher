"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Sparkles,
  GraduationCap,
  Flame,
  Quote,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Award,
} from "lucide-react";
import { Evaluation } from "@/domain/models/Evaluation";
import { FormattedFeedback } from "@/domain/strategies/FeedbackToneStrategy";
import { ProgressionDelta } from "@/domain/models/Attempt";

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

interface SubmissionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isEvaluating: boolean;
  evaluationState: string;
  activeSubmission: SubmissionHistoryItem | null;
  history: SubmissionHistoryItem[];
  onSelectSubmission: (id: string) => void;
  progressionDelta?: ProgressionDelta | null;
  tone: "MENTOR" | "ROAST";
  onToggleTone?: (tone: "MENTOR" | "ROAST") => void;
  onLoadSubmissionCode?: (payload: {
    requirementsAnalysis?: string;
    classDesign?: string;
    relationshipsAndPatterns?: string;
  }) => void;
}

export const SubmissionDrawer: React.FC<SubmissionDrawerProps> = ({
  isOpen,
  onClose,
  isEvaluating,
  evaluationState,
  activeSubmission,
  history,
  onSelectSubmission,
  progressionDelta,
  tone,
  onToggleTone,
  onLoadSubmissionCode,
}) => {
  // Height state in percentage of parent container (default 55%, min 25%, max 100%)
  const [drawerHeightPercent, setDrawerHeightPercent] = useState<number>(55);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [deltaExpanded, setDeltaExpanded] = useState<boolean>(false);
  const [rubricExpanded, setRubricExpanded] = useState<boolean>(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const dragStartYRef = useRef<number>(0);
  const startHeightPercentRef = useRef<number>(55);

  // Toggle maximize to 100% full upper side
  const toggleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false);
      setDrawerHeightPercent(55);
    } else {
      setIsMaximized(true);
      setDrawerHeightPercent(100);
    }
  };

  // Mouse & touch drag resizing
  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    setIsMaximized(false);
    dragStartYRef.current = clientY;
    startHeightPercentRef.current = drawerHeightPercent;
  };

  const onMouseDownResizer = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
  };

  const onTouchStartResizer = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleDragStart(e.touches[0].clientY);
    }
  };

  const handleGlobalMove = useCallback(
    (clientY: number) => {
      if (!isDragging) return;
      const parent = drawerRef.current?.parentElement;
      if (!parent) return;

      const parentHeight = parent.clientHeight;
      if (parentHeight <= 0) return;

      const deltaY = dragStartYRef.current - clientY; // Moving UP increases height
      const deltaPercent = (deltaY / parentHeight) * 100;
      const newPercent = Math.min(
        100,
        Math.max(25, startHeightPercentRef.current + deltaPercent)
      );

      setDrawerHeightPercent(newPercent);
      if (newPercent >= 96) {
        setIsMaximized(true);
      } else {
        setIsMaximized(false);
      }
    },
    [isDragging]
  );

  const handleGlobalEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => handleGlobalMove(e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handleGlobalMove(e.touches[0].clientY);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", handleGlobalEnd);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", handleGlobalEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", handleGlobalEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", handleGlobalEnd);
    };
  }, [isDragging, handleGlobalMove, handleGlobalEnd]);

  if (!isOpen) return null;

  const currentEvaluation = activeSubmission?.evaluation;
  const score =
    currentEvaluation?.totalScore ?? activeSubmission?.totalScore ?? 0;

  return (
    <div
      ref={drawerRef}
      style={{
        height: isMaximized ? "100%" : `${drawerHeightPercent}%`,
      }}
      className={`absolute bottom-0 left-0 right-0 z-30 flex flex-col bg-white border-t border-[#e7e5e4] shadow-[0_-8px_30px_rgba(28,25,23,0.12)] rounded-t-2xl overflow-hidden ${
        isDragging ? "transition-none select-none" : "transition-all duration-300 ease-out"
      }`}
    >
      {/* ============================================================ */}
      {/* DRAGGABLE TOP RESIZER BAR (LeetCode Console Grab Handle)       */}
      {/* ============================================================ */}
      <div
        onMouseDown={onMouseDownResizer}
        onTouchStart={onTouchStartResizer}
        className="w-full h-8 sm:h-9 bg-[#faf8f5] hover:bg-[#f5f2eb] border-b border-[#e7e5e4] flex items-center justify-between px-3 cursor-row-resize select-none shrink-0 transition-colors group"
        title="Drag up or down to resize submission panel"
      >
        {/* Left: Indicator Title & Status */}
        <div className="flex items-center gap-2 min-w-0">
          <Terminal className="h-3.5 w-3.5 text-[#78716c] shrink-0" />
          <span className="text-xs font-mono font-bold text-[#1c1917] tracking-tight truncate">
            {isEvaluating ? "Evaluating Solution..." : "Submission Assessment"}
          </span>
          {!isEvaluating && activeSubmission && (
            <span className="hidden sm:inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#f0eee9] text-[#57534e] border border-[#e7e5e4]">
              Attempt #{activeSubmission.sequenceNumber}
            </span>
          )}
        </div>

        {/* Center: Tactile Drag Pill Handle */}
        <div className="flex items-center justify-center px-4 py-1">
          <div className="w-10 h-1 rounded-full bg-[#d6d3d1] group-hover:bg-[#a8a29e] transition-colors" />
        </div>

        {/* Right: Window Controls (Maximize / Minimize / Close) */}
        <div className="flex items-center gap-1 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={toggleMaximize}
            className="p-1 rounded-md text-[#78716c] hover:text-[#1c1917] hover:bg-[#e7e5e4]/60 transition cursor-pointer"
            title={isMaximized ? "Restore Height" : "Stretch to Top (Maximize)"}
          >
            {isMaximized ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#78716c] hover:text-[#1c1917] hover:bg-[#e7e5e4]/60 transition cursor-pointer"
            title="Close Panel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* DRAWER BODY: SCROLLABLE SUBMISSION ASSESSMENT REPORT          */}
      {/* ============================================================ */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#fdfbf7]">
        {/* ACTIVE EVALUATION IN-PROGRESS STATE */}
        {isEvaluating ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl bg-white border border-[#e7e5e4] shadow-xs space-y-4 my-auto">
            <div className="h-9 w-9 border-3 border-[#e7e5e4] border-t-[#1c1917] rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1c1917] font-serif">
                Evaluating Architectural Blueprint...
              </h3>
              <p className="text-xs text-[#78716c] font-mono">
                Running AST inspections, polymorphism guards & 5-D rubric heuristics...
              </p>
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-[#faf8f5] border border-[#e7e5e4] text-[11px] font-mono text-[#57534e]">
              Pipeline State: {evaluationState || "Analyzing"}
            </div>
          </div>
        ) : !activeSubmission ? (
          <div className="p-8 text-center text-sm text-[#78716c] border border-dashed border-[#d6d3d1] rounded-2xl bg-white space-y-2">
            <p className="font-semibold text-[#292524]">No submission evaluated yet</p>
            <p className="text-xs text-[#78716c]">
              Click &quot;Evaluate Architecture&quot; or press Ctrl+Enter to run your solution.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* UNIFIED HERO ASSESSMENT CARD */}
            <div className="rounded-2xl bg-white border border-[#e7e5e4] shadow-xs overflow-hidden transition-all">
              {/* Header Track: Attempt Switcher + Tone Toggle + Load Code */}
              <div className="p-4 pb-3 border-b border-[#f0eee9] flex flex-wrap items-center justify-between gap-3 bg-[#faf8f5]/60">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[#78716c] font-semibold uppercase tracking-wider">
                    Attempt:
                  </span>
                  <select
                    value={activeSubmission.id}
                    onChange={(e) => onSelectSubmission(e.target.value)}
                    className="bg-white hover:bg-[#faf8f5] border border-[#e7e5e4] text-xs font-mono font-bold text-[#1c1917] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1c1917] cursor-pointer shadow-2xs transition max-w-[180px] sm:max-w-none truncate"
                  >
                    {history.map((h) => (
                      <option key={h.id} value={h.id}>
                        #{h.sequenceNumber} ({h.totalScore ?? 0}/100) —{" "}
                        {new Date(h.submittedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2.5">
                  {onToggleTone && (
                    <div className="flex items-center bg-[#f0eee9] p-0.5 rounded-lg border border-[#e7e5e4]">
                      <button
                        onClick={() => onToggleTone("MENTOR")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                          tone === "MENTOR"
                            ? "bg-white text-[#1c1917] shadow-2xs font-semibold"
                            : "text-[#78716c] hover:text-[#1c1917]"
                        }`}
                      >
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span>Mentor</span>
                      </button>
                      <button
                        onClick={() => onToggleTone("ROAST")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                          tone === "ROAST"
                            ? "bg-[#c2410c] text-white shadow-2xs font-semibold"
                            : "text-[#78716c] hover:text-[#1c1917]"
                        }`}
                      >
                        <Flame className="h-3.5 w-3.5" />
                        <span>Roast</span>
                      </button>
                    </div>
                  )}

                  {onLoadSubmissionCode && activeSubmission.payload && (
                    <button
                      onClick={() => onLoadSubmissionCode(activeSubmission.payload!)}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#57534e] hover:text-[#1c1917] border border-[#e7e5e4] hover:border-[#1c1917] rounded-lg px-2.5 py-1.5 bg-white transition cursor-pointer shadow-2xs"
                      title="Restore this attempt's code into the editor"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span className="hidden sm:inline">Load in Editor</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Score & Verdict Row */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-3xl sm:text-4xl font-bold text-[#1c1917] tracking-tight">
                    {score}
                  </span>
                  <span className="font-mono text-xs text-[#a8a29e]">/ 100</span>
                </div>

                {/* Persona Commentary Section */}
                {(() => {
                  const activeFeedback =
                    activeSubmission.formattedFeedback ||
                    (currentEvaluation
                      ? {
                          toneName: tone,
                          headline:
                            tone === "ROAST"
                              ? score >= 75
                                ? "Wait... did you actually write decent interfaces? 🧐"
                                : "Senior Dev is grabbing a coffee to survive this code review. ☕"
                              : score >= 75
                              ? "Exemplary Architecture! Highly cohesive design."
                              : "Good Initial Attempt! Let's address fundamental abstractions.",
                          badgeEmoji: tone === "ROAST" ? "🔥" : "🧭",
                          verdictNarrative:
                            currentEvaluation.summary ||
                            `You scored ${score}/100. ${
                              currentEvaluation.strengths && currentEvaluation.strengths.length > 0
                                ? `We noticed strong points: ${currentEvaluation.strengths.join(". ")}. `
                                : ""
                            }Focus on the suggestions below to elevate your next attempt to top-tier industry standards.`,
                          concludingAdvice:
                            tone === "ROAST"
                              ? "Fix the God Objects and try again before you trigger an outage."
                              : `Refactor your design by breaking up larger classes and introducing interfaces, then submit Attempt ${(activeSubmission.sequenceNumber || 1) + 1} to see your score delta!`,
                        }
                      : null);

                  if (!activeFeedback) return null;

                  return (
                    <div className="pt-3.5 border-t border-[#f0eee9] space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xl select-none shrink-0">
                            {activeFeedback.badgeEmoji}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-[#1c1917] font-serif truncate">
                            {activeFeedback.headline}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#78716c] px-2 py-0.5 rounded-full bg-[#faf8f5] border border-[#e7e5e4] shrink-0 font-medium">
                          {tone === "ROAST" ? "Architect Roast" : "Architect Mentor"}
                        </span>
                      </div>

                      <p className="text-xs sm:text-[13px] leading-relaxed text-[#44403c] font-sans">
                        {activeFeedback.verdictNarrative}
                      </p>

                      <div className="p-3 rounded-xl bg-[#faf8f5] border border-[#e7e5e4] flex items-start gap-2.5 text-xs sm:text-[13px]">
                        <Sparkles className="h-4 w-4 text-[#1c1917] shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <span className="font-bold text-[#1c1917]">Next Action: </span>
                          <span className="text-[#44403c]">{activeFeedback.concludingAdvice}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* MULTI-ATTEMPT PROGRESSION DELTA (FOLDED / UNFOLDED) */}
            {progressionDelta?.hasProgression && (
              <div className="rounded-2xl bg-white border border-[#e7e5e4] shadow-xs overflow-hidden transition-all">
                {/* Clickable Header Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => setDeltaExpanded(!deltaExpanded)}
                  className="w-full p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-[#faf8f5] transition cursor-pointer text-left select-none group"
                >
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#1c1917] min-w-0">
                    <TrendingUp className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      Progression Delta (Attempt #{Math.max(1, (activeSubmission.sequenceNumber || 2) - 1)} vs #{activeSubmission.sequenceNumber || 2})
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5 font-mono text-xs font-bold w-full sm:w-auto">
                    <span className="text-[#78716c]">
                      {progressionDelta.previousOverallScore}% &rarr; {progressionDelta.currentOverallScore}%
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border ${
                        progressionDelta.overallScoreDelta >= 0
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-red-50 text-red-800 border-red-200"
                      }`}
                    >
                      {progressionDelta.overallScoreDelta >= 0 ? "+" : ""}
                      {progressionDelta.overallScoreDelta}%
                    </span>
                    <div className="h-6 w-6 rounded-full flex items-center justify-center text-[#78716c] group-hover:text-[#1c1917] transition-colors ml-1">
                      {deltaExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expandable Criteria Deltas & Highlights */}
                {deltaExpanded && (
                  <div className="p-4 sm:p-4.5 pt-0 border-t border-[#f0eee9] animate-in fade-in duration-200">
                    {/* Progression Highlights (Warnings, Personal Best, Narrative) */}
                    {progressionDelta.progressionHighlights && progressionDelta.progressionHighlights.length > 0 && (
                      <div className="pt-3 pb-2 space-y-1.5">
                        {progressionDelta.progressionHighlights.map((hl, idx) => (
                          <div
                            key={idx}
                            className={`text-xs px-2.5 py-1.5 rounded-lg font-mono ${
                              hl.startsWith("⚠️")
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : hl.startsWith("🏆") || hl.startsWith("🎉")
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold"
                                : "bg-[#faf8f5] text-[#57534e] border border-[#e7e5e4]"
                            }`}
                          >
                            {hl}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {progressionDelta.criteriaDeltas.map((cd) => (
                        <div
                          key={cd.criterionId}
                          className="p-2.5 rounded-lg bg-[#faf8f5] border border-[#e7e5e4] flex items-center justify-between"
                        >
                          <span className="text-[#57534e] text-xs font-medium truncate pr-2">
                            {cd.criterionName}
                          </span>
                          <span
                            className={`font-mono font-bold text-xs shrink-0 ${
                              cd.delta > 0
                                ? "text-emerald-700"
                                : cd.delta < 0
                                ? "text-red-700"
                                : "text-[#78716c]"
                            }`}
                          >
                            {cd.delta > 0 ? `+${cd.delta}` : cd.delta} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5-D RUBRIC DIMENSION BREAKDOWN (ONE OUTER CARD WITH INSIDE CARDS, FOLDED / UNFOLDED) */}
            {currentEvaluation?.criteriaScores && (
              <div className="rounded-2xl bg-white border border-[#e7e5e4] shadow-xs overflow-hidden transition-all">
                {/* Clickable Header Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => setRubricExpanded(!rubricExpanded)}
                  className="w-full p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-[#faf8f5] transition cursor-pointer text-left select-none group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Award className="h-4 w-4 text-[#1c1917] shrink-0" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1c1917] truncate">
                      Rubric Dimension Breakdown & Evidence
                    </h3>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 w-full sm:w-auto">
                    <span className="text-[11px] text-[#78716c] font-mono font-medium px-2 py-0.5 rounded-full bg-[#f0eee9] border border-[#e7e5e4]">
                      {currentEvaluation.criteriaScores.length} Dimensions Evaluated
                    </span>
                    <div className="h-6 w-6 rounded-full flex items-center justify-center text-[#78716c] group-hover:text-[#1c1917] transition-colors ml-1">
                      {rubricExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expandable Inside Cards Grid: 3 cards top row, 2 cards bottom row */}
                {rubricExpanded && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-[#f0eee9] animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4">
                      {currentEvaluation.criteriaScores.map((cs) => {
                        const cleanQuote = (cs.evidenceQuote || "")
                          .replace(/^["'“”]+|["'“”]+$/g, "")
                          .trim();

                        return (
                          <div
                            key={cs.criterionId}
                            className="p-3.5 sm:p-4 rounded-xl bg-[#faf8f5] border border-[#e7e5e4] flex flex-col justify-between space-y-3 shadow-2xs hover:border-[#d6d3d1] transition"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs sm:text-sm font-bold text-[#1c1917] tracking-tight line-clamp-2">
                                  {cs.criterionName}
                                </span>
                                <span
                                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                                    cs.score >= 4
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                      : cs.score >= 3
                                      ? "bg-blue-50 text-blue-800 border-blue-200"
                                      : "bg-amber-50 text-amber-900 border-amber-200"
                                  }`}
                                >
                                  {cs.score}/5
                                </span>
                              </div>

                              <p className="text-xs text-[#44403c] leading-relaxed font-sans">
                                {cs.concern}
                              </p>

                              {/* Clean Editorial Code / Evidence Citation */}
                              {cleanQuote && (
                                <div className="rounded-lg bg-white border border-[#e7e5e4] p-2.5 space-y-1">
                                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#78716c]">
                                    <Quote className="h-3 w-3 text-[#a8a29e]" />
                                    <span>Evidence Cited</span>
                                  </div>
                                  <p className="font-mono text-[11px] text-[#1c1917] leading-relaxed break-words bg-[#faf8f5] p-2 rounded border border-[#e7e5e4]/70">
                                    &ldquo;{cleanQuote}&rdquo;
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Actionable Suggestion */}
                            {cs.suggestion && (
                              <div className="flex items-start gap-1.5 pt-2 border-t border-[#e7e5e4]/70 text-xs text-[#57534e]">
                                <Sparkles className="h-3 w-3 text-[#1c1917] shrink-0 mt-0.5" />
                                <p className="leading-relaxed">
                                  <span className="font-bold text-[#1c1917]">Suggestion: </span>
                                  <span>{cs.suggestion}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
