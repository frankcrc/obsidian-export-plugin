import { promises as fsPromises, readdirSync } from 'fs';
import { join, relative } from 'path';

export type DirectorySnapshot = Map<string, string>;

/**
 * Records file signatures so files written by obsidian-export can be listed afterwards.
 * Signatures use mtime and size, which also works with `--preserve-mtime`.
 */
export async function snapshotDirectory(directory: string): Promise<DirectorySnapshot> {
	const snapshot: DirectorySnapshot = new Map();
	await walk(directory, directory, snapshot);
	return snapshot;
}

export function directoryHasEntries(directory: string): boolean {
	try {
		return readdirSync(directory).length > 0;
	} catch {
		return false;
	}
}

export async function countFiles(directory: string): Promise<number> {
	let count = 0;
	await walkFiles(directory, () => {
		count += 1;
	});
	return count;
}

export function diffSnapshots(before: DirectorySnapshot, after: DirectorySnapshot): string[] {
	const changed: string[] = [];
	for (const [path, signature] of after) {
		if (before.get(path) !== signature) {
			changed.push(path);
		}
	}
	return changed.sort((left, right) => left.localeCompare(right, 'zh-CN'));
}

async function walkFiles(current: string, onFile: () => void): Promise<void> {
	let entries;
	try {
		entries = await fsPromises.readdir(current, { withFileTypes: true });
	} catch {
		return;
	}
	for (const entry of entries) {
		const fullPath = join(current, entry.name);
		if (entry.isDirectory()) {
			await walkFiles(fullPath, onFile);
			continue;
		}
		if (entry.isFile()) {
			onFile();
		}
	}
}

async function walk(root: string, current: string, snapshot: DirectorySnapshot): Promise<void> {
	let entries;
	try {
		entries = await fsPromises.readdir(current, { withFileTypes: true });
	} catch {
		return;
	}
	for (const entry of entries) {
		const fullPath = join(current, entry.name);
		if (entry.isDirectory()) {
			await walk(root, fullPath, snapshot);
			continue;
		}
		if (!entry.isFile()) {
			continue;
		}
		try {
			const stats = await fsPromises.stat(fullPath);
			snapshot.set(relative(root, fullPath), `${stats.mtimeMs}:${stats.size}`);
		} catch {
			// Ignore files that disappear or cannot be read during the scan.
		}
	}
}
