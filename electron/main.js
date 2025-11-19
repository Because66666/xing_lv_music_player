import { app, BrowserWindow } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
// 使用 Electron 内置的打包状态判断，避免在安装包中引入额外依赖
const isDev = !app.isPackaged

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 创建主窗口；在开发模式下如果加载失败则回退到打包后的 dist
 */
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#000000',
    frame: false,
    autoHideMenuBar: false,
    icon: path.join(__dirname, '../assets/logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: !isDev
    }
  })


  if (isDev) {
    const devUrl = 'http://localhost:3000/'
    win.loadURL(devUrl)
    win.webContents.once('did-fail-load', () => {
      const indexPath = path.join(__dirname, '../dist/index.html')
      win.loadFile(indexPath)
    })
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html')
    win.loadFile(indexPath)
  }
}

/**
 * 应用就绪时初始化
 */
app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

/**
 * 所有窗口关闭时退出（macOS 除外）
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})