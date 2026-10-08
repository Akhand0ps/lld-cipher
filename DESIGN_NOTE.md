# 📐 Design Note: LLD Studio Architecture Blueprint

**Context:** Domain modeling, state machines, evaluation pipelines, and extensibility proofs for an automated Low-Level Design practice platform.  
**Target:** CipherSchools 2-Day Engineering Assignment  
**Domain:** Object-Oriented Domain Modeling, Strategy Patterns, Aggregate Roots, State Machines

---

## 1. System Blueprint & End-to-End User Journey

The platform provides a deliberate, iterative practice loop that evaluates architecture rather than algorithmic syntax:

```
┌─────────────────┐       ┌────────────────────────┐       ┌──────────────────────┐
│  SELECT PROBLEM │──────►│   STRUCTURED DESIGN    │──────►│    PRE-PERSISTENCE   │
│  • Requirements │       │   • Scope & Assumptions│       │    (State: SUBMITTED)│
│  • 5-D Rubrics  │       │   • Classes & Interfaces│      │    *Zero Data Loss*  │
└─────────────────┘       │   • Patterns & Concurr │       └──────────┬───────────┘
                          └────────────────────────┘                  │
                                                                      ▼
┌─────────────────┐       ┌────────────────────────┐       ┌──────────────────────┐
│ REFACTOR & RETRY│◄──────│   PROGRESSION DELTA    │◄──────│ COMPOSITE EVALUATOR  │
│ • Pre-populated │       │   • Per-criterion +/-  │       │ • Deterministic Gate │
│   editor state  │       │   • Personal best      │       │ • AI Semantic Engine │
└─────────────────┘       │   • Version warnings   │       │ • Tone Strategy (🔥) │
                          └────────────────────────┘       └──────────────────────┘
```

### 1.1 The Core User Journey:
1. **Context Discovery:** The candidate selects a curated problem (*Parking Lot, Elevator Dispatch, In-Memory Pub/Sub*) with explicit functional requirements, non-functional constraints, and a pre-configured 5-dimensional rubric.
2. **Drafting Architecture:** The candidate writes their design across a 3-part structured editor (Requirements Analysis, Class & Interface Contracts, Design Patterns & Concurrency).
3. **Pre-Persistence (Safety Guard):** When submitted, the system transitions `DRAFT → SUBMITTED` and commits to storage *before* initiating evaluation. If the evaluator crashes or times out, the user's work is never lost.
4. **Composite Evaluation:** A deterministic static parser validates structural completeness and fails fast on empty inputs. If valid, the AI semantic reasoner evaluates SOLID compliance, detects God Objects, and extracts verbatim quotes.
5. **Presentation Formatting:** The result passes through `FeedbackToneStrategy` (`MentorToneStrategy` or `RoastToneStrategy` 🔥) to produce formatted diagnostics without re-calling the LLM.
6. **Progression Inspection & Refactor:** The candidate reviews exact score deltas (+38% overall, +2 pts on SRP), their editor is automatically pre-populated with their prior design, and they refactor into Attempt 2.

---

## 2. Core Domain Model (Classes, Methods, & Responsibilities)

The domain model avoids framework coupling and enforces strict domain-driven encapsulation:

```
                    ┌──────────────────────────────────────────────┐
                    │                   Problem                    │
                    ├──────────────────────────────────────────────┤
                    │ - id: string                                 │
                    │ - title: string                              │
                    │ - prompt: string                             │
                    │ - functionalRequirements: string[]           │
                    │ - nonFunctionalConstraints: string[]         │
                    │ - rubric: Rubric                             │
                    └──────────────────────┬───────────────────────┘
                                           │ 1
                                           │ has many
                                           ▼ *
                    ┌──────────────────────────────────────────────┐
                    │            Attempt (Aggregate Root)          │
                    ├──────────────────────────────────────────────┤
                    │ - id: string                                 │
                    │ - problemId: string                          │
                    │ - candidateId: string                        │
                    │ - createdAt: string                          │
                    │ - updatedAt: string                          │
                    │ - submissions: Submission[]                  │
                    ├──────────────────────────────────────────────┤
                    │ + createNewSubmission(payload, format)       │
                    │ + getLatestSubmission(): Submission?         │
                    │ + getPreviousSubmission(): Submission?       │
                    │ + calculateProgressionDelta(): Delta         │
                    │ + getFullProgressionTimeline(): Point[]      │
                    └──────────────────────┬───────────────────────┘
                                           │ 1
                                           │ has many
                                           ▼ *
                    ┌──────────────────────────────────────────────┐
                    │                  Submission                  │
                    ├──────────────────────────────────────────────┤
                    │ - id: string                                 │
                    │ - attemptId: string                          │
                    │ - sequenceNumber: number                     │
                    │ - format: SubmissionFormat                   │
                    │ - payload: SubmissionPayload                 │
                    │ - state: SubmissionState                     │
                    │ - evaluation: Evaluation?                    │
                    ├──────────────────────────────────────────────┤
                    │ + submit(): void                             │
                    │ + markEvaluating(): void                     │
                    │ + markCompleted(evaluation): void            │
                    │ + markFailed(reason): void                   │
                    └──────────────────────┬───────────────────────┘
                                           │ 1
                                           │ produces
                                           ▼ 1
                    ┌──────────────────────────────────────────────┐
                    │                  Evaluation                  │
                    ├──────────────────────────────────────────────┤
                    │ - id: string                                 │
                    │ - submissionId: string                       │
                    │ - evaluatorType: "RULE" | "AI" | "COMPOSITE" │
                    │ - promptVersion: string                      │
                    │ - totalScore: number                         │
                    │ - criteriaScores: CriterionScore[]           │
                    │ - strengths: string[]                        │
                    │ - keyWeaknesses: string[]                    │
                    │ - evaluatedAt: string                        │
                    └──────────────────────┬───────────────────────┘
                                           │
                   ┌───────────────────────┴───────────────────────┐
                   ▼                                               ▼
┌─────────────────────────────────────┐         ┌─────────────────────────────────────┐
│        Evaluator (Interface)        │         │    FeedbackToneStrategy (Interface) │
├─────────────────────────────────────┤         ├─────────────────────────────────────┤
│ + evaluate(sub, prob): Promise<Eval>│         │ + format(evaluation): FormattedFdbk │
└──────────────────┬──────────────────┘         └──────────────────┬──────────────────┘
                   │ implements                                    │ implements
         ┌─────────┼─────────┐                           ┌─────────┴─────────┐
         ▼         ▼         ▼                           ▼                   ▼
┌──────────────┐┌────────┐┌───────────────┐     ┌──────────────────┐┌─────────────────┐
│RuleBasedEval ││AIEval  ││CompositeEval  │     │MentorToneStrategy││RoastToneStrategy│
└──────────────┘└────────┘└───────────────┘     └──────────────────┘└─────────────────┘
```

### 2.1 Entity Responsibilities & Invariants

| Entity / Value Object | Responsibility | Encapsulated Invariant |
|---|---|---|
| **`Problem`** | Encapsulates problem statements, scope boundaries, and its unique grading `Rubric`. | A problem's rubric criteria weights must sum to exactly 100%. |
| **`Attempt`** *(Aggregate Root)* | Manages the consistency boundary for a candidate's practice journey on a specific problem; calculates progression deltas. | Submissions must have strictly sequential, monotonically increasing `sequenceNumber`s (1, 2, 3...). Deltas can only be computed between evaluated submissions. |
| **`Submission`** | Represents a point-in-time design revision; holds polymorphic payload (`STRUCTURED_TEXT | CODE | DIAGRAM_JSON`). | Enforces valid lifecycle state transitions (`DRAFT → SUBMITTED → EVALUATING → COMPLETED \| FAILED`). State cannot skip steps. |
| **`Evaluation`** | Immutable snapshot of an evaluation run; carries criteria scores and prompt version. | `totalScore` is strictly bounded `[0, 100]`. Every score carries verbatim quotes and prompt version tag. |
| **`CriterionScore`** *(Value Object)* | Diagnostic breakdown for one rubric criterion. | Immutable tuple: `(criterionId, score, maxScore, weight, evidenceQuote, concern, suggestion)`. |
| **`AttemptRepository`** *(Interface)* | Abstraction for storing and querying Attempt aggregates. | Domain logic depends strictly on the interface contract, decoupling domain logic from in-memory singleton or PostgreSQL. |

---

## 3. Formal Submission State Machine

To guarantee zero candidate data loss and prevent illegal lifecycle operations:

```
                    ┌─────────┐
                    │  DRAFT  │
                    └────┬────┘
                         │
                         │ submit() [Validates payload presence]
                         ▼
                    ┌─────────┐
                    │SUBMITTED│ ──► Immediately committed to repository
                    └────┬────┘
                         │
                         │ markEvaluating() [Begins async/sync evaluator]
                         ▼
                   ┌──────────┐
                   │EVALUATING│
                   └────┬─────┘
                        │
          ┌─────────────┴─────────────┐
          │ markCompleted(eval)       │ markFailed(reason)
          ▼                           ▼
    ┌───────────┐               ┌──────────┐
    │ COMPLETED │               │  FAILED  │ (Persists failureReason;
    └───────────┘               └──────────┘  allows re-triggering eval)
```

### State Transition Validation Table:

| Current State | Allowed Next State | Trigger / Guard Condition | Failure Action |
|---|---|---|---|
| `DRAFT` | `SUBMITTED` | Candidate clicks Submit; payload must not be null. | Throws `Error("Cannot submit empty draft")` |
| `SUBMITTED` | `EVALUATING` | Evaluation worker picks up submission; persists pre-eval state. | Throws `Error("Invalid transition: must be submitted first")` |
| `EVALUATING` | `COMPLETED` | Evaluator returns validated `Evaluation` matching schema. | Throws `Error("Cannot complete evaluation that is not evaluating")` |
| `EVALUATING` | `FAILED` | Evaluator times out, network crashes, or schema validation fails. | Stores `failureReason`; preserves candidate's written payload. |
| `COMPLETED` | *TERMINAL* | Immutable. Revisions must create a new `Submission` entity. | Throws `Error("Completed submissions cannot be modified")` |
| `FAILED` | `EVALUATING` | Candidate or system clicks "Retry Evaluation". | Re-attempts evaluation without re-typing. |

---

## 4. Evaluation Pipeline & Division of Labor

```
                                  ┌────────────────────────┐
                                  │   POST /submissions    │
                                  └───────────┬────────────┘
                                              │
                                              ▼
                                 ┌──────────────────────────┐
                                 │  CompositeEvaluator      │
                                 └────────────┬─────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         ┌─────────────────────────┐                     ┌─────────────────────────┐
         │   RuleBasedEvaluator    │                     │       AIEvaluator       │
         │   (Deterministic Gate)  │                     │   (Semantic Reasoner)   │
         ├─────────────────────────┤                     ├─────────────────────────┤
         │ • Word count < 10?      │                     │ • Calls Gemini API with │
         │ • Classes declared < 1? │                     │   strict JSON Schema.   │
         │ • Generates score 0-30  │                     │ • Checks SRP, Coupling, │
         └────────────┬────────────┘                     │   Patterns, Concurrency │
                      │                                  │ • Extracts verbatim     │
                      │ Short-circuits if deficient      │   evidence lines        │
                      ├──────────────────────────┐       └────────────┬────────────┘
                      ▼                          ▼                    │
              [Immediate Fail]          [Proceed to AI]               │
              Score < 30                Score >= 30                   │
                      │                          │                    │
                      └──────────────────────────┴────────────────────┘
                                                 │
                                                 ▼
                                  ┌────────────────────────┐
                                  │  FeedbackToneStrategy  │
                                  ├────────────────────────┤
                                  │ • MentorToneStrategy   │
                                  │ • RoastToneStrategy 🔥 │
                                  └────────────────────────┘
```

### 4.1 Division of Labor Matrix:

| Evaluation Responsibility | Engine | Implementation Mechanism | Architectural Justification |
|---|---|---|---|
| **Empty / Deficient Gating** | Deterministic | Word count and empty-string check | Fails fast in <1ms; avoids wasting LLM tokens and latency on empty inputs. |
| **Structural Parsing** | Deterministic | Regex AST parsing for `class X implements Y` | 100% deterministic assertion of declared types and inheritance relationships. |
| **God Object Detection** | Hybrid | Static count (single class >300 chars) + AI | Identifies classes consolidating too many domain responsibilities. |
| **Responsibility Boundary Analysis**| AI Reasoner | Gemini 2.5 Flash / Semantic Heuristic | Contextual reasoning required to know if `calculateFee()` belongs in `ParkingLot`. |
| **Design Pattern Suitability** | AI Reasoner | Semantic analysis of extensibility hooks | Evaluates whether Strategy or Observer pattern actually solves problem constraints. |
| **Concurrency & Thread Safety** | AI Reasoner | Invariant checks on shared mutable state | Checks for lock synchronization, race conditions, and atomic operations. |
| **Verbatim Evidence Quotes** | AI Reasoner | Sentence extraction (<90 chars) | Grounds critiques in actual candidate text to eliminate vague or hallucinated feedback. |

---

## 5. Extensibility Defenses (The Two Change Tests)

### 5.1 Change Test A: Text Today, Class Diagram Tomorrow
> **Challenge:** *"Today the learner submits text. Later the platform supports a class diagram. How much of your domain model changes?"*

**Implementation:**
The `Submission` entity decouples submission metadata from content representation:
```typescript
export type SubmissionFormat = "STRUCTURED_TEXT" | "PSEUDO_CODE" | "DIAGRAM_JSON";

export interface SubmissionPayload {
  requirementsAnalysis?: string;
  classDesign?: string;
  relationshipsAndPatterns?: string;
  diagramData?: string; // Future Mermaid AST / Graph JSON
  notes?: string;
}
```
**Proof:**  
When diagram submissions are introduced:
1. `Submission.format` is set to `"DIAGRAM_JSON"`.
2. The payload carries the serialized graph (nodes and edges).
3. The `Attempt` aggregate lifecycle, sequence numbering, state transitions, repository persistence, and progression delta logic require **zero lines of code changes**. Tested and verified in [`domain.test.ts`](file:///home/akhand0ps/dev/lld/src/__tests__/domain.test.ts).

---

### 5.2 Change Test B: AI Evaluator Today, Rule/Human Review Tomorrow
> **Challenge:** *"Today feedback comes from an AI evaluator. Later you add a rule-based evaluator or human review. Can you add it without rewriting the practice flow?"*

**Implementation:**
The submission practice controller depends strictly on the `Evaluator` abstraction:
```typescript
export interface Evaluator {
  readonly evaluatorType: "RULE" | "AI" | "COMPOSITE";
  evaluate(submission: Submission, problem: Problem): Promise<Evaluation>;
}
```
**Proof:**  
Adding a `HumanReviewEvaluator` or an external `ASTCompilerEvaluator` requires:
1. Creating a class implementing `Evaluator`.
2. Registering it in the evaluator factory.
3. The submission route, the `Attempt` aggregate, and the diagnostic drawer require **zero modifications** (Open/Closed Principle).

---

## 6. Key Engineering Trade-offs & Production Scaling

We made deliberate, pragmatic engineering trade-offs suitable for a 2-day prototype, while designing clear production migration paths:

1. **In-Memory Repository vs. Persistent Database:**
   - *Prototype Choice:* `InMemoryAttemptRepository` singleton for zero-dependency local evaluation (`npm run dev` works instantly with zero Docker/DB setup).
   - *Known Failure Mode:* Server restarts clear candidate history; heap memory grows unbounded under high submission volume.
   - *Production Path:* The domain and API layers depend solely on the `AttemptRepository` interface. Swapping in a `PostgresAttemptRepository` (Prisma/Drizzle) requires **zero changes** to domain models, state machine, or the evaluation engine.

2. **Synchronous Evaluation vs. Async Job Queue:**
   - *Prototype Choice:* Evaluation is executed synchronously within the POST handler to deliver immediate feedback during local demo evaluation without external message queues.
   - *Known Failure Mode:* If third-party LLM latencies spike (>10s), HTTP connections remain open, risking connection pool exhaustion under concurrent users.
   - *Mitigation & Production Path:* The submission lifecycle (`DRAFT → SUBMITTED → EVALUATING → COMPLETED | FAILED`) is already decoupled. Work is persisted *before* evaluation starts (zero data loss). In production, POST returns `202 Accepted` immediately, a worker (BullMQ/Redis) processes evaluation asynchronously, and the client polls or streams updates.

3. **Session-Scoped Identity vs. Full Authentication:**
   - *Prototype Choice:* Browser-local UUID stored in `localStorage` tracks candidate submissions across tab refreshes and re-evaluations without requiring account registration.
   - *Known Failure Mode:* Candidate identity is device-bound; clearing browser cache creates a new learner journey.
   - *Production Path:* The `candidateId` foreign key on the `Attempt` aggregate root maps directly to a future `User` aggregate root backed by OAuth/JWT.

4. **Graceful Evaluator Degradation (Hybrid Engine):**
   - *Prototype Choice:* High-fidelity semantic heuristic engine grades submissions with AST-like structural parsing when external LLM API keys are unavailable.
   - *Production Path:* When `GEMINI_API_KEY` is present, evaluation uses schema-validated structured output with strict runtime type checks (rejecting malformed payloads rather than silently defaulting).

5. **Prompt Versioning for Delta Comparability:**
   - *Decision:* Every `Evaluation` records `promptVersion` (e.g. `v1.0`). If rubric criteria or evaluation prompts evolve between attempts, the progression delta automatically flags a comparability notice to prevent artificial score shifts.

---

## 7. Answers to Hard Architectural Cross-Questions

### Q1: "Why is `Attempt` the Aggregate Root instead of `Submission` or `Problem`?"
**Answer:** In Domain-Driven Design, an Aggregate Root defines a consistency boundary. A candidate's practice journey consists of multiple submissions. If `Submission` were the aggregate root, calculating progression deltas (+38% improvement across attempts), maintaining monotonically increasing sequence numbers (Attempt #1, #2), and enforcing personal best tracking would require an external orchestrator querying across multiple roots, causing eventual consistency anomalies. `Attempt` encapsulates the entire lifecycle of a problem attempt, guaranteeing sequence integrity and transactional consistency.

### Q2: "Why didn't you put the tone (Roast vs Mentor) directly into the LLM system prompt?"
**Answer:** Coupling tone to the LLM prompt is a classic anti-pattern:
1. It doubles LLM API costs and doubles token latency whenever a user wants to view the same diagnostic in another tone.
2. It introduces non-deterministic evaluation divergence: an LLM prompted to "roast" often assigns lower numerical scores to the same code than an LLM prompted to "coach".
By separating canonical evaluation (scores, criteria, verbatim evidence) from formatting via `FeedbackToneStrategy`, the evaluation remains 100% objective, while the presentation persona switches instantly on the client side with 0ms latency and 0 tokens.

### Q3: "How do you prevent prompt drift from corrupting historical progression deltas?"
**Answer:** Every `Evaluation` entity is stamped with an immutable `promptVersion` string (e.g., `"v1.0"`). When `calculateProgressionDelta()` compares Attempt 1 against Attempt 2, it verifies that `prevEval.promptVersion === currEval.promptVersion`. If prompt versions differ, it appends an explicit comparability disclaimer:  
*`"⚠️ Note: Evaluator prompt was updated between these attempts (v1.0 → v2.0). Scores may not be directly comparable."`*  
This prevents false positives where prompt improvements are mistaken for candidate skill growth.

### Q4: "Why do you transition to `SUBMITTED` and persist *before* triggering evaluation?"
**Answer:** Network calls to LLM APIs are inherently fragile: they face timeouts, token rate limits, and 500 errors. If evaluation logic is executed before persisting, any transient failure causes the entire HTTP request to fail, destroying the candidate's carefully written class design. By persisting in `SUBMITTED` state first, the candidate's input is safely committed. If evaluation fails, the state transitions to `FAILED` with a documented `failureReason`, and the candidate can re-trigger evaluation with a single click without re-typing their solution.

### Q5: "How does your design handle concurrent submissions or rapid double-clicks?"
**Answer:** In our prototype, the UI disables the submission button immediately upon click. At the domain level, sequence numbers are calculated inside `createNewSubmission()` via `this.submissions.length + 1`. In a multi-replica production deployment, we would enforce an optimistic concurrency check (`version` column) or a unique database constraint on `(attempt_id, sequence_number)` to prevent duplicate sequence collision.
