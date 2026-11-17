import { Notice, Platform } from 'obsidian';
import { spawn } from 'child_process';
import { loadElectron } from './electron';

export function openFolder(directory: string): void {
	const electron = loadElectron();
	const shell = electron?.shell;
	if (shell?.openPath) {
		void shell
			.openPath(directory)
			.then((error) => {
				if (error) {
					openWithSystemCommand(directory);
				}
			})
			.catch(() => openWithSystemCommand(directory));
		return;
	}
	openWithSystemCommand(directory);
}

/**
 * `explorer.exe <path>` hands the request to the running Explorer process, which focuses
 * an existing window for that folder instead of creating a new one. Shell.Application's
 * COM `Explore()` is deliberately not used because it always opens another window.
 */
function openWithSystemCommand(directory: string): void {
	const command = Platform.isWin ? 'explorer.exe' : Platform.isMacOS ? 'open' : 'xdg-open';
	try {
		const child = spawn(command, [directory], {
			windowsHide: true,
			detached: true,
			stdio: 'ignore',
		});
		child.unref();
	} catch {
		new Notice('无法打开目标目录。');
	}
}
