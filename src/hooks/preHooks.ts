/**
 * Pre-Hook implementations.
 *
 * - Intent gatekeeper: block mutating tools if no active intent
 * - Scope enforcement: block writes outside owned_scope
 * - Command classification: Safe vs Destructive for HITL
 * - Optimistic locking: block if file was modified by parallel agent
 */

import path from "path"
import type { HookContext, HookResult } from "./HookEngine"
import { findIntentById } from "./orchestration/activeIntents"

const DESTRUCTIVE_TOOLS = [
	"write_to_file",
	"execute_command",
	"apply_diff",
	"edit_file",
	"edit",
	"search_replace",
	"apply_patch",
	"search_and_replace",
	"search_files",
]

const MUTATING_TOOLS = ["write_to_file", "apply_diff", "edit_file", "edit", "search_replace", "apply_patch", "search_and_replace"]

import { checkLock } from "./orchestration/locking"

export async function intentGatekeeper(ctx: HookContext): Promise<HookResult> {
	const { toolName, task } = ctx

	if (DESTRUCTIVE_TOOLS.includes(toolName)) {
		if (!task.activeIntentId) {
			return {
				proceed: false,
				error: `INTENT PROTOCOL VIOLATION: You are attempting to use "${toolName}" without an active intent context. You MUST call "select_active_intent" first to load the business reasoning and constraints for your work.`,
			}
		}
	}

	return { proceed: true }
}

export async function scopeEnforcement(ctx: HookContext): Promise<HookResult> {
	const { toolName, task, params } = ctx

	if (!MUTATING_TOOLS.includes(toolName) || !task.activeIntentId) {
		return { proceed: true }
	}

	const intent = await findIntentById(task.workspacePath, task.activeIntentId)
	if (!intent || !intent.owned_scope || intent.owned_scope.length === 0) {
		return { proceed: true }
	}

	// Get the target path from params
	const targetPath = (params?.path || params?.file_path || params?.relative_path) as string | undefined
	if (!targetPath) {
		return { proceed: true }
	}

	const isAllowed = intent.owned_scope.some((scope) => {
		// Simple prefix match for now, or exact match
		// Remove trailing slashes and normalize
		const normalizedScope = scope.endsWith("/**") ? scope.slice(0, -3) : scope
		const normalizedPath = targetPath.startsWith("/") ? path.relative(task.workspacePath, targetPath) : targetPath

		if (scope.endsWith("/**")) {
			// Directory match: normalizedPath should start with normalizedScope
			return normalizedPath === normalizedScope || normalizedPath.startsWith(normalizedScope + "/")
		} else {
			// Exact file match
			return normalizedPath === scope
		}
	})

	if (!isAllowed) {
		return {
			proceed: false,
			error: `SCOPE VIOLATION: The intent "${intent.name}" (${intent.id}) does not own the scope for "${targetPath}". Owned scope: ${intent.owned_scope.join(", ")}. Please switch to a relevant intent or update the orchestration specification.`,
		}
	}

	return { proceed: true }
}

export async function optimisticLockCheck(ctx: HookContext): Promise<HookResult> {
	const { toolName, task, params } = ctx

	if (!MUTATING_TOOLS.includes(toolName)) {
		return { proceed: true }
	}

	const relativePath = (params?.path || params?.file_path || params?.relative_path) as string | undefined
	if (!relativePath) {
		return { proceed: true }
	}

	const normalizedRelativePath = relativePath.startsWith("/")
		? path.relative(task.workspacePath, relativePath)
		: relativePath

	const lockResult = await checkLock(task.workspacePath, normalizedRelativePath, task.taskId)
	if (!lockResult.allowed) {
		return {
			proceed: false,
			error: lockResult.error,
		}
	}

	return { proceed: true }
}
