import { App, Modal, Setting } from 'obsidian';
import { t } from '../i18n';

export interface ConfirmOptions {
	title: string;
	message: string;
	detail?: string;
	confirmText: string;
	cancelText?: string;
	conflicts?: string[];
}

export function confirmOverwrite(
	app: App,
	destination: string,
	existingFileCount: number,
	conflicts: string[],
): Promise<boolean> {
	return new Promise((resolve) => {
		new ConfirmModal(
			app,
			{
				title: t('confirm.title'),
				message: t('confirm.message', { count: existingFileCount }),
				detail: destination,
				confirmText: t('confirm.continue'),
				conflicts,
			},
			resolve,
		).open();
	});
}

class ConfirmModal extends Modal {
	private settled = false;

	constructor(
		app: App,
		private readonly options: ConfirmOptions,
		private readonly resolve: (value: boolean) => void,
	) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		this.setTitle(this.options.title);
		contentEl.createEl('p', { text: this.options.message });
		if (this.options.detail) {
			contentEl.createEl('pre', { text: this.options.detail, cls: 'oe-command-preview' });
		}
		if (this.options.conflicts) {
			this.renderConflicts(this.options.conflicts);
		}
		new Setting(contentEl)
			.addButton((button) =>
				button.setButtonText(this.options.cancelText ?? t('common.cancel')).onClick(() => {
					this.finish(false);
				}),
			)
			.addButton((button) =>
				button
					.setButtonText(this.options.confirmText)
					.setCta()
					.onClick(() => {
						this.finish(true);
					}),
			);
	}

	onClose(): void {
		this.contentEl.empty();
		if (!this.settled) {
			this.settled = true;
			this.resolve(false);
		}
	}

	private finish(value: boolean): void {
		if (this.settled) {
			return;
		}
		this.settled = true;
		this.resolve(value);
		this.close();
	}

	private renderConflicts(conflicts: string[]): void {
		if (conflicts.length === 0) {
			this.contentEl.createEl('p', {
				text: t('confirm.noConflicts'),
			});
			return;
		}

		const limit = 30;
		this.contentEl.createEl('p', {
			text: t('confirm.conflicts', { count: conflicts.length }),
		});
		const list = this.contentEl.createDiv({ cls: 'oe-file-list' });
		for (const conflict of conflicts.slice(0, limit)) {
			list.createDiv({ text: conflict, cls: 'oe-file-path' });
		}
		if (conflicts.length > limit) {
			list.createDiv({
				text: t('common.moreFiles', { count: conflicts.length - limit }),
				cls: 'oe-file-more',
			});
		}
	}
}
