import {
	App,
	Notice,
	PluginSettingTab,
	requireApiVersion,
	Setting,
	type SettingDefinitionItem,
} from 'obsidian';
import type ObsidianExportPlugin from './main';
import { detectBinary, probeBinary, resolveBinary } from './export/runner';
import { isLanguagePreference, setLanguage, t, type LanguagePreference } from './i18n';
import { pickDirectory } from './ui/directory-picker';
import { getVaultRoot } from './utils/paths';

export type FrontmatterStrategy = 'auto' | 'always' | 'never';

export interface ExportSettings {
	language: LanguagePreference;
	binaryPath: string;
	destination: string;
	noGit: boolean;
	frontmatter: FrontmatterStrategy;
	hidden: boolean;
	noRecursiveEmbeds: boolean;
	preserveMtime: boolean;
	hardLinebreaks: boolean;
	openAfterExport: boolean;
	confirmOverwrite: boolean;
	extraArgs: string;
}

export const DEFAULT_SETTINGS: ExportSettings = {
	language: 'auto',
	binaryPath: '',
	destination: '',
	noGit: true,
	frontmatter: 'auto',
	hidden: false,
	noRecursiveEmbeds: false,
	preserveMtime: false,
	hardLinebreaks: false,
	openAfterExport: true,
	confirmOverwrite: true,
	extraArgs: '',
};

/**
 * Obsidian 1.13+ renders the tab from `getSettingDefinitions()` so the settings
 * are indexed for settings search. `display()` stays as the fallback for older
 * versions, which have no declarative API.
 */
export class ExportSettingTab extends PluginSettingTab {
	constructor(
		app: App,
		private readonly plugin: ObsidianExportPlugin,
	) {
		super(app, plugin);
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: t('settings.language.name'),
				desc: t('settings.language.desc'),
				control: {
					type: 'dropdown',
					key: 'language',
					options: {
						auto: t('settings.language.auto'),
						en: t('settings.language.en'),
						zh: t('settings.language.zh'),
					},
				},
			},
			{
				type: 'group',
				heading: t('settings.cli.heading'),
				items: [
					{
						name: t('settings.binary.name'),
						desc: t('settings.binary.desc'),
						render: (setting) => {
							this.addBinaryPathControls(setting);
						},
					},
					{
						name: t('settings.download.name'),
						desc: t('settings.download.desc'),
						render: (setting) => {
							this.addDownloadButton(setting);
						},
					},
				],
			},
			{
				type: 'group',
				heading: t('settings.export.heading'),
				items: [
					{
						name: t('settings.noGit.name'),
						desc: t('settings.noGit.desc'),
						control: { type: 'toggle', key: 'noGit' },
					},
					{
						name: t('settings.frontmatter.name'),
						desc: t('settings.frontmatter.desc'),
						control: {
							type: 'dropdown',
							key: 'frontmatter',
							options: {
								auto: t('settings.frontmatter.auto'),
								always: t('settings.frontmatter.always'),
								never: t('settings.frontmatter.never'),
							},
						},
					},
					{
						name: t('settings.hidden.name'),
						desc: t('settings.hidden.desc'),
						control: { type: 'toggle', key: 'hidden' },
					},
					{
						name: t('settings.preserveMtime.name'),
						desc: t('settings.preserveMtime.desc'),
						control: { type: 'toggle', key: 'preserveMtime' },
					},
					{
						name: t('settings.hardLinebreaks.name'),
						desc: t('settings.hardLinebreaks.desc'),
						control: { type: 'toggle', key: 'hardLinebreaks' },
					},
					{
						name: t('settings.noRecursiveEmbeds.name'),
						desc: t('settings.noRecursiveEmbeds.desc'),
						control: { type: 'toggle', key: 'noRecursiveEmbeds' },
					},
					{
						name: t('settings.openAfterExport.name'),
						control: { type: 'toggle', key: 'openAfterExport' },
					},
					{
						name: t('settings.confirmOverwrite.name'),
						desc: t('settings.confirmOverwrite.desc'),
						control: { type: 'toggle', key: 'confirmOverwrite' },
					},
					{
						name: t('settings.extraArgs.name'),
						desc: t('settings.extraArgs.desc'),
						control: {
							type: 'textarea',
							key: 'extraArgs',
							placeholder: t('settings.extraArgs.placeholder'),
						},
					},
				],
			},
		];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		(this.plugin.settings as unknown as Record<string, unknown>)[key] = value;
		await this.plugin.saveSettings();
		if (key !== 'language') {
			return;
		}
		if (isLanguagePreference(this.plugin.settings.language)) {
			setLanguage(this.plugin.settings.language);
		}
		this.refresh();
		new Notice(t('notice.languageChanged'));
	}

	display(): void {
		this.renderSettings();
	}

	private renderSettings(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName(t('settings.language.name'))
			.setDesc(t('settings.language.desc'))
			.addDropdown((dropdown) =>
				dropdown
					.addOption('auto', t('settings.language.auto'))
					.addOption('en', t('settings.language.en'))
					.addOption('zh', t('settings.language.zh'))
					.setValue(this.plugin.settings.language)
					.onChange((value) => {
						if (!isLanguagePreference(value) || value === this.plugin.settings.language) {
							return;
						}
						this.plugin.settings.language = value;
						void this.plugin.saveSettings();
						setLanguage(value);
						this.refresh();
						new Notice(t('notice.languageChanged'));
					}),
			);

		new Setting(containerEl).setName(t('settings.cli.heading')).setHeading();

		this.addBinaryPathControls(
			new Setting(containerEl)
				.setName(t('settings.binary.name'))
				.setDesc(t('settings.binary.desc')),
		);

		this.addDownloadButton(
			new Setting(containerEl)
				.setName(t('settings.download.name'))
				.setDesc(t('settings.download.desc')),
		);

		new Setting(containerEl).setName(t('settings.export.heading')).setHeading();

		new Setting(containerEl)
			.setName(t('settings.noGit.name'))
			.setDesc(t('settings.noGit.desc'))
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.noGit).onChange((value) => {
					this.plugin.settings.noGit = value;
					void this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName(t('settings.frontmatter.name'))
			.setDesc(t('settings.frontmatter.desc'))
			.addDropdown((dropdown) =>
				dropdown
					.addOption('auto', t('settings.frontmatter.auto'))
					.addOption('always', t('settings.frontmatter.always'))
					.addOption('never', t('settings.frontmatter.never'))
					.setValue(this.plugin.settings.frontmatter)
					.onChange((value) => {
						if (value === 'auto' || value === 'always' || value === 'never') {
							this.plugin.settings.frontmatter = value;
							void this.plugin.saveSettings();
						}
					}),
			);

		new Setting(containerEl)
			.setName(t('settings.hidden.name'))
			.setDesc(t('settings.hidden.desc'))
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.hidden).onChange((value) => {
					this.plugin.settings.hidden = value;
					void this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName(t('settings.preserveMtime.name'))
			.setDesc(t('settings.preserveMtime.desc'))
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.preserveMtime).onChange((value) => {
					this.plugin.settings.preserveMtime = value;
					void this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName(t('settings.hardLinebreaks.name'))
			.setDesc(t('settings.hardLinebreaks.desc'))
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.hardLinebreaks).onChange((value) => {
					this.plugin.settings.hardLinebreaks = value;
					void this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName(t('settings.noRecursiveEmbeds.name'))
			.setDesc(t('settings.noRecursiveEmbeds.desc'))
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.noRecursiveEmbeds).onChange((value) => {
					this.plugin.settings.noRecursiveEmbeds = value;
					void this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName(t('settings.openAfterExport.name'))
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.openAfterExport).onChange((value) => {
					this.plugin.settings.openAfterExport = value;
					void this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName(t('settings.confirmOverwrite.name'))
			.setDesc(t('settings.confirmOverwrite.desc'))
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.confirmOverwrite).onChange((value) => {
					this.plugin.settings.confirmOverwrite = value;
					void this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName(t('settings.extraArgs.name'))
			.setDesc(t('settings.extraArgs.desc'))
			.addTextArea((text) =>
				text
					.setPlaceholder(t('settings.extraArgs.placeholder'))
					.setValue(this.plugin.settings.extraArgs)
					.onChange((value) => {
						this.plugin.settings.extraArgs = value;
						void this.plugin.saveSettings();
					}),
			);
	}

	private addBinaryPathControls(setting: Setting): Setting {
		return setting
			.addText((text) =>
				text
					.setPlaceholder(t('settings.binary.placeholder'))
					.setValue(this.plugin.settings.binaryPath)
					.onChange((value) => {
						this.plugin.settings.binaryPath = value;
						void this.plugin.saveSettings();
					}),
			)
			.addButton((button) =>
				button.setButtonText(t('settings.binary.browse')).onClick(() => {
					void this.chooseBinaryFolder();
				}),
			)
			.addButton((button) =>
				button.setButtonText(t('settings.binary.detect')).onClick(() => {
					void this.detect();
				}),
			)
			.addButton((button) =>
				button.setButtonText(t('settings.binary.test')).onClick(() => {
					void this.testBinary();
				}),
			);
	}

	private addDownloadButton(setting: Setting): Setting {
		return setting.addButton((button) =>
			button.setButtonText(t('settings.download.button')).onClick(() => {
				window.open('https://github.com/zoni/obsidian-export/releases');
			}),
		);
	}

	private async chooseBinaryFolder(): Promise<void> {
		const selected = await pickDirectory(this.plugin.settings.binaryPath);
		if (!selected) {
			return;
		}
		this.plugin.settings.binaryPath = selected;
		await this.plugin.saveSettings();
		this.refresh();
	}

	private async detect(): Promise<void> {
		new Notice(t('notice.detecting'));
		const found = await detectBinary();
		if (found) {
			this.plugin.settings.binaryPath = found;
			await this.plugin.saveSettings();
			this.refresh();
			new Notice(t('notice.found', { path: found }));
		} else {
			new Notice(t('notice.notFound'));
		}
	}

	private async testBinary(): Promise<void> {
		const binary = resolveBinary(this.plugin.settings.binaryPath);
		const probe = await probeBinary(binary, getVaultRoot(this.app));
		new Notice(probe.message, probe.ok ? 5000 : 10000);
	}

	/**
	 * `update()` only exists on Obsidian 1.13+. Older versions rebuild the
	 * imperative UI from `renderSettings()` instead.
	 */
	private refresh(): void {
		if (requireApiVersion('1.13.0')) {
			this.update();
			return;
		}
		this.renderSettings();
	}
}
