/**
 * TRP1 Challenge: Hook Engine for Intent-Code Traceability
 *
 * This module provides the middleware boundary that intercepts tool execution
 * for context injection, scope enforcement, and trace logging.
 *
 * @see ARCHITECTURE_NOTES.md
 * @see TRP1_IMPLEMENTATION_GUIDE.md
 */

export { HookEngine, hookEngine } from "./HookEngine"
export type { HookContext, HookResult } from "./HookEngine"
export * from "./preHooks"
export * from "./postHooks"
export { readActiveIntents, findIntentById } from "./orchestration"
export type { ActiveIntent, ActiveIntentsFile, AgentTraceEntry } from "./orchestration"
