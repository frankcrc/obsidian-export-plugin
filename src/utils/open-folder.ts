import { Notice, Platform } from 'obsidian';
import { spawn } from 'child_process';
import { loadElectron } from './electron';

export function openFolder(directory: string): void {
	const electron = loadElectron();
	if (electron?.shell?.openPath) {
		void electron.shell.openPath(directory);
		return;
	}

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
