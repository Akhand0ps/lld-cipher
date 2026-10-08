"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { ProblemPane } from "@/components/ProblemPane";
import { EditorPane } from "@/components/EditorPane";
import { DocsDrawerModal } from "@/components/DocsDrawerModal";
import { SubmissionDrawer } from "@/components/SubmissionDrawer";
import { Problem } from "@/domain/models/Problem";
import { SubmissionFormat } from "@/domain/models/Submission";
import { Evaluation } from "@/domain/models/Evaluation";
import { FormattedFeedback } from "@/domain/strategies/FeedbackToneStrategy";
import { ProgressionDelta } from "@/domain/models/Attempt";
import { SEED_PROBLEMS } from "@/domain/repositories/ProblemRepository";
import { ScreenSplitter } from "@/components/ui/screen-splitter";
import { BookOpen, Code, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Returns a stable session-scoped candidate ID.
 * Generates a random UUID on first visit and persists it in localStorage
 * so history and progression delta remain consistent for the same browser session.
 * This is a lightweight substitute for full auth — sufficient for MVP demo.
 */
function getOrCreateCandidateId(): string {
  const STORAGE_KEY = "lld_studio_candidate_id";
  if (typeof window === "undefined") return "ssr-placeholder";
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const newId = `learner_${crypto.randomUUID()}`;
  localStorage.setItem(STORAGE_KEY, newId);
  return newId;
}

interface SubmissionHistoryItem {
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

interface ProblemStudioWorkspaceProps {
  problemId: string;
}

export const ProblemStudioWorkspace: React.FC<ProblemStudioWorkspaceProps> = ({
  problemId,
}) => {
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>(SEED_PROBLEMS);

  // Session-scoped candidate identity — stable per browser, no auth required.
  // Initialized lazily via useRef to avoid SSR mismatch.
  const candidateIdRef = useRef<string>("demo-learner");
  useEffect(() => {
    candidateIdRef.current = getOrCreateCandidateId();
  }, []);

  // Find current problem, defaulting to matching SEED_PROBLEMS
  const initialProblem = SEED_PROBLEMS.find((p) => p.id === problemId) || SEED_PROBLEMS[0];
  const [activeProblem, setActiveProblem] = useState<Problem>(initialProblem);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [history, setHistory] = useState<SubmissionHistoryItem[]>([]);
  const [progressionDelta, setProgressionDelta] = useState<ProgressionDelta | null>(null);

  const [editorPayload, setEditorPayload] = useState({
    requirementsAnalysis: initialProblem.starterTemplates?.requirementsAnalysis || "",
    classDesign: initialProblem.starterTemplates?.classDesign || "",
    relationshipsAndPatterns: initialProblem.starterTemplates?.relationshipsAndPatterns || "",
  });

  const [tone, setTone] = useState<"MENTOR" | "ROAST">("MENTOR");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationState, setEvaluationState] = useState("DRAFT");

  // LeetCode-style Inline Tab Navigation & Selected Submission
  const [activeTab, setActiveTab] = useState<"requirements" | "rubric" | "attempts" | "submissions">("requirements");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [submissionDrawerOpen, setSubmissionDrawerOpen] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<Evaluation | null>(null);
  const [currentFeedback, setCurrentFeedback] = useState<FormattedFeedback | null>(null);
  const [currentSequenceNumber, setCurrentSequenceNumber] = useState(1);

  const [docsOpen, setDocsOpen] = useState(false);
  const [docsTab, setDocsTab] = useState<"research" | "design" | "ai">("design");

  // LeetCode-style Screen Splitter (Draggable split pane with persistence)
  const containerRef = useRef<HTMLDivElement>(null);
  const [splitRatio, setSplitRatio] = useState<number>(48);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  const [mobileView, setMobileView] = useState<"problem" | "editor">("problem");

  // Restore preferred split ratio from localStorage with safe bounds
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lld_studio_split_ratio");
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 28 && parsed <= 72) {
          setSplitRatio(parsed);
        } else {
          setSplitRatio(48);
        }
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  // Monitor desktop viewport width and re-clamp split ratio dynamically
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const minLeftPx = 360;
      const minRightPx = 360;
      if (rect.width <= minLeftPx + minRightPx) return;

      setSplitRatio((prev) => {
        const currentLeftPx = (prev / 100) * rect.width;
        const clampedLeftPx = Math.max(
          minLeftPx,
          Math.min(rect.width - minRightPx, currentLeftPx)
        );
        return (clampedLeftPx / rect.width) * 100;
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Smooth dragging with pointer event clamping and text-selection prevention
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const minLeftPx = 360;
      const minRightPx = 360;
      if (rect.width <= minLeftPx + minRightPx) return;

      const offset = clientX - rect.left;
      const leftPx = Math.max(minLeftPx, Math.min(rect.width - minRightPx, offset));
      const clampedRatio = (leftPx / rect.width) * 100;
      setSplitRatio(clampedRatio);
    };

    const onPointerMove = (e: PointerEvent) => {
      e.preventDefault();
      handleMove(e.clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    const onEnd = () => {
      setIsDragging(false);
      setSplitRatio((curr) => {
        try {
          localStorage.setItem("lld_studio_split_ratio", curr.toString());
        } catch {
          // Ignore storage errors
        }
        return curr;
      });
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onEnd);

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  const handleResetSplit = () => {
    setSplitRatio(48);
    try {
      localStorage.setItem("lld_studio_split_ratio", "48");
    } catch {
      // Ignore storage errors
    }
  };

  // Load all problems for the header switcher
  useEffect(() => {
    async function fetchProblems() {
      try {
        const res = await fetch("/api/problems");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setProblems(json.data);
          const found = json.data.find((p: Problem) => p.id === problemId);
          if (found) {
            setActiveProblem(found);
          }
        }
      } catch (err) {
        console.error("Failed to load problems:", err);
      }
    }
    fetchProblems();
  }, [problemId]);

  // Fetch attempt history whenever active problem changes
  const loadAttemptForProblem = useCallback(async (problem: Problem) => {
    const candidateId = candidateIdRef.current;
    try {
      const res = await fetch(`/api/attempts?problemId=${problem.id}&candidateId=${candidateId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const attemptData = json.data;
        setAttemptId(attemptData.id);

        const subs: SubmissionHistoryItem[] = (attemptData.submissions || []).map((s: {
          id: string;
          sequenceNumber: number;
          submittedAt: string;
          state: string;
          evaluation?: Evaluation;
          payload?: {
            requirementsAnalysis?: string;
            classDesign?: string;
            relationshipsAndPatterns?: string;
          };
        }) => ({
          id: s.id,
          sequenceNumber: s.sequenceNumber,
          submittedAt: s.submittedAt,
          state: s.state,
          totalScore: s.evaluation?.totalScore,
          evaluation: s.evaluation,
          payload: s.payload,
        }));
        setHistory(subs);
        setProgressionDelta(attemptData.latestProgression || null);

        // Preload editor with latest submission or template
        if (subs.length > 0 && subs[subs.length - 1].payload) {
          const lastPayload = subs[subs.length - 1].payload!;
          setEditorPayload({
            requirementsAnalysis: lastPayload.requirementsAnalysis || "",
            classDesign: lastPayload.classDesign || "",
            relationshipsAndPatterns: lastPayload.relationshipsAndPatterns || "",
          });
        } else if (problem.starterTemplates) {
          setEditorPayload({
            requirementsAnalysis: problem.starterTemplates.requirementsAnalysis || "",
            classDesign: problem.starterTemplates.classDesign || "",
            relationshipsAndPatterns: problem.starterTemplates.relationshipsAndPatterns || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch attempt:", err);
    }
  }, []);

  useEffect(() => {
    if (activeProblem) {
      loadAttemptForProblem(activeProblem);
    }
  }, [activeProblem, loadAttemptForProblem]);

  // Reset editor to active problem's starter template
  const handleResetTemplate = () => {
    if (activeProblem?.starterTemplates) {
      setEditorPayload({
        requirementsAnalysis: activeProblem.starterTemplates.requirementsAnalysis || "",
        classDesign: activeProblem.starterTemplates.classDesign || "",
        relationshipsAndPatterns: activeProblem.starterTemplates.relationshipsAndPatterns || "",
      });
    } else {
      setEditorPayload({
        requirementsAnalysis: "",
        classDesign: "",
        relationshipsAndPatterns: "",
      });
    }
  };

  // Submit candidate design for evaluation
  const handleSubmitDesign = async (
    format: SubmissionFormat,
    evaluatorType: "COMPOSITE" | "RULE" | "AI"
  ) => {
    if (!activeProblem) return;

    setIsEvaluating(true);
    setEvaluationState("SUBMITTED");
    setSubmissionDrawerOpen(true);

    try {
      setTimeout(() => setEvaluationState("EVALUATING"), 300);

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: activeProblem.id,
          candidateId: candidateIdRef.current,
          attemptId: attemptId,
          payload: editorPayload,
          format,
          tone,
          evaluatorType,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setEvaluationState("COMPLETED");
        const { submission, evaluation, formattedFeedback, progressionDelta: delta } = json.data;

        setCurrentEvaluation(evaluation);
        setCurrentFeedback(formattedFeedback);
        setCurrentSequenceNumber(submission.sequenceNumber);
        setProgressionDelta(delta);
        setSelectedSubmissionId(submission.id);
        setAttemptId(json.data.attempt?.id || attemptId);

        const submittedPayload = {
          requirementsAnalysis: editorPayload.requirementsAnalysis,
          classDesign: editorPayload.classDesign,
          relationshipsAndPatterns: editorPayload.relationshipsAndPatterns,
        };

        setHistory((prev) => [
          ...prev,
          {
            id: submission.id,
            sequenceNumber: submission.sequenceNumber,
            submittedAt: submission.submittedAt,
            state: submission.state,
            totalScore: evaluation.totalScore,
            evaluation,
            formattedFeedback,
            payload: submittedPayload,
          },
        ]);

        // Pre-populate editor with submitted payload so retry is a real refactor,
        // not starting from scratch. The learner edits their existing design in place.
        setEditorPayload(submittedPayload);

        // Keep submission drawer open (LeetCode style bottom sheet over the editor pane)
        setSubmissionDrawerOpen(true);
      } else {
        alert(json.error || "Evaluation failed. Please review your submission.");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Submission encountered an unexpected error.");
    } finally {
      setIsEvaluating(false);
      setEvaluationState("DRAFT");
    }
  };

  // Inspect past submission from history tab
  const handleSelectHistorySubmission = (subId: string) => {
    setSelectedSubmissionId(subId);
    setSubmissionDrawerOpen(true);

    const item = history.find((h) => h.id === subId);
    if (item && item.evaluation) {
      setCurrentEvaluation(item.evaluation);
      setCurrentSequenceNumber(item.sequenceNumber);
      if (item.formattedFeedback) {
        setCurrentFeedback(item.formattedFeedback);
      }
    }
  };

  // Load a historical submission's code back into the editor
  const handleLoadSubmissionCode = (payload: {
    requirementsAnalysis?: string;
    classDesign?: string;
    relationshipsAndPatterns?: string;
  }) => {
    if (payload) {
      setEditorPayload({
        requirementsAnalysis: payload.requirementsAnalysis || "",
        classDesign: payload.classDesign || "",
        relationshipsAndPatterns: payload.relationshipsAndPatterns || "",
      });
    }
  };

  // Toggle tone persona
  const handleToggleTone = (newTone: "MENTOR" | "ROAST") => {
    setTone(newTone);
    if (currentEvaluation) {
      const isRoast = newTone === "ROAST";
      const headline = isRoast
        ? currentEvaluation.totalScore >= 75
          ? "Wait... did you actually write decent interfaces? 🧐"
          : "Senior Dev is grabbing a coffee to survive this code review. ☕"
        : currentEvaluation.totalScore >= 75
        ? "Exemplary Architecture! Highly cohesive design."
        : "Constructive Review: Focus on decomposing larger classes.";

      const updated: FormattedFeedback = {
        toneName: newTone,
        headline,
        badgeEmoji: isRoast ? "🔥" : "🎓",
        verdictNarrative: currentEvaluation.summary,
        critiqueItems: currentEvaluation.criteriaScores.map((cs) => ({
          criterionName: cs.criterionName,
          score: cs.score,
          toneRemark: isRoast
            ? cs.score <= 2
              ? `God Object / Anti-pattern alert: ${cs.concern}`
              : `Fair enough, at least this part isn't completely broken.`
            : `Score: ${cs.score}/5. ${cs.concern}`,
          evidenceQuote: cs.evidenceQuote,
          suggestion: cs.suggestion,
        })),
        concludingAdvice: isRoast
          ? "Fix the God Objects and try again before you trigger an outage."
          : "Refactor based on the suggestions and check your progression delta!",
      };
      setCurrentFeedback(updated);
    }
  };

  const rawActiveSubmission =
    history.find((h) => h.id === selectedSubmissionId) ||
    (history.length > 0 ? history[history.length - 1] : null);

  const activeSubmission = rawActiveSubmission
    ? {
        ...rawActiveSubmission,
        evaluation: currentEvaluation || rawActiveSubmission.evaluation,
        formattedFeedback: currentFeedback || rawActiveSubmission.formattedFeedback,
      }
    : null;

  return (
    <div className="flex flex-col h-screen w-full bg-[#faf8f5] text-[#1c1917] overflow-hidden font-sans">
      {/* Top Application Bar with Navigation */}
      <Header
        problems={problems}
        activeProblem={activeProblem}
        tone={tone}
        onToggleTone={handleToggleTone}
        submissionCount={history.length}
        onOpenDocs={() => setDocsOpen(true)}
      />

      {/* Mobile Workspace View Switcher (Only visible on screens < 1024px) */}
      <div className="lg:hidden flex items-center justify-between px-3 py-1.5 bg-[#f0eee9] border-b border-[#e7e5e4] text-xs shrink-0 select-none">
        <div className="flex items-center gap-1 p-0.5 bg-white/80 rounded-lg border border-[#e7e5e4] shadow-2xs">
          <button
            onClick={() => setMobileView("problem")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition cursor-pointer",
              mobileView === "problem"
                ? "bg-[#1c1917] text-white shadow-xs font-semibold"
                : "text-[#78716c] hover:text-[#1c1917]"
            )}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Problem Context</span>
          </button>
          <button
            onClick={() => setMobileView("editor")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition cursor-pointer",
              mobileView === "editor"
                ? "bg-[#1c1917] text-white shadow-xs font-semibold"
                : "text-[#78716c] hover:text-[#1c1917]"
            )}
          >
            <Code className="h-3.5 w-3.5" />
            <span>Code Editor</span>
            {editorPayload.classDesign?.trim() && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            )}
          </button>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setSubmissionDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#e7e5e4] text-[#1c1917] font-mono text-[11px] font-bold shadow-2xs cursor-pointer"
          >
            <Terminal className="h-3 w-3 text-[#78716c]" />
            <span>{history[history.length - 1].totalScore ?? 0}/100</span>
          </button>
        )}
      </div>

      {/* Main Studio Split Workspace with LeetCode-style Draggable Splitter */}
      <main
        ref={containerRef}
        className={cn(
          "flex-1 flex flex-col lg:flex-row overflow-hidden relative",
          isDragging && "select-none"
        )}
      >
        {/* Transparent global drag overlay to prevent iframe / textarea mouse event swallowing */}
        {isDragging && (
          <div className="fixed inset-0 z-50 cursor-col-resize select-none" />
        )}

        {/* Left Pane: Problem Context, Requirements & Submissions */}
        <div
          style={isDesktop ? { width: `${splitRatio}%` } : undefined}
          className={cn(
            "w-full h-full overflow-hidden min-w-0 shrink-0",
            isDesktop
              ? "block"
              : mobileView === "problem"
              ? "flex-1 block"
              : "hidden"
          )}
        >
          <ProblemPane
            problem={activeProblem}
            history={history}
            selectedSubmissionId={selectedSubmissionId}
            onSelectSubmission={handleSelectHistorySubmission}
            progressionDelta={progressionDelta}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tone={tone}
            onToggleTone={handleToggleTone}
            onLoadSubmissionCode={handleLoadSubmissionCode}
          />
        </div>

        {/* LeetCode-style Draggable Screen Splitter */}
        <ScreenSplitter
          isDragging={isDragging}
          onPointerDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onTouchStart={() => setIsDragging(true)}
          onDoubleClick={handleResetSplit}
          splitRatio={splitRatio}
        />

        {/* Right Pane: Multi-Section Design Editor with LeetCode-style bottom slide-up Submission Drawer */}
        <div
          className={cn(
            "w-full h-full relative flex flex-col overflow-hidden min-w-0",
            isDesktop
              ? "lg:flex-1"
              : mobileView === "editor"
              ? "flex-1 flex"
              : "hidden"
          )}
        >
          <EditorPane
            payload={editorPayload}
            onChangePayload={setEditorPayload}
            onSubmit={handleSubmitDesign}
            onResetTemplate={handleResetTemplate}
            isEvaluating={isEvaluating}
            evaluationState={evaluationState}
            hasSubmission={history.length > 0}
            onOpenSubmissionDrawer={() => setSubmissionDrawerOpen(true)}
            latestScore={
              history.length > 0 && history[history.length - 1].totalScore !== undefined
                ? history[history.length - 1].totalScore
                : undefined
            }
          />

          <SubmissionDrawer
            isOpen={submissionDrawerOpen}
            onClose={() => setSubmissionDrawerOpen(false)}
            isEvaluating={isEvaluating}
            evaluationState={evaluationState}
            activeSubmission={activeSubmission}
            history={history}
            onSelectSubmission={handleSelectHistorySubmission}
            progressionDelta={progressionDelta}
            tone={tone}
            onToggleTone={handleToggleTone}
            onLoadSubmissionCode={handleLoadSubmissionCode}
          />
        </div>
      </main>

      {/* Assignment Deliverables Drawer Modal */}
      <DocsDrawerModal
        isOpen={docsOpen}
        onClose={() => setDocsOpen(false)}
        initialTab={docsTab}
      />
    </div>
  );
};
