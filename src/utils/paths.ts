import { App, FileSystemAdapter, Platform } from 'obsidian';
import { dirname, isAbsolute, join, resolve, sep } from 'path';
import { homedir } from 'os';

export function getVaultRoot(app: App): string {
	const adapter = app.vault.adapter;
	if (adapter instanceof FileSystemAdapter) {
		return adapter.getBasePath();
	}
	throw new Error('仅支持本地文件系统仓库。');
}

export function toAbsoluteVaultPath(app: App, vaultPath: string): string {
	const adapter = app.vault.adapter;
	if (adapter instanceof FileSystemAdapter) {
		return adapter.getFullPath(vaultPath);
	}
	return join(getVaultRoot(app), vaultPath);
}

export function defaultDestination(vaultRoot: string, suggestedName: string): string {
	const name = suggestedName.trim().replace(/[\\/:*?"<>|]+/g, '-');
	return join(dirname(vaultRoot), `${name.length > 0 ? name : 'export'}-export`);
}

/**
 * Accepts paths pasted from a terminal or file dialog, including quoted paths and `~`.
 */
export function cleanUserPath(value: string): string {
	let result = value.trim();
	if (result.length >= 2) {
		const first = result.charAt(0);
		const last = result.charAt(result.length - 1);
		if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
			result = result.slice(1, -1).trim();
		}
	}
	if (result === '~') {
		return homedir();
	}
	if (result.startsWith('~/') || result.startsWith('~\\')) {
		return join(homedir(), result.slice(2));
	}
	return result;
}

export function resolveUserPath(baseDir: string, value: string): string {
	const cleaned = cleanUserPath(value);
	return isAbsolute(cleaned) ? resolve(cleaned) : resolve(baseDir, cleaned);
}

export function areSamePath(left: string, right: string): boolean {
	return normalizeForCompare(left) === normalizeForCompare(right);
}

export function isInside(parent: string, child: string): boolean {
	const normalizedParent = normalizeForCompare(parent);
	const normalizedChild = normalizeForCompare(child);
	if (normalizedParent === normalizedChild) {
		return true;
	}
	const prefix = normalizedParent.endsWith(sep) ? normalizedParent : normalizedParent + sep;
	return normalizedChild.startsWith(prefix);
}

function normalizeForCompare(value: string): string {
	const normalized = resolve(value);
	return Platform.isWin ? normalized.toLowerCase() : normalized;
}
