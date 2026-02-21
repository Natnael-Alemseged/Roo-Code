import { Task } from "../task/Task"
import { BaseTool, ToolCallbacks } from "./BaseTool"
import { readActiveIntents, getRecentIntentHistory } from "../../hooks/orchestration"
import { ActiveIntent } from "../../hooks/orchestration/types"

export class SelectActiveIntentTool extends BaseTool<"select_active_intent"> {
	readonly name = "select_active_intent" as const

	async execute(
		params: { intent_id: string },
		task: Task,
		callbacks: ToolCallbacks,
	): Promise<void> {
		const { intent_id } = params
		const workspacePath = task.workspacePath
		
		try {
			const intents = await readActiveIntents(workspacePath)
			const intent = intents.find((i: ActiveIntent) => i.id === intent_id)
			
			if (!intent) {
				callbacks.pushToolResult(`Error: Intent ID "${intent_id}" not found in .orchestration/active_intents.yaml`)
				return
			}
			
			// Store in task state
			task.activeIntentId = intent_id

			// Fetch recent history for this intent (Score 5: Curated Context)
			const history = await getRecentIntentHistory(workspacePath, intent_id)
			
			// Build context block for LLM
			const contextBlock = `
<intent_context id="${intent.id}">
  <name>${intent.name}</name>
  <status>${intent.status}</status>
  <scope>${intent.owned_scope?.join(", ") || "*"}</scope>
  <constraints>
${intent.constraints?.map((c: string) => `    - ${c}`).join("\n") || "    None"}
  </constraints>
  <acceptance_criteria>
${intent.acceptance_criteria?.map((ac: string) => `    - ${ac}`).join("\n") || "    None"}
  </acceptance_criteria>
  <recent_history>
${history}
  </recent_history>
</intent_context>

Intent "${intent.name}" (${intent.id}) is now active. Your actions are now governed by this intent's scope and constraints.
`.trim()

			callbacks.pushToolResult(contextBlock)
			
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			callbacks.pushToolResult(`Error reading orchestration files: ${errorMessage}`)
		}
	}
}
