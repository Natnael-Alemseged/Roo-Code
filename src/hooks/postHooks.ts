/**
 * Post-Hook implementations.
 *
 * - Agent trace: append to .orchestration/agent_trace.jsonl
 * - Intent map: update .orchestration/intent_map.md
 * - Lesson recording: append to AGENTS.md on verification failure
 */

import type { HookContext } from "./HookEngine"

export async function appendAgentTrace(
	ctx: HookContext & { result?: unknown },
	filePath: string,
	contentHash: string,
	intentId: string,
): Promise<void> {
	// TODO Phase 3: Build trace object, append to agent_trace.jsonl
}

export async function updateIntentMap(ctx: HookContext, intentId: string, filePath: string): Promise<void> {
	// TODO: Incrementally update intent_map.md
}

export async function recordLesson(ctx: HookContext, failureReason: string): Promise<void> {
	// TODO Phase 4: Append to AGENTS.md/CLAUDE.md
}
