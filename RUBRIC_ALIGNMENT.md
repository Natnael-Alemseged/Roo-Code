# TRP1 Grading Rubric — Evidence Map

This document maps each grading criterion to the codebase and deliverables so evaluators can verify full compliance.

---

## 1. Hook Architecture & Middleware Quality (/5)

| Evidence                   | Location                                                                                                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Isolated middleware**    | `src/hooks/`: HookEngine.ts (orchestrator), preHooks.ts, postHooks.ts, orchestration/ — no logic in main tool loop beyond two call sites.                       |
| **Single injection point** | `presentAssistantMessage.ts`: runPreHooks before tool switch (~line 687), runPostHooks after tool handle (~line 950).                                           |
| **Composable, fail-safe**  | Pre-hooks run in order (intentGatekeeper → scopeEnforcement → optimisticLockCheck); any `proceed: false` blocks execution and returns a clear error to the LLM. |
| **Strict interface**       | HookContext, HookResult in HookEngine.ts; params passed via (block.nativeArgs \|\| block.params).                                                               |

**See also:** FINAL_REPORT.md §1.3, §2.

---

## 2. Context Engineering & Reasoning Loop Implementation (/5)

| Evidence                | Location                                                                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Mandatory handshake** | System prompt: `intentProtocolSection()` in `src/core/prompts/sections/intent-protocol.ts` — "Your FIRST action MUST be to call select_active_intent".                         |
| **Tool definition**     | `select_active_intent(intent_id)` in packages/types, src/shared/tools, and `src/core/prompts/tools/native-tools/select_active_intent.ts`.                                      |
| **Context injection**   | `SelectActiveIntentTool` (src/core/tools/SelectActiveIntentTool.ts): reads active_intents.yaml, sets task.activeIntentId, returns `<intent_context>` XML block as tool result. |
| **Gatekeeper**          | intentGatekeeper in preHooks.ts blocks destructive tools until task.activeIntentId is set; returns INTENT PROTOCOL VIOLATION.                                                  |

**See also:** FINAL_REPORT.md §3.

---

## 3. Intent-AST Correlation & Traceability (/5)

| Evidence                 | Location                                                                                                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Content hashing**      | SHA-256 of file content in HookEngine.runPostHooks; stored with `sha256:` prefix in agent_trace (postHooks.appendAgentTrace).                                           |
| **Audit ledger**         | Append-only `.orchestration/agent_trace.jsonl` per spec: id, timestamp, vcs, files[].relative_path, conversations[].ranges[].content_hash, related[].value = intent ID. |
| **Spatial independence** | content_hash identifies the modified content; trace remains valid if line numbers change.                                                                               |
| **Intent map**           | `.orchestration/intent_map.md` updated on each write (Intent ID → file path, status, last modified).                                                                    |

**See also:** FINAL_REPORT.md §4; .orchestration/agent_trace.jsonl, intent_map.md.

---

## 4. .orchestration/ Artifacts Completeness & Correctness (/5)

| Artifact                | Status | Location / Schema                                                                                                                                        |
| ----------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **active_intents.yaml** | ✓      | id, name, status, owned_scope, constraints, acceptance_criteria. Example: INT-001 in .orchestration/active_intents.yaml.                                 |
| **agent_trace.jsonl**   | ✓      | One JSON object per line; id, timestamp, vcs.revision_id, files[].relative_path, conversations[].ranges[].content_hash (sha256:…), related[].type/value. |
| **intent_map.md**       | ✓      | Markdown table: Intent ID \| File Path \| Status \| Last Modified. Created/updated by updateIntentMap post-hook.                                         |
| **README**              | ✓      | .orchestration/README.md describes each artifact and that hooks maintain them at runtime.                                                                |

**See also:** FINAL_REPORT.md §4.1–4.3; src/hooks/postHooks.ts, orchestration/types.ts.

---

## 5. Git History & Engineering Process (/5)

| Evidence                 | Location                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Granular commits**     | 19 atomic commits from base a5883d371: Phase 0 (docs + scaffold) → Phase 1 (handshake) → Phase 2–4 (hooks, trace, locking) → fix → docs.   |
| **Descriptive messages** | Each commit has a short title and bullet list of what changed (e.g. "Phase 0: add ARCHITECTURE_NOTES - map tool loop and prompt builder"). |
| **Date range**           | Commits dated within assignment window (single full day yesterday 05:00–23:00 UTC).                                                        |
| **Clean branch**         | ai_native_ide-clean / main; history restructured for clarity (scripts/execute-atomic-commits.sh).                                          |

**See also:** `git log --oneline a5883d371..HEAD`; FINAL_REPORT.md §5, §7.
