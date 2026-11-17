/**
 * Minimal shape of the `electron` module available in Obsidian's desktop runtime.
 */
declare module 'electron' {
	export interface ElectronDialogOptionsLike {
		title?: string;
		defaultPath?: string;
		properties?: string[];
	}

	export interface ElectronDialogResultLike {
		canceled: boolean;
		filePaths: string[];
	}

	export interface ElectronDialogLike {
		showOpenDialog(options: ElectronDialogOptionsLike): Promise<ElectronDialogResultLike>;
	}

	export interface ElectronShellLike {
		openPath?(path: string): Promise<string>;
	}

	export interface ElectronWebUtilsLike {
		getPathForFile?(file: File): string;
	}

	export const remote: { dialog?: ElectronDialogLike } | undefined;
	export const shell: ElectronShellLike | undefined;
	export const webUtils: ElectronWebUtilsLike | undefined;
}
