"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  X,
  Code,
  FileCode,
  Cpu,
  Flame,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  Onboarding,
  ChoiceGroup,
  useOnboarding,
} from "@/components/ui/onboarding";
import { Badge } from "@/components/ui/badge";

interface StudioOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTone?: (tone: "MENTOR" | "ROAST") => void;
  onSelectLevel?: (level: string) => void;
}

/**
 * Pinned bottom navigation with clean button hierarchy and skip option.
 */
function StudioOnboardingNav({
  isLastStep,
  onComplete,
  onSkip,
}: {
  isLastStep?: boolean;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const {
    currentStep,
    totalSteps,
    canGoBack,
    canGoNext,
    handleBack,
    handleNext,
  } = useOnboarding();
  const last = isLastStep ?? currentStep === totalSteps;

  return (
    <div className="flex items-center justify-between gap-3 w-full">
      <button
        type="button"
        onClick={onSkip}
        className="text-xs text-[#78716c] hover:text-[#1c1917] transition cursor-pointer px-1 py-1 font-medium underline-offset-4 hover:underline"
      >
        Skip to Studio
      </button>

      <div className="flex items-center gap-2 sm:gap-3">
        {canGoBack && (
          <button
            type="button"
            onClick={handleBack}
            className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] text-xs font-semibold hover:bg-[#faf8f5] transition cursor-pointer shadow-2xs"
          >
            Back
          </button>
        )}

        {last ? (
          <button
            type="button"
            onClick={onComplete}
            className="h-8 sm:h-9 px-4 sm:px-5 rounded-lg bg-[#1c1917] text-[#faf8f5] text-xs font-semibold hover:bg-black transition cursor-pointer shadow-xs active:scale-[0.99] flex items-center gap-1.5"
          >
            <span>Start Designing</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            disabled={!canGoNext}
            onClick={handleNext}
            className="h-8 sm:h-9 px-4 sm:px-5 rounded-lg bg-[#1c1917] text-[#faf8f5] text-xs font-semibold hover:bg-black disabled:opacity-50 transition cursor-pointer shadow-xs active:scale-[0.99] flex items-center gap-1.5"
          >
            <span>Next Step</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export const StudioOnboardingModal: React.FC<StudioOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSelectTone,
  onSelectLevel,
}) => {
  const [mounted, setMounted] = useState(false);
  const [level, setLevel] = useState<string>("sde2");
  const [selectedTone, setSelectedTone] = useState<"MENTOR" | "ROAST">("MENTOR");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedLevel = localStorage.getItem("lld_target_level");
      const savedTone = localStorage.getItem("lld_preferred_tone");
      if (savedLevel) setLevel(savedLevel);
      if (savedTone === "MENTOR" || savedTone === "ROAST") {
        setSelectedTone(savedTone);
      }
    }
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleFinish();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleFinish = (targetProblemId?: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lld_onboarding_completed", "true");
      localStorage.setItem("lld_target_level", level);
      localStorage.setItem("lld_preferred_tone", selectedTone);
    }
    if (onSelectTone) {
      onSelectTone(selectedTone);
    }
    if (onSelectLevel) {
      onSelectLevel(level);
    }
    onClose();

    if (targetProblemId) {
      router.push(`/problems/${targetProblemId}`);
    }
  };

  const getLevelLabel = () => {
    if (level === "sde1") return "Junior (SDE-1)";
    if (level === "senior") return "Staff / Principal (L6+)";
    return "Mid/Senior (SDE-2)";
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-zinc-950/60 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white border border-[#e7e5e4] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]">
        {/* Top Header: Brand & Dismiss */}
        <div className="px-4 sm:px-6 py-3 border-b border-[#e7e5e4] flex items-center justify-between bg-[#faf8f5] shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-[#1c1917] text-[#faf8f5] flex items-center justify-center font-mono text-xs font-bold">
              LS
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#1c1917] tracking-tight">
                LLD Studio Calibration
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-[#78716c] bg-[#efece6] px-1.5 py-0.5 rounded">
                Interactive Setup
              </span>
            </div>
          </div>

          <button
            onClick={() => handleFinish()}
            className="p-1.5 rounded-md text-[#78716c] hover:text-[#1c1917] hover:bg-[#f0eee9] transition cursor-pointer"
            aria-label="Skip onboarding"
            title="Close and save preferences"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Onboarding Wizard with Pinned Footer */}
        <Onboarding
          totalSteps={3}
          defaultValue={1}
          onComplete={() => handleFinish()}
          className="bg-transparent border-0 p-0 shadow-none flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          {/* Step Pills Indicator */}
          <div className="py-2.5 px-4 flex justify-center shrink-0 border-b border-[#f0eee9] bg-white">
            <Onboarding.StepIndicator
              variant="pills"
              className="w-full max-w-[150px] sm:max-w-[180px]"
            />
          </div>

          {/* Scrollable Step Content Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {/* STEP 1: Evaluation Rigor & Target Level */}
            <Onboarding.Step step={1} className="space-y-3.5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#f0eee9] text-[#57534e] border border-[#e7e5e4]">
                  <span>Step 1 of 3</span>
                  <span>•</span>
                  <span>Role Calibration</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-bold font-serif text-[#1c1917] tracking-tight">
                  Welcome to LLD Studio
                </h2>
                <p className="text-xs sm:text-sm text-[#78716c] leading-relaxed">
                  Calibrate your evaluation standard. Real-time reviews will grade your class contracts, invariants, and trade-offs accordingly.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#57534e] block">
                  Select your target seniority tier:
                </label>

                <ChoiceGroup
                  name="target-level"
                  value={level}
                  onValueChange={setLevel}
                  orientation="vertical"
                  className="space-y-2"
                >
                  <ChoiceGroup.Item
                    value="sde1"
                    className="flex items-start gap-3 p-3 rounded-xl border border-[#e7e5e4] hover:border-[#1c1917] transition cursor-pointer data-[state=selected]:border-[#1c1917] data-[state=selected]:bg-[#fdfbf7] data-[state=selected]:ring-1 data-[state=selected]:ring-[#1c1917]"
                  >
                    <div className="h-2 w-2 rounded-full mt-1.5 bg-amber-500 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-[#1c1917]">
                        Junior Engineer (SDE-1)
                      </div>
                      <div className="text-[11px] text-[#78716c] mt-0.5 leading-snug">
                        Focus on Single Responsibility, preventing God Classes, and clear entity boundaries.
                      </div>
                    </div>
                  </ChoiceGroup.Item>

                  <ChoiceGroup.Item
                    value="sde2"
                    className="flex items-start gap-3 p-3 rounded-xl border border-[#e7e5e4] hover:border-[#1c1917] transition cursor-pointer data-[state=selected]:border-[#1c1917] data-[state=selected]:bg-[#fdfbf7] data-[state=selected]:ring-1 data-[state=selected]:ring-[#1c1917]"
                  >
                    <div className="h-2 w-2 rounded-full mt-1.5 bg-blue-500 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-[#1c1917] flex items-center gap-1.5 flex-wrap">
                        <span>Mid-Level / Senior SDE (SDE-2)</span>
                        <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          Recommended
                        </span>
                      </div>
                      <div className="text-[11px] text-[#78716c] mt-0.5 leading-snug">
                        Master interface segregation, Open/Closed extensibility, Strategy, and Factory patterns.
                      </div>
                    </div>
                  </ChoiceGroup.Item>

                  <ChoiceGroup.Item
                    value="senior"
                    className="flex items-start gap-3 p-3 rounded-xl border border-[#e7e5e4] hover:border-[#1c1917] transition cursor-pointer data-[state=selected]:border-[#1c1917] data-[state=selected]:bg-[#fdfbf7] data-[state=selected]:ring-1 data-[state=selected]:ring-[#1c1917]"
                  >
                    <div className="h-2 w-2 rounded-full mt-1.5 bg-emerald-500 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-[#1c1917]">
                        Staff / Principal Architect (L6+)
                      </div>
                      <div className="text-[11px] text-[#78716c] mt-0.5 leading-snug">
                        Rigorous thread-safety mutexes, state invariants, and architectural trade-off defenses.
                      </div>
                    </div>
                  </ChoiceGroup.Item>
                </ChoiceGroup>
              </div>
            </Onboarding.Step>

            {/* STEP 2: Reviewer Persona & Tone */}
            <Onboarding.Step step={2} className="space-y-3.5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#f0eee9] text-[#57534e] border border-[#e7e5e4]">
                  <span>Step 2 of 3</span>
                  <span>•</span>
                  <span>Reviewer Persona</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-bold font-serif text-[#1c1917] tracking-tight">
                  Choose Reviewer Personality
                </h2>
                <p className="text-xs sm:text-sm text-[#78716c] leading-relaxed">
                  Tailor how the evaluation engine communicates architectural critiques and refactoring hints.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <ChoiceGroup
                  name="preferred-tone"
                  value={selectedTone}
                  onValueChange={(val) => setSelectedTone(val as "MENTOR" | "ROAST")}
                  orientation="vertical"
                  className="space-y-2.5"
                >
                  <ChoiceGroup.Item
                    value="MENTOR"
                    className="flex flex-col gap-2 p-3.5 rounded-xl border border-[#e7e5e4] hover:border-[#1c1917] transition cursor-pointer data-[state=selected]:border-[#1c1917] data-[state=selected]:bg-[#fdfbf7] data-[state=selected]:ring-1 data-[state=selected]:ring-[#1c1917]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-blue-600 shrink-0" />
                        <span className="text-xs font-bold text-[#1c1917]">Architect Mentor</span>
                      </div>
                      <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        Pedagogical
                      </span>
                    </div>
                    <p className="text-[11px] text-[#78716c] leading-snug">
                      Constructive, empathetic feedback with design pattern breakdowns, trade-off analysis, and step-by-step refactoring advice.
                    </p>
                    <div className="p-2 rounded-lg bg-[#f5f3ee] text-[10px] font-mono text-[#57534e] italic border border-[#e7e5e4]/60">
                      &quot;Good vehicle abstraction. Extract pricing calculations into a Strategy pattern to keep ParkingLot extensible.&quot;
                    </div>
                  </ChoiceGroup.Item>

                  <ChoiceGroup.Item
                    value="ROAST"
                    className="flex flex-col gap-2 p-3.5 rounded-xl border border-[#e7e5e4] hover:border-[#1c1917] transition cursor-pointer data-[state=selected]:border-[#1c1917] data-[state=selected]:bg-[#fdfbf7] data-[state=selected]:ring-1 data-[state=selected]:ring-[#1c1917]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-600 shrink-0" />
                        <span className="text-xs font-bold text-[#1c1917]">Architect Roast</span>
                      </div>
                      <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200">
                        Principal Engineer
                      </span>
                    </div>
                    <p className="text-[11px] text-[#78716c] leading-snug">
                      Brutal, witty critique mirroring an impatient Principal Engineer roasting God Objects, leaked abstractions, and race conditions.
                    </p>
                    <div className="p-2 rounded-lg bg-[#f5f3ee] text-[10px] font-mono text-[#57534e] italic border border-[#e7e5e4]/60">
                      &quot;You shoved pricing logic directly into ParkingLot. Congratulations on the God Object—production will love that race condition.&quot;
                    </div>
                  </ChoiceGroup.Item>
                </ChoiceGroup>
              </div>
            </Onboarding.Step>

            {/* STEP 3: Workflow & Direct Launch */}
            <Onboarding.Step step={3} className="space-y-3.5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>Step 3 of 3 • Setup Complete</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-bold font-serif text-[#1c1917] tracking-tight">
                  You&apos;re Ready to Design
                </h2>
                <p className="text-xs sm:text-sm text-[#78716c] leading-relaxed">
                  Calibrated for <strong className="text-[#1c1917]">{getLevelLabel()}</strong> with <strong className="text-[#1c1917]">{selectedTone === "ROAST" ? "Roast Review" : "Mentor Review"}</strong>.
                </p>
              </div>

              {/* 3 Pillars Methodology */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#faf8f5] border border-[#e7e5e4]">
                <div className="text-center space-y-1">
                  <Code className="h-3.5 w-3.5 mx-auto text-[#1c1917]" />
                  <div className="text-[10px] font-bold text-[#1c1917]">1. Contracts</div>
                  <div className="text-[9px] text-[#78716c] leading-tight">Types & Interfaces</div>
                </div>
                <div className="text-center space-y-1 border-x border-[#e7e5e4] px-1">
                  <FileCode className="h-3.5 w-3.5 mx-auto text-[#1c1917]" />
                  <div className="text-[10px] font-bold text-[#1c1917]">2. Invariants</div>
                  <div className="text-[9px] text-[#78716c] leading-tight">Locks & Boundaries</div>
                </div>
                <div className="text-center space-y-1">
                  <Cpu className="h-3.5 w-3.5 mx-auto text-[#1c1917]" />
                  <div className="text-[10px] font-bold text-[#1c1917]">3. Audit</div>
                  <div className="text-[9px] text-[#78716c] leading-tight">5-D Rubric Scoring</div>
                </div>
              </div>

              {/* Quick Launch Cards */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#57534e]">
                  Launch your first challenge:
                </div>

                <button
                  type="button"
                  onClick={() => handleFinish("parking-lot-system")}
                  className="w-full text-left p-3 rounded-xl border border-[#e7e5e4] hover:border-[#1c1917] hover:bg-[#faf8f5] transition cursor-pointer flex items-center justify-between gap-3 group shadow-2xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#78716c]">#01</span>
                      <h4 className="text-xs font-bold text-[#1c1917] group-hover:underline truncate">
                        Multi-Floor Smart Parking Lot
                      </h4>
                      <Badge variant="warning" className="text-[9px] px-1.5 py-0">
                        INTERMEDIATE
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[#78716c] truncate mt-0.5">
                      Strategy Pattern, Factory Method, Vehicle Sizing & Invariants
                    </p>
                  </div>
                  <div className="h-6 w-6 rounded-md flex items-center justify-center text-[#78716c] group-hover:text-[#1c1917] group-hover:translate-x-0.5 transition-transform shrink-0">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleFinish("elevator-dispatch-system")}
                  className="w-full text-left p-3 rounded-xl border border-[#e7e5e4] hover:border-[#1c1917] hover:bg-[#faf8f5] transition cursor-pointer flex items-center justify-between gap-3 group shadow-2xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#78716c]">#02</span>
                      <h4 className="text-xs font-bold text-[#1c1917] group-hover:underline truncate">
                        Elevator Control & Dispatch System
                      </h4>
                      <Badge variant="purple" className="text-[9px] px-1.5 py-0">
                        ADVANCED
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[#78716c] truncate mt-0.5">
                      State Pattern, SCAN Algorithm, Boundary Checks
                    </p>
                  </div>
                  <div className="h-6 w-6 rounded-md flex items-center justify-center text-[#78716c] group-hover:text-[#1c1917] group-hover:translate-x-0.5 transition-transform shrink-0">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleFinish("in-memory-pubsub-service")}
                  className="w-full text-left p-3 rounded-xl border border-[#e7e5e4] hover:border-[#1c1917] hover:bg-[#faf8f5] transition cursor-pointer flex items-center justify-between gap-3 group shadow-2xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#78716c]">#03</span>
                      <h4 className="text-xs font-bold text-[#1c1917] group-hover:underline truncate">
                        In-Memory Pub-Sub / Event Bus
                      </h4>
                      <Badge variant="warning" className="text-[9px] px-1.5 py-0">
                        INTERMEDIATE
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[#78716c] truncate mt-0.5">
                      Observer Pattern, Producer-Consumer, Concurrency Locks
                    </p>
                  </div>
                  <div className="h-6 w-6 rounded-md flex items-center justify-center text-[#78716c] group-hover:text-[#1c1917] group-hover:translate-x-0.5 transition-transform shrink-0">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              </div>
            </Onboarding.Step>
          </div>

          {/* Pinned Bottom Navigation */}
          <div className="px-4 sm:px-6 py-3 border-t border-[#e7e5e4] bg-[#faf8f5] shrink-0">
            <StudioOnboardingNav
              onComplete={() => handleFinish()}
              onSkip={() => handleFinish()}
            />
          </div>
        </Onboarding>
      </div>
    </div>,
    document.body
  );
};
