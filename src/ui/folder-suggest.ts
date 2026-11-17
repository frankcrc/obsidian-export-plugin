import { App, FuzzySuggestModal, TFolder } from 'obsidian';

export class FolderSuggestModal extends FuzzySuggestModal<TFolder> {
	constructor(
		app: App,
		private readonly onChoose: (folder: TFolder) => void,
	) {
		super(app);
		this.setPlaceholder('选择要导出的文件夹');
	}

	getItems(): TFolder[] {
		const folders = this.app.vault
			.getAllLoadedFiles()
			.filter((file): file is TFolder => file instanceof TFolder);
		const root = this.app.vault.getRoot();
		const unique = folders.some((folder) => folder.path === root.path) ? folders : [root, ...folders];
		return unique.sort((left, right) => left.path.localeCompare(right.path));
	}

	getItemText(folder: TFolder): string {
		return folder.path;
	}

	onChooseItem(folder: TFolder): void {
		this.onChoose(folder);
	}
}
