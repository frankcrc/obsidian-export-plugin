import { App, Modal, Notice } from 'obsidian';
import { startExport, type ExportRunResult, type RunningExport } from '../export/runner';
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
		this.setTitle('正在导出');
		this.statusEl = contentEl.createEl('p', {
			text: `正在导出${this.job.title}，请稍候…`,
		});
		this.logEl = contentEl.createEl('pre', { cls: 'oe-log' });
		this.actionsEl = contentEl.createDiv({ cls: 'oe-progress-actions' });
		this.renderActions([{ text: '取消导出', onClick: () => this.running?.cancel() }]);
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
		this.running = startExport({
			binary: this.job.binary,
			args: this.job.args,
			cwd: this.job.vaultRoot,
			onOutput: (chunk) => this.appendLog(chunk),
		});

		const result = await this.running.result;
		this.running = null;
		this.finished = true;
		this.renderResult(result);
	}

	private appendLog(chunk: string): void {
		this.log += chunk;
		if (this.log.length > MAX_LOG_LENGTH) {
			this.log = this.log.slice(-MAX_LOG_LENGTH);
		}
		this.logEl.setText(this.log);
		this.logEl.scrollTop = this.logEl.scrollHeight;
	}

	private renderResult(result: ExportRunResult): void {
		if (this.closed) {
			return;
		}

		const success = result.exitCode === 0 && !result.spawnError && !result.canceled;
		this.titleEl.setText(success ? '导出完成' : '导出失败');

		if (result.canceled) {
			this.statusEl.setText('导出已取消。');
		} else if (result.spawnError) {
			this.statusEl.setText(`无法启动 obsidian-export：${result.spawnError}。请检查设置中的可执行文件路径。`);
		} else if (result.exitCode !== 0) {
			this.statusEl.setText(`obsidian-export 退出码：${result.exitCode ?? '未知'}。`);
		} else {
			this.statusEl.setText(`导出完成，文件已写入 ${this.job.destination}。`);
		}

		if (success && this.job.openAfterExport) {
			openFolder(this.job.destination);
		}

		const actions: Array<{ text: string; onClick: () => void; cta?: boolean }> = [];
		if (success) {
			actions.push({
				text: '打开目标目录',
				onClick: () => openFolder(this.job.destination),
				cta: true,
			});
		}
		actions.push({ text: '关闭', onClick: () => this.close() });
		this.renderActions(actions);

		new Notice(success ? '导出完成。' : '导出失败，请查看日志。');
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
