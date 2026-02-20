/**
 * Hook Engine — Middleware boundary for tool execution.
 *
 * Intercepts all tool execution requests:
 * - PreToolUse: intent context injection, HITL authorization, scope enforcement
 * - PostToolUse: agent_trace.jsonl, intent_map.md, AGENTS.md updates
 *
 * Injection point: presentAssistantMessage, before/after tool.handle()
 */

import type { Task } from "../core/task/Task"
import type { ToolCallbacks } from "../core/tools/BaseTool"

export type ToolName = string
export type HookPhase = "pre" | "post"

export interface HookContext {
	task: Task
	toolName: ToolName
	params?: Record<string, unknown>
	callbacks: ToolCallbacks
}

export interface HookResult {
	proceed: boolean
	error?: string
	injectedContext?: string
}

export class HookEngine {
	/**
	 * Run Pre-Hooks before tool execution.
	 * Returns { proceed: false, error } to block execution.
	 */
	async runPreHooks(ctx: HookContext): Promise<HookResult> {
		// TODO Phase 1–2: Intent gatekeeper, scope enforcement, command classification
		return { proceed: true }
	}

	/**
	 * Run Post-Hooks after successful tool execution.
	 */
	async runPostHooks(ctx: HookContext & { result?: unknown }): Promise<void> {
		// TODO Phase 3–4: agent_trace.jsonl append, intent_map update, lesson recording
	}
}

export const hookEngine = new HookEngine()
