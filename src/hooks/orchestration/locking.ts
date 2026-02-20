/**
 * Semantic Locking for Parallel Orchestration.
 */

import path from "path"
import fs from "fs/promises"
import crypto from "crypto"

export interface HashRecord {
	path: string
	hash: string
	timestamp: string
	taskId: string
}

export interface LockFile {
	hashes: HashRecord[]
}

const FILENAME = "last_hashes.json"

export async function checkLock(cwd: string, relativePath: string, taskId: string): Promise<{ allowed: boolean; error?: string }> {
	const filePath = path.join(cwd, ".orchestration", FILENAME)
	const fullPath = path.join(cwd, relativePath)

	try {
		// Get current hash of the file on disk
		const content = await fs.readFile(fullPath, "utf-8")
		const currentHash = crypto.createHash("sha256").update(content).digest("hex")

		let lockData: LockFile = { hashes: [] }
		try {
			const raw = await fs.readFile(filePath, "utf-8")
			lockData = JSON.parse(raw)
		} catch {
			// No lock file yet, create it and allow
			await updateLock(cwd, relativePath, currentHash, taskId)
			return { allowed: true }
		}

		const record = lockData.hashes.find(h => h.path === relativePath)
		if (!record) {
			// No record for this file, update and allow
			await updateLock(cwd, relativePath, currentHash, taskId)
			return { allowed: true }
		}

		// If current hash matches last recorded hash for THIS file, allow.
		// If it doesn't match, it means someone else changed it.
		if (record.hash !== currentHash) {
			// Collision detected!
			if (record.taskId !== taskId) {
				return {
					allowed: false,
					error: `OPTIMISTIC LOCK COLLISION: File "${relativePath}" has been modified by another task (${record.taskId}) since your last read. Please re-read the file to sync state before attempting further modifications.`,
				}
			}
		}

		// All good, update the timestamp/hash
		await updateLock(cwd, relativePath, currentHash, taskId)
		return { allowed: true }
	} catch (error) {
		// File might not exist yet, allow
		return { allowed: true }
	}
}

export async function updateLock(cwd: string, relativePath: string, hash: string, taskId: string): Promise<void> {
	const filePath = path.join(cwd, ".orchestration", FILENAME)
	const orchestrationDir = path.join(cwd, ".orchestration")

	try {
		await fs.mkdir(orchestrationDir, { recursive: true })
		
		let lockData: LockFile = { hashes: [] }
		try {
			const raw = await fs.readFile(filePath, "utf-8")
			lockData = JSON.parse(raw)
		} catch {}

		const existing = lockData.hashes.findIndex(h => h.path === relativePath)
		const newRecord: HashRecord = {
			path: relativePath,
			hash,
			timestamp: new Date().toISOString(),
			taskId
		}

		if (existing !== -1) {
			lockData.hashes[existing] = newRecord
		} else {
			lockData.hashes.push(newRecord)
		}

		await fs.writeFile(filePath, JSON.stringify(lockData, null, 2))
	} catch (error) {
		console.error(`[updateLock] Failed to update lock: ${error}`)
	}
}
