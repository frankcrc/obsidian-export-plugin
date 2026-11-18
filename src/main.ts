import { Plugin } from 'obsidian';
import {
	DEFAULT_SETTINGS,
	ExportSettingTab,
	type ExportSettings,
} from './settings';
import { exportActiveNoteOrVault, registerCommands, registerFileMenu } from './commands';
import { isLanguagePreference, setLanguage, t } from './i18n';

export default class ObsidianExportPlugin extends Plugin {
	settings: ExportSettings = { ...DEFAULT_SETTINGS };

	async onload(): Promise<void> {
		await this.loadSettings();
		setLanguage(this.settings.language);

		this.addRibbonIcon('file-down', t('ribbon.export'), () => {
			exportActiveNoteOrVault(this);
		});

		registerCommands(this);
		registerFileMenu(this);
		this.addSettingTab(new ExportSettingTab(this.app, this));
	}

	async loadSettings(): Promise<void> {
		const stored = (await this.loadData()) as Partial<ExportSettings> | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, stored ?? {});
		if (!isLanguagePreference(this.settings.language)) {
			this.settings.language = DEFAULT_SETTINGS.language;
		}
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
