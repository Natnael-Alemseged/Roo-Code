/**
 * Read/write .orchestration/active_intents.yaml
 */

import path from "path"
import fs from "fs/promises"
import * as yaml from "yaml"

import type { ActiveIntent, ActiveIntentsFile } from "./types"

const FILENAME = "active_intents.yaml"

export async function readActiveIntents(cwd: string): Promise<ActiveIntent[]> {
	const filePath = path.join(cwd, ".orchestration", FILENAME)
	try {
		const raw = await fs.readFile(filePath, "utf-8")
		const parsed = (yaml.parse(raw) ?? {}) as ActiveIntentsFile
		return parsed?.active_intents ?? []
	} catch {
		return []
	}
}

export async function findIntentById(cwd: string, intentId: string): Promise<ActiveIntent | null> {
	const intents = await readActiveIntents(cwd)
	return intents.find((i) => i.id === intentId) ?? null
}
