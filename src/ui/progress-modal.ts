import { App, Modal, Notice } from 'obsidian';
import { join } from 'path';
import { startExport, type ExportRunResult, type RunningExport } from '../export/runner';
import { diffSnapshots, snapshotDirectory } from '../export/snapshot';
import { t } from '../i18n';
import { openFolder } from '../utils/open-folder';

export interface ExportJob {
	title: string;
	binary: string;
	args: string[];
	vaultRoot: string;
	destination: string;
	openAfterExport: boolean;
}

const MAX_LOG_LENGTH = 20000;

export class ExportProgressModal extends Modal {
	private running: RunningExport | null = null;
	private log = '';
	private closed = false;
	private finished = false;
	private statusEl!: HTMLElement;
	private filesEl!: HTMLElement;
	private logEl!: HTMLElement;
	private actionsEl!: HTMLElement;

	constructor(
		app: App,
		private readonly job: ExportJob,
	) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('oe-progress-modal');
		this.setTitle(t('progress.title'));
		this.statusEl = contentEl.createEl('p', {
			text: t('progress.running', { target: this.job.title }),
		});
		this.filesEl = contentEl.createDiv({ cls: 'oe-file-list' });
		this.filesEl.hide();
		this.logEl = contentEl.createEl('pre', { cls: 'oe-log' });
		this.logEl.hide();
		this.actionsEl = contentEl.createDiv({ cls: 'oe-progress-actions' });
		this.renderActions([{ text: t('progress.cancel'), onClick: () => this.running?.cancel() }]);
		void this.runJob();
	}

	onClose(): void {
		this.closed = true;
		if (!this.finished) {
			this.running?.cancel();
		}
		this.contentEl.empty();
	}

	private async runJob(): Promise<void> {
		const before = await snapshotDirectory(this.job.destination);

		this.running = startExport({
			binary: this.job.binary,
			args: this.job.args,
			cwd: this.job.vaultRoot,
			onOutput: (chunk) => this.appendLog(chunk),
		});

		const result = await this.running.result;
		this.running = null;
		this.finished = true;

		let changedFiles: string[] = [];
		if (result.exitCode === 0 && !result.spawnError && !result.canceled) {
			const after = await snapshotDirectory(this.job.destination);
			changedFiles = diffSnapshots(before, after);
		}
		this.renderResult(result, changedFiles);
	}

	private appendLog(chunk: string): void {
		this.log += chunk;
		if (this.log.length > MAX_LOG_LENGTH) {
			this.log = this.log.slice(-MAX_LOG_LENGTH);
		}
		this.logEl.show();
		this.logEl.setText(this.log);
		this.logEl.scrollTop = this.logEl.scrollHeight;
	}

	private renderResult(result: ExportRunResult, changedFiles: string[]): void {
		if (this.closed) {
			return;
		}

		const success = result.exitCode === 0 && !result.spawnError && !result.canceled;
		this.titleEl.setText(success ? t('progress.successTitle') : t('progress.failureTitle'));

		if (result.canceled) {
			this.statusEl.setText(t('progress.canceled'));
		} else if (result.spawnError) {
			this.statusEl.setText(t('progress.spawnError', { error: result.spawnError }));
		} else if (result.exitCode !== 0) {
			this.statusEl.setText(
				t('progress.exitCode', { code: result.exitCode ?? t('common.unknown') }),
			);
		} else if (changedFiles.length > 0) {
			this.statusEl.setText(t('progress.changed', { count: changedFiles.length }));
			this.renderFileList(changedFiles);
		} else {
			this.statusEl.setText(t('progress.noChanges', { destination: this.job.destination }));
		}

		if (success && this.job.openAfterExport) {
			openFolder(this.job.destination);
		}

		const actions: Array<{ text: string; onClick: () => void; cta?: boolean }> = [];
		if (success) {
			actions.push({
				text: t('progress.open'),
				onClick: () => openFolder(this.job.destination),
				cta: true,
			});
		}
		actions.push({ text: t('common.close'), onClick: () => this.close() });
		this.renderActions(actions);

		new Notice(success ? t('notice.exportSuccess') : t('notice.exportFailed'));
	}

	private renderFileList(files: string[]): void {
		const limit = 30;
		for (const file of files.slice(0, limit)) {
			this.filesEl.createDiv({
				text: join(this.job.destination, file),
				cls: 'oe-file-path',
			});
		}
		if (files.length > limit) {
			this.filesEl.createDiv({
				text: t('common.moreFiles', { count: files.length - limit }),
				cls: 'oe-file-more',
			});
		}
		this.filesEl.show();
	}

	private renderActions(actions: Array<{ text: string; onClick: () => void; cta?: boolean }>): void {
		this.actionsEl.empty();
		for (const action of actions) {
			const button = this.actionsEl.createEl('button', {
				text: action.text,
				cls: action.cta === true ? 'mod-cta' : undefined,
			});
			button.addEventListener('click', action.onClick);
		}
	}
}
