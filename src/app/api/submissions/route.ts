import { NextRequest, NextResponse } from "next/server";
import { attemptRepository } from "@/domain/repositories/AttemptRepository";
import { problemRepository } from "@/domain/repositories/ProblemRepository";
import { Attempt } from "@/domain/models/Attempt";
import { CompositeEvaluator } from "@/domain/evaluators/CompositeEvaluator";
import { RuleBasedEvaluator } from "@/domain/evaluators/RuleBasedEvaluator";
import { AIEvaluator } from "@/domain/evaluators/AIEvaluator";
import { Evaluator } from "@/domain/evaluators/Evaluator";
import { MentorToneStrategy } from "@/domain/strategies/MentorToneStrategy";
import { RoastToneStrategy } from "@/domain/strategies/RoastToneStrategy";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      problemId,
      candidateId = "default-learner",
      attemptId,
      payload,
      format = "STRUCTURED_TEXT",
      tone = "MENTOR",
      evaluatorType = "COMPOSITE",
    } = body;

    if (!problemId) {
      return NextResponse.json({ success: false, error: "problemId is required" }, { status: 400 });
    }

    const problem = await problemRepository.findById(problemId);
    if (!problem) {
      return NextResponse.json({ success: false, error: "Problem not found" }, { status: 404 });
    }

    // Step 1: Fetch or initialize Attempt Aggregate Root
    let attempt: Attempt | null = null;
    if (attemptId) {
      attempt = await attemptRepository.findById(attemptId);
    }
    if (!attempt) {
      attempt = await attemptRepository.findByProblemAndCandidate(problemId, candidateId);
    }
    if (!attempt) {
      attempt = new Attempt({
        id: `att_${problemId}_${candidateId}_${Date.now().toString(36)}`,
        problemId,
        candidateId,
      });
    }

    // Step 2: Create Submission entity (State: DRAFT)
    const submission = attempt.createNewSubmission(payload || {}, format);

    // Step 3: Transition to SUBMITTED and persist immediately (zero data loss on crash)
    submission.submit();
    await attemptRepository.save(attempt);

    // Step 4: Transition to EVALUATING
    submission.markEvaluating();
    await attemptRepository.save(attempt);

    // Step 5: Select Evaluator Strategy (Passes Change Test B)
    let evaluator: Evaluator;
    if (evaluatorType === "RULE") {
      evaluator = new RuleBasedEvaluator();
    } else if (evaluatorType === "AI") {
      evaluator = new AIEvaluator();
    } else {
      evaluator = new CompositeEvaluator();
    }

    try {
      // Step 6: Execute Evaluation
      const evaluation = await evaluator.evaluate(submission, problem);

      // Step 7: Mark completed with evaluation result
      submission.markCompleted(evaluation);
      await attemptRepository.save(attempt);

      // Step 8: Apply Tone Strategy (Strategy Pattern - Differentiator #3)
      const toneStrategy = tone === "ROAST" ? new RoastToneStrategy() : new MentorToneStrategy();
      const formattedFeedback = toneStrategy.format(evaluation);

      // Step 9: Compute Multi-attempt Progression Delta (Differentiator #2)
      const progressionDelta = attempt.calculateProgressionDelta();

      return NextResponse.json({
        success: true,
        data: {
          submission: submission.toJSON(),
          evaluation,
          formattedFeedback,
          progressionDelta,
          attempt: attempt.toJSON(),
        },
      });
    } catch (evalError) {
      submission.markFailed((evalError as Error).message || "Evaluation failed");
      await attemptRepository.save(attempt);
      return NextResponse.json(
        {
          success: false,
          error: "Evaluation failed. Submission was saved.",
          submission: submission.toJSON(),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
