import { spawn, type ChildProcess } from 'child_process';
import { promises as fsPromises, statSync } from 'fs';
import { join } from 'path';
import { Platform } from 'obsidian';
import { t } from '../i18n';
import { cleanUserPath } from '../utils/paths';

export interface ExportRunResult {
	exitCode: number | null;
	stdout: string;
	stderr: string;
	spawnError?: string;
	canceled: boolean;
}

export interface RunningExport {
	result: Promise<ExportRunResult>;
	cancel(): void;
}

export interface RunExportOptions {
	binary: string;
	args: string[];
	cwd: string;
	onOutput?: (chunk: string) => void;
}

export interface BinaryProbe {
	ok: boolean;
	message: string;
}

export function resolveBinary(configured: string): string {
	const cleaned = cleanUserPath(configured);
	if (cleaned.length === 0) {
		return 'obsidian-export';
	}
	try {
		if (statSync(cleaned).isDirectory()) {
			return join(cleaned, Platform.isWin ? 'obsidian-export.exe' : 'obsidian-export');
		}
	} catch {
		// Not an existing path, so treat the value as a command name.
	}
	return cleaned;
}

export async function ensureDirectory(directory: string): Promise<void> {
	await fsPromises.mkdir(directory, { recursive: true });
}

export function startExport(options: RunExportOptions): RunningExport {
	let canceled = false;
	let stdout = '';
	let stderr = '';
	let settled = false;
	let resolveResult: (value: ExportRunResult) => void = () => undefined;

	const result = new Promise<ExportRunResult>((resolve) => {
		resolveResult = resolve;
	});

	const finish = (spawnError?: string, exitCode: number | null = null): void => {
		if (settled) {
			return;
		}
		settled = true;
		resolveResult({ exitCode, stdout, stderr, spawnError, canceled });
	};

	const child: ChildProcess = spawn(options.binary, options.args, {
		cwd: options.cwd,
		windowsHide: true,
	});

	child.stdout?.setEncoding('utf8');
	child.stderr?.setEncoding('utf8');
	child.stdout?.on('data', (chunk: string) => {
		stdout += chunk;
		options.onOutput?.(chunk);
	});
	child.stderr?.on('data', (chunk: string) => {
		stderr += chunk;
		options.onOutput?.(chunk);
	});
	child.on('error', (error: Error) => finish(error.message));
	child.on('close', (code: number | null) => finish(undefined, code));

	return {
		result,
		cancel: () => {
			canceled = true;
			child.kill();
		},
	};
}

export function probeBinary(binary: string, cwd: string): Promise<BinaryProbe> {
	const running = startExport({ binary, args: ['--version'], cwd });
	return running.result.then((result) => {
		const output = `${result.stdout}${result.stderr}`.trim();
		if (result.spawnError) {
			return { ok: false, message: t('probe.spawnError', { error: result.spawnError }) };
		}
		if (result.exitCode !== 0) {
			return {
				ok: false,
				message:
					output.length > 0
						? output
						: t('probe.exitCode', { code: result.exitCode ?? t('common.unknown') }),
			};
		}
		return { ok: true, message: output.length > 0 ? output : t('probe.available') };
	});
}

export function detectBinary(): Promise<string | null> {
	return new Promise((resolve) => {
		const command = Platform.isWin ? 'where' : 'which';
		const child = spawn(command, ['obsidian-export'], { windowsHide: true });
		let output = '';
		let settled = false;

		const finish = (value: string | null): void => {
			if (settled) {
				return;
			}
			settled = true;
			resolve(value);
		};

		child.stdout?.setEncoding('utf8');
		child.stdout?.on('data', (chunk: string) => {
			output += chunk;
		});
		child.on('error', () => finish(null));
		child.on('close', (code: number | null) => {
			if (code !== 0) {
				finish(null);
				return;
			}
			const first = output
				.split(/\r?\n/u)
				.map((line) => line.trim())
				.find((line) => line.length > 0);
			finish(first ?? null);
		});
	});
}
