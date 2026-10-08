import { Evaluation } from "../models/Evaluation";

export interface FormattedFeedback {
  toneName: "MENTOR" | "ROAST";
  headline: string;
  badgeEmoji: string;
  verdictNarrative: string;
  critiqueItems: {
    criterionName: string;
    score: number;
    toneRemark: string;
    evidenceQuote: string;
    suggestion: string;
  }[];
  concludingAdvice: string;
}

export interface FeedbackToneStrategy {
  readonly tone: "MENTOR" | "ROAST";
  format(evaluation: Evaluation): FormattedFeedback;
}
