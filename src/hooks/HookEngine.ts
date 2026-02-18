/**
 * Hook Engine — Middleware boundary for tool execution.
 *
 * Intercepts all tool execution requests:
 * - PreToolUse: intent context injection, HITL authorization, scope enforcement
 * - PostToolUse: agent_trace.jsonl, intent_map.md, AGENTS.md updates
 *
 * Injection point: presentAssistantMessage, before/after tool.handle()
 */

import crypto from "crypto"
import fs from "fs/promises"
import path from "path"
import type { Task } from "../core/task/Task"
import type { ToolCallbacks } from "../core/tools/BaseTool"
import { intentGatekeeper, scopeEnforcement, optimisticLockCheck } from "./preHooks"
import { appendAgentTrace, updateIntentMap } from "./postHooks"

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
		// 1. Intent Gatekeeper
		const intentResult = await intentGatekeeper(ctx)
		if (!intentResult.proceed) {
			return intentResult
		}

		// 2. Scope Enforcement (Phase 2)
		const scopeResult = await scopeEnforcement(ctx)
		if (!scopeResult.proceed) {
			return scopeResult
		}

		// 3. Optimistic Lock Check (Phase 4)
		const lockResult = await optimisticLockCheck(ctx)
		if (!lockResult.proceed) {
			return lockResult
		}

		return { proceed: true }
	}

	/**
	 * Run Post-Hooks after successful tool execution.
	 */
	async runPostHooks(ctx: HookContext & { result?: unknown }): Promise<void> {
		const { toolName, params, task } = ctx

		if (!task.activeIntentId) {
			return
		}

		const MUTATING_TOOLS = ["write_to_file", "apply_diff", "edit_file", "edit", "search_replace", "apply_patch", "search_and_replace"]

		if (MUTATING_TOOLS.includes(toolName)) {
			try {
				const relativePath = (params?.path || params?.file_path || params?.relative_path) as string | undefined
				if (!relativePath) {
					return
				}

				const fullPath = relativePath.startsWith("/")
					? relativePath
					: path.join(task.workspacePath, relativePath)
				const normalizedRelativePath = path.relative(task.workspacePath, fullPath)

				// Calculate content hash of the file on disk after mutation
				const content = await fs.readFile(fullPath, "utf-8")
				const hash = crypto.createHash("sha256").update(content).digest("hex")

				// 1. Append Agent Trace
				await appendAgentTrace(ctx, normalizedRelativePath, hash, task.activeIntentId)

				// 2. Update Intent Map
				await updateIntentMap(ctx, task.activeIntentId, normalizedRelativePath)
			} catch (error) {
				console.error(`[runPostHooks] Failed to process post-hook for ${toolName}: ${error}`)
			}
		}
	}
}

export const hookEngine = new HookEngine()
