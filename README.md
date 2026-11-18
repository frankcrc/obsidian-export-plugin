# Export as Markdown

English | [简体中文](README.zh-CN.md)

Some Obsidian notes use reference-style syntax, and sharing them as Markdown rather than PDF can be useful. To share a note as a single Markdown file, I found [obsidian-export](https://github.com/zoni/obsidian-export). Since it is a command-line tool, this plugin makes it possible to run it from Obsidian without remembering CLI commands.

This plugin uses the locally installed [obsidian-export](https://github.com/zoni/obsidian-export) CLI to export Obsidian notes as standard Markdown. The plugin does not include obsidian-export.

## Features

- **Export the current note**: Use the vault root as the source and `--start-at` to export only the current note, while still resolving its links and embeds.
- **Export a folder** from the vault.
- **Export the entire vault**.
- Browse for or enter a destination directory before each export; it is created if it does not exist.
- View the command that will run and live logs, and cancel an export at any time.
- If the destination is not empty, review the files expected to be overwritten and confirm before exporting (can be disabled in settings).
- After exporting, view the full paths of files written (up to 30 paths are shown).
- Remember the last destination directory used.
- The interface is available in English and Simplified Chinese. By default it follows Obsidian's language; you can override it in settings.

## Prerequisites

1. Install obsidian-export (it is not bundled with this plugin):
   - Download a binary from [Releases](https://github.com/zoni/obsidian-export/releases) and add it to your PATH; or
   - Run `cargo install obsidian-export`.
2. Verify the installation by running `obsidian-export --version` in a terminal.

## Build and install

```bash
npm install
npm run build
```

Copy `main.js`, `manifest.json`, and `styles.css` to `<Vault>/.obsidian/plugins/export-as-markdown/`, then enable the plugin in **Settings → Community plugins**.

## Usage

The command palette provides these commands (the names are localized):

- `Export current note`
- `Export folder…`
- `Export entire vault…`

The download icon in the ribbon works too: it exports the current note when one is active, or the entire vault otherwise.

In the dialog, enter a destination directory. **Browse…** opens the system directory picker (where you can create a folder), or you can paste a path directly. Review the command preview, then select **Start export**.

## Settings

- **Language**: Interface language. **Auto** follows Obsidian; English and Simplified Chinese are available. Dialogs and settings update immediately, while command names and the ribbon tooltip update after reloading the plugin.
- **obsidian-export path**: Full path to the executable, command name, or a folder containing the executable. Leave blank to use `obsidian-export` from PATH.
- **Auto-detect**: Find obsidian-export on PATH. **Test**: Run `--version` to verify it is available.
- **Ignore Git rules** (`--no-git`)
- **Frontmatter strategy** (`--frontmatter auto|always|never`)
- **Include hidden files** (`--hidden`)
- **Preserve modification times** (`--preserve-mtime`)
- **Convert soft line breaks to hard line breaks** (`--hard-linebreaks`)
- **Allow recursive embeds** (`--no-recursive-embeds`)
- **Extra arguments**: Parsed using shell-style rules (quotes are supported), for example `--only-tags published`.
- **Open destination after export**
- **Confirm before overwriting**: When the destination is not empty, list files expected to be overwritten and ask for confirmation before exporting (enabled by default).

## Equivalent CLI example

```bat
obsidian-export "C:\Vault" --start-at "C:\Vault\Folder\Note.md" --no-git "C:\ExportedMarkdown"
```

## Notes

- The plugin only runs obsidian-export locally. It makes no network requests and does not upload vault contents.
- **Files outside the vault**: exports are written to the destination directory you pick, which usually lives outside the vault. The plugin reads your vault as the source and writes only to that destination; no other path is read or written.
- The destination cannot be the vault root. If it is inside the vault, the plugin shows a warning because Obsidian will index the exported files, and a later full-vault export may include them again.
- The export layout is determined by obsidian-export: files are flattened into the destination when exporting a folder, while the folder structure is preserved when exporting the entire vault.
- The overwrite confirmation predicts files based on the export scope and hidden-file setting. It does not account for `.export-ignore`, Git ignore rules, or tag filtering, so the plugin still checks whether the destination is non-empty before export.

## License

[0BSD](LICENSE).
