import fs from "fs/promises"
import path from "path"
import { AgentTraceEntry } from "./types"

export async function readAgentTrace(workspacePath: string): Promise<AgentTraceEntry[]> {
	const tracePath = path.join(workspacePath, ".orchestration", "agent_trace.jsonl")
	try {
		const content = await fs.readFile(tracePath, "utf-8")
		return content
			.trim()
			.split("\n")
			.filter((l) => l.trim().length > 0)
			.map((l) => JSON.parse(l))
	} catch (error) {
		return []
	}
}

export async function getRecentIntentHistory(workspacePath: string, intentId: string, limit = 5): Promise<string> {
	const traces = await readAgentTrace(workspacePath)
	const relevant = traces
		.filter((t) =>
			t.files?.some((f) =>
				f.conversations?.some((c) =>
					c.related?.some((r) => r.type === "specification" && r.value === intentId)
				)
			)
		)
		.slice(-limit)

	if (relevant.length === 0) {
		return "No recent history for this intent."
	}

	return relevant
		.map((t) => {
			const file = t.files[0]
			const convo = file.conversations[0]
			const mutationClass = convo.related?.find((r) => r.type === "mutation_class")?.value || "UNKNOWN"
			return `- [${t.timestamp}] ${file.relative_path} (${mutationClass})`
		})
		.join("\n")
}
