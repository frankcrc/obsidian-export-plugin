import { existsSync, promises as fsPromises, statSync } from 'fs';
import { basename, join, relative } from 'path';
import type { ExportSettings } from '../settings';

export interface PredictRequest {
	vaultRoot: string;
	startAt?: string;
}

/**
 * Estimates which files obsidian-export will write, relative to the destination.
 * `.export-ignore`, git ignore rules and tag filters are not evaluated, so this is
 * only used to report likely overwrites; the directory check remains the safety net.
 */
export async function predictOutputPaths(
	settings: ExportSettings,
	request: PredictRequest,
): Promise<string[]> {
	const { vaultRoot, startAt } = request;

	if (startAt) {
		try {
			const stats = statSync(startAt);
			if (stats.isFile()) {
				return [basename(startAt)];
			}
			if (stats.isDirectory()) {
				return collectRelativeFiles(startAt, settings.hidden);
			}
		} catch {
			// Fall back to the vault root below.
		}
	}
	return collectRelativeFiles(vaultRoot, settings.hidden);
}

/**
 * Returns the absolute paths of predicted output files that already exist.
 */
export function findExistingOutputs(destination: string, outputs: string[]): string[] {
	const existing: string[] = [];
	for (const output of outputs) {
		const absolutePath = join(destination, output);
		if (existsSync(absolutePath)) {
			existing.push(absolutePath);
		}
	}
	return existing;
}

async function collectRelativeFiles(root: string, includeHidden: boolean): Promise<string[]> {
	const results: string[] = [];
	await walk(root, root, includeHidden, results);
	return results.sort((left, right) => left.localeCompare(right, 'zh-CN'));
}

async function walk(
	root: string,
	current: string,
	includeHidden: boolean,
	results: string[],
): Promise<void> {
	let entries;
	try {
		entries = await fsPromises.readdir(current, { withFileTypes: true });
	} catch {
		return;
	}
	for (const entry of entries) {
		if (!includeHidden && entry.name.startsWith('.')) {
			continue;
		}
		const fullPath = join(current, entry.name);
		if (entry.isDirectory()) {
			await walk(root, fullPath, includeHidden, results);
			continue;
		}
		if (entry.isFile()) {
			results.push(relative(root, fullPath));
		}
	}
}
