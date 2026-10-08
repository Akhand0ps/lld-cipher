import { Evaluation } from "../models/Evaluation";
import { FeedbackToneStrategy, FormattedFeedback } from "./FeedbackToneStrategy";

export class RoastToneStrategy implements FeedbackToneStrategy {
  public readonly tone = "ROAST" as const;

  public format(evaluation: Evaluation): FormattedFeedback {
    const score = evaluation.totalScore;
    let headline = "Senior Dev just facepalmed at their desk. 🤦‍♂️";
    let badgeEmoji = "🔥";

    if (score >= 85) {
      headline = "Wait... someone actually knows what SOLID means? Suspicious. 🤔";
      badgeEmoji = "🧐";
    } else if (score >= 70) {
      headline = "It won't immediately burn the datacenter down, but I wouldn't trust it on Friday evening. ☕";
      badgeEmoji = "⚠️";
    } else if (score < 40) {
      headline = "Emergency Alert: PagerDuty has been triggered just by looking at this architecture. 🚨";
      badgeEmoji = "💀";
    }

    const narrative = `You scored ${score}/100. If this code went to production, the on-call engineer would track down your LinkedIn and block you. ${
      evaluation.keyWeaknesses.length
        ? `Here's what kept us awake: ${evaluation.keyWeaknesses.join(" ")}`
        : "Somehow, your classes survived our initial teardown."
    }`;

    const critiqueItems = evaluation.criteriaScores.map((cs) => {
      let remark = "";
      const name = cs.criterionName.toLowerCase();

      if (name.includes("responsibility") || name.includes("cohesion")) {
        if (cs.score <= 2) {
          remark = `Bro created a God Object with more responsibilities than the Indian Prime Minister. Why not add weather forecasting and pizza delivery to this class while you're at it?`;
        } else if (cs.score === 3) {
          remark = `It's not a full disaster, but this class is definitely hoarding responsibilities like a hoarder's attic.`;
        } else {
          remark = `Fine, your classes actually have distinct jobs. Did someone help you with this?`;
        }
      } else if (name.includes("coupling") || name.includes("interface")) {
        if (cs.score <= 2) {
          remark = `Tight coupling alert! These classes are glued together harder than superglue on fingers. Good luck writing a unit test without mocking the entire internet.`;
        } else {
          remark = `You actually used interfaces. Wonders never cease! Just make sure you aren't doing 'new ConcreteClass()' right after declaring the interface.`;
        }
      } else if (name.includes("extensibility") || name.includes("pattern")) {
        if (cs.score <= 2) {
          remark = `Open/Closed Principle left the chat. The moment Product Manager asks for 1 new feature, you'll be writing 47 nested 'if-else' statements.`;
        } else {
          remark = `Nice design pattern flex. Hope you didn't just paste it from Refactoring Guru without knowing how it works.`;
        }
      } else if (name.includes("concurrency") || name.includes("edge case")) {
        if (cs.score <= 2) {
          remark = `Zero thread safety! Two users clicking simultaneously and your system will allocate the same parking spot to a Tesla and an Auto-rickshaw. Chaos guaranteed.`;
        } else {
          remark = `You actually thought about concurrency! Respect. The 3 AM PagerDuty alarm might spare you after all.`;
        }
      } else {
        remark = `Score: ${cs.score}/5. ${cs.concern}`;
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
        ? "Okay, you actually know what you're doing. Stop reading my roasts and submit this in your interview already."
        : "Delete your God Objects, extract some interfaces, and try Attempt 2 before the tech lead rejects your PR.";

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
