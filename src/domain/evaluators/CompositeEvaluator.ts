import { Problem } from "../models/Problem";
import { Submission } from "../models/Submission";
import { Evaluation } from "../models/Evaluation";
import { Evaluator } from "./Evaluator";
import { RuleBasedEvaluator } from "./RuleBasedEvaluator";
import { AIEvaluator } from "./AIEvaluator";

/**
 * CompositeEvaluator
 *
 * Implements the "Deterministic + AI Hybrid" evaluation pipeline
 * recommended in the CipherSchools assignment specification.
 *
 * 1. Executes RuleBasedEvaluator for fast, deterministic structural checks.
 * 2. If structural checks fail (e.g. empty submission or gibberish), terminates early.
 * 3. Otherwise, delegates to AIEvaluator for deep architectural analysis.
 */
export class CompositeEvaluator implements Evaluator {
  public readonly evaluatorType = "COMPOSITE" as const;
  private ruleEvaluator: RuleBasedEvaluator;
  private aiEvaluator: AIEvaluator;

  constructor(ruleEvaluator?: RuleBasedEvaluator, aiEvaluator?: AIEvaluator) {
    this.ruleEvaluator = ruleEvaluator || new RuleBasedEvaluator();
    this.aiEvaluator = aiEvaluator || new AIEvaluator();
  }

  public async evaluate(submission: Submission, problem: Problem): Promise<Evaluation> {
    // Step 1: Deterministic check
    const ruleResult = await this.ruleEvaluator.evaluate(submission, problem);

    // If submission is critically deficient, return the deterministic result
    if (ruleResult.totalScore < 30) {
      return {
        ...ruleResult,
        evaluatorType: this.evaluatorType,
        summary: `Deterministic structural check failed (${ruleResult.totalScore}/100): Minimal architectural detail provided. Please define concrete classes and interfaces.`,
      };
    }

    // Step 2: Advanced architectural evaluation via AI / Semantic Engine
    const aiResult = await this.aiEvaluator.evaluate(submission, problem);

    return {
      ...aiResult,
      evaluatorType: this.evaluatorType,
      strengths: [...new Set([...ruleResult.strengths, ...aiResult.strengths])],
      keyWeaknesses: [...new Set([...ruleResult.keyWeaknesses, ...aiResult.keyWeaknesses])],
    };
  }
}
