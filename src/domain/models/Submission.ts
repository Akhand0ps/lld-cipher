import { Evaluation } from "./Evaluation";

export type SubmissionFormat = "STRUCTURED_TEXT" | "PSEUDO_CODE" | "DIAGRAM_JSON";

export type SubmissionState = "DRAFT" | "SUBMITTED" | "EVALUATING" | "COMPLETED" | "FAILED";

export interface SubmissionPayload {
  requirementsAnalysis?: string;
  classDesign?: string;
  relationshipsAndPatterns?: string;
  diagramData?: string; // Change Test A extension: allows class diagram data in the future
  notes?: string;
}

export class Submission {
  public id: string;
  public attemptId: string;
  public sequenceNumber: number;
  public format: SubmissionFormat;
  public payload: SubmissionPayload;
  public state: SubmissionState;
  public submittedAt: string;
  public completedAt?: string;
  public failureReason?: string;
  public evaluation?: Evaluation;

  constructor(params: {
    id: string;
    attemptId: string;
    sequenceNumber: number;
    format?: SubmissionFormat;
    payload: SubmissionPayload;
    state?: SubmissionState;
    submittedAt?: string;
    evaluation?: Evaluation;
    failureReason?: string;
  }) {
    this.id = params.id;
    this.attemptId = params.attemptId;
    this.sequenceNumber = params.sequenceNumber;
    this.format = params.format || "STRUCTURED_TEXT";
    this.payload = params.payload;
    this.state = params.state || "DRAFT";
    this.submittedAt = params.submittedAt || new Date().toISOString();
    this.evaluation = params.evaluation;
    this.failureReason = params.failureReason;
  }

  public submit(): void {
    if (this.state !== "DRAFT") {
      throw new Error(`Cannot submit from state ${this.state}`);
    }
    this.state = "SUBMITTED";
  }

  public markEvaluating(): void {
    if (this.state !== "SUBMITTED") {
      throw new Error(`Cannot evaluate from state ${this.state}`);
    }
    this.state = "EVALUATING";
  }

  public markCompleted(evaluation: Evaluation): void {
    if (this.state !== "EVALUATING") {
      throw new Error(`Cannot complete evaluation from state ${this.state}`);
    }
    this.state = "COMPLETED";
    this.evaluation = evaluation;
    this.completedAt = new Date().toISOString();
  }

  public markFailed(reason: string): void {
    this.state = "FAILED";
    this.failureReason = reason;
  }

  /**
   * Helper to serialize into plain JSON
   */
  public toJSON() {
    return {
      id: this.id,
      attemptId: this.attemptId,
      sequenceNumber: this.sequenceNumber,
      format: this.format,
      payload: this.payload,
      state: this.state,
      submittedAt: this.submittedAt,
      completedAt: this.completedAt,
      failureReason: this.failureReason,
      evaluation: this.evaluation,
    };
  }
}
