/**
 * Types for .orchestration/ data models.
 */

export interface ActiveIntent {
	id: string
	name: string
	status: "PENDING" | "IN_PROGRESS" | "DONE"
	owned_scope?: string[]
	constraints?: string[]
	acceptance_criteria?: string[]
}

export interface ActiveIntentsFile {
	active_intents: ActiveIntent[]
}

export interface AgentTraceEntry {
	id: string
	timestamp: string
	vcs?: { revision_id: string }
	files: Array<{
		relative_path: string
		conversations: Array<{
			url?: string
			contributor?: { entity_type: string; model_identifier?: string }
			ranges?: Array<{ start_line: number; end_line: number; content_hash: string }>
			related?: Array<{ type: string; value: string }>
		}>
	}>
}
