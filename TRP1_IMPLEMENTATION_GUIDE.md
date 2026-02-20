# TRP1 Challenge Week 1: Implementation Guide

**From Your Current State (Roo Code Running) to a Governed AI-Native IDE**

You have Roo Code running (F5 → new VS Code window, extension in activity bar). This guide walks you from here through all phases and deliverables.

---

## Prerequisites ✓

- [x] Fork running, F5 launches extension
- [ ] Read: [Context Engineering for Coding Agents](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html)
- [ ] Read: [AI-Native Git](https://medium.com/@ThinkingLoop/ai-native-git-version-control-for-agent-code-a98462c154e4)
- [ ] Skim: [Cognitive Debt](https://margaretstorey.com/blog/2026/02/09/cognitive-debt/)

---

## Phase 0: Archaeological Dig — DONE ✓

**Deliverable:** `ARCHITECTURE_NOTES.md` (see repo root)

You now know:

- **Tool loop:** `src/core/assistant-message/presentAssistantMessage.ts` — switch on `block.name`, calls `writeToFileTool.handle()`, `executeCommandTool.handle()`, etc.
- **Prompt builder:** `src/core/prompts/system.ts` — `generatePrompt()` / `SYSTEM_PROMPT`
- **Tool definitions:** `src/core/prompts/tools/native-tools/` — where to add `select_active_intent`
- **HITL:** `askApproval` in `presentAssistantMessage`, called by tools before destructive actions

---

## Phase 1: The Handshake (Reasoning Loop)

**Goal:** Force the agent to "checkout" an intent before writing code.

### 1.1 Create the `.orchestration` Directory Structure

```bash
mkdir -p .orchestration
```

**active_intents.yaml** (user/maintainable):

```yaml
active_intents:
    - id: "INT-001"
      name: "Build Weather API"
      status: "IN_PROGRESS"
      owned_scope:
          - "src/api/**"
          - "src/weather/**"
      constraints:
          - "Must use OpenAPI 3.0"
          - "No external API keys in code"
      acceptance_criteria:
          - "Unit tests in tests/weather/ pass"
```

### 1.2 Implement `select_active_intent` Tool

**New file:** `src/core/tools/SelectActiveIntentTool.ts`

- Input: `intent_id: string`
- Behavior:
    1. Read `{cwd}/.orchestration/active_intents.yaml`
    2. Find intent with matching `id`
    3. If not found → `pushToolResult(toolError("Invalid intent ID: ..."))`, return
    4. Build `<intent_context>` XML block with constraints, scope, acceptance_criteria
    5. `pushToolResult` with that block
    6. Store `intent_id` on the Task (e.g. `cline.activeIntentId = intent_id`)

Use `SkillTool` as a template: same approval flow, but no approval needed for intent selection (it's read-only context loading).

### 1.3 Register the Tool

1. Add to `src/core/prompts/tools/native-tools/select_active_intent.ts`:
    - `name: "select_active_intent"`
    - `parameters: { intent_id: string }`
2. Add to `getNativeTools()` in `src/core/prompts/tools/native-tools/index.ts`
3. Add to `NativeToolArgs` in `src/shared/tools.ts`
4. Add case in `presentAssistantMessage` switch:
    ```typescript
    case "select_active_intent":
      await selectActiveIntentTool.handle(cline, block, { askApproval, handleError, pushToolResult })
      break
    ```

### 1.4 Modify System Prompt

In `src/core/prompts/system.ts` (e.g. in `getToolUseGuidelinesSection` or a new section):

```
You are an Intent-Driven Architect. You CANNOT write code or execute commands until you have loaded the relevant context.
1. Analyze the user request.
2. Your FIRST action MUST be to call select_active_intent with the appropriate intent_id from .orchestration/active_intents.yaml.
3. Only after receiving the intent context may you call write_to_file, execute_command, or other mutating tools.
If no intent matches, inform the user and suggest creating one.
```

### 1.5 The Gatekeeper (Pre-Hook)

Before any mutating tool (`write_to_file`, `execute_command`, `apply_diff`, etc.):

- Check if `cline.activeIntentId` is set (from a prior `select_active_intent` call in this turn/session)
- If not: block and return `"You must cite a valid active Intent ID. Call select_active_intent first."`

**Injection point:** At the start of each tool’s `execute()` in Phase 2, or in a wrapper in `presentAssistantMessage` before calling `tool.handle()`.

---

## Phase 2: Hook Middleware & Security Boundary

### 2.1 Create `src/hooks/` Directory

```
src/hooks/
├── index.ts           # exports
├── HookEngine.ts      # central middleware
├── preHooks.ts        # Pre-Hook implementations
├── postHooks.ts       # Post-Hook implementations
└── orchestration/     # .orchestration file I/O
    ├── activeIntents.ts
    ├── agentTrace.ts
    └── intentMap.ts
```

### 2.2 Pre-Hook: Intent Gatekeeper

Before mutating tools run:

1. Read `cline.activeIntentId`
2. If missing → return error, do not call tool

### 2.3 Pre-Hook: Scope Enforcement

For `write_to_file`:

1. Resolve `relPath` against `owned_scope` (glob patterns) of the active intent
2. If path not in scope → return `"Scope Violation: {intent_id} is not authorized to edit [filename]. Request scope expansion."`

Use `minimatch` or similar for glob matching.

### 2.4 Pre-Hook: Command Classification

For `execute_command`:

- Classify as Safe (read) vs Destructive (write, delete, execute)
- For destructive: ensure `askApproval` is called (already done) and optionally add `.intentignore` check
- `.intentignore`: list of intents that must not be modified by certain tools (simple model: glob patterns of paths)

### 2.5 Autonomous Recovery

On reject or pre-hook block: return a structured tool error (e.g. `formatResponse.toolError(...)`) so the LLM can self-correct without crashing.

---

## Phase 3: AI-Native Git Layer (Full Traceability)

### 3.1 Schema for agent_trace.jsonl

Append one JSON object per line after each successful write:

```json
{
	"id": "uuid-v4",
	"timestamp": "2026-02-18T12:00:00Z",
	"vcs": { "revision_id": "git_sha" },
	"files": [
		{
			"relative_path": "src/auth/middleware.ts",
			"conversations": [
				{
					"url": "session_id",
					"contributor": { "entity_type": "AI", "model_identifier": "claude-3-5-sonnet" },
					"ranges": [{ "start_line": 15, "end_line": 45, "content_hash": "sha256:..." }],
					"related": [{ "type": "specification", "value": "INT-001" }]
				}
			]
		}
	]
}
```

### 3.2 Content Hashing

```typescript
import crypto from "crypto"
function contentHash(content: string): string {
	return "sha256:" + crypto.createHash("sha256").update(content).digest("hex").slice(0, 32)
}
```

### 3.3 Post-Hook on write_to_file

After `task.diffViewProvider.saveChanges` / `saveDirectly`:

1. Get `cline.activeIntentId`
2. Compute `content_hash` of the written content (or modified range)
3. Get `git rev-parse HEAD` for `vcs.revision_id`
4. Build trace object and append to `.orchestration/agent_trace.jsonl`

### 3.4 Modify write_to_file Tool Schema (Optional)

Add optional `intent_id` and `mutation_class` (`AST_REFACTOR` | `INTENT_EVOLUTION`) to the schema. If not provided, infer from `cline.activeIntentId` and heuristics (e.g. new file vs edit = INTENT_EVOLUTION).

---

## Phase 4: Parallel Orchestration (Master Thinker)

### 4.1 Optimistic Locking

Before write:

1. Read current file from disk
2. Hash it
3. Compare to hash the agent "read" at start of turn (you may need to track `fileHashAtRead` when `read_file` is called)
4. If different → block with "Stale File: file was modified. Re-read and retry."

Simpler variant: hash file before write, store in Task; on next write to same path, re-hash and compare.

### 4.2 Lesson Recording

Add a tool or post-hook: when a verification step (linter/test) fails, append a "Lessons Learned" entry to `AGENTS.md` or `CLAUDE.md` with timestamp and failure reason.

---

## Deliverables Checklist

### Interim (Wednesday 21hr UTC)

- [ ] PDF report: How VS Code extension works, architecture, hook design, diagrams
- [ ] `ARCHITECTURE_NOTES.md`
- [ ] GitHub repo with `src/hooks/` directory (can be scaffolded)

### Final (Saturday 21hr UTC)

- [ ] PDF: Complete implementation report
- [ ] Meta-audit video (≤5 min):
    1. Fresh workspace, `active_intents.yaml` with e.g. INT-001: Build Weather API
    2. Two chat panels: Agent A (Architect), Agent B (Builder)
    3. Agent B refactors file → show `agent_trace.jsonl` updating
    4. Agent B tries destructive cmd without intent → show Pre-Hook blocking
- [ ] `.orchestration/` artifacts: `agent_trace.jsonl`, `active_intents.yaml`, `intent_map.md`
- [ ] Source: forked extension with clean `src/hooks/`

---

## Suggested Implementation Order

1. **Phase 0** — Done (ARCHITECTURE_NOTES.md)
2. **Phase 1** — `select_active_intent` tool + prompt change + gatekeeper
3. **Phase 2** — Create `src/hooks/`, move gatekeeper into Pre-Hook, add scope enforcement
4. **Phase 3** — Post-Hook for `write_to_file` → `agent_trace.jsonl`
5. **Phase 4** — Optimistic locking, lesson recording (stretch)

---

## Quick Reference: Key Paths in Roo Code

| What                    | Path                                                    |
| ----------------------- | ------------------------------------------------------- |
| Tool dispatch           | `src/core/assistant-message/presentAssistantMessage.ts` |
| Write tool              | `src/core/tools/WriteToFileTool.ts`                     |
| Execute command         | `src/core/tools/ExecuteCommandTool.ts`                  |
| System prompt           | `src/core/prompts/system.ts`                            |
| Native tool definitions | `src/core/prompts/tools/native-tools/`                  |
| Skill tool (template)   | `src/core/tools/SkillTool.ts`                           |
| Base tool               | `src/core/tools/BaseTool.ts`                            |
| Tool types              | `src/shared/tools.ts`                                   |
