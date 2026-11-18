import { App, Modal, Notice, Setting, type TextComponent } from 'obsidian';
import type ObsidianExportPlugin from '../main';
import { buildExportArgs, formatCommandLine } from '../export/command';
import { findExistingOutputs, predictOutputPaths } from '../export/predict';
import { ensureDirectory, resolveBinary } from '../export/runner';
import { countFiles, directoryHasEntries } from '../export/snapshot';
import { t } from '../i18n';
import {
	areSamePath,
	defaultDestination,
	getVaultRoot,
	isInside,
	resolveUserPath,
} from '../utils/paths';
import { pickDirectory } from './directory-picker';
import { confirmOverwrite } from './confirm-modal';
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
		this.setTitle(t('modal.export.title'));

		const info = contentEl.createDiv({ cls: 'oe-target-info' });
		info.createSpan({ text: t('modal.export.target', { title: this.target.title }) });
		info.createSpan({ text: this.target.detail, cls: 'oe-target-detail' });

		new Setting(contentEl)
			.setName(t('modal.export.destinationName'))
			.setDesc(t('modal.export.destinationDesc'))
			.addText((text) => {
				this.destinationInput = text;
				text
					.setPlaceholder(t('modal.export.destinationPlaceholder'))
					.setValue(this.destination)
					.onChange((value) => {
						this.destination = value;
						this.refresh();
					});
				text.inputEl.addClass('oe-destination-input');
			})
			.addButton((button) =>
				button.setButtonText(t('common.browse')).onClick(() => {
					void this.browse();
				}),
			);

		this.warningEl = contentEl.createDiv({ cls: 'oe-warning' });
		this.warningEl.hide();

		contentEl.createDiv({ text: t('modal.export.command'), cls: 'oe-section-label' });
		this.previewEl = contentEl.createEl('pre', { cls: 'oe-command-preview' });

		new Setting(contentEl).setName(t('settings.openAfterExport.name')).addToggle((toggle) =>
			toggle.setValue(this.plugin.settings.openAfterExport).onChange((value) => {
				this.plugin.settings.openAfterExport = value;
				void this.plugin.saveSettings();
			}),
		);

		new Setting(contentEl)
			.addButton((button) => button.setButtonText(t('common.cancel')).onClick(() => this.close()))
			.addButton((button) =>
				button
					.setButtonText(t('modal.export.start'))
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
			warnings.push(t('warning.destinationRequired'));
		} else {
			if (areSamePath(destination, vaultRoot)) {
				warnings.push(t('warning.vaultRoot'));
			} else if (isInside(vaultRoot, destination)) {
				warnings.push(t('warning.insideVault'));
			}
			if (directoryHasEntries(destination)) {
				warnings.push(t('warning.notEmpty'));
			}
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
			new Notice(t('warning.destinationRequired'));
			return;
		}
		const destination = resolveUserPath(vaultRoot, this.destination);
		if (areSamePath(destination, vaultRoot)) {
			new Notice(t('warning.vaultRoot'));
			return;
		}

		if (this.plugin.settings.confirmOverwrite) {
			const existingFiles = await countFiles(destination);
			if (existingFiles > 0) {
				const predictedOutputs = await predictOutputPaths(this.plugin.settings, {
					vaultRoot,
					startAt: this.target.startAt,
				});
				const conflicts = findExistingOutputs(destination, predictedOutputs);
				const confirmed = await confirmOverwrite(this.app, destination, existingFiles, conflicts);
				if (!confirmed) {
					return;
				}
			}
		}

		try {
			await ensureDirectory(destination);
		} catch (error) {
			if (getErrorCode(error) === 'EEXIST') {
				new Notice(t('error.destinationOccupied'));
			} else {
				new Notice(
					t('error.createDestination', {
						error: error instanceof Error ? error.message : String(error),
					}),
				);
			}
			return;
		}

		this.plugin.settings.destination = destination;
		await this.plugin.saveSettings();

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

function getErrorCode(error: unknown): string | undefined {
	if (typeof error !== 'object' || error === null || !('code' in error)) {
		return undefined;
	}
	return typeof error.code === 'string' ? error.code : undefined;
}
