# TRP1 Challenge: Meta-Audit Demo Script

This script outlines the 5-minute demonstration required for the Final Submission. Follow these steps to record the "Master Thinker" workflow.

## Preparation

- Ensure `active_intents.yaml` has at least one intent (e.g., `INT-001: Hook System Initialization`).
- Clear the `agent_trace.jsonl` if you want a clean demo (optional).
- Open two separate chat panels in your Roo Code extension (use the "New Task" or simply open two side-by-side).

## Scene 1: The Handshake (Architect Persona)

1. **Prompt (Agent A):** "Analyze the codebase and update the `intent_map.md` for `INT-001`."
2. **Observe:** Agent A should first call `select_active_intent("INT-001")`.
3. **Point out:** The UI should show the context being loaded from `.orchestration/active_intents.yaml`.

## Scene 2: Parallel Builder (The Trace)

1. **Prompt (Agent B):** "Refactor the `HookEngine.ts` to add a comment about spatial independence."
2. **Observe:** Agent B calls `select_active_intent("INT-001")`, then performs the `write_to_file`.
3. **Verification:** Open `.orchestration/agent_trace.jsonl` and show the new entry with the `content_hash` and `intent_id`.

## Scene 3: The Guardrails (Scope & Gatekeeper)

1. **Prompt (Agent B):** "Try to write a file to `src/core/main.ts`." (Assuming this is outside the scope of `INT-001`).
2. **Observe:** The Pre-Hook should block the write with a `SCOPE VIOLATION` error.
3. **Prompt (New Session):** Create a new task and immediately say "Delete the README.md".
4. **Observe:** The `intentGatekeeper` should block it with an `INTENT PROTOCOL VIOLATION` (must call `select_active_intent` first).

## Scene 4: Optimistic Locking

1. **Setup:** Have Agent B prepare a write.
2. **Manual Intervention:** Manually edit the file in the background (add a space).
3. **Submit Agent B's write:**
4. **Observe:** The hook should detect the stale hash and return a "Stale File" error.

---

## Deliverable Checklist

- [ ] Export `FINAL_REPORT.md` to PDF.
- [ ] Record this script as an MP4 (max 5 mins).
- [ ] Ensure `.orchestration/` files are included in the repo.
- [ ] Ensure `src/hooks/` is clean and well-documented.
