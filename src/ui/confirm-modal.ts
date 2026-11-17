import { App, Modal, Setting } from 'obsidian';

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
				title: '目标目录已存在文件',
				message: `目标目录中已有 ${existingFileCount} 个文件。`,
				detail: destination,
				confirmText: '继续导出',
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
				button.setButtonText(this.options.cancelText ?? '取消').onClick(() => {
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
				text: '按导出范围预计，没有同名文件会被覆盖。',
			});
			return;
		}

		const limit = 30;
		this.contentEl.createEl('p', {
			text: `按导出范围预计，以下 ${conflicts.length} 个文件将被覆盖（其他文件不会被删除）：`,
		});
		const list = this.contentEl.createDiv({ cls: 'oe-file-list' });
		for (const conflict of conflicts.slice(0, limit)) {
			list.createDiv({ text: conflict, cls: 'oe-file-path' });
		}
		if (conflicts.length > limit) {
			list.createDiv({
				text: `……另有 ${conflicts.length - limit} 个文件未显示`,
				cls: 'oe-file-more',
			});
		}
	}
}
