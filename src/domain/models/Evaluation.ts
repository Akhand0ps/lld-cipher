export interface CriterionScore {
  criterionId: string;
  criterionName: string;
  score: number; // 1 to 5 scale
  maxScore: number; // usually 5
  weight: number; // percentage weight, e.g., 20
  evidenceQuote: string; // verbatim quote from candidate's submission
  concern: string; // identified issue or anti-pattern
  suggestion: string; // concrete recommendation for improvement
}

export interface Evaluation {
  id: string;
  submissionId: string;
  evaluatorType: "RULE" | "AI" | "COMPOSITE";
  /**
   * Tracks which version of the evaluation prompt was used.
   * Enables the progression delta to warn when comparing scores across
   * different prompt versions (apples-to-oranges comparison).
   */
  promptVersion?: string;
  totalScore: number; // 0 to 100
  criteriaScores: CriterionScore[];
  strengths: string[];
  keyWeaknesses: string[];
  summary: string;
  evaluatedAt: string;
}
