/**
 * Post-Hook implementations.
 *
 * - Agent trace: append to .orchestration/agent_trace.jsonl
 * - Intent map: update .orchestration/intent_map.md
 * - Lesson recording: append to CLAUDE.md on verification failure
 */

import path from "path"
import fs from "fs/promises"
import { v4 as uuidv4 } from "uuid"
import type { HookContext } from "./HookEngine"
import type { AgentTraceEntry } from "./orchestration/types"

import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

async function getGitSha(cwd: string): Promise<string> {
	try {
		const { stdout } = await execAsync("git rev-parse HEAD", { cwd })
		return stdout.trim()
	} catch {
		return "HEAD"
	}
}

export async function appendAgentTrace(
	ctx: HookContext & { result?: unknown },
	relativeFilePath: string,
	contentHash: string,
	intentId: string,
	mutationClass?: string,
): Promise<void> {
	const { task } = ctx
	const tracePath = path.join(task.workspacePath, ".orchestration", "agent_trace.jsonl")
	const gitSha = await getGitSha(task.workspacePath)

	const related = [{ type: "specification", value: intentId }]
	if (mutationClass) {
		related.push({ type: "mutation_class", value: mutationClass })
	}

	const entry: AgentTraceEntry = {
		id: uuidv4(),
		timestamp: new Date().toISOString(),
		vcs: { revision_id: gitSha },
		files: [
			{
				relative_path: relativeFilePath,
				conversations: [
					{
						url: task.taskId,
						contributor: { entity_type: "AI", model_identifier: "roo-code" },
						ranges: [{ start_line: 1, end_line: -1, content_hash: contentHash.startsWith("sha256:") ? contentHash : `sha256:${contentHash}` }],
						related,
					},
				],
			},
		],
	}

	try {
		await fs.appendFile(tracePath, JSON.stringify(entry) + "\n")
	} catch (error) {
		console.error(`[appendAgentTrace] Failed to write trace: ${error}`)
	}
}

export async function updateIntentMap(ctx: HookContext, intentId: string, relativeFilePath: string): Promise<void> {
	const { task } = ctx
	const mapPath = path.join(task.workspacePath, ".orchestration", "intent_map.md")
	const date = new Date().toISOString().split("T")[0]

	let content = ""
	try {
		content = await fs.readFile(mapPath, "utf-8")
	} catch {
		content = "# Intent Traceability Map\n\n| Intent ID | File Path | Status | Last Modified |\n| :--- | :--- | :--- | :--- |\n"
	}

	const lines = content.split("\n")
	const newRow = `| ${intentId} | ${relativeFilePath} | ACTIVE | ${date} |`

	// Check if row already exists for this ID and File
	const existingIndex = lines.findIndex((l) => l.includes(`| ${intentId} | ${relativeFilePath} |`))

	if (existingIndex !== -1) {
		lines[existingIndex] = newRow
	} else {
		lines.push(newRow)
	}

	try {
		await fs.writeFile(mapPath, lines.join("\n"))
	} catch (error) {
		console.error(`[updateIntentMap] Failed to write map: ${error}`)
	}
}

export async function recordLesson(ctx: HookContext, failureReason: string): Promise<void> {
	const { task } = ctx
	const claudePath = path.join(task.workspacePath, "CLAUDE.md")
	const date = new Date().toISOString().split("T")[0]

	const lessonEntry = `\n### [Automated Lesson] - ${date}\n- **Context:** Tool failure in task \`${task.taskId}\`\n- **Issue:** ${failureReason}\n- **Resolution:** [AI to self-correct based on this record]\n`

	try {
		let content = ""
		try {
			content = await fs.readFile(claudePath, "utf-8")
		} catch {
			content = "# CLAUDE.md — Developer Guide\n\n## Lessons Learned\n"
		}

		if (!content.includes("## Lessons Learned")) {
			content += "\n\n## Lessons Learned\n"
		}

		await fs.appendFile(claudePath, lessonEntry)
	} catch (error) {
		console.error(`[recordLesson] Failed to record lesson: ${error}`)
	}
}
