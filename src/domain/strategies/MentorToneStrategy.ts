import { Evaluation } from "../models/Evaluation";
import { FeedbackToneStrategy, FormattedFeedback } from "./FeedbackToneStrategy";

export class MentorToneStrategy implements FeedbackToneStrategy {
  public readonly tone = "MENTOR" as const;

  public format(evaluation: Evaluation): FormattedFeedback {
    const score = evaluation.totalScore;
    let headline = "Great effort! A solid foundation with room for refinement.";
    let badgeEmoji = "🌱";

    if (score >= 85) {
      headline = "Outstanding Design! Production-ready domain modeling.";
      badgeEmoji = "🏆";
    } else if (score >= 70) {
      headline = "Strong Architecture! Well thought-out trade-offs.";
      badgeEmoji = "⭐";
    } else if (score < 50) {
      headline = "Good Initial Attempt! Let's address fundamental abstractions.";
      badgeEmoji = "🧭";
    }

    const narrative = `You scored ${score}/100. ${
      evaluation.strengths.length
        ? `We noticed strong points: ${evaluation.strengths.join(" ")}`
        : "You have set up the core domain concepts nicely."
    } Focus on the suggestions below to elevate your next attempt to top-tier industry standards.`;

    const critiqueItems = evaluation.criteriaScores.map((cs) => {
      let remark = `You earned ${cs.score}/${cs.maxScore} points here.`;
      if (cs.score >= 4) {
        remark = `Exemplary job (${cs.score}/5)! Your handling demonstrates sound architectural discipline.`;
      } else if (cs.score === 3) {
        remark = `Decent baseline (${cs.score}/5). You've grasped the core idea, but there is an opportunity to decouple further.`;
      } else {
        remark = `Key growth area (${cs.score}/5). ${cs.concern}`;
      }

      return {
        criterionName: cs.criterionName,
        score: cs.score,
        toneRemark: remark,
        evidenceQuote: cs.evidenceQuote,
        suggestion: cs.suggestion,
      };
    });

    const concludingAdvice =
      score >= 80
        ? "You are interview-ready on this problem! Try designing for edge-case failure modes or retry policies next."
        : "Refactor your design by breaking up larger classes and introducing interfaces, then submit Attempt 2 to see your score delta!";

    return {
      toneName: this.tone,
      headline,
      badgeEmoji,
      verdictNarrative: narrative,
      critiqueItems,
      concludingAdvice,
    };
  }
}
