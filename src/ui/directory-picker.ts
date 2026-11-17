import { Notice } from 'obsidian';
import { dirname } from 'path';
import { loadElectron, type ElectronModule } from '../utils/electron';

/**
 * Opens a native directory picker. Returns `null` when the user cancels,
 * and falls back to the `<input webkitdirectory>` picker when Electron's
 * remote dialog is unavailable.
 */
export async function pickDirectory(defaultPath?: string): Promise<string | null> {
	const electron = loadElectron();
	const dialog = electron?.remote?.dialog;
	if (dialog) {
		try {
			const result = await dialog.showOpenDialog({
				title: '选择导出目录',
				defaultPath: defaultPath && defaultPath.trim().length > 0 ? defaultPath : undefined,
				properties: ['openDirectory', 'createDirectory'],
			});
			if (result.canceled) {
				return null;
			}
			return result.filePaths[0] ?? null;
		} catch {
			// Fall through to the DOM picker below.
		}
	}
	return pickDirectoryWithInput(electron);
}

function pickDirectoryWithInput(electron: ElectronModule | null): Promise<string | null> {
	return new Promise((resolve) => {
		const input = activeDocument.createEl('input');
		input.type = 'file';
		input.setAttribute('webkitdirectory', '');
		input.addClass('oe-hidden-file-input');

		let settled = false;
		const finish = (value: string | null): void => {
			if (settled) {
				return;
			}
			settled = true;
			input.removeEventListener('change', handleChange);
			input.removeEventListener('cancel', handleCancel);
			input.remove();
			resolve(value);
		};
		const handleChange = (): void => {
			const file = input.files?.[0];
			if (!file) {
				finish(null);
				new Notice('没有读取到所选文件夹，请直接输入路径。');
				return;
			}
			const absolute = resolveFilePath(file, electron);
			if (!absolute) {
				finish(null);
				new Notice('当前环境无法获取文件夹路径，请直接输入路径。');
				return;
			}
			const depth = Math.max(0, file.webkitRelativePath.split('/').length - 1);
			let directory = absolute;
			for (let index = 0; index < depth; index += 1) {
				directory = dirname(directory);
			}
			finish(directory);
		};
		const handleCancel = (): void => finish(null);

		input.addEventListener('change', handleChange);
		input.addEventListener('cancel', handleCancel);
		activeDocument.body.appendChild(input);
		input.click();
	});
}

function resolveFilePath(file: File, electron: ElectronModule | null): string | null {
	const fromWebUtils = electron?.webUtils?.getPathForFile?.(file);
	if (fromWebUtils) {
		return fromWebUtils;
	}
	const legacyPath = (file as File & { path?: string }).path;
	return legacyPath ?? null;
}
