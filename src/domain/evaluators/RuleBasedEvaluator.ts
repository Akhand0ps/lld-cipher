import { Problem } from "../models/Problem";
import { Submission } from "../models/Submission";
import { Evaluation, CriterionScore } from "../models/Evaluation";
import { Evaluator } from "./Evaluator";

export class RuleBasedEvaluator implements Evaluator {
  public readonly evaluatorType = "RULE" as const;

  public async evaluate(submission: Submission, problem: Problem): Promise<Evaluation> {
    const payload = submission.payload;
    const reqText = (payload.requirementsAnalysis || "").trim();
    const classText = (payload.classDesign || "").trim();
    const relText = (payload.relationshipsAndPatterns || "").trim();

    const totalWords = (reqText + " " + classText + " " + relText)
      .split(/\s+/)
      .filter(Boolean).length;

    const criteriaScores: CriterionScore[] = [];
    const weaknesses: string[] = [];
    const strengths: string[] = [];

    // Extract structural declarations (classes, interfaces, inheritance, implementation)
    const classDeclarations = Array.from(
      classText.matchAll(/class\s+([A-Za-z0-9_]+)(?:\s+extends\s+([A-Za-z0-9_]+))?(?:\s+implements\s+([A-Za-z0-9_,\s]+))?/gi)
    );
    const interfaceDeclarations = Array.from(
      classText.matchAll(/interface\s+([A-Za-z0-9_]+)/gi)
    );
    const classNames = classDeclarations.map((m) => m[1]);
    const interfaceNames = interfaceDeclarations.map((m) => m[1]);
    const implementedInterfaces = classDeclarations
      .flatMap((m) => (m[3] ? m[3].split(",").map((s) => s.trim()) : []))
      .filter(Boolean);

    // Rule 1: Completeness Check
    const hasRequirements = reqText.length > 20;
    const hasClasses = classNames.length > 0 || classText.length > 30;
    const hasPatterns = relText.length > 15;

    if (!hasRequirements) {
      weaknesses.push("Requirements breakdown is missing or too brief.");
    } else {
      strengths.push("Explicit requirements analysis provided.");
    }

    if (!hasClasses) {
      weaknesses.push("Class & Interface design is insufficient or absent.");
    } else {
      strengths.push(`Identified ${classNames.length} declared class(es) and ${interfaceNames.length} interface(s).`);
    }

    const isMinimalOrDeficient = totalWords < 10 || (!hasClasses && !hasRequirements);

    if (isMinimalOrDeficient) {
      weaknesses.push("Submission is severely incomplete: minimal words or missing both requirements and classes.");
    }

    // Generate criteria scores based on structural static heuristics
    problem.rubric.criteria.forEach((criterion) => {
      let score = 3;
      let evidence = "General structure analysis.";
      let concern = "No deep architectural flaw detected by static structural rules.";
      let suggestion = "Provide more granular method signatures and edge case handling.";

      if (isMinimalOrDeficient) {
        score = 1;
        evidence = `Submission has only ${totalWords} words and lacks concrete design definitions.`;
        concern = "Severely deficient submission. Cannot evaluate architecture without content.";
        suggestion = "Provide requirements breakdown, class declarations, and design patterns.";
      } else if (criterion.name.toLowerCase().includes("responsibility")) {
        if (!hasClasses) {
          score = 1;
          evidence = "Class definitions section is empty or under 30 characters.";
          concern = "Cannot assess Single Responsibility without explicit class definitions.";
          suggestion = "Declare each class with its private fields and public methods.";
        } else if (classNames.length === 1 && totalWords > 80) {
          score = 2;
          evidence = `Single monolithic class '${classNames[0]}' declared without decomposition.`;
          concern = "High risk of God Object antipattern consolidating too many domain responsibilities.";
          suggestion = "Decompose into specialized components (e.g., SlotAllocator, PricingStrategy).";
        } else if (classNames.some((c) => /manager|service|god/i.test(c))) {
          const culprit = classNames.find((c) => /manager|service|god/i.test(c));
          score = 2;
          evidence = `Class '${culprit}' uses generic manager/service suffix, aggregating disparate tasks.`;
          concern = "Ambiguous responsibility boundary; likely to violate SRP over time.";
          suggestion = "Decompose into bounded domain entities and discrete command handlers.";
        } else if (classNames.length >= 3) {
          score = 4;
          evidence = `Decomposed into ${classNames.length} distinct classes (${classNames.slice(0, 3).join(", ")}...).`;
          concern = "Verify responsibilities remain tightly encapsulated in each class.";
          suggestion = "Document public vs private boundaries and invariants.";
        } else {
          score = 3;
          evidence = `Identified ${classNames.length} class declaration(s).`;
          concern = "Ensure responsibilities do not leak across classes.";
          suggestion = "Document public vs private boundaries.";
        }
      } else if (criterion.name.toLowerCase().includes("coupling") || criterion.name.toLowerCase().includes("interface")) {
        if (!hasClasses) {
          score = 1;
          evidence = "No classes declared.";
          concern = "Cannot assess coupling without class declarations.";
          suggestion = "Define domain interfaces and concrete classes.";
        } else if (interfaceNames.length > 0 && implementedInterfaces.length > 0) {
          score = 4;
          evidence = `Declared ${interfaceNames.length} interface(s) (${interfaceNames.join(", ")}) with concrete class implementation(s).`;
          concern = "Ensure callers depend strictly on the interface contracts rather than concrete types.";
          suggestion = "Use Dependency Injection to wire instances at composition root.";
        } else if (interfaceNames.length > 0 && implementedInterfaces.length === 0) {
          score = 3;
          evidence = `Declared interface contract(s) (${interfaceNames.join(", ")}) but no classes explicitly implement them.`;
          concern = "Interfaces declared but uncoupled from class implementations.";
          suggestion = "Connect classes to interfaces via 'implements' keyword.";
        } else {
          score = 2;
          evidence = `Declared ${classNames.length} concrete class(es) without interface abstractions.`;
          concern = "Tight coupling between concrete classes limits substitutability.";
          suggestion = "Introduce interface contracts for pluggable strategies.";
        }
      } else if (criterion.name.toLowerCase().includes("extensibility") || criterion.name.toLowerCase().includes("pattern")) {
        const patternMatches = (relText + " " + classText).match(/strategy|factory|observer|singleton|decorator|state|adapter/gi) || [];
        const distinctPatterns = Array.from(new Set(patternMatches.map((p) => p.toLowerCase())));

        if (distinctPatterns.length > 0 && interfaceNames.length > 0) {
          score = 4;
          evidence = `Applied ${distinctPatterns.join(", ")} pattern backed by explicit interface contracts.`;
          concern = "Verify pattern is not applied prematurely where simpler polymorphism suffices.";
          suggestion = "Clearly justify why this pattern solves the requirement.";
        } else if (distinctPatterns.length > 0) {
          score = 3;
          evidence = `Referenced ${distinctPatterns.join(", ")} pattern, but lacks formal interface abstraction.`;
          concern = "Pattern mentioned conceptually without structural polymorphism contracts.";
          suggestion = "Define an interface for the pattern variants.";
        } else {
          score = 2;
          evidence = "No design pattern or extension mechanism documented.";
          concern = "System may require modifying existing code to support new requirements (OCP violation).";
          suggestion = "Identify open-for-extension points (e.g., pricing strategy, dispatch policy).";
        }
      } else {
        score = totalWords > 80 ? 3 : 2;
        evidence = `Total submission length: ${totalWords} words across sections.`;
        concern = totalWords < 50 ? "Sparse explanations reduce clarity." : "Good baseline clarity.";
        suggestion = "Detail concurrency and boundary conditions.";
      }

      criteriaScores.push({
        criterionId: criterion.id,
        criterionName: criterion.name,
        score,
        maxScore: 5,
        weight: criterion.weight,
        evidenceQuote: evidence,
        concern,
        suggestion,
      });
    });

    // Compute weighted total score (0 - 100)
    let totalScore = 0;
    criteriaScores.forEach((cs) => {
      totalScore += (cs.score / cs.maxScore) * cs.weight;
    });
    totalScore = Math.round(totalScore);

    return {
      id: `eval_rule_${submission.id}_${Date.now()}`,
      submissionId: submission.id,
      evaluatorType: this.evaluatorType,
      promptVersion: "v1.0",
      totalScore,
      criteriaScores,
      strengths,
      keyWeaknesses: weaknesses,
      summary:
        totalScore >= 60
          ? "Deterministic checks passed. Structural foundation is sound."
          : "Deterministic checks found significant gaps in class abstraction and completeness.",
      evaluatedAt: new Date().toISOString(),
    };
  }
}
