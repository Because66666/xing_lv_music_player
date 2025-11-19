/**
 * 将 PNG 图标转换为 Windows 所需的 ICO 格式
 * - 输入：assets/logo.png
 * - 输出：build/icon.ico (至少包含 256x256 尺寸)
 */
import fs from 'fs';
import path from 'path';
import pngToIco from 'png-to-ico';

/**
 * 主函数：读取 PNG，生成 ICO 并写入到 build 目录
 */
async function main() {
  const projectRoot = process.cwd();
  const srcPng = path.join(projectRoot, 'assets', 'logo.png');
  const outDir = path.join(projectRoot, 'build');
  const outIco = path.join(outDir, 'icon.ico');

  if (!fs.existsSync(srcPng)) {
    console.error(`[gen-ico] 源文件不存在: ${srcPng}`);
    process.exit(1);
  }

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  try {
    const buf = await pngToIco(srcPng);
    fs.writeFileSync(outIco, buf);
    console.log(`[gen-ico] 已生成 ICO: ${outIco}`);
  } catch (err) {
    console.error('[gen-ico] 生成 ICO 失败', err);
    process.exit(1);
  }
}

/**
 * 执行入口
 */
main();