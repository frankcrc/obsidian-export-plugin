import { Notice, TFile, TFolder } from 'obsidian';
import type ObsidianExportPlugin from './main';
import { ExportModal, type ExportTarget } from './ui/export-modal';
import { FolderSuggestModal } from './ui/folder-suggest';
import { getVaultRoot, toAbsoluteVaultPath } from './utils/paths';

export function registerCommands(plugin: ObsidianExportPlugin): void {
	plugin.addCommand({
		id: 'export-current-note',
		name: '导出当前笔记',
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
		name: '导出文件夹…',
		callback: () => chooseFolder(plugin),
	});

	plugin.addCommand({
		id: 'export-vault',
		name: '导出整个仓库…',
		callback: () => openExportModal(plugin, vaultTarget(plugin)),
	});
}

export function registerFileMenu(plugin: ObsidianExportPlugin): void {
	plugin.registerEvent(
		plugin.app.workspace.on('file-menu', (menu, file) => {
			if (file instanceof TFile && file.extension === 'md') {
				menu.addItem((item) =>
					item
						.setTitle('导出为 Markdown')
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
						.setTitle('导出为 Markdown')
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
		title: '当前笔记',
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
		title: '文件夹',
		detail: folder.path,
		startAt: toAbsoluteVaultPath(plugin.app, folder.path),
		suggestedName: folder.name,
	});
}

function vaultTarget(plugin: ObsidianExportPlugin): ExportTarget {
	const name = plugin.app.vault.getName();
	return {
		title: '整个仓库',
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
		new Notice(error instanceof Error ? error.message : '无法读取仓库路径。');
		return;
	}
	new ExportModal(plugin.app, plugin, target).open();
}
