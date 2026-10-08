# 🛠️ AI_USAGE.md — Engineering Decisions Log

This document records 6 critical design decisions where AI assistance (Claude, Gemini, Copilot) was evaluated. Rather than accepting generated boilerplate, each suggestion was tested against real interview constraints, domain integrity, and failure modes.

---

### Decision 1: Full Docker Execution Sandbox vs. Structured Design Editor
- **What the AI Suggested:**  
  AI scaffolded a 250-line execution container pipeline using Docker and Judge0 to compile Java/C++ code, instantiate classes, and run JUnit assertions.
- **Decision:** **REJECTED.**
- **Engineering Rationale:**  
  Compilation tests algorithm syntax, not Low-Level Design thinking. In real-world LLD interviews at tier-1 tech companies, candidates are evaluated on a shared document or whiteboard for their ability to define class boundaries, interface contracts, and design patterns. Implementing Docker sandboxes would add operational overhead, slow down feedback loops by 10–15 seconds, and introduce security vulnerabilities without improving the core practice loop.

---

### Decision 2: Open-Ended LLM Prompt vs. Strict 5-Dimensional Rubric Schema
- **What the AI Suggested:**  
  A conversational prompt: *"Review this Low-Level Design, critique its object-oriented patterns, and give a score out of 100."*
- **Decision:** **REJECTED.**
- **Engineering Rationale:**  
  Unconstrained LLM prompts produce severe hallucination, inconsistent scores across identical attempts, and overly flattering praise that does not help the learner. We mandated a **fixed 5-dimensional rubric** (`srp-cohesion`, `coupling-interfaces`, `extensibility-patterns`, `concurrency-edge-cases`, `clarity-justification`) with a strict JSON schema and required **verbatim evidence quotes** from the candidate's submission to substantiate every critique.

---

### Decision 3: Presentation Strategy Pattern for Roast Mode vs. Hardcoded Prompts
- **What the AI Suggested:**  
  When exploring the idea of a "Senior Dev Roast Mode", the AI suggested writing two separate LLM prompts and making two distinct API calls depending on what tone the user requested.
- **Decision:** **ACCEPTED & ARCHITECTURALLY ENHANCED.**
- **Engineering Rationale:**  
  Instead of calling the LLM multiple times or coupling evaluation logic to humor, we implemented the **Strategy Pattern** via `FeedbackToneStrategy` (`MentorToneStrategy` vs. `RoastToneStrategy`). The evaluation result (scores, violations, evidence quotes) remains canonical and unchanged, while the formatting strategy alters the tone dynamically. This allows users to switch between Mentor and Roast modes instantly on the frontend without incurring additional LLM latency or token costs.

---

### Decision 4: Immediate State Pre-Persistence vs. In-Flight Processing
- **What the AI Suggested:**  
  The initial scaffolding ran the evaluation inside the HTTP request and saved the submission to the repository only *after* the evaluator returned successfully.
- **Decision:** **REJECTED & REARCHITECTED.**
- **Engineering Rationale:**  
  AI evaluation calls are network I/O and can take 3–8 seconds or fail due to timeouts or API rate limits. If evaluation crashes mid-flight, the candidate's written design would be lost permanently. We rearchitected the lifecycle to transition `DRAFT → SUBMITTED`, **persist to repository immediately**, transition to `EVALUATING`, and only then trigger evaluation. If evaluation fails, state becomes `FAILED` with a retry option, guaranteeing **zero candidate data loss**.

---

### Decision 5: Criterion ID vs. Criterion Name as the Progression Delta Join Key
- **What the AI Suggested:**  
  The initial AI scaffold joined previous and current `criteriaScores` by matching `criterionName` (e.g., `"Single Responsibility & Cohesion"`).
- **Decision:** **ACCEPTED THE GOAL, REJECTED THE IMPLEMENTATION.** Used `criterionId` instead.
- **Engineering Rationale:**  
  `criterionName` is a display label — it can be edited for clarity, translated, or reformatted without changing what the criterion measures. If names drift between rubric versions, the delta calculation silently stops matching and produces empty comparisons. `criterionId` (e.g., `"srp-cohesion"`) is a stable, intent-preserving identifier that changes only when the underlying rubric criterion itself is added or removed. Join keys must always be stable identifiers, not display labels.

---

### Decision 6: Structural AST Regex Parsing vs. Naive Substring Matching
- **What the AI Suggested:**  
  For deterministic fallback scoring, the AI suggested simple keyword regex:
  ```typescript
  const hasInterface = /interface\s+/i.test(classText);
  if (hasInterface) score = 4; // Loose Coupling
  ```
- **Decision:** **REJECTED AS FLAWED, REPLACED WITH STRUCTURAL PARSING.**
- **Engineering Rationale:**  
  A comment like `// I dislike interface-heavy design` would trigger `/interface/i` and reward the candidate with 4/5 points on Loose Coupling without declaring a single abstraction. We threw out the AI's regex and built structural pattern matching in `RuleBasedEvaluator` that parses explicit class and interface declarations (`class X extends Y implements Z`), counts distinct classes vs. interfaces, checks that declared classes actually `implement` declared interfaces, and detects monolithic God Objects (e.g. single classes named `*Manager` or `*Service` handling multiple concerns).

