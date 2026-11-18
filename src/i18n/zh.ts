import type { TranslationKey } from './en';

export const zh: Record<TranslationKey, string> = {
	'common.browse': '浏览…',
	'common.cancel': '取消',
	'common.close': '关闭',
	'common.moreFiles': '……另有 {count} 个文件未显示',
	'common.unknown': '未知',

	'ribbon.export': '导出为 Markdown',

	'command.exportCurrent': '导出当前笔记',
	'command.exportFolder': '导出文件夹…',
	'command.exportVault': '导出整个仓库…',

	'menu.export': '导出为 Markdown',

	'target.currentNote': '当前笔记',
	'target.folder': '文件夹',
	'target.vault': '整个仓库',

	'error.vaultRoot': '无法读取仓库路径。',
	'error.fileSystemOnly': '仅支持本地文件系统仓库。',

	'settings.language.name': '界面语言',
	'settings.language.desc':
		'插件界面语言。对话框和设置会立即更新；命令名称和功能区提示需重新加载插件后更新。',
	'settings.language.auto': '自动（跟随 Obsidian）',
	'settings.language.en': 'English',
	'settings.language.zh': '简体中文',
	'notice.languageChanged': '界面语言已切换。重新加载插件后可更新命令名称和功能区提示。',

	'settings.cli.heading': '命令行工具',
	'settings.binary.name': 'obsidian-export 路径',
	'settings.binary.desc':
		'可执行文件的完整路径、包含可执行文件的文件夹，或命令名（从 PATH 中查找）。留空时使用 obsidian-export。',
	'settings.binary.placeholder': 'obsidian-export 或完整路径',
	'settings.binary.browse': '选择文件夹…',
	'settings.binary.detect': '自动检测',
	'settings.binary.test': '测试',
	'settings.download.name': '打开下载页面',
	'settings.download.desc': '本插件不包含 obsidian-export，需要单独安装。',
	'settings.download.button': '下载',
	'notice.detecting': '正在查找 obsidian-export…',
	'notice.found': '已找到：{path}',
	'notice.notFound': '未在 PATH 中找到 obsidian-export，请手动填写完整路径。',

	'settings.export.heading': '导出选项',
	'settings.noGit.name': '忽略 git 规则',
	'settings.noGit.desc': '对应 --no-git，导出时不按 .gitignore 排除文件。',
	'settings.frontmatter.name': 'Frontmatter 策略',
	'settings.frontmatter.desc': '对应 --frontmatter，控制导出文件是否保留 YAML frontmatter。',
	'settings.frontmatter.auto': '自动',
	'settings.frontmatter.always': '始终添加',
	'settings.frontmatter.never': '移除',
	'settings.hidden.name': '导出隐藏文件',
	'settings.hidden.desc': '对应 --hidden。',
	'settings.preserveMtime.name': '保留修改时间',
	'settings.preserveMtime.desc': '对应 --preserve-mtime。',
	'settings.hardLinebreaks.name': '软换行转硬换行',
	'settings.hardLinebreaks.desc': '对应 --hard-linebreaks，类似 Obsidian 的严格换行设置。',
	'settings.noRecursiveEmbeds.name': '允许循环嵌入',
	'settings.noRecursiveEmbeds.desc': '对应 --no-recursive-embeds。笔记互相嵌入时插入链接而不是报错。',
	'settings.openAfterExport.name': '导出后打开目标目录',
	'settings.confirmOverwrite.name': '覆盖前提示',
	'settings.confirmOverwrite.desc': '目标目录中已有文件时，导出前弹出确认对话框。',
	'settings.extraArgs.name': '额外参数',
	'settings.extraArgs.desc': '附加到命令行中的其他参数，例如 --only-tags 发布。',
	'settings.extraArgs.placeholder': '--only-tags 发布',

	'confirm.title': '目标目录已存在文件',
	'confirm.message': '目标目录中已有 {count} 个文件。',
	'confirm.continue': '继续导出',
	'confirm.noConflicts': '按导出范围预计，没有同名文件会被覆盖。',
	'confirm.conflicts': '按导出范围预计，以下 {count} 个文件将被覆盖（其他文件不会被删除）：',

	'modal.export.title': '导出为 Markdown',
	'modal.export.target': '{title}：',
	'modal.export.destinationName': '目标目录',
	'modal.export.destinationDesc': '导出的文件会写入此目录，目录不存在时会自动创建。',
	'modal.export.destinationPlaceholder': '例如 D:\\导出\\笔记',
	'modal.export.command': '将执行的命令',
	'modal.export.start': '开始导出',

	'warning.destinationRequired': '请填写目标目录。',
	'warning.vaultRoot': '目标目录不能是仓库根目录。',
	'warning.insideVault':
		'目标目录位于仓库内，导出的文件会被 Obsidian 索引，导出整个仓库时还可能被再次导出。',
	'warning.notEmpty': '目标目录不是空的，导出前会检查并提示将被覆盖的文件。',

	'error.destinationOccupied': '目标路径已被同名文件占用，请填写文件夹路径。',
	'error.createDestination': '无法创建目标目录：{error}',

	'progress.title': '正在导出',
	'progress.running': '正在导出：{target}，请稍候…',
	'progress.cancel': '取消导出',
	'progress.successTitle': '导出完成',
	'progress.failureTitle': '导出失败',
	'progress.canceled': '导出已取消。',
	'progress.spawnError': '无法启动 obsidian-export：{error}。请检查设置中的可执行文件路径。',
	'progress.exitCode': 'obsidian-export 退出码：{code}。',
	'progress.changed': '导出完成，共更新 {count} 个文件：',
	'progress.noChanges': '导出完成，但目标目录中没有检测到新文件：{destination}',
	'progress.open': '打开目标目录',
	'notice.exportSuccess': '导出完成。',
	'notice.exportFailed': '导出失败，请查看日志。',

	'dialog.selectDestination': '选择导出目录',
	'notice.directoryUnreadable': '没有读取到所选文件夹，请直接输入路径。',
	'notice.directoryPathUnavailable': '当前环境无法获取文件夹路径，请直接输入路径。',
	'notice.openFolderFailed': '无法打开目标目录。',

	'folderSuggest.placeholder': '选择要导出的文件夹',

	'probe.spawnError': '无法启动 obsidian-export：{error}',
	'probe.exitCode': 'obsidian-export 退出码 {code}。',
	'probe.available': 'obsidian-export 可用。',
};
