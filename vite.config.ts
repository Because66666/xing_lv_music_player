import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite 配置函数：
 * - 开发模式保持 base 为 '/'
 * - 生产模式设置 base 为 './'，以便在 Electron 中从本地文件系统加载时，资源路径相对 index.html，不会指向磁盘根目录
 */
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
  return {
      base: mode === 'production' ? './' : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
        strictPort: true,
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
