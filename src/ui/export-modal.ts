import { App, Modal, Notice, Setting, type TextComponent } from 'obsidian';
import type ObsidianExportPlugin from '../main';
import { buildExportArgs, formatCommandLine } from '../export/command';
import { ensureDirectory, resolveBinary } from '../export/runner';
import {
	areSamePath,
	defaultDestination,
	getVaultRoot,
	isInside,
	resolveUserPath,
} from '../utils/paths';
import { pickDirectory } from './directory-picker';
import { ExportProgressModal } from './progress-modal';

export interface ExportTarget {
	title: string;
	detail: string;
	startAt?: string;
	suggestedName: string;
}

export class ExportModal extends Modal {
	private destination: string;
	private destinationInput: TextComponent | null = null;
	private previewEl!: HTMLElement;
	private warningEl!: HTMLElement;

	constructor(
		app: App,
		private readonly plugin: ObsidianExportPlugin,
		private readonly target: ExportTarget,
	) {
		super(app);
		const vaultRoot = getVaultRoot(app);
		this.destination =
			plugin.settings.destination.length > 0
				? plugin.settings.destination
				: defaultDestination(vaultRoot, target.suggestedName);
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('oe-export-modal');
		this.setTitle('导出为 Markdown');

		const info = contentEl.createDiv({ cls: 'oe-target-info' });
		info.createSpan({ text: `${this.target.title}：` });
		info.createSpan({ text: this.target.detail, cls: 'oe-target-detail' });

		new Setting(contentEl)
			.setName('目标目录')
			.setDesc('导出的文件会写入此目录，目录不存在时会自动创建。')
			.addText((text) => {
				this.destinationInput = text;
				text
					.setPlaceholder('例如 D:\\导出\\笔记')
					.setValue(this.destination)
					.onChange((value) => {
						this.destination = value;
						this.refresh();
					});
				text.inputEl.addClass('oe-destination-input');
			})
			.addButton((button) =>
				button.setButtonText('浏览…').onClick(() => {
					void this.browse();
				}),
			);

		this.warningEl = contentEl.createDiv({ cls: 'oe-warning' });
		this.warningEl.hide();

		contentEl.createDiv({ text: '将执行的命令', cls: 'oe-section-label' });
		this.previewEl = contentEl.createEl('pre', { cls: 'oe-command-preview' });

		new Setting(contentEl).setName('导出后打开目标目录').addToggle((toggle) =>
			toggle.setValue(this.plugin.settings.openAfterExport).onChange((value) => {
				this.plugin.settings.openAfterExport = value;
				void this.plugin.saveSettings();
			}),
		);

		new Setting(contentEl)
			.addButton((button) => button.setButtonText('取消').onClick(() => this.close()))
			.addButton((button) =>
				button
					.setButtonText('开始导出')
					.setCta()
					.onClick(() => {
						void this.startExport();
					}),
			);

		this.refresh();
	}

	onClose(): void {
		this.contentEl.empty();
	}

	private async browse(): Promise<void> {
		const selected = await pickDirectory(this.destination);
		if (!selected) {
			return;
		}
		this.destination = selected;
		this.destinationInput?.setValue(selected);
		this.refresh();
	}

	private refresh(): void {
		const vaultRoot = getVaultRoot(this.app);
		const destination = resolveUserPath(vaultRoot, this.destination);
		const binary = resolveBinary(this.plugin.settings.binaryPath);
		const args = buildExportArgs(this.plugin.settings, {
			vaultRoot,
			startAt: this.target.startAt,
			destination,
		});
		this.previewEl.setText(formatCommandLine(binary, args));

		const warnings: string[] = [];
		if (this.destination.trim().length === 0) {
			warnings.push('请填写目标目录。');
		} else if (areSamePath(destination, vaultRoot)) {
			warnings.push('目标目录不能是仓库根目录。');
		} else if (isInside(vaultRoot, destination)) {
			warnings.push('目标目录位于仓库内，导出的文件会被 Obsidian 索引，导出整个仓库时还可能被再次导出。');
		}
		this.warningEl.setText(warnings.join(' '));
		if (warnings.length > 0) {
			this.warningEl.show();
		} else {
			this.warningEl.hide();
		}
	}

	private async startExport(): Promise<void> {
		const vaultRoot = getVaultRoot(this.app);
		if (this.destination.trim().length === 0) {
			new Notice('请填写目标目录。');
			return;
		}
		const destination = resolveUserPath(vaultRoot, this.destination);
		if (areSamePath(destination, vaultRoot)) {
			new Notice('目标目录不能是仓库根目录。');
			return;
		}

		this.plugin.settings.destination = destination;
		await this.plugin.saveSettings();

		try {
			await ensureDirectory(destination);
		} catch (error) {
			new Notice(`无法创建目标目录：${error instanceof Error ? error.message : String(error)}`);
			return;
		}

		const binary = resolveBinary(this.plugin.settings.binaryPath);
		const args = buildExportArgs(this.plugin.settings, {
			vaultRoot,
			startAt: this.target.startAt,
			destination,
		});

		this.close();
		new ExportProgressModal(this.app, {
			title: this.target.title,
			binary,
			args,
			vaultRoot,
			destination,
			openAfterExport: this.plugin.settings.openAfterExport,
		}).open();
	}
}
