import type OpenAI from "openai"

export function getSelectActiveIntentDescription(): OpenAI.Chat.ChatCompletionTool {
	return {
		type: "function",
		function: {
			name: "select_active_intent",
			description:
				"This tool MUST ONLY be used as the VERY FIRST action in a new task or when switching to a different business objective. It loads the full context, constraints, and acceptance criteria for a specific 'Intent' from the .orchestration/active_intents.yaml file. You CANNOT write code or execute commands until an intent is selected and loaded into your active context.",
			parameters: {
				type: "object",
				properties: {
					intent_id: {
						type: "string",
						description: "The unique ID of the intent to select (e.g., 'INT-001').",
					},
				},
				required: ["intent_id"],
			},
		},
	}
}

export default getSelectActiveIntentDescription
