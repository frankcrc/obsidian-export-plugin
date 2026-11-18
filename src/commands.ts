import { Notice, TFile, TFolder } from 'obsidian';
import type ObsidianExportPlugin from './main';
import { t } from './i18n';
import { ExportModal, type ExportTarget } from './ui/export-modal';
import { FolderSuggestModal } from './ui/folder-suggest';
import { getVaultRoot, toAbsoluteVaultPath } from './utils/paths';

export function registerCommands(plugin: ObsidianExportPlugin): void {
	plugin.addCommand({
		id: 'export-current-note',
		name: t('command.exportCurrent'),
		checkCallback: (checking: boolean) => {
			const file = plugin.app.workspace.getActiveFile();
			if (!file || file.extension !== 'md') {
				return false;
			}
			if (!checking) {
				exportFile(plugin, file);
			}
			return true;
		},
	});

	plugin.addCommand({
		id: 'export-folder',
		name: t('command.exportFolder'),
		callback: () => chooseFolder(plugin),
	});

	plugin.addCommand({
		id: 'export-vault',
		name: t('command.exportVault'),
		callback: () => openExportModal(plugin, vaultTarget(plugin)),
	});
}

export function registerFileMenu(plugin: ObsidianExportPlugin): void {
	plugin.registerEvent(
		plugin.app.workspace.on('file-menu', (menu, file) => {
			if (file instanceof TFile && file.extension === 'md') {
				menu.addItem((item) =>
					item
						.setTitle(t('menu.export'))
						.setIcon('file-down')
						.onClick(() => {
							exportFile(plugin, file);
						}),
				);
				return;
			}
			if (file instanceof TFolder) {
				menu.addItem((item) =>
					item
						.setTitle(t('menu.export'))
						.setIcon('file-down')
						.onClick(() => {
							exportFolder(plugin, file);
						}),
				);
			}
		}),
	);
}

export function exportActiveNoteOrVault(plugin: ObsidianExportPlugin): void {
	const file = plugin.app.workspace.getActiveFile();
	if (file && file.extension === 'md') {
		exportFile(plugin, file);
		return;
	}
	openExportModal(plugin, vaultTarget(plugin));
}

export function exportFile(plugin: ObsidianExportPlugin, file: TFile): void {
	openExportModal(plugin, {
		title: t('target.currentNote'),
		detail: file.path,
		startAt: toAbsoluteVaultPath(plugin.app, file.path),
		suggestedName: file.basename,
	});
}

export function exportFolder(plugin: ObsidianExportPlugin, folder: TFolder): void {
	if (folder.path.length === 0 || folder.path === '/') {
		openExportModal(plugin, vaultTarget(plugin));
		return;
	}
	openExportModal(plugin, {
		title: t('target.folder'),
		detail: folder.path,
		startAt: toAbsoluteVaultPath(plugin.app, folder.path),
		suggestedName: folder.name,
	});
}

function vaultTarget(plugin: ObsidianExportPlugin): ExportTarget {
	const name = plugin.app.vault.getName();
	return {
		title: t('target.vault'),
		detail: name,
		suggestedName: name,
	};
}

function chooseFolder(plugin: ObsidianExportPlugin): void {
	new FolderSuggestModal(plugin.app, (folder: TFolder) => exportFolder(plugin, folder)).open();
}

function openExportModal(plugin: ObsidianExportPlugin, target: ExportTarget): void {
	try {
		getVaultRoot(plugin.app);
	} catch (error) {
		new Notice(error instanceof Error ? error.message : t('error.vaultRoot'));
		return;
	}
	new ExportModal(plugin.app, plugin, target).open();
}
