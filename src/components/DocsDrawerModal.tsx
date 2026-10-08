"use client";

import React, { useState } from "react";
import { X, BookOpen } from "lucide-react";

interface DocsDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "research" | "design" | "ai";
}

export const DocsDrawerModal: React.FC<DocsDrawerModalProps> = ({
  isOpen,
  onClose,
  initialTab = "design",
}) => {
  const [activeTab, setActiveTab] = useState<"research" | "design" | "ai">(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1c1917]/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#faf8f5] border border-[#e7e5e4] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#e7e5e4] bg-[#fdfbf7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="h-4 sm:h-5 w-4 sm:w-5 text-[#1c1917] shrink-0" />
              <h2 className="text-sm sm:text-base font-serif font-bold text-[#1c1917] tracking-tight truncate">Assignment Deliverables & Notes</h2>
            </div>
            <button
              onClick={onClose}
              className="sm:hidden p-1.5 rounded-lg text-[#78716c] hover:text-[#1c1917] hover:bg-[#efece6] transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            <div className="flex items-center bg-[#efece6] p-0.5 rounded-lg border border-[#e7e5e4] text-xs w-full sm:w-auto overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab("research")}
                className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1 rounded-md font-medium transition cursor-pointer text-center whitespace-nowrap ${
                  activeTab === "research" ? "bg-[#1c1917] text-[#faf8f5] shadow-xs font-semibold" : "text-[#78716c] hover:text-[#1c1917]"
                }`}
              >
                Research Note
              </button>
              <button
                onClick={() => setActiveTab("design")}
                className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1 rounded-md font-medium transition cursor-pointer text-center whitespace-nowrap ${
                  activeTab === "design" ? "bg-[#1c1917] text-[#faf8f5] shadow-xs font-semibold" : "text-[#78716c] hover:text-[#1c1917]"
                }`}
              >
                Design Note
              </button>
              <button
                onClick={() => setActiveTab("ai")}
                className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1 rounded-md font-medium transition cursor-pointer text-center whitespace-nowrap ${
                  activeTab === "ai" ? "bg-[#1c1917] text-[#faf8f5] shadow-xs font-semibold" : "text-[#78716c] hover:text-[#1c1917]"
                }`}
              >
                AI Usage
              </button>
            </div>

            <button
              onClick={onClose}
              className="hidden sm:inline-flex p-1.5 rounded-lg text-[#78716c] hover:text-[#1c1917] hover:bg-[#efece6] transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 text-xs text-[#44403c] leading-relaxed font-sans bg-[#faf8f5]">
          {activeTab === "research" && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#fdfbf7] border border-[#e7e5e4] text-[#1c1917] shadow-xs">
                <span className="font-bold text-[#1c1917]">Deliverable 1: Research Note (1–2 Pages)</span>
                <p className="mt-1 text-[11px] text-[#78716c]">
                  Explores why LLD practice is fundamentally hard, analyzes current industry tools (LeetCode, NeetCode, Educative), identifies the &quot;Feedback Black Hole&quot;, and proposes our solution hypothesis.
                </p>
              </div>

              <div className="space-y-3 bg-[#fdfbf7] p-4 rounded-xl border border-[#e7e5e4] shadow-xs">
                <h3 className="text-sm font-serif font-bold text-[#1c1917]">1. The Learner Problem: The Feedback Black Hole</h3>
                <p>
                  Unlike Data Structures & Algorithms (where test cases output green/red deterministically), Low-Level Design has no single &quot;correct&quot; solution. Two valid designs for a Parking Lot can look completely different.
                </p>
                <p>
                  Learners currently practice by drawing diagrams on Excalidraw or typing in Google Docs, then comparing against an author&apos;s reference solution. This produces three critical failure modes:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[#57534e]">
                  <li><strong>False Confidence:</strong> Believing their design is good because it works in happy-path scenarios, unaware of God Objects or tight coupling.</li>
                  <li><strong>No Evidence-Based Diagnostics:</strong> Reading a reference solution does not tell the learner what was wrong in <em>their</em> submission.</li>
                  <li><strong>Broken Iteration Loop:</strong> Practice without feedback is just repetition, not learning.</li>
                </ul>

                <h3 className="text-sm font-serif font-bold text-[#1c1917] pt-2">2. Evaluation of Existing Approaches</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border border-[#e7e5e4] text-[11px]">
                    <thead className="bg-[#efece6] text-[#1c1917] font-semibold">
                      <tr>
                        <th className="p-2 border border-[#e7e5e4]">Platform</th>
                        <th className="p-2 border border-[#e7e5e4]">Submission</th>
                        <th className="p-2 border border-[#e7e5e4]">Feedback</th>
                        <th className="p-2 border border-[#e7e5e4]">Critical Gap</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border border-[#e7e5e4] font-semibold text-[#1c1917]">LeetCode / HackerRank</td>
                        <td className="p-2 border border-[#e7e5e4]">Full Code</td>
                        <td className="p-2 border border-[#e7e5e4]">Pass/Fail Tests</td>
                        <td className="p-2 border border-[#e7e5e4]">Tests functional execution, not architectural trade-offs or coupling.</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-[#e7e5e4] font-semibold text-[#1c1917]">Educative / Grokking LLD</td>
                        <td className="p-2 border border-[#e7e5e4]">Passive Reading</td>
                        <td className="p-2 border border-[#e7e5e4]">Static Reference Solutions</td>
                        <td className="p-2 border border-[#e7e5e4]">Zero active evaluation on candidate&apos;s own design attempts.</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-[#e7e5e4] font-semibold text-[#1c1917]">Raw ChatGPT / Claude</td>
                        <td className="p-2 border border-[#e7e5e4]">Freeform Prompt</td>
                        <td className="p-2 border border-[#e7e5e4]">Unconstrained text</td>
                        <td className="p-2 border border-[#e7e5e4]">Polite praise, hallucinated scores, no consistent rubric across attempts.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-sm font-serif font-bold text-[#1c1917] pt-2">3. Our Product Direction</h3>
                <p>
                  A lightweight studio built around a <strong>Fixed 5-Dimensional Architectural Rubric</strong> with <strong>Verbatim Evidence Pointing</strong> and <strong>Multi-Attempt Progression Tracking</strong>.
                </p>
              </div>
            </div>
          )}

          {activeTab === "design" && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#fdfbf7] border border-[#e7e5e4] text-[#1c1917] shadow-xs">
                <span className="font-bold text-[#1c1917]">Deliverable 2: Design Note & Architectural Decisions</span>
                <p className="mt-1 text-[11px] text-[#78716c]">
                  Explains the core domain model, aggregate roots, the Strategy Pattern implementations, and how our design passes Change Tests A and B.
                </p>
              </div>

              <div className="space-y-3 bg-[#fdfbf7] p-4 rounded-xl border border-[#e7e5e4] shadow-xs">
                <h3 className="text-sm font-serif font-bold text-[#1c1917]">1. Core Domain Objects & Responsibilities</h3>
                <ul className="list-disc pl-5 space-y-1 text-[#57534e]">
                  <li><strong>Problem (Entity):</strong> Encapsulates problem requirements, constraints, and its unique grading Rubric.</li>
                  <li><strong>Attempt (Aggregate Root):</strong> Manages the practice lifecycle for a candidate on a problem. Calculates <code>ProgressionDelta</code> across multiple submissions.</li>
                  <li><strong>Submission (Entity):</strong> Snapshot of candidate design. Manages lifecycle states (<code>DRAFT → SUBMITTED → EVALUATING → COMPLETED | FAILED</code>).</li>
                  <li><strong>Evaluator (Strategy Interface):</strong> Decouples evaluation execution. Implemented by <code>RuleBasedEvaluator</code>, <code>AIEvaluator</code>, and <code>CompositeEvaluator</code>.</li>
                  <li><strong>FeedbackToneStrategy (Strategy Interface):</strong> Decouples diagnostic data from presentation tone. Implemented by <code>MentorToneStrategy</code> and <code>RoastToneStrategy</code>.</li>
                </ul>

                <h3 className="text-sm font-serif font-bold text-[#1c1917] pt-2">2. Defence of the Two Change Tests</h3>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-[#efece6]/60 border border-[#e7e5e4]">
                    <span className="font-semibold text-[#1c1917]">Change Test A: Text today, Class Diagram tomorrow</span>
                    <p className="text-[11px] text-[#57534e] mt-1">
                      Our <code>Submission</code> entity has a polymorphic <code>format</code> field (<code>STRUCTURED_TEXT | PSEUDO_CODE | DIAGRAM_JSON</code>) and a generic <code>SubmissionPayload</code>. Adding diagram support does not alter <code>Attempt</code> lifecycle, state machine, or evaluation storage.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#efece6]/60 border border-[#e7e5e4]">
                    <span className="font-semibold text-[#1c1917]">Change Test B: AI evaluator today, Human/Rule evaluator tomorrow</span>
                    <p className="text-[11px] text-[#57534e] mt-1">
                      The submission controller only interacts with the <code>Evaluator</code> interface. Adding a human review queue is as simple as creating <code>HumanReviewEvaluator implements Evaluator</code> without modifying a single line of the practice workflow.
                    </p>
                  </div>
                </div>

                <h3 className="text-sm font-serif font-bold text-[#1c1917] pt-2">3. Deterministic vs AI Division</h3>
                <p>
                  Deterministic checks handle structural sanity (minimum word count, presence of classes and interfaces, empty submission detection). AI / Semantic heuristics handle qualitative reasoning (coupling analysis, God Object detection, concurrency invariants).
                </p>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#fdfbf7] border border-[#e7e5e4] text-[#1c1917] shadow-xs">
                <span className="font-bold text-[#1c1917]">Deliverable 4: AI_USAGE.md (3–5 Meaningful Decisions)</span>
                <p className="mt-1 text-[11px] text-[#78716c]">
                  Transparent breakdown of AI suggestions, what we accepted, what we rejected, and why engineering judgment prevailed.
                </p>
              </div>

              <div className="space-y-3 bg-[#fdfbf7] p-4 rounded-xl border border-[#e7e5e4] shadow-xs">
                <div className="p-3 rounded-lg bg-[#efece6]/60 border border-[#e7e5e4] space-y-1">
                  <span className="font-semibold text-[#1c1917]">Decision 1: Full Docker Code Sandbox vs Structured Design Editor</span>
                  <p className="text-[#57534e] text-[11px]">
                    <strong>AI Suggested:</strong> Build a Docker sandbox or use Judge0 to compile and execute Java/C++ code.
                  </p>
                  <p className="text-[#1c1917] text-[11px]">
                    <strong>Our Judgment (Rejected):</strong> Rejected because compilation tests execution correctness, not object-oriented design. Whiteboard LLD interviews test modeling and abstractions.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#efece6]/60 border border-[#e7e5e4] space-y-1">
                  <span className="font-semibold text-[#1c1917]">Decision 2: Freeform AI Prompt vs Strict Rubric Schema</span>
                  <p className="text-[#57534e] text-[11px]">
                    <strong>AI Suggested:</strong> Send code with a conversational prompt: &quot;Critique this LLD solution and rate it out of 100.&quot;
                  </p>
                  <p className="text-[#1c1917] text-[11px]">
                    <strong>Our Judgment (Rejected):</strong> Rejected due to severe hallucination and score drift. We mandated a fixed 5-dimension rubric with strict JSON schema and required verbatim evidence quotes.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#efece6]/60 border border-[#e7e5e4] space-y-1">
                  <span className="font-semibold text-[#1c1917]">Decision 3: Strategy Pattern for Tone Presentation</span>
                  <p className="text-[#57534e] text-[11px]">
                    <strong>AI Suggested:</strong> Prompt the LLM differently if user wants roast mode vs mentor mode.
                  </p>
                  <p className="text-[#1c1917] text-[11px]">
                    <strong>Our Judgment (Accepted & Architected):</strong> Decoupled evaluation from formatting using the Strategy Pattern (<code>FeedbackToneStrategy</code>).
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#efece6]/60 border border-[#e7e5e4] space-y-1">
                  <span className="font-semibold text-[#1c1917]">Decision 4: State Machine Pre-Persist on Submit</span>
                  <p className="text-[#1c1917] text-[11px]">
                    <strong>Engineering Decision:</strong> Persist submission to repository immediately in <code>SUBMITTED</code> state before invoking the evaluator to guarantee zero candidate data loss.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#e7e5e4] bg-[#fdfbf7] flex items-center justify-between">
          <span className="text-[11px] text-[#78716c]">
            Files: <code>RESEARCH_NOTE.md</code> • <code>DESIGN_NOTE.md</code> • <code>AI_USAGE.md</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#efece6] hover:bg-[#e7e5e4] text-xs font-medium text-[#1c1917] transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
