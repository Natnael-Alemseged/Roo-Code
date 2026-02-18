# Walkthrough: Governed AI-Native IDE (TRP1 Implementation)

This guide demonstrates how to use the new Governance and Traceability features in this Roo Code fork.

---

## 1. The Handshake (Phase 1)

Before you can perform any file modifications or terminal commands, you MUST "check out" an active intent.

### Step 1: Select Active Intent

Call the `select_active_intent` tool with a valid ID from `.orchestration/active_intents.yaml`.

**Example LLM Call:**

```json
{
	"name": "select_active_intent",
	"arguments": {
		"intentId": "INT-001"
	}
}
```

### Result:

- The `Task` instance is updated with `activeIntentId = "INT-001"`.
- The agent now has permission to act within the defined **Owned Scope**.

---

## 2. Scope Enforcement (Phase 2)

If the agent attempts to write to a file outside its owned scope, the Hook Engine will block it.

### Example Violation:

If `owned_scope` is `["src/hooks/**"]` and the agent tries to write to `src/main.ts`:

**Hook Output:**

> OBJECTIVE VIOLATION: The intent "Hook System Initialization" (INT-001) does not own the scope for "src/main.ts". Please switch to a relevant intent or update the orchestration specification.

---

## 3. Spatial Independence & Traceability (Phase 3)

Every successful write is logged in `.orchestration/agent_trace.jsonl` with a SHA-256 hash.

### Audit Ledger Entry:

```json
{
	"id": "uuid-v4",
	"timestamp": "2026-02-18T...",
	"files": [
		{
			"relative_path": "src/hooks/HookEngine.ts",
			"conversations": [
				{
					"url": "task-uuid",
					"ranges": [{ "content_hash": "sha256:..." }],
					"related": [{ "type": "specification", "value": "INT-001" }]
				}
			]
		}
	]
}
```

This ensures that even if line numbers change, the semantic correlation between the code block and the business intent is preserved.

---

## 4. Parallel Orchestration (Phase 4)

### Optimistic Locking

The IDE now detects if another agent (or human) has modified a file since the current task started, using the `last_hashes.json` sidecar.

### Lesson Recording

Failed tool executions (e.g., lint errors) are automatically summarized and appended to `CLAUDE.md` to prevent similar mistakes in future turns.

---

## 5. Summary of Files Created/Modified

- `src/hooks/HookEngine.ts`: Central middleware.
- `src/hooks/preHooks.ts`: Governance logic (Gatekeeper, Scope, Locking).
- `src/hooks/postHooks.ts`: Traceability logic (Trace, Map, Lessons).
- `src/hooks/orchestration/`: YAML/JSON data models.
- `src/core/assistant-message/presentAssistantMessage.ts`: Integration point.
- `src/core/prompts/tools/native-tools/select_active_intent.ts`: The Handshake tool.
- `.orchestration/`: Directory for governance artifacts.
