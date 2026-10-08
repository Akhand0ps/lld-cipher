"use client";

import React, { useState } from "react";
import { Play, RotateCcw, Code, Cpu, FileCode, Check, Info, ChevronDown, Terminal } from "lucide-react";
import { SubmissionFormat } from "@/domain/models/Submission";
import { HaloButton } from "@/components/ui/halo-button";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { CompactSelect } from "@/components/ui/compact-select";

interface EditorPayload {
  requirementsAnalysis: string;
  classDesign: string;
  relationshipsAndPatterns: string;
  diagramData?: string;
  notes?: string;
}

interface EditorPaneProps {
  payload: EditorPayload;
  onChangePayload: (newPayload: EditorPayload) => void;
  onSubmit: (format: SubmissionFormat, evaluatorType: "COMPOSITE" | "RULE" | "AI") => void;
  onResetTemplate: () => void;
  isEvaluating: boolean;
  evaluationState: string;
  hasSubmission?: boolean;
  onOpenSubmissionDrawer?: () => void;
  latestScore?: number;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  payload,
  onChangePayload,
  onSubmit,
  onResetTemplate,
  isEvaluating,
  evaluationState,
  hasSubmission,
  onOpenSubmissionDrawer,
  latestScore,
}) => {
  const [activeSection, setActiveSection] = useState<"classes" | "requirements" | "patterns">("classes");
  const [format, setFormat] = useState<SubmissionFormat>("STRUCTURED_TEXT");
  const [evaluatorType, setEvaluatorType] = useState<"COMPOSITE" | "RULE" | "AI">("COMPOSITE");
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const handleFieldChange = (field: keyof EditorPayload, val: string) => {
    onChangePayload({
      ...payload,
      [field]: val,
    });
  };

  // Enable Tab indentation inside textarea instead of jumping focus
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    field: keyof EditorPayload
  ) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isEvaluating) {
        onSubmit(format, evaluatorType);
      }
      return;
    }

    // Insert 4 spaces on Tab
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;
      const newVal = val.substring(0, start) + "    " + val.substring(end);
      handleFieldChange(field, newVal);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const currentContent =
    activeSection === "classes"
      ? payload.classDesign || ""
      : activeSection === "requirements"
      ? payload.requirementsAnalysis || ""
      : payload.relationshipsAndPatterns || "";

  const totalWords = (
    (payload.requirementsAnalysis || "") +
    " " +
    (payload.classDesign || "") +
    " " +
    (payload.relationshipsAndPatterns || "")
  )
    .split(/\s+/)
    .filter(Boolean).length;

  const currentLines = currentContent.split("\n").length;

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] overflow-hidden">
      {/* Editor Top Navigation & Controls */}
      <div className="p-2.5 sm:p-3 border-b border-[#e7e5e4] bg-[#faf8f5] flex flex-wrap items-center justify-between gap-2.5 min-w-0">
        {/* Section Tabs (Tactile IDE Buffer Tabs) */}
        <div className="max-w-full min-w-0 overflow-x-auto scrollbar-none">
          <SegmentedTabs
            value={activeSection}
            onValueChange={(val) =>
              setActiveSection(val as "classes" | "requirements" | "patterns")
            }
            items={[
              {
                value: "classes",
                label: (
                  <>
                    <Code className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden sm:inline">Classes & Interfaces</span>
                    <span className="sm:hidden">Classes</span>
                    {payload.classDesign?.trim() ? (
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-amber-500"
                        title="Buffer drafted"
                      />
                    ) : null}
                  </>
                ),
              },
              {
                value: "requirements",
                label: (
                  <>
                    <FileCode className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden sm:inline">Scope & Assumptions</span>
                    <span className="sm:hidden">Scope</span>
                    {payload.requirementsAnalysis?.trim() ? (
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-amber-500"
                        title="Buffer drafted"
                      />
                    ) : null}
                  </>
                ),
              },
              {
                value: "patterns",
                label: (
                  <>
                    <Cpu className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden sm:inline">Patterns & Concurrency</span>
                    <span className="sm:hidden">Patterns</span>
                    {payload.relationshipsAndPatterns?.trim() ? (
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-amber-500"
                        title="Buffer drafted"
                      />
                    ) : null}
                  </>
                ),
              },
            ]}
          />
        </div>

        {/* Evaluator Strategy Picker & Meta Stats */}
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {/* Format selector */}
          <CompactSelect
            prefixLabel="Format:"
            value={format}
            onValueChange={(val) => setFormat(val as SubmissionFormat)}
            options={[
              { value: "STRUCTURED_TEXT", label: "Structured Text" },
              { value: "PSEUDO_CODE", label: "Code / Interfaces" },
              { value: "DIAGRAM_JSON", label: "Diagram JSON" },
            ]}
          />

          {/* Evaluator Strategy selector */}
          <CompactSelect
            prefixLabel="Engine:"
            value={evaluatorType}
            onValueChange={(val) => setEvaluatorType(val as "COMPOSITE" | "RULE" | "AI")}
            options={[
              {
                value: "COMPOSITE",
                label: "Hybrid (Rule + AI)",
                description: "Holistic rubric scoring",
              },
              {
                value: "RULE",
                label: "Deterministic Rules",
                description: "Fast contract verification",
              },
              {
                value: "AI",
                label: "AI Senior Architect",
                description: "Deep architectural diagnosis",
              },
            ]}
          />

          <span className="text-[11px] font-mono text-[#78716c] hidden sm:inline pl-1">
            {totalWords} words • {currentLines} lines
          </span>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative flex flex-col p-4 overflow-hidden bg-[#fdfbf7]">
        {activeSection === "classes" && (
          <div className="flex-1 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#57534e] flex items-center gap-1.5 font-mono min-w-0">
                <Code className="h-3.5 w-3.5 text-[#78716c] shrink-0" />
                <span className="hidden sm:inline truncate">Core Classes, Interfaces & Method Signatures</span>
                <span className="sm:hidden truncate">Classes & Method Signatures</span>
              </label>
              <span className="text-xs text-[#78716c] hidden 2xl:flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-[#a8a29e] shrink-0" />
                <span>Specify access modifiers, abstractions, and contract signatures.</span>
              </span>
            </div>
            <textarea
              value={payload.classDesign}
              onChange={(e) => handleFieldChange("classDesign", e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, "classDesign")}
              placeholder={`// Declare your classes and interfaces here...
public interface PaymentStrategy {
    void processPayment(double amount);
}

public class ParkingLot {
    private List<ParkingFloor> floors;
    public Ticket parkVehicle(Vehicle vehicle) { ... }
}`}
              className="flex-1 w-full bg-white border border-[#e7e5e4] rounded-xl p-4 text-sm font-mono text-[#1c1917] placeholder-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-[#1c1917] focus:border-[#1c1917] resize-none leading-relaxed transition shadow-xs"
              spellCheck={false}
            />
          </div>
        )}

        {activeSection === "requirements" && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#57534e] flex items-center gap-1.5 font-mono min-w-0">
                <FileCode className="h-3.5 w-3.5 text-[#78716c] shrink-0" />
                <span className="hidden sm:inline truncate">Requirements Breakdown & Architectural Assumptions</span>
                <span className="sm:hidden truncate">Scope & Assumptions</span>
              </label>
              <span className="text-xs text-[#78716c] hidden 2xl:flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-[#a8a29e]" />
                <span>Clarify actors, use cases, and out-of-scope boundaries.</span>
              </span>
            </div>
            <textarea
              value={payload.requirementsAnalysis}
              onChange={(e) => handleFieldChange("requirementsAnalysis", e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, "requirementsAnalysis")}
              placeholder={`1. Core Actors & Use Cases:
- Driver: Requests parking spot, receives ticket, pays at exit.
- Attendant / Automated Gate: Validates ticket, lifts barrier.

2. Assumptions & Boundary Conditions:
- Spot allocation prioritizes proximity to entry gate.
- Payment supports Cash and CreditCard.`}
              className="flex-1 w-full bg-white border border-[#e7e5e4] rounded-xl p-4 text-sm font-mono text-[#1c1917] placeholder-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-[#1c1917] focus:border-[#1c1917] resize-none leading-relaxed transition shadow-xs"
              spellCheck={false}
            />
          </div>
        )}

        {activeSection === "patterns" && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#57534e] flex items-center gap-1.5 font-mono min-w-0">
                <Cpu className="h-3.5 w-3.5 text-[#78716c] shrink-0" />
                <span className="hidden sm:inline truncate">Design Patterns, Relationships & Concurrency</span>
                <span className="sm:hidden truncate">Patterns & Concurrency</span>
              </label>
              <span className="text-xs text-[#78716c] hidden 2xl:flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-[#a8a29e]" />
                <span>Justify pattern choices and concurrency guards.</span>
              </span>
            </div>
            <textarea
              value={payload.relationshipsAndPatterns}
              onChange={(e) => handleFieldChange("relationshipsAndPatterns", e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, "relationshipsAndPatterns")}
              placeholder={`// Design Patterns Justification:
// 1. Strategy Pattern for Dynamic Pricing: Allows plugging PeakSurge or Weekend rates without altering ParkingLot.
// 2. Observer Pattern for Display Board: Automatically updates vacant count when vehicle parks.

// Concurrency & Thread-Safety:
// - Synchronized lock on ParkingFloor.allocateSpot() to prevent race conditions during concurrent entries.`}
              className="flex-1 w-full bg-white border border-[#e7e5e4] rounded-xl p-4 text-sm font-mono text-[#1c1917] placeholder-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-[#1c1917] focus:border-[#1c1917] resize-none leading-relaxed transition shadow-xs"
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* Editor Footer Actions */}
      <div className="p-2 sm:p-3.5 border-t border-[#e7e5e4] bg-[#faf8f5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-2.5 min-w-0">
        <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0">
          <button
            onClick={() => {
              onResetTemplate();
              setCopiedTemplate(true);
              setTimeout(() => setCopiedTemplate(false), 2000);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#e7e5e4] hover:border-[#1c1917] bg-white text-xs font-medium text-[#57534e] hover:text-[#1c1917] transition cursor-pointer shadow-xs active:scale-98"
          >
            {copiedTemplate ? (
              <Check className="h-3.5 w-3.5 text-[#1c1917]" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5 text-[#78716c]" />
            )}
            <span>{copiedTemplate ? "Reset!" : "Reset Template"}</span>
          </button>

          {/* LeetCode-style Bottom Submission Drawer Trigger */}
          {onOpenSubmissionDrawer && (
            <button
              onClick={onOpenSubmissionDrawer}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition cursor-pointer shadow-xs active:scale-98 ${
                hasSubmission
                  ? "bg-white border-[#e7e5e4] hover:border-[#1c1917] text-[#1c1917]"
                  : "bg-white border-[#e7e5e4] text-[#a8a29e] hover:text-[#57534e]"
              }`}
              title="Open Submission Assessment Drawer"
            >
              <Terminal className="h-3.5 w-3.5 text-[#78716c]" />
              <span>Assessment</span>
              {latestScore !== undefined && (
                <span className="font-bold text-[10px] px-1.5 py-0.2 rounded bg-[#f0eee9] text-[#1c1917] border border-[#e7e5e4]">
                  {latestScore}/100
                </span>
              )}
            </button>
          )}
        </div>

        {/* Primary Action Button (Warm Charcoal Minimalist CTA with shortcut) */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {evaluationState && evaluationState !== "DRAFT" && (
            <span className="text-xs font-mono text-[#78716c] animate-pulse hidden sm:inline">
              State: {evaluationState}...
            </span>
          )}

          <HaloButton
            disabled={isEvaluating}
            isLoading={isEvaluating}
            loadingText="Evaluating Architecture…"
            onClick={() => onSubmit(format, evaluatorType)}
            className="cursor-pointer w-full sm:w-auto justify-center"
          >
            <div className="flex items-center justify-center gap-2 w-full">
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Evaluate Architecture</span>
              <span className="hidden md:inline text-[10px] text-muted-foreground font-mono font-normal">
                (Ctrl+Enter)
              </span>
            </div>
          </HaloButton>
        </div>
      </div>
    </div>
  );
};
