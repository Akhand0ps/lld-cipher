import { Attempt } from "../models/Attempt";
import { Submission } from "../models/Submission";

export interface AttemptRepository {
  findById(id: string): Promise<Attempt | null>;
  findByProblemAndCandidate(problemId: string, candidateId: string): Promise<Attempt | null>;
  listByCandidate(candidateId: string): Promise<Attempt[]>;
  save(attempt: Attempt): Promise<void>;
}

export class InMemoryAttemptRepository implements AttemptRepository {
  private attempts: Map<string, Attempt> = new Map();

  constructor() {
    this.seedDemoAttempt();
  }

  public async findById(id: string): Promise<Attempt | null> {
    const attempt = this.attempts.get(id);
    return attempt || null;
  }

  public async findByProblemAndCandidate(problemId: string, candidateId: string): Promise<Attempt | null> {
    for (const attempt of this.attempts.values()) {
      if (attempt.problemId === problemId && attempt.candidateId === candidateId) {
        return attempt;
      }
    }
    return null;
  }

  public async listByCandidate(candidateId: string): Promise<Attempt[]> {
    const results: Attempt[] = [];
    for (const attempt of this.attempts.values()) {
      if (attempt.candidateId === candidateId) {
        results.push(attempt);
      }
    }
    return results;
  }

  public async save(attempt: Attempt): Promise<void> {
    this.attempts.set(attempt.id, attempt);
  }

  /**
   * Pre-seed a sample attempt to immediately demonstrate
   * the Progression Delta differentiator in demo videos & evaluations
   */
  private seedDemoAttempt(): void {
    const demoAttempt = new Attempt({
      id: "attempt-demo-parking-lot",
      problemId: "parking-lot-system",
      candidateId: "demo-learner",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    });

    // Attempt 1: Naive God Object design
    const sub1 = new Submission({
      id: "sub-demo-1",
      attemptId: demoAttempt.id,
      sequenceNumber: 1,
      format: "STRUCTURED_TEXT",
      payload: {
        requirementsAnalysis: "Mall parking lot with cars and bikes. 1 entry and exit.",
        classDesign: `class ParkingLotManager {
    List<Spot> spots;
    public void parkVehicle(Vehicle v) { /* parks vehicle */ }
    public double calculateFeeAndPrintReceipt(Ticket t) { /* calculates fee and bills */ }
}`,
        relationshipsAndPatterns: "Used simple class without patterns.",
      },
      state: "COMPLETED",
      evaluation: {
        id: "eval-demo-1",
        submissionId: "sub-demo-1",
        evaluatorType: "COMPOSITE",
        totalScore: 48,
        criteriaScores: [
          {
            criterionId: "srp-cohesion",
            criterionName: "Single Responsibility & Cohesion",
            score: 2,
            maxScore: 5,
            weight: 25,
            evidenceQuote: 'class ParkingLotManager { ... calculateFeeAndPrintReceipt ... }',
            concern: "God Object: ParkingLotManager handles spot allocation, billing, and printing.",
            suggestion: "Separate fee calculation into a dedicated FeeCalculator.",
          },
          {
            criterionId: "coupling-interfaces",
            criterionName: "Loose Coupling & Interface Segregation",
            score: 2,
            maxScore: 5,
            weight: 20,
            evidenceQuote: "List<Spot> spots",
            concern: "No interfaces declared for vehicle or spot types.",
            suggestion: "Define Vehicle and ParkingSpot abstractions.",
          },
          {
            criterionId: "extensibility-patterns",
            criterionName: "Extensibility & Design Patterns",
            score: 2,
            maxScore: 5,
            weight: 25,
            evidenceQuote: "Used simple class without patterns",
            concern: "Adding new pricing rules requires modifying ParkingLotManager directly.",
            suggestion: "Use Strategy Pattern for PricingStrategy.",
          },
          {
            criterionId: "concurrency-edge-cases",
            criterionName: "Concurrency & Edge Case Handling",
            score: 2,
            maxScore: 5,
            weight: 20,
            evidenceQuote: "No concurrency synchronization defined",
            concern: "Race conditions possible on spot assignment under concurrent gate entries.",
            suggestion: "Use atomic locks or synchronized spot allocation.",
          },
          {
            criterionId: "clarity-justification",
            criterionName: "Design Explanation & Trade-offs",
            score: 3,
            maxScore: 5,
            weight: 10,
            evidenceQuote: "Mall parking lot with cars and bikes",
            concern: "Sparse explanation of trade-offs.",
            suggestion: "Document edge case assumptions.",
          },
        ],
        strengths: ["Clear core entity identification."],
        keyWeaknesses: ["God Object antipattern in ParkingLotManager.", "No interface contracts."],
        summary: "Initial attempt. Architecture is monolithic with high coupling.",
        evaluatedAt: new Date(Date.now() - 3600000).toISOString(),
      },
    });

    demoAttempt.submissions.push(sub1);
    this.attempts.set(demoAttempt.id, demoAttempt);
  }
}

// Global singleton to persist state in Node server across requests
const globalForRepo = globalThis as unknown as { attemptRepo?: InMemoryAttemptRepository };
export const attemptRepository = globalForRepo.attemptRepo || new InMemoryAttemptRepository();
if (process.env.NODE_ENV !== "production") globalForRepo.attemptRepo = attemptRepository;
