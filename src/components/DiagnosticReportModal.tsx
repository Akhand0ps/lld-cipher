"use client";

import React from "react";
import { X, TrendingUp, Sparkles, Flame, GraduationCap, CheckCircle, ArrowRight, Quote } from "lucide-react";
import { Evaluation } from "@/domain/models/Evaluation";
import { FormattedFeedback } from "@/domain/strategies/FeedbackToneStrategy";
import { ProgressionDelta } from "@/domain/models/Attempt";
import { Highlighter, HighlightBlock } from "./Highlighter";

interface DiagnosticReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: Evaluation;
  formattedFeedback: FormattedFeedback;
  progressionDelta?: ProgressionDelta | null;
  sequenceNumber: number;
  tone: "MENTOR" | "ROAST";
  onToggleTone: (newTone: "MENTOR" | "ROAST") => void;
  onStartNextAttempt: () => void;
}

export const DiagnosticReportModal: React.FC<DiagnosticReportModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  formattedFeedback,
  progressionDelta,
  sequenceNumber,
  tone,
  onToggleTone,
  onStartNextAttempt,
}) => {
  if (!isOpen) return null;

  const score = evaluation.totalScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Top Header (Monochromatic) */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shrink-0">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="px-3 py-1.5 rounded-lg bg-zinc-950 text-white font-mono font-bold text-base sm:text-lg shadow-xs flex items-center gap-1.5 shrink-0">
              <span>{score}</span>
              <span className="text-xs text-zinc-400 font-normal">/100</span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base font-bold text-zinc-950 tracking-tight">
                  Architectural Diagnostic Report
                </h2>
                <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 font-mono border border-zinc-200 font-medium shrink-0">
                  Attempt #{sequenceNumber}
                </span>
                <span className={`text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase tracking-wider shrink-0 ${
                  score >= 80 ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                  score >= 60 ? "bg-blue-50 text-blue-800 border border-blue-200" :
                  "bg-amber-50 text-amber-900 border border-amber-200"
                }`}>
                  {score >= 80 ? "Production Grade" : score >= 60 ? "Decoupled Design" : "Needs Refactoring"}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 truncate">
                Evaluation Strategy: <span className="font-mono text-zinc-900 font-semibold">{evaluation.evaluatorType} Engine</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
            {/* Live Strategy Toggle inside Modal */}
            <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
              <button
                onClick={() => onToggleTone("MENTOR")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                  tone === "MENTOR"
                    ? "bg-white text-zinc-950 shadow-2xs font-semibold"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Mentor</span>
              </button>
              <button
                onClick={() => onToggleTone("ROAST")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                  tone === "ROAST"
                    ? "bg-zinc-950 text-white shadow-2xs font-semibold"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                <span>Roast</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-zinc-50/40">
          {/* Persona Feedback Banner */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-white relative overflow-hidden transition-all shadow-xs">
            <div className="flex items-start gap-3.5">
              <span className="text-2xl select-none">{formattedFeedback.badgeEmoji}</span>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                    <span>{formattedFeedback.headline}</span>
                  </h3>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 font-semibold shrink-0">
                    {formattedFeedback.toneName === "ROAST" ? "Roast Review" : "Architect Mentor Review"}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-zinc-700">
                  {formattedFeedback.verdictNarrative}
                </p>
                <div className="pt-2 text-xs font-medium text-zinc-900 flex items-center gap-1.5 border-t border-zinc-100">
                  <Sparkles className="h-3.5 w-3.5 text-zinc-700 shrink-0" />
                  <span>Next Action: {formattedFeedback.concludingAdvice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Differentiator #2: Multi-Attempt Progression Delta Banner */}
          {progressionDelta?.hasProgression && (
            <div className="p-4 rounded-xl bg-white border border-zinc-300 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-zinc-950 text-xs font-bold uppercase tracking-wider">
                  <TrendingUp className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Progression Delta (Attempt #{sequenceNumber - 1} vs #{sequenceNumber})</span>
                </div>
                <div className="font-mono text-sm font-bold text-zinc-950 flex items-center gap-1">
                  <span className="text-zinc-500 font-normal">{progressionDelta.previousOverallScore}%</span>
                  <span>→</span>
                  <span>{progressionDelta.currentOverallScore}%</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                    progressionDelta.overallScoreDelta >= 0 ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"
                  }`}>
                    {progressionDelta.overallScoreDelta >= 0 ? "+" : ""}
                    {progressionDelta.overallScoreDelta}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {progressionDelta.criteriaDeltas.map((cd) => (
                  <div
                    key={cd.criterionId}
                    className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between"
                  >
                    <span className="text-zinc-700 text-[11px] font-medium truncate">{cd.criterionName}</span>
                    <span className={`font-mono font-bold text-xs ${cd.delta >= 0 ? "text-emerald-700" : "text-zinc-950"}`}>
                      {cd.delta > 0 ? `+${cd.delta}` : cd.delta} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rubric Dimension Critique Cards (5-D Rubric with Evidence Quotes) */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Rubric Dimension Breakdown & Evidence
            </h3>

            <div className="space-y-3">
              {formattedFeedback.critiqueItems.map((item, idx) => {
                const rawScore = item.score;
                // Strip redundant outer quotation marks if present
                const cleanQuote = (item.evidenceQuote || "").replace(/^["'“”]+|["'“”]+$/g, "").trim();

                return (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 rounded-xl bg-white border border-zinc-200 space-y-3 shadow-xs"
                  >
                    {/* Header: Dimension & Score */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-zinc-950">{item.criterionName}</span>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                        rawScore >= 4 ? "bg-emerald-50 text-emerald-900 border-emerald-200" :
                        rawScore >= 3 ? "bg-blue-50 text-blue-900 border-blue-200" :
                        "bg-zinc-100 text-zinc-900 border-zinc-200"
                      }`}>
                        {rawScore}/5
                      </span>
                    </div>

                    {/* Persona Remark */}
                    <div className="text-xs text-zinc-800 font-medium leading-relaxed">
                      {item.toneRemark}
                    </div>

                    {/* Verbatim Evidence Quote (Highlighter Block without double quotes) */}
                    {cleanQuote && (
                      <HighlightBlock variant="blue" className="mt-2 text-left shadow-xs">
                        <div className="flex items-start gap-2.5">
                          <Quote className="h-3.5 w-3.5 text-blue-700 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-blue-800 font-semibold block">
                              Candidate Evidence Cited:
                            </span>
                            <p className="font-mono text-zinc-900 text-xs leading-relaxed">
                              &ldquo;{cleanQuote}&rdquo;
                            </p>
                          </div>
                        </div>
                      </HighlightBlock>
                    )}

                    {/* Suggestion Callout */}
                    <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-start gap-2 text-xs text-zinc-800">
                      <CheckCircle className="h-3.5 w-3.5 text-zinc-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-zinc-950">Actionable Suggestion: </span>
                        <span>{item.suggestion}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-4 sm:px-6 py-3 border-t border-zinc-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-zinc-200 hover:border-zinc-300 bg-white text-xs font-medium text-zinc-700 hover:text-zinc-950 transition shadow-2xs text-center"
          >
            Review Submission
          </button>

          <button
            onClick={() => {
              onClose();
              onStartNextAttempt();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-zinc-950 hover:bg-black shadow-xs transition active:scale-[0.99]"
          >
            <span>Start Next Attempt (Refactor & Improve)</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
