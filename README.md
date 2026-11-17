# Export as Markdown

使用本机安装的 [obsidian-export](https://github.com/zoni/obsidian-export) 命令行工具，把 Obsidian 笔记导出为普通 Markdown。插件本身不包含 obsidian-export。

## 功能

- **导出当前笔记**：以仓库根目录为源、通过 `--start-at` 只导出当前笔记，链接与嵌入仍能正常解析。
- **导出文件夹**：选择仓库中的文件夹导出。
- **导出整个仓库**。
- 每次导出前可浏览或输入目标目录，目录不存在时会自动创建。
- 实时显示将执行的命令与运行日志，可随时取消。
- 目标目录不为空时，导出前按预计输出路径列出将被覆盖的文件并确认（可在设置中关闭）。
- 导出完成后列出本次实际写入的文件完整路径（超过 30 个时只显示前 30 个）。
- 记住上次使用的目标目录。

## 前置条件

1. 安装 obsidian-export（本插件不集成）：
   - 从 [Releases](https://github.com/zoni/obsidian-export/releases) 下载二进制并加入 PATH；或
   - 运行 `cargo install obsidian-export`。
2. 验证安装：在终端执行 `obsidian-export --version`。

## 构建与安装

```bash
npm install
npm run build
```

将 `main.js`、`manifest.json`、`styles.css` 复制到 `<Vault>/.obsidian/plugins/export-as-markdown/`，然后在 **设置 → 第三方插件** 中启用。

## 使用

命令面板中提供：

- `导出当前笔记`
- `导出文件夹…`
- `导出整个仓库…`

左侧功能区的下载图标同样可用：有活动笔记时导出当前笔记，否则导出整个仓库。

在弹出的对话框中填写目标目录：**浏览…** 会打开系统目录选择器（可直接新建文件夹），也可以直接粘贴路径。确认命令预览后点击 **开始导出**。

## 设置

- **obsidian-export 路径**：可执行文件完整路径、命令名，或包含可执行文件的文件夹。留空时使用 PATH 中的 `obsidian-export`。
- **自动检测**：在 PATH 中查找 obsidian-export；**测试**：执行 `--version` 验证是否可用。
- **忽略 git 规则**（`--no-git`）
- **frontmatter**（`--frontmatter auto|always|never`）
- **导出隐藏文件**（`--hidden`）
- **保留修改时间**（`--preserve-mtime`）
- **软换行转硬换行**（`--hard-linebreaks`）
- **允许循环嵌入**（`--no-recursive-embeds`）
- **额外参数**：按 shell 风格解析（支持引号），例如 `--only-tags 发布`。
- **导出后打开目标目录**
- **覆盖前提示**：目标目录不为空时，导出前按预计输出路径列出将被覆盖的文件并确认（默认开启）。

## 等价命令行示例

```bat
obsidian-export "E:\data\obsidian\myrepo" --start-at "E:\data\obsidian\myrepo\工作\东信\中间件\实例\集群信息_云上东博.md" --no-git "E:\临时\集群信息导出"
```

## 说明

- 插件只在本机调用 obsidian-export，不发起网络请求，也不上传任何仓库内容。
- 目标目录不能是仓库根目录；目标目录位于仓库内部时会给出提示，因为导出结果会被 Obsidian 索引，导出整个仓库时还可能被再次包含。
- 导出布局由 obsidian-export 决定：导出文件夹时笔记平铺到目标目录，导出整个仓库时保留目录结构。
- 覆盖提示中的文件名是按导出范围和隐藏文件设置推测的；`.export-ignore`、git 忽略规则和标签过滤不参与推测，因此仍会先检查目标目录是否非空。