# .orchestration/ — TRP1 Final Submission Artifacts

This directory contains the **Saturday deliverable** artifacts required by the TRP1 Challenge.

| File | Purpose |
|------|---------|
| **active_intents.yaml** | Intent specification: business intents, owned_scope, constraints, acceptance_criteria. Updated via Pre-Hooks (select_active_intent) and Post-Hooks. |
| **agent_trace.jsonl** | Append-only ledger: every mutating action linked to Intent ID and content hash (spatial independence). Updated by Post-Hook after `write_to_file`. |
| **intent_map.md** | Spatial map: Intent ID → file path. Updated when intent evolution occurs. |

- The hook system in `src/hooks/` creates or updates these files at runtime.
- Example rows are included so evaluators can see the schema; running the extension will append/update entries.
