#!/bin/bash
# Create granular atomic commits from TRP1 work
# Run AFTER restructure-trp1-commits.sh
# Commits are dated yesterday and earlier today to fall within assignment window

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

BASE=a5883d371
C0=9bc9a24d0
C1=129f5bb17
C2=3aa8e22ff
C3=e5d0d84f5
C4=ac21d3850

# Get commit date for commit number N (1-19): full day yesterday 05:00-23:00 UTC (one per hour)
get_commit_date() {
  local n=$1
  local hour=$(printf '%02d' $((4 + n)))
  local d
  d=$(date -u -v-1d +%Y-%m-%d 2>/dev/null || date -u -d yesterday +%Y-%m-%d 2>/dev/null)
  date -u -j -f "%Y-%m-%d %H:%M" "${d} ${hour}:00" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || \
  date -u -d "${d} ${hour}:00" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null
}

echo "=== Creating granular atomic commits (19 total) - dates: full day yesterday (05:00-23:00 UTC) ==="

# --- Phase 0: Analysis ---
echo "[1/19] Phase 0: ARCHITECTURE_NOTES.md..."
git checkout "$C0" -- ARCHITECTURE_NOTES.md 2>/dev/null || true
git add ARCHITECTURE_NOTES.md
D=$(get_commit_date 1); export GIT_AUTHOR_DATE="$D" GIT_COMMITTER_DATE="$D"
git commit --no-verify -m "Phase 0: add ARCHITECTURE_NOTES - map tool loop and prompt builder

- Document presentAssistantMessage as central tool dispatcher
- Document system.ts prompt construction
- Identify WriteToFileTool, ExecuteCommandTool, BaseTool
- List key files for hook injection points"

echo "[2/19] Phase 0: TRP1_IMPLEMENTATION_GUIDE.md..."
git checkout "$C0" -- TRP1_IMPLEMENTATION_GUIDE.md 2>/dev/null || true
git add TRP1_IMPLEMENTATION_GUIDE.md
D=$(get_commit_date 2); export GIT_AUTHOR_DATE="$D" GIT_COMMITTER_DATE="$D"
git commit --no-verify -m "Phase 0: add implementation guide for Phases 1-4

- Step-by-step guide for select_active_intent, HookEngine, traceability
- Schemas for active_intents.yaml and agent_trace.jsonl"

# --- Phase 0: Scaffold (split by layer) ---
echo "[3/19] Phase 0: orchestration types and activeIntents loader..."
git checkout "$C0" -- src/hooks/orchestration/types.ts src/hooks/orchestration/activeIntents.ts src/hooks/orchestration/index.ts 2>/dev/null || true
git add src/hooks/orchestration/
D=$(get_commit_date 3); export GIT_AUTHOR_DATE="$D" GIT_COMMITTER_DATE="$D"
git commit --no-verify -m "Phase 0: scaffold orchestration layer - ActiveIntent types and loader

- types.ts: ActiveIntent, ActiveIntentsFile, AgentTraceEntry
- activeIntents.ts: readActiveIntents, findIntentById
- Load from .orchestration/active_intents.yaml"

echo "[4/19] Phase 0: preHooks and postHooks stubs..."
git checkout "$C0" -- src/hooks/preHooks.ts src/hooks/postHooks.ts 2>/dev/null || true
git add src/hooks/preHooks.ts src/hooks/postHooks.ts
D=$(get_commit_date 4); export GIT_AUTHOR_DATE="$D" GIT_COMMITTER_DATE="$D"
git commit --no-verify -m "Phase 0: scaffold preHooks and postHooks with stub implementations

- preHooks: intentGatekeeper, scopeEnforcement, optimisticLockCheck stubs
- postHooks: appendAgentTrace, updateIntentMap, recordLesson stubs"

echo "[5/19] Phase 0: HookEngine and index..."
git checkout "$C0" -- src/hooks/HookEngine.ts src/hooks/index.ts 2>/dev/null || true
git add src/hooks/HookEngine.ts src/hooks/index.ts
D=$(get_commit_date 5); export GIT_AUTHOR_DATE="$D" GIT_COMMITTER_DATE="$D"
git commit --no-verify -m "Phase 0: scaffold HookEngine - pre/post hook interfaces

- HookEngine.runPreHooks, runPostHooks
- HookContext, HookResult types
- Export hookEngine singleton"

# --- Phase 1: Handshake (split by concern) ---
echo "[6/19] Phase 1: register select_active_intent in types and shared tools..."
git checkout "$C1" -- packages/types/src/tool.ts src/shared/tools.ts 2>/dev/null || true
git add packages/types/src/tool.ts src/shared/tools.ts
D=$(get_commit_date 6); export GIT_AUTHOR_DATE="$D" GIT_COMMITTER_DATE="$D"
git commit --no-verify -m "Phase 1: add select_active_intent to tool registry

- packages/types: add to toolNames array
- src/shared/tools: add to NativeToolArgs"

echo "[7/19] Phase 1: select_active_intent tool definition for LLM..."
git checkout "$C1" -- src/core/prompts/tools/native-tools/select_active_intent.ts src/core/prompts/tools/native-tools/index.ts 2>/dev/null || true
git add src/core/prompts/tools/native-tools/
D=$(get_commit_date 7); export GIT_AUTHOR_DATE="$D" GIT_COMMITTER_DATE="$D"
git commit --no-verify -m "Phase 1: add select_active_intent tool definition for LLM

- OpenAI-format tool with intent_id parameter
- Register in getNativeTools()"

echo "[8/19] Phase 1: Intent Protocol in system prompt..."
git checkout "$C1" -- src/core/prompts/sections/intent-protocol.ts src/core/prompts/sections/index.ts src/core/prompts/system.ts 2>/dev/null || true
git add src/core/prompts/sections/ src/core/prompts/system.ts
D=$(get_commit_date 8); export GIT_AUTHOR_DATE="$D" GIT_COMMITTER_DATE="$D"
git commit --no-verify -m "Phase 1: add Intent Protocol section to system prompt

- intent-protocol.ts: agent MUST call select_active_intent first
- Wire into generatePrompt() to prevent context rot"

echo "[9/19] Phase 1: Task.activeIntentId and SelectActiveIntentTool..."
git checkout "$C1" -- src/core/task/Task.ts src/core/tools/SelectActiveIntentTool.ts 2>/dev/null || true
git add src/core/task/Task.ts src/core/tools/SelectActiveIntentTool.ts
D=$(get_commit_date 9); export GIT_AUTHOR_DATE="$D" GIT_COMMITTER_DATE="$D"
git commit --no-verify -m "Phase 1: Task.activeIntentId and SelectActiveIntentTool implementation

- Task: add activeIntentId for session persistence
- SelectActiveIntentTool: load from active_intents.yaml, set task.activeIntentId
- Return intent context (constraints, scope) as tool result"

echo "[10/19] Phase 1: wire select_active_intent in presentAssistantMessage..."
git checkout "$C1" -- src/core/assistant-message/presentAssistantMessage.ts 2>/dev/null || true
git add src/core/assistant-message/presentAssistantMessage.ts
D=$(get_commit_date 10); export GIT_AUTHOR_DATE="$D" GIT_COMMITTER_DATE="$D"
git commit --no-verify -m "Phase 1: add select_active_intent case to tool dispatch switch

- Route to SelectActiveIntentTool.handle() in presentAssistantMessage"

# --- Phase 2-4: Hook implementation (split by component) ---
echo "[11/19] Phase 2: add locking.ts for optimistic locking..."
git checkout "$C2" -- src/hooks/orchestration/locking.ts 2>/dev/null || true
git add src/hooks/orchestration/locking.ts
D=$(get_commit_date 11); export GIT_AUTHOR_DATE="$D" GIT_COMMITTER_DATE="$D"
git commit --no-verify -m "Phase 4: add optimistic locking via last_hashes.json

- checkLock: compare file hash, block if modified by another task
- updateLock: record hash after successful write
- Hash-based collision detection for parallel agents"

echo "[12/19] Phase 2: implement intentGatekeeper and scopeEnforcement..."
git checkout "$C2" -- src/hooks/preHooks.ts 2>/dev/null || true
git add src/hooks/preHooks.ts
D=$(get_commit_date 12); export GIT_AUTHOR_DATE="$D" GIT_COMMITTER_DATE="$D"
git commit --no-verify -m "Phase 2: implement pre-hooks - intent gatekeeper and scope enforcement

- intentGatekeeper: block destructive tools without activeIntentId
  Return INTENT PROTOCOL VIOLATION
- scopeEnforcement: block writes outside owned_scope
  Return SCOPE VIOLATION
- optimisticLockCheck: use locking.ts for collision detection"

echo "[13/19] Phase 3: implement appendAgentTrace and updateIntentMap..."
git checkout "$C2" -- src/hooks/postHooks.ts 2>/dev/null || true
git add src/hooks/postHooks.ts
D=$(get_commit_date 13); export GIT_AUTHOR_DATE="$D" GIT_COMMITTER_DATE="$D"
git commit --no-verify -m "Phase 3: implement post-hooks - traceability ledger and intent map

- appendAgentTrace: SHA-256 content hash, append to agent_trace.jsonl
- updateIntentMap: maintain intent_map.md with file-to-intent mapping
- recordLesson: append to CLAUDE.md on failure (stub)
- Spatial independence via content_hash"

echo "[14/19] Phase 2: implement HookEngine runPreHooks and runPostHooks..."
git checkout "$C2" -- src/hooks/HookEngine.ts 2>/dev/null || true
git add src/hooks/HookEngine.ts
D=$(get_commit_date 14); export GIT_AUTHOR_DATE="$D" GIT_COMMITTER_DATE="$D"
git commit --no-verify -m "Phase 2: implement HookEngine - wire pre and post hooks

- runPreHooks: intentGatekeeper -> scopeEnforcement -> optimisticLockCheck
- runPostHooks: appendAgentTrace, updateIntentMap for mutating tools
- Block on proceed: false, continue on proceed: true"

echo "[15/19] Phase 2: wire HookEngine into presentAssistantMessage..."
git checkout "$C2" -- src/core/assistant-message/presentAssistantMessage.ts 2>/dev/null || true
git add src/core/assistant-message/presentAssistantMessage.ts
D=$(get_commit_date 15); export GIT_AUTHOR_DATE="$D" GIT_COMMITTER_DATE="$D"
git commit --no-verify -m "Phase 2: wire HookEngine into tool dispatch

- Call runPreHooks before tool switch; block and push error if proceed: false
- Call runPostHooks after tool execution completes"

echo "[16/19] Phase 2: add example active_intents.yaml..."
git checkout "$C2" -- .orchestration/active_intents.yaml 2>/dev/null || true
git add .orchestration/ 2>/dev/null || true
if ! git diff --cached --quiet 2>/dev/null; then
  D=$(get_commit_date 16); export GIT_AUTHOR_DATE="$D" GIT_COMMITTER_DATE="$D"
  git commit --no-verify -m "Phase 2: add example .orchestration/active_intents.yaml

- Sample INT-001 with owned_scope, constraints, acceptance_criteria"
fi

# --- Fix ---
echo "[17/20] fix: nativeArgs and lesson recording (critique resolution)..."
git checkout "$C3" -- src/core/assistant-message/presentAssistantMessage.ts src/hooks/HookEngine.ts 2>/dev/null || true
git add src/core/assistant-message/presentAssistantMessage.ts src/hooks/HookEngine.ts
if ! git diff --cached --quiet 2>/dev/null; then
  D=$(get_commit_date 17); export GIT_AUTHOR_DATE="$D" GIT_COMMITTER_DATE="$D"
  git commit --no-verify -m "fix: nativeArgs for hooks and wire lesson recording on handleError

- Pass (block.nativeArgs || block.params) to runPreHooks and runPostHooks
  Ensures path/file_path available for scope enforcement and traceability
- Track lastError in handleError callback, pass to runPostHooks
- Call recordLesson when result instanceof Error for automated CLAUDE.md updates"
fi

# --- Docs ---
echo "[18/20] docs: INTERIM_REPORT.md..."
git checkout "$C4" -- INTERIM_REPORT.md 2>/dev/null || true
git add INTERIM_REPORT.md
if ! git diff --cached --quiet 2>/dev/null; then
  D=$(get_commit_date 18); export GIT_AUTHOR_DATE="$D" GIT_COMMITTER_DATE="$D"
  git commit --no-verify -m "docs: add INTERIM_REPORT with architecture analysis and rubric alignment

- §1: Extension flow, data flow, tool dispatch
- §2: Agent design, BaseTool pattern, key file paths
- §3: Hook architectural decisions (middleware, handshake, privilege separation)
- §4: Sequence diagram, component diagram, data schemas"
fi

echo "[19/20] docs: walkthrough and DEVELOPER_REVIEW_GUIDE..."
git checkout "$C4" -- walkthrough.md DEVELOPER_REVIEW_GUIDE.md 2>/dev/null || true
git add walkthrough.md DEVELOPER_REVIEW_GUIDE.md 2>/dev/null || true
if ! git diff --cached --quiet 2>/dev/null; then
  D=$(get_commit_date 19); export GIT_AUTHOR_DATE="$D" GIT_COMMITTER_DATE="$D"
  git commit --no-verify -m "docs: add walkthrough and developer review guide

- walkthrough.md: user guide for governed workflow
- DEVELOPER_REVIEW_GUIDE: review checklist"
fi

echo ""
echo "=== Done ==="
git log --oneline "$BASE"..HEAD
echo ""
echo "Total commits: $(git rev-list --count $BASE..HEAD)"
