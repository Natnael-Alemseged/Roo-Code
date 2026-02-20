/**
 * Pre-Hook implementations.
 *
 * - Intent gatekeeper: block mutating tools if no active intent
 * - Scope enforcement: block writes outside owned_scope
 * - Command classification: Safe vs Destructive for HITL
 * - Optimistic locking: block if file was modified by parallel agent
 */

import type { HookContext, HookResult } from "./HookEngine"

export async function intentGatekeeper(ctx: HookContext): Promise<HookResult> {
	// TODO: Check ctx.task.activeIntentId; block if missing for write/execute
	return { proceed: true }
}

export async function scopeEnforcement(ctx: HookContext): Promise<HookResult> {
	// TODO: Resolve path against owned_scope from active_intents.yaml
	return { proceed: true }
}

export async function optimisticLockCheck(ctx: HookContext): Promise<HookResult> {
	// TODO Phase 4: Compare file hash before write
	return { proceed: true }
}
