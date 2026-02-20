export function intentProtocolSection(): string {
	return `
## INTENT PROTOCOL (TRP1 GOVERNANCE)
Your FIRST action in any task MUST be to call 'select_active_intent'. This loads the specific business reasoning, constraints, and scope for your work.
- You are strictly FORBIDDEN from using 'write_to_file', 'apply_diff', or 'execute_command' until you have a confirmed 'intent_context'.
- If you attempt to modify code without an active intent, your action will be BLOCKED by the gatekeeper.
- If you are unsure which intent to select, read '.orchestration/active_intents.yaml' first.
`.trim()
}
