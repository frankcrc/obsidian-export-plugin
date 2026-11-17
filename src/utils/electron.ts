export interface ElectronDialogResult {
	canceled: boolean;
	filePaths: string[];
}

export interface ElectronDialogOptions {
	title?: string;
	defaultPath?: string;
	properties?: string[];
}

export interface ElectronDialog {
	showOpenDialog(options: ElectronDialogOptions): Promise<ElectronDialogResult>;
}

export interface ElectronShell {
	openPath?(path: string): Promise<string>;
}

export interface ElectronWebUtils {
	getPathForFile?(file: File): string;
}

export interface ElectronModule {
	remote?: { dialog?: ElectronDialog };
	shell?: ElectronShell;
	webUtils?: ElectronWebUtils;
}

/**
 * `electron` is provided by the Obsidian desktop runtime and is not a bundled dependency.
 * The module is loaded lazily so plugin startup never depends on it.
 */
export function loadElectron(): ElectronModule | null {
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports -- Electron is injected by the Obsidian desktop runtime and has no ESM entry point.
		return require('electron') as ElectronModule;
	} catch {
		return null;
	}
}
