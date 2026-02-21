export function intentProtocolSection(): string {
	return `
## INTENT PROTOCOL (TRP1 GOVERNANCE)
1. **Handshake First**: Your FIRST action in any task MUST be to call 'select_active_intent'. This tool returns a <intent_context> block with mandatory constraints and scope.
2. **Deterministic Gatekeeping**: You are strictly FORBIDDEN from using tools that mutate the environment (write_to_file, apply_diff, execute_command) until you have selected an intent.
3. **Traceability Classification**: When using 'write_to_file', you SHOULD provide a 'mutation_class' parameter:
   - 'AST_REFACTOR': For changes that preserve logic but improve structure/readability.
   - 'INTENT_EVOLUTION': For new feature additions or requirement-driven changes.
4. **Shared Brain**: If you encounter errors, the system will record them in 'CLAUDE.md'. Read this file periodically to synchronize state with other agents.
`.trim()
}
