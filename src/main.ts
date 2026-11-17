import { Plugin } from 'obsidian';
import {
	DEFAULT_SETTINGS,
	ExportSettingTab,
	type ExportSettings,
} from './settings';
import { exportActiveNoteOrVault, registerCommands, registerFileMenu } from './commands';

export default class ObsidianExportPlugin extends Plugin {
	settings: ExportSettings = { ...DEFAULT_SETTINGS };

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addRibbonIcon('file-down', '导出为 Markdown', () => {
			exportActiveNoteOrVault(this);
		});

		registerCommands(this);
		registerFileMenu(this);
		this.addSettingTab(new ExportSettingTab(this.app, this));
	}

	async loadSettings(): Promise<void> {
		const stored = (await this.loadData()) as Partial<ExportSettings> | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, stored ?? {});
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
