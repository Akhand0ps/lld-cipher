import { Problem } from "../models/Problem";
import { Submission } from "../models/Submission";
import { Evaluation } from "../models/Evaluation";

/**
 * Evaluator Strategy Interface
 *
 * Change Test B Defence:
 * Any new evaluation mechanism (e.g. Human Review, Static AST Linter,
 * Custom Model, Rule-Engine) implements this contract without
 * changing the core practice workflow.
 */
export interface Evaluator {
  readonly evaluatorType: "RULE" | "AI" | "COMPOSITE";
  evaluate(submission: Submission, problem: Problem): Promise<Evaluation>;
}
