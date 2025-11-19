<div align="center">
<img alt="GHBanner" src="https://github.com/user-attachments/assets/e9e0e6a5-e261-4832-b96e-cf50a5af0ca3" />
</div>

# 星旅音乐播放器

一款现代星际主题的唱片音乐播放器，带有音频可视化功能，专为内容创作者录制音乐而设计。由 Gemini3 初版设计，Trae 持续迭代维护。

**主要特性**
- 本地运行，无需互联网连接
- 播放本地音乐文件，支持自定义封面
- 内置音频可视化与主题随机化效果
- Electron 框架封装，支持 Windows 桌面安装包

## 环境要求
- Node.js（建议 18+）
- Windows（PowerShell 终端）

## 快速开始
1. 安装依赖：
   - `npm install`
2. 开发运行（Vite + Electron）：
   - `npm run dev`
   - 该命令会先启动 Vite 开发服务器（端口 `3000`），随后启动 Electron 并自动加载开发页面。
3. 生产模式本地运行（用于验收打包页面效果）：
   - `npm run start:electron`
   - 执行构建并启动 Electron，加载 `dist/index.html`。
4. 打包 Windows 安装包（NSIS）：
   - `npm run build:win`
   - 安装包输出目录：`release_build/`
   - 如果遇到“文件被占用”错误，请先关闭从 `win-unpacked` 目录启动的应用，再重试。

## 歌单模式
- 歌单文件示例：`歌单.json.demo`
- 支持从应用界面上传 JSON 歌单；歌单仅在 Electron 应用环境下可用。
- JSON 格式要求（数组）：
  - `title`: 歌曲标题
  - `path`: 音频文件的绝对路径（Windows）
  - `cover`: 封面图片的绝对路径（可选）

## 图标设置
- 应用窗口图标源文件：`assets/logo.png`
- Windows 安装包图标会在打包前自动从上述 PNG 生成 ICO：
  - 生成脚本：`npm run prebuild:win`（已包含在打包流程中）
  - 生成结果：`build/icon.ico`
  - 如需替换，直接用你自己的 `.ico` 覆盖 `build/icon.ico` 或在 `package.json -> build.win.icon` 指向你的 ICO 文件。

## 重要说明
- 生产构建的静态资源路径已设置为相对路径（`base: './'`），确保 Electron 生产模式能正确加载 `dist/assets/*`。
- 安装包打包脚本会尝试关闭占用进程并清理旧输出目录以避免失败。

## 目录结构（核心）
- `electron/main.js`：Electron 主进程入口（开发模式加载 `http://localhost:3000/`，生产模式加载 `dist/index.html`）
- `index.html` / `index.tsx` / `App.tsx`：前端入口与应用主体
- `assets/`：静态资源（例如 `logo.png`）
- `build/`：打包前生成的 `icon.ico`
- `dist/`：Vite 生产构建产物
- `release_build/`：Windows 安装包输出目录

## 常见问题
- 开发模式界面未显示：
  - 确认 3000 端口未被占用，检查终端是否显示 Vite 启动成功日志。
- 生产模式资源 404：
  - 已通过 `base: './'` 处理；如仍遇到问题，请重新构建并运行 `npm run start:electron`。
- 打包失败提示文件被占用：
  - 关闭从 `win-unpacked` 启动的应用，或重新启动电脑后再次执行 `npm run build:win`。
