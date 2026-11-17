import type { ExportSettings } from '../settings';

export interface ExportRequest {
	vaultRoot: string;
	startAt?: string;
	destination: string;
}

export function buildExportArgs(settings: ExportSettings, request: ExportRequest): string[] {
	const args: string[] = [];

	if (request.startAt) {
		args.push('--start-at', request.startAt);
	}
	args.push('--frontmatter', settings.frontmatter);
	if (settings.noGit) {
		args.push('--no-git');
	}
	if (settings.hidden) {
		args.push('--hidden');
	}
	if (settings.noRecursiveEmbeds) {
		args.push('--no-recursive-embeds');
	}
	if (settings.preserveMtime) {
		args.push('--preserve-mtime');
	}
	if (settings.hardLinebreaks) {
		args.push('--hard-linebreaks');
	}

	args.push(...parseExtraArgs(settings.extraArgs));
	args.push(request.vaultRoot, request.destination);
	return args;
}

export function parseExtraArgs(input: string): string[] {
	const args: string[] = [];
	let current = '';
	let quote: '"' | "'" | null = null;
	let started = false;

	for (const character of input) {
		if (quote) {
			if (character === quote) {
				quote = null;
			} else {
				current += character;
			}
			continue;
		}
		if (character === '"' || character === "'") {
			quote = character;
			started = true;
			continue;
		}
		if (character === ' ' || character === '\t' || character === '\n' || character === '\r') {
			if (started) {
				args.push(current);
				current = '';
				started = false;
			}
			continue;
		}
		current += character;
		started = true;
	}

	if (started) {
		args.push(current);
	}
	return args;
}

export function formatCommandLine(binary: string, args: string[]): string {
	return [binary, ...args].map(quoteArgument).join(' ');
}

function quoteArgument(value: string): string {
	if (value.length === 0) {
		return '""';
	}
	return /[\s"]/u.test(value) ? `"${value.replace(/"/g, '\\"')}"` : value;
}
