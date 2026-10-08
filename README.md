# 🏛️ LLD Studio — Diagnostic Low-Level Design Practice Platform

[![Live Demo](https://img.shields.io/badge/Demo-cipherlld.vercel.app-blue?style=flat&logo=vercel)](https://cipherlld.vercel.app)
[![Tests](https://img.shields.io/badge/domain_tests-10%2F10_passing-emerald)](./src/__tests__/domain.test.ts)
[![Next.js](https://img.shields.io/badge/Next.js-16.4_Turbopack-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x_Strict-blue)](https://www.typescriptlang.org/)
[![Deliverable](https://img.shields.io/badge/Assignment-CipherSchools_SDE_Intern-orange)](./CipherSchools.pdf)

> 🌐 **Live Production Deployment:** **[cipherlld.vercel.app](https://cipherlld.vercel.app)**  
> **Core Practice Loop:** `Select Problem → Structured Design → Immediate Pre-Persistence → Multi-Dimensional Evaluation → Inspect Progression Delta → Refactor & Retry`

---

## ⚡ 60-Second Quickstart

```bash
# 1. Clone & install dependencies
git clone https://github.com/akhand0ps/lld-cipher.git
cd lld-cipher
npm install

# 2. Run the Domain Test Suite (verifies aggregate roots, state transitions & change tests)
npm test

# 3. Launch the development studio
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)**.  
*(Zero environment setup required. Works out-of-the-box with built-in structural heuristics. Optional: Supply `GEMINI_API_KEY` in `.env.local` for live Gemini 2.5 Flash reasoning.)*

---

## 📋 Deliverables & Reviewer Mapping

Direct mapping to **Section 7 ("What to Submit")** of the [CipherSchools Assignment Specification](./CipherSchools.pdf):

| Deliverable | Repository Artifact | Format | Description & Focus |
|---|---|---|---|
| **Research Note** | [`RESEARCH_NOTE.md`](./RESEARCH_NOTE.md) & [`PDF`](./Research_Note_CipherSchools.pdf) | Markdown & PDF | Market audit (LeetCode, Grokking, Pramp), cognitive traps, format trade-offs & cross-question answers. |
| **Design Note** | [`DESIGN_NOTE.md`](./DESIGN_NOTE.md) & [`PDF`](./Design_Note_CipherSchools.pdf) | Markdown & PDF | Domain models, aggregate boundaries, state machines, change test proofs & production bottlenecks. |
| **AI Usage Log** | [`AI_USAGE.md`](./AI_USAGE.md) | Markdown | 6 critical engineering decisions with AI (what AI suggested, what was rejected, and engineering rationales). |
| **Domain Tests** | [`src/__tests__/domain.test.ts`](./src/__tests__/domain.test.ts) | Automated Suite | 10 unit tests covering state machine guards, deltas, prompt version warnings, and Change Tests A & B. |
| **Working Prototype** | [`src/`](./src/) | Full-Stack App | Split-pane IDE: problem requirements, 5-D rubric cards, structured editor, and LeetCode-style attempts drawer. |

---

## 🏗️ Core Domain Architecture (LLD First)

The domain model avoids framework coupling and enforces clean Domain-Driven Design (DDD) encapsulation:

```
                    ┌──────────────────────────────────────────────┐
                    │                   Problem                    │
                    ├──────────────────────────────────────────────┤
                    │ - id: string                                 │
                    │ - title: string                              │
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
                    │ - submissions: Submission[]                  │
                    ├──────────────────────────────────────────────┤
                    │ + createNewSubmission(payload, format)       │
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
                    │ - promptVersion: string                      │
                    │ - totalScore: number                         │
                    │ - criteriaScores: CriterionScore[]           │
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

### Key Design Patterns & Architectural Decisions:
1. **Aggregate Root Pattern (`Attempt`):** Manages the consistency boundary for candidate iterations, enforcing monotonically increasing sequence numbers (Attempt #1, #2) and transactional progression delta calculations.
2. **Strategy Pattern (`Evaluator`):** Decouples evaluation engines (`RuleBasedEvaluator`, `AIEvaluator`, `CompositeEvaluator`). Satisfies the Open/Closed Principle.
3. **Strategy Pattern (`FeedbackToneStrategy`):** Decouples diagnostic formatting (🎓 *Mentor Mode* vs. 🔥 *Senior Dev Roast Mode*) from evaluation computation, enabling instant client-side tone switches with 0ms latency and 0 additional LLM tokens.
4. **State Machine (`SubmissionState`):** Enforces strict lifecycle transitions (`DRAFT → SUBMITTED → EVALUATING → COMPLETED | FAILED`).
5. **Prompt Versioning:** Every `Evaluation` carries `promptVersion: "v1.0"`. Cross-version evaluations flag an automated comparability disclaimer to prevent misleading progression metrics.

---

## 🛡️ Defending the Two Explicit Change Tests

### Change Test A: Text Today, Class Diagram Tomorrow
* **The Constraint:** The platform accepts text today; tomorrow it must support visual class diagrams. How much of the domain model changes?
* **Our Solution:** `Submission` holds a polymorphic `SubmissionPayload` (`STRUCTURED_TEXT | PSEUDO_CODE | DIAGRAM_JSON`) where diagram ASTs/graphs are stored without schema changes.
* **Result:** Zero changes to `Attempt` aggregate lifecycle, state machine, or persistence layers. Verified in unit tests.

### Change Test B: AI Evaluator Today, Rule/Human Review Tomorrow
* **The Constraint:** Feedback is generated by an LLM today; tomorrow you add a human review or AST linter. Can you add it without modifying practice flows?
* **Our Solution:** Practice controllers depend solely on the `Evaluator` interface contract (`evaluate(submission, problem): Promise<Evaluation>`).
* **Result:** Adding a `HumanReviewEvaluator` is a simple matter of implementing the interface. The practice loop requires zero modifications. Verified in unit tests.

---

## 🔍 Hard Engineering Trade-offs & Production Hardening

We made pragmatic choices appropriate for a 2-day prototype, while documenting real failure modes and production upgrade paths:

### 1. In-Memory Singleton vs. Persistent Database
* **Prototype Decision:** `InMemoryAttemptRepository` singleton for zero-dependency local evaluation (`npm run dev` works with zero Docker/DB setup).
* **Known Failure Mode:** Process restarts clear candidate history; heap memory grows unbounded under high submission volume.
* **Production Path:** The domain and API layers depend solely on the `AttemptRepository` interface. Swapping in a `PostgresAttemptRepository` (Prisma/Drizzle) requires **zero changes** to domain models, the state machine, or the evaluation pipeline.

### 2. Synchronous Evaluation vs. Asynchronous Job Worker
* **Prototype Decision:** Evaluation runs synchronously within the POST handler to deliver immediate feedback during local demo evaluation without external message queues.
* **Known Failure Mode:** If LLM API latencies spike (>10s), HTTP connections stay open, risking connection pool exhaustion under concurrent users.
* **Mitigation & Production Path:** The submission lifecycle (`DRAFT → SUBMITTED → EVALUATING → COMPLETED | FAILED`) is already decoupled. Submissions transition to `SUBMITTED` and **persist before calling evaluation**, guaranteeing zero candidate data loss on crash. In production, POST returns `202 Accepted` immediately, a worker (BullMQ/Redis) processes evaluation asynchronously, and the client polls or streams updates.

### 3. Session-Scoped Identity vs. Full Authentication
* **Prototype Decision:** Browser-local UUID stored in `localStorage` tracks candidate submissions across tab refreshes without requiring account registration.
* **Known Failure Mode:** Identity is device-bound; clearing browser cache resets the candidate journey.
* **Production Path:** The `candidateId` foreign key on `Attempt` maps directly to a future `User` aggregate root backed by OAuth/JWT.

