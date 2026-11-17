import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import type ObsidianExportPlugin from './main';
import { detectBinary, probeBinary, resolveBinary } from './export/runner';
import { pickDirectory } from './ui/directory-picker';
import { getVaultRoot } from './utils/paths';

export type FrontmatterStrategy = 'auto' | 'always' | 'never';

export interface ExportSettings {
	binaryPath: string;
	destination: string;
	noGit: boolean;
	frontmatter: FrontmatterStrategy;
	hidden: boolean;
	noRecursiveEmbeds: boolean;
	preserveMtime: boolean;
	hardLinebreaks: boolean;
	openAfterExport: boolean;
	extraArgs: string;
}

export const DEFAULT_SETTINGS: ExportSettings = {
	binaryPath: '',
	destination: '',
	noGit: true,
	frontmatter: 'auto',
	hidden: false,
	noRecursiveEmbeds: false,
	preserveMtime: false,
	hardLinebreaks: false,
	openAfterExport: true,
	extraArgs: '',
};

export class ExportSettingTab extends PluginSettingTab {
	constructor(
		app: App,
		private readonly plugin: ObsidianExportPlugin,
	) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName('命令行工具').setHeading();

		new Setting(containerEl)
			.setName('obsidian-export 路径')
			.setDesc('可执行文件的完整路径、包含可执行文件的文件夹，或命令名（从 PATH 中查找）。留空时使用 obsidian-export。')
			.addText((text) =>
				text
					.setPlaceholder('obsidian-export 或完整路径')
					.setValue(this.plugin.settings.binaryPath)
					.onChange((value) => {
						this.plugin.settings.binaryPath = value;
						void this.plugin.saveSettings();
					}),
			)
			.addButton((button) =>
				button.setButtonText('选择文件夹…').onClick(() => {
					void this.chooseBinaryFolder();
				}),
			)
			.addButton((button) =>
				button.setButtonText('自动检测').onClick(() => {
					void this.detect();
				}),
			)
			.addButton((button) =>
				button.setButtonText('测试').onClick(() => {
					void this.testBinary();
				}),
			);

		new Setting(containerEl)
			.setName('打开下载页面')
			.setDesc('本插件不包含 obsidian-export，需要单独安装。')
			.addButton((button) =>
				button.setButtonText('下载').onClick(() => {
					window.open('https://github.com/zoni/obsidian-export/releases');
				}),
			);

		new Setting(containerEl).setName('导出选项').setHeading();

		new Setting(containerEl)
			.setName('忽略 git 规则')
			.setDesc('对应 --no-git，导出时不按 .gitignore 排除文件。')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.noGit).onChange((value) => {
					this.plugin.settings.noGit = value;
					void this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName('Frontmatter 策略')
			.setDesc('对应 --frontmatter，控制导出文件是否保留 YAML frontmatter。')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('auto', '自动')
					.addOption('always', '始终添加')
					.addOption('never', '移除')
					.setValue(this.plugin.settings.frontmatter)
					.onChange((value) => {
						if (value === 'auto' || value === 'always' || value === 'never') {
							this.plugin.settings.frontmatter = value;
							void this.plugin.saveSettings();
						}
					}),
			);

		new Setting(containerEl)
			.setName('导出隐藏文件')
			.setDesc('对应 --hidden。')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.hidden).onChange((value) => {
					this.plugin.settings.hidden = value;
					void this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName('保留修改时间')
			.setDesc('对应 --preserve-mtime。')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.preserveMtime).onChange((value) => {
					this.plugin.settings.preserveMtime = value;
					void this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName('软换行转硬换行')
			.setDesc('对应 --hard-linebreaks，类似 Obsidian 的严格换行设置。')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.hardLinebreaks).onChange((value) => {
					this.plugin.settings.hardLinebreaks = value;
					void this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName('允许循环嵌入')
			.setDesc('对应 --no-recursive-embeds。笔记互相嵌入时插入链接而不是报错。')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.noRecursiveEmbeds).onChange((value) => {
					this.plugin.settings.noRecursiveEmbeds = value;
					void this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName('导出后打开目标目录')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.openAfterExport).onChange((value) => {
					this.plugin.settings.openAfterExport = value;
					void this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName('额外参数')
			.setDesc('附加到命令行中的其他参数，例如 --only-tags 发布。')
			.addTextArea((text) =>
				text
					.setPlaceholder('--only-tags 发布')
					.setValue(this.plugin.settings.extraArgs)
					.onChange((value) => {
						this.plugin.settings.extraArgs = value;
						void this.plugin.saveSettings();
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
		this.display();
	}

	private async detect(): Promise<void> {
		new Notice('正在查找 obsidian-export…');
		const found = await detectBinary();
		if (found) {
			this.plugin.settings.binaryPath = found;
			await this.plugin.saveSettings();
			this.display();
			new Notice(`已找到：${found}`);
		} else {
			new Notice('未在 PATH 中找到 obsidian-export，请手动填写完整路径。');
		}
	}

	private async testBinary(): Promise<void> {
		const binary = resolveBinary(this.plugin.settings.binaryPath);
		const probe = await probeBinary(binary, getVaultRoot(this.app));
		new Notice(probe.message, probe.ok ? 5000 : 10000);
	}
}
