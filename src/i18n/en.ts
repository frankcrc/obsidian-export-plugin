export const en = {
	'common.browse': 'Browse…',
	'common.cancel': 'Cancel',
	'common.close': 'Close',
	'common.moreFiles': '…and {count} more files',
	'common.unknown': 'unknown',

	'ribbon.export': 'Export as Markdown',

	'command.exportCurrent': 'Export current note',
	'command.exportFolder': 'Export folder…',
	'command.exportVault': 'Export entire vault…',

	'menu.export': 'Export as Markdown',

	'target.currentNote': 'Current note',
	'target.folder': 'Folder',
	'target.vault': 'Entire vault',

	'error.vaultRoot': 'Could not read the vault path.',
	'error.fileSystemOnly': 'Only local file system vaults are supported.',

	'settings.general.heading': 'General',
	'settings.language.name': 'Language',
	'settings.language.desc':
		'Language of the plugin interface. Dialogs and settings update immediately; reload the plugin to update command names and the ribbon tooltip.',
	'settings.language.auto': 'Auto (follow Obsidian)',
	'settings.language.en': 'English',
	'settings.language.zh': '简体中文',
	'notice.languageChanged':
		'Interface language changed. Reload the plugin to update command names and the ribbon tooltip.',

	'settings.cli.heading': 'Command-line tool',
	'settings.binary.name': 'obsidian-export path',
	'settings.binary.desc':
		'Full path to the executable, a folder containing it, or a command name found on PATH. Leave empty to use obsidian-export.',
	'settings.binary.placeholder': 'obsidian-export or full path',
	'settings.binary.browse': 'Select folder…',
	'settings.binary.detect': 'Auto-detect',
	'settings.binary.test': 'Test',
	'settings.download.name': 'Open download page',
	'settings.download.desc': 'This plugin does not include obsidian-export; install it separately.',
	'settings.download.button': 'Download',
	'notice.detecting': 'Looking for obsidian-export…',
	'notice.found': 'Found: {path}',
	'notice.notFound': 'obsidian-export was not found on PATH. Enter the full path manually.',

	'settings.export.heading': 'Export options',
	'settings.noGit.name': 'Ignore Git rules',
	'settings.noGit.desc': '--no-git: do not exclude files based on .gitignore during export.',
	'settings.frontmatter.name': 'Frontmatter strategy',
	'settings.frontmatter.desc':
		'--frontmatter: controls whether exported files keep their YAML frontmatter.',
	'settings.frontmatter.auto': 'Automatic',
	'settings.frontmatter.always': 'Always add',
	'settings.frontmatter.never': 'Remove',
	'settings.hidden.name': 'Include hidden files',
	'settings.hidden.desc': '--hidden: include hidden files in the export.',
	'settings.preserveMtime.name': 'Preserve modification times',
	'settings.preserveMtime.desc': '--preserve-mtime: keep original modification times.',
	'settings.hardLinebreaks.name': 'Convert soft line breaks to hard line breaks',
	'settings.hardLinebreaks.desc':
		"--hard-linebreaks, similar to Obsidian's strict line breaks setting.",
	'settings.noRecursiveEmbeds.name': 'Allow recursive embeds',
	'settings.noRecursiveEmbeds.desc':
		'--no-recursive-embeds: insert links instead of failing when notes embed each other.',
	'settings.openAfterExport.name': 'Open destination after export',
	'settings.confirmOverwrite.name': 'Confirm before overwriting',
	'settings.confirmOverwrite.desc':
		'Ask for confirmation before exporting when the destination already contains files.',
	'settings.extraArgs.name': 'Extra arguments',
	'settings.extraArgs.desc':
		'Additional command-line arguments, for example --only-tags published.',
	'settings.extraArgs.placeholder': '--only-tags published',

	'confirm.title': 'Destination already contains files',
	'confirm.message': 'The destination already contains {count} files.',
	'confirm.continue': 'Continue export',
	'confirm.noConflicts':
		'Based on the export scope, no files with the same names will be overwritten.',
	'confirm.conflicts':
		'Based on the export scope, the following {count} files will be overwritten (other files will not be deleted):',

	'modal.export.title': 'Export as Markdown',
	'modal.export.target': '{title}: ',
	'modal.export.destinationName': 'Destination folder',
	'modal.export.destinationDesc':
		'Exported files are written here. The folder is created if it does not exist.',
	'modal.export.destinationPlaceholder': 'For example D:\\Export\\Notes',
	'modal.export.command': 'Command to run',
	'modal.export.start': 'Start export',

	'warning.destinationRequired': 'Enter a destination folder.',
	'warning.vaultRoot': 'The destination cannot be the vault root.',
	'warning.insideVault':
		'The destination is inside the vault. Exported files will be indexed by Obsidian, and a full-vault export may include them again.',
	'warning.notEmpty':
		'The destination is not empty. Files that will be overwritten are listed before exporting.',

	'error.destinationOccupied':
		'The destination path is occupied by a file. Enter a folder path.',
	'error.createDestination': 'Could not create the destination folder: {error}',

	'progress.title': 'Exporting',
	'progress.running': 'Exporting: {target}. Please wait…',
	'progress.cancel': 'Cancel export',
	'progress.successTitle': 'Export complete',
	'progress.failureTitle': 'Export failed',
	'progress.canceled': 'Export canceled.',
	'progress.spawnError':
		'Could not start obsidian-export: {error}. Check the executable path in settings.',
	'progress.exitCode': 'obsidian-export exited with code {code}.',
	'progress.changed': 'Export complete. Updated {count} files:',
	'progress.noChanges':
		'Export complete, but no new files were detected in the destination: {destination}',
	'progress.open': 'Open destination',
	'notice.exportSuccess': 'Export complete.',
	'notice.exportFailed': 'Export failed. Check the log.',

	'dialog.selectDestination': 'Select export folder',
	'notice.directoryUnreadable':
		'Could not read the selected folder. Enter the path manually.',
	'notice.directoryPathUnavailable':
		'The folder path is not available in this environment. Enter the path manually.',
	'notice.openFolderFailed': 'Could not open the destination folder.',

	'folderSuggest.placeholder': 'Select a folder to export',

	'probe.spawnError': 'Could not start obsidian-export: {error}',
	'probe.exitCode': 'obsidian-export exited with code {code}.',
	'probe.available': 'obsidian-export is available.',
};

export type TranslationKey = keyof typeof en;
