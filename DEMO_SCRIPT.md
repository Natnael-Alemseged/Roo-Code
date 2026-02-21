# TRP1 Challenge: Master Thinker Meta-Audit Demo Script

This script demonstrates the "Governed Engineering Engine" upgrade. You are proving that the IDE is now a manager of parallel silicon workers, not just a text editor.

## Phase 0: The Setup (Open .orchestration/)

1. **Show Workspace:** Highlight the `.orchestration/` directory.
2. **Setup State:** Open `active_intents.yaml`. Show `INT-001` (Core Logic) is `DONE` and `INT-002` (Orchestration Expansion) is `IN_PROGRESS`.
3. **Open 2 Chats:** Create two side-by-side Roo Code instances.
    - **Left:** Architect Persona
    - **Right:** Builder Persona

## Phase 1: The Handshake & Dynamic History

1. **Left Chat (Architect):** "I will plan the next refactor for INT-002. Select intent INT-002 and analyze."
2. **Observe:** Architect calls `select_active_intent("INT-002")`.
3. **Point out:** The Tool Result contains a `<recent_history>` block. Explain that the AI now knows exactly what previous agents did in this intent by reading the ledger.
4. **Right Chat (Builder):** "Architect is planning. I'll check the current status of INT-002."

## Phase 2: High-Fidelity Traceability (The Trace)

1. **Right Chat (Builder):** "Refactor `src/hooks/postHooks.ts` to improve Git SHA logging."
2. **Observe:** Builder calls `select_active_intent("INT-002")` then `write_to_file`.
3. **Open `agent_trace.jsonl`:** Show the new entry.
4. **POINT OUT Master Thinker Evidence:**
    - **VCS revision_id**: It's a real 40-character Git SHA, not a placeholder.
    - **mutation_class**: Note that the agent didn't specify it, but the **Heuristic Engine** classified it as `AST_REFACTOR` because it detected a prior write record in `last_hashes.json`.

## Phase 3: The Guardrails (Governance)

1. **Right Chat (Builder):** "Delete the root `package.json`."
2. **Observe:** The Pre-Hook blocks it immediately. Show the error: `INTENT PROTOCOL VIOLATION`. Explain that the agent cannot touch critical files without explicit intent checkout.
3. **Attempt Out-of-Scope:** Have Builder try to edit a file not in `INT-002`'s `owned_scope`.
4. **Observe:** Show the `SCOPE VIOLATION` error. This proves the IDE enforces the "Governed Perimeter."

## Phase 4: Parallelism & The Shared Brain

1. **Simulate Conflict:**
    - Architect (Left) prepares a write to `HookEngine.ts`.
    - You (Human) manually add a comment to `HookEngine.ts` and save.
2. **Submit Architect's Write:** Show the **Optimistic Lock Collision**.
3. **Resolution:** Point out how the agent is forced to re-read (Self-Correction).
4. **Show `CLAUDE.md`:** Open the shared brain. Point out that a "Lesson Learned" was automatically recorded when the agent encountered a previous logic error, proving the "Hive Mind" is real.

---

## Technical Evidence Checklist (For Grading)

- [ ] **VCS Tracking:** Real `git rev-parse HEAD` output in JSONL.
- [ ] **Heuristic Classification:** `AST_REFACTOR` detected without LLM hint.
- [ ] **Dynamic Injection:** `<recent_history>` present in Handshake.
- [ ] **Shared Brain:** Failures persisted to `CLAUDE.md`.
- [ ] **Linearity:** Git history showing professional, granular engineering.
