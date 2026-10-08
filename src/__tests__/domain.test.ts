import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Attempt } from "../domain/models/Attempt";
import { Submission } from "../domain/models/Submission";
import { problemRepository } from "../domain/repositories/ProblemRepository";
import { RuleBasedEvaluator } from "../domain/evaluators/RuleBasedEvaluator";
import { CompositeEvaluator } from "../domain/evaluators/CompositeEvaluator";
import { MentorToneStrategy } from "../domain/strategies/MentorToneStrategy";
import { RoastToneStrategy } from "../domain/strategies/RoastToneStrategy";

describe("LLD Practice Platform - Domain Test Suite", () => {
  it("Attempt aggregate root properly creates submissions with incrementing sequence", () => {
    const attempt = new Attempt({
      id: "attempt-1",
      problemId: "parking-lot-system",
      candidateId: "user-1",
    });

    assert.equal(attempt.submissions.length, 0);

    const sub1 = attempt.createNewSubmission({
      requirementsAnalysis: "Requirements 1",
      classDesign: "Class 1",
    });

    assert.equal(sub1.sequenceNumber, 1);
    assert.equal(sub1.state, "DRAFT");
    assert.equal(attempt.submissions.length, 1);

    const sub2 = attempt.createNewSubmission({
      requirementsAnalysis: "Requirements 2",
      classDesign: "Class 2",
    });

    assert.equal(sub2.sequenceNumber, 2);
    assert.equal(attempt.submissions.length, 2);
    assert.equal(attempt.getLatestSubmission()?.id, sub2.id);
  });

  it("Submission state transitions enforce strict lifecycle guards", () => {
    const sub = new Submission({
      id: "sub-1",
      attemptId: "att-1",
      sequenceNumber: 1,
      payload: { requirementsAnalysis: "test" },
      state: "DRAFT",
    });

    // Valid lifecycle: DRAFT -> SUBMITTED -> EVALUATING -> COMPLETED
    sub.submit();
    assert.equal(sub.state, "SUBMITTED");

    // Invalid transition: cannot complete before evaluating
    assert.throws(() => {
      sub.markCompleted({
        id: "eval-1",
        submissionId: sub.id,
        evaluatorType: "RULE",
        totalScore: 50,
        criteriaScores: [],
        strengths: [],
        keyWeaknesses: [],
        summary: "test",
        evaluatedAt: new Date().toISOString(),
      });
    }, /Cannot complete evaluation/);

    sub.markEvaluating();
    assert.equal(sub.state, "EVALUATING");

    sub.markCompleted({
      id: "eval-1",
      submissionId: sub.id,
      evaluatorType: "RULE",
      totalScore: 75,
      criteriaScores: [],
      strengths: ["Clean"],
      keyWeaknesses: [],
      summary: "Passed",
      evaluatedAt: new Date().toISOString(),
    });
    assert.equal(sub.state, "COMPLETED");
    assert.equal(sub.evaluation?.totalScore, 75);
  });

  it("Attempt calculates multi-attempt progression delta accurately (Differentiator #2)", () => {
    const attempt = new Attempt({
      id: "att-prog",
      problemId: "parking-lot-system",
      candidateId: "user-prog",
    });

    const sub1 = attempt.createNewSubmission({ requirementsAnalysis: "v1" });
    sub1.submit();
    sub1.markEvaluating();
    sub1.markCompleted({
      id: "eval-1",
      submissionId: sub1.id,
      evaluatorType: "RULE",
      totalScore: 50,
      criteriaScores: [
        {
          criterionId: "srp-cohesion",
          criterionName: "Single Responsibility & Cohesion",
          score: 2,
          maxScore: 5,
          weight: 25,
          evidenceQuote: "Quote 1",
          concern: "God Object",
          suggestion: "Separate classes",
        },
      ],
      strengths: [],
      keyWeaknesses: ["God Object"],
      summary: "Initial",
      evaluatedAt: new Date().toISOString(),
    });

    const sub2 = attempt.createNewSubmission({ requirementsAnalysis: "v2" });
    sub2.submit();
    sub2.markEvaluating();
    sub2.markCompleted({
      id: "eval-2",
      submissionId: sub2.id,
      evaluatorType: "RULE",
      totalScore: 75,
      criteriaScores: [
        {
          criterionId: "srp-cohesion",
          criterionName: "Single Responsibility & Cohesion",
          score: 4,
          maxScore: 5,
          weight: 25,
          evidenceQuote: "Quote 2",
          concern: "None",
          suggestion: "Keep it up",
        },
      ],
      strengths: ["High Cohesion"],
      keyWeaknesses: [],
      summary: "Revised",
      evaluatedAt: new Date().toISOString(),
    });

    const progression = attempt.calculateProgressionDelta();
    assert.equal(progression.hasProgression, true);
    assert.equal(progression.overallScoreDelta, 25); // 75 - 50 = +25
    assert.equal(progression.criteriaDeltas.length, 1);
    assert.equal(progression.criteriaDeltas[0].delta, 2); // 4 - 2 = +2 points
  });

  it("RuleBasedEvaluator detects empty/deficient submissions deterministically", async () => {
    const problem = (await problemRepository.findById("parking-lot-system"))!;
    const evaluator = new RuleBasedEvaluator();

    const emptySub = new Submission({
      id: "sub-empty",
      attemptId: "att-empty",
      sequenceNumber: 1,
      payload: { requirementsAnalysis: "" },
      state: "SUBMITTED",
    });

    const result = await evaluator.evaluate(emptySub, problem);
    assert.ok(result.totalScore < 40);
    assert.ok(result.keyWeaknesses.length > 0);
  });

  it("CompositeEvaluator short-circuits deficient submissions before calling AI", async () => {
    const problem = (await problemRepository.findById("parking-lot-system"))!;
    const composite = new CompositeEvaluator();

    const deficientSub = new Submission({
      id: "sub-deficient",
      attemptId: "att-deficient",
      sequenceNumber: 1,
      payload: { requirementsAnalysis: "tiny", classDesign: "" },
      state: "SUBMITTED",
    });

    const result = await composite.evaluate(deficientSub, problem);
    assert.ok(result.totalScore < 30);
    assert.match(result.summary, /Deterministic structural check failed/);
  });

  it("FeedbackToneStrategy switches persona dynamically (Strategy Pattern / Roast Mode)", async () => {
    const mentor = new MentorToneStrategy();
    const roast = new RoastToneStrategy();

    const sampleEvaluation = {
      id: "eval-test",
      submissionId: "sub-test",
      evaluatorType: "COMPOSITE" as const,
      totalScore: 35,
      criteriaScores: [
        {
          criterionId: "srp-cohesion",
          criterionName: "Single Responsibility & Cohesion",
          score: 1,
          maxScore: 5,
          weight: 25,
          evidenceQuote: "class GodClass",
          concern: "Monolithic God Object",
          suggestion: "Decompose into smaller classes",
        },
      ],
      strengths: [],
      keyWeaknesses: ["God Object"],
      summary: "Needs refactoring",
      evaluatedAt: new Date().toISOString(),
    };

    const mentorFeedback = mentor.format(sampleEvaluation);
    const roastFeedback = roast.format(sampleEvaluation);

    assert.equal(mentorFeedback.toneName, "MENTOR");
    assert.equal(roastFeedback.toneName, "ROAST");
    assert.match(mentorFeedback.headline, /Good Initial Attempt/);
    assert.match(roastFeedback.headline, /PagerDuty|Senior Dev/);
    assert.match(roastFeedback.critiqueItems[0].toneRemark, /God Object|Prime Minister|responsibilities/);
  });

  it("Change Test A: Submission accepts polymorphic diagram payload without contract changes", () => {
    const diagramSub = new Submission({
      id: "sub-diag",
      attemptId: "att-diag",
      sequenceNumber: 1,
      format: "DIAGRAM_JSON",
      payload: {
        diagramData: JSON.stringify({ nodes: ["ParkingLot", "Spot"], edges: ["has-many"] }),
        notes: "UML Class diagram payload",
      },
      state: "DRAFT",
    });

    assert.equal(diagramSub.format, "DIAGRAM_JSON");
    assert.ok(diagramSub.payload.diagramData);
  });

  it("Attempt generates full progression timeline and tracks personal best across iterations", () => {
    const attempt = new Attempt({
      id: "att-timeline",
      problemId: "parking-lot-system",
      candidateId: "user-timeline",
    });

    // Sub 1: 45%
    const s1 = attempt.createNewSubmission({ requirementsAnalysis: "reqs" });
    s1.submit();
    s1.markEvaluating();
    s1.markCompleted({
      id: "ev-1",
      submissionId: s1.id,
      evaluatorType: "RULE",
      promptVersion: "v1.0",
      totalScore: 45,
      criteriaScores: [{ criterionId: "srp-cohesion", criterionName: "SRP", score: 2, maxScore: 5, weight: 25, evidenceQuote: "q1", concern: "c1", suggestion: "s1" }],
      strengths: [],
      keyWeaknesses: [],
      summary: "First",
      evaluatedAt: new Date().toISOString(),
    });

    // Sub 2: 70%
    const s2 = attempt.createNewSubmission({ requirementsAnalysis: "reqs2" });
    s2.submit();
    s2.markEvaluating();
    s2.markCompleted({
      id: "ev-2",
      submissionId: s2.id,
      evaluatorType: "RULE",
      promptVersion: "v1.0",
      totalScore: 70,
      criteriaScores: [{ criterionId: "srp-cohesion", criterionName: "SRP", score: 4, maxScore: 5, weight: 25, evidenceQuote: "q2", concern: "c2", suggestion: "s2" }],
      strengths: [],
      keyWeaknesses: [],
      summary: "Second",
      evaluatedAt: new Date().toISOString(),
    });

    // Sub 3: 85%
    const s3 = attempt.createNewSubmission({ requirementsAnalysis: "reqs3" });
    s3.submit();
    s3.markEvaluating();
    s3.markCompleted({
      id: "ev-3",
      submissionId: s3.id,
      evaluatorType: "RULE",
      promptVersion: "v1.0",
      totalScore: 85,
      criteriaScores: [{ criterionId: "srp-cohesion", criterionName: "SRP", score: 5, maxScore: 5, weight: 25, evidenceQuote: "q3", concern: "c3", suggestion: "s3" }],
      strengths: [],
      keyWeaknesses: [],
      summary: "Third",
      evaluatedAt: new Date().toISOString(),
    });

    const timeline = attempt.getFullProgressionTimeline();
    assert.equal(timeline.length, 3);
    assert.equal(timeline[0].totalScore, 45);
    assert.equal(timeline[1].totalScore, 70);
    assert.equal(timeline[2].totalScore, 85);
    assert.equal(timeline[2].deltaFromInitial, 40); // 85 - 45 = +40

    const delta = attempt.calculateProgressionDelta();
    assert.equal(delta.hasProgression, true);
    assert.equal(delta.personalBestScore, 85);
    assert.equal(delta.deltaFromPersonalBest, 15); // 85 - 70 = +15 over prior best
    assert.ok(delta.progressionHighlights.some((h) => h.includes("New personal best")));
  });

  it("Attempt warns when comparing evaluations with different prompt versions", () => {
    const attempt = new Attempt({
      id: "att-prompt-warn",
      problemId: "parking-lot-system",
      candidateId: "user-warn",
    });

    const s1 = attempt.createNewSubmission({ requirementsAnalysis: "reqs" });
    s1.submit();
    s1.markEvaluating();
    s1.markCompleted({
      id: "ev-v1",
      submissionId: s1.id,
      evaluatorType: "AI",
      promptVersion: "v1.0",
      totalScore: 50,
      criteriaScores: [],
      strengths: [],
      keyWeaknesses: [],
      summary: "v1 eval",
      evaluatedAt: new Date().toISOString(),
    });

    const s2 = attempt.createNewSubmission({ requirementsAnalysis: "reqs" });
    s2.submit();
    s2.markEvaluating();
    s2.markCompleted({
      id: "ev-v2",
      submissionId: s2.id,
      evaluatorType: "AI",
      promptVersion: "v2.0",
      totalScore: 65,
      criteriaScores: [],
      strengths: [],
      keyWeaknesses: [],
      summary: "v2 eval",
      evaluatedAt: new Date().toISOString(),
    });

    const delta = attempt.calculateProgressionDelta();
    assert.ok(delta.progressionHighlights.some((h) => h.includes("Evaluator prompt was updated between these attempts")));
  });

  it("RuleBasedEvaluator scores structural interfaces higher than superficial mentions", async () => {
    const problem = (await problemRepository.findById("parking-lot-system"))!;
    const evaluator = new RuleBasedEvaluator();

    // Superficial mention in text without interface declarations
    const superficialSub = new Submission({
      id: "sub-superficial",
      attemptId: "att-superficial",
      sequenceNumber: 1,
      payload: {
        requirementsAnalysis: "Detailed requirements breakdown for large parking lot management.",
        classDesign: "class ParkingLotManager { feeCalculator: any; } // I dislike interface-heavy designs",
        relationshipsAndPatterns: "No special patterns used.",
      },
      state: "SUBMITTED",
    });

    const supResult = await evaluator.evaluate(superficialSub, problem);
    const supCoupling = supResult.criteriaScores.find((c) => c.criterionId === "coupling-interfaces");
    assert.ok(supCoupling && supCoupling.score <= 2);

    // Structural interface declaration and implementation
    const structuralSub = new Submission({
      id: "sub-structural",
      attemptId: "att-structural",
      sequenceNumber: 1,
      payload: {
        requirementsAnalysis: "Detailed requirements breakdown for large parking lot management system.",
        classDesign: "interface FeeStrategy { calculate(duration: number): number; }\nclass HourlyFeeStrategy implements FeeStrategy { calculate(d: number) { return d * 10; } }\nclass ParkingLot { private feeStrategy: FeeStrategy; }",
        relationshipsAndPatterns: "Strategy pattern for flexible fee computation policies.",
      },
      state: "SUBMITTED",
    });

    const structResult = await evaluator.evaluate(structuralSub, problem);
    const structCoupling = structResult.criteriaScores.find((c) => c.criterionId === "coupling-interfaces");
    assert.ok(structCoupling && structCoupling.score >= 4);
  });
});
