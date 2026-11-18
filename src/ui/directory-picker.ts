import { Notice } from 'obsidian';
import { dirname } from 'path';
import { t } from '../i18n';
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
				title: t('dialog.selectDestination'),
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
				new Notice(t('notice.directoryUnreadable'));
				return;
			}
			const absolute = resolveFilePath(file, electron);
			if (!absolute) {
				finish(null);
				new Notice(t('notice.directoryPathUnavailable'));
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
