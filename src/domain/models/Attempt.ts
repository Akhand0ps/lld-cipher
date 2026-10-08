import { Submission, SubmissionPayload, SubmissionFormat } from "./Submission";

export interface CriterionDelta {
  criterionId: string;
  criterionName: string;
  previousScore: number;
  currentScore: number;
  delta: number;
}

export interface ProgressionTimelinePoint {
  sequenceNumber: number;
  submissionId: string;
  totalScore: number;
  criteriaScores: { criterionId: string; criterionName: string; score: number }[];
  submittedAt: string;
  deltaFromInitial: number;
}

export interface ProgressionDelta {
  hasProgression: boolean;
  previousSubmissionId?: string;
  currentSubmissionId?: string;
  overallScoreDelta: number;
  previousOverallScore: number;
  currentOverallScore: number;
  personalBestScore?: number;
  deltaFromPersonalBest?: number;
  criteriaDeltas: CriterionDelta[];
  progressionHighlights: string[];
}

export class Attempt {
  public id: string;
  public problemId: string;
  public candidateId: string;
  public createdAt: string;
  public updatedAt: string;
  public submissions: Submission[];

  constructor(params: {
    id: string;
    problemId: string;
    candidateId: string;
    createdAt?: string;
    updatedAt?: string;
    submissions?: Submission[];
  }) {
    this.id = params.id;
    this.problemId = params.problemId;
    this.candidateId = params.candidateId;
    this.createdAt = params.createdAt || new Date().toISOString();
    this.updatedAt = params.updatedAt || new Date().toISOString();
    this.submissions = params.submissions || [];
  }

  public createNewSubmission(payload: SubmissionPayload, format: SubmissionFormat = "STRUCTURED_TEXT"): Submission {
    const nextSeq = this.submissions.length + 1;
    const submission = new Submission({
      id: `sub_${this.id}_${nextSeq}_${Date.now().toString(36)}`,
      attemptId: this.id,
      sequenceNumber: nextSeq,
      format,
      payload,
      state: "DRAFT",
    });

    this.submissions.push(submission);
    this.updatedAt = new Date().toISOString();
    return submission;
  }

  public getLatestSubmission(): Submission | undefined {
    if (this.submissions.length === 0) return undefined;
    return this.submissions[this.submissions.length - 1];
  }

  public getPreviousSubmission(): Submission | undefined {
    if (this.submissions.length < 2) return undefined;
    return this.submissions[this.submissions.length - 2];
  }

  /**
   * Differentiator: Computes multi-attempt progression delta per rubric dimension
   */
  public calculateProgressionDelta(): ProgressionDelta {
    const current = this.getLatestSubmission();
    const previous = this.getPreviousSubmission();

    if (!current?.evaluation || !previous?.evaluation) {
      return {
        hasProgression: false,
        overallScoreDelta: 0,
        previousOverallScore: previous?.evaluation?.totalScore || 0,
        currentOverallScore: current?.evaluation?.totalScore || 0,
        criteriaDeltas: [],
        progressionHighlights: [
          current?.evaluation
            ? "First evaluated attempt. Submit another revision to track progression delta!"
            : "No evaluated submissions yet.",
        ],
      };
    }

    const prevEval = previous.evaluation;
    const currEval = current.evaluation;
    const overallDelta = currEval.totalScore - prevEval.totalScore;

    const criteriaDeltas: CriterionDelta[] = [];
    const highlights: string[] = [];

    // Warn if the two evaluations used different prompt versions.
    // Score comparisons across prompt versions may not be apples-to-apples.
    if (
      prevEval.promptVersion &&
      currEval.promptVersion &&
      prevEval.promptVersion !== currEval.promptVersion
    ) {
      highlights.push(
        `⚠️ Note: Evaluator prompt was updated between these attempts (${prevEval.promptVersion} → ${currEval.promptVersion}). Scores may not be directly comparable.`
      );
    }

    currEval.criteriaScores.forEach((currScore) => {
      const prevScore = prevEval.criteriaScores.find((p) => p.criterionId === currScore.criterionId);
      const prevVal = prevScore ? prevScore.score : 0;
      const delta = currScore.score - prevVal;

      criteriaDeltas.push({
        criterionId: currScore.criterionId,
        criterionName: currScore.criterionName,
        previousScore: prevVal,
        currentScore: currScore.score,
        delta,
      });

      if (delta > 0) {
        highlights.push(`Improved "${currScore.criterionName}" by +${delta} points (${prevVal} → ${currScore.score}).`);
      } else if (delta < 0) {
        highlights.push(`Regression in "${currScore.criterionName}" by ${delta} points (${prevVal} → ${currScore.score}).`);
      }
    });

    if (overallDelta > 0) {
      highlights.unshift(`Overall score increased by +${overallDelta}% (from ${prevEval.totalScore} to ${currEval.totalScore}).`);
    } else if (overallDelta === 0) {
      highlights.unshift(`Overall score remained steady at ${currEval.totalScore}%.`);
    } else {
      highlights.unshift(`Overall score shifted by ${overallDelta}% (from ${prevEval.totalScore} to ${currEval.totalScore}).`);
    }

    // Calculate personal best comparison across all completed submissions
    const completed = this.submissions.filter((s) => s.state === "COMPLETED" && s.evaluation);
    const priorCompleted = completed.filter((s) => s.id !== current.id);
    const personalBestPrior = priorCompleted.length > 0
      ? Math.max(...priorCompleted.map((s) => s.evaluation!.totalScore))
      : prevEval.totalScore;
    const personalBestAll = completed.length > 0
      ? Math.max(...completed.map((s) => s.evaluation!.totalScore))
      : currEval.totalScore;

    if (currEval.totalScore > personalBestPrior && priorCompleted.length > 0) {
      highlights.push(`🏆 New personal best score (${currEval.totalScore}% vs prior best ${personalBestPrior}%)!`);
    }

    return {
      hasProgression: true,
      previousSubmissionId: previous.id,
      currentSubmissionId: current.id,
      overallScoreDelta: overallDelta,
      previousOverallScore: prevEval.totalScore,
      currentOverallScore: currEval.totalScore,
      personalBestScore: personalBestAll,
      deltaFromPersonalBest: currEval.totalScore - personalBestPrior,
      criteriaDeltas,
      progressionHighlights: highlights,
    };
  }

  /**
   * Returns a complete chronological progression timeline across all evaluated attempts.
   */
  public getFullProgressionTimeline(): ProgressionTimelinePoint[] {
    const completed = this.submissions.filter(
      (s) => s.state === "COMPLETED" && s.evaluation
    );
    if (completed.length === 0) return [];
    const initialScore = completed[0].evaluation!.totalScore;

    return completed.map((s) => ({
      sequenceNumber: s.sequenceNumber,
      submissionId: s.id,
      totalScore: s.evaluation!.totalScore,
      criteriaScores: s.evaluation!.criteriaScores.map((c) => ({
        criterionId: c.criterionId,
        criterionName: c.criterionName,
        score: c.score,
      })),
      submittedAt: s.submittedAt,
      deltaFromInitial: s.evaluation!.totalScore - initialScore,
    }));
  }

  public toJSON() {
    return {
      id: this.id,
      problemId: this.problemId,
      candidateId: this.candidateId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      submissions: this.submissions.map((s) => s.toJSON()),
      latestProgression: this.calculateProgressionDelta(),
      progressionTimeline: this.getFullProgressionTimeline(),
    };
  }
}
