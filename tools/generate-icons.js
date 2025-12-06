import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建 SVG 图标
const createSVGIcon = (size) => `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#764ba2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f093fb;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad${size})"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">OS</text>
  <ellipse cx="${size * 0.15}" cy="${size * 0.2}" rx="${size * 0.08}" ry="${size * 0.05}" fill="rgba(255,255,255,0.3)"/>
</svg>`;

// 简单的 SVG 转 PNG (使用 data URL)
const createDataURL = (size) => {
  const svg = createSVGIcon(size);
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
};

// 创建图标文件
const sizes = [16, 48, 128];
const extPath = path.join(__dirname, 'chrome-extension');

if (!fs.existsSync(extPath)) {
  console.log('❌ chrome-extension 文件夹不存在');
  process.exit(1);
}

sizes.forEach(size => {
  const svg = createSVGIcon(size);
  const svgPath = path.join(extPath, `icon${size}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`✅ 已创建 icon${size}.svg`);
});

console.log('\n⚠️  提示: SVG 图标已创建。');
console.log('Chrome 扩展需要 PNG 格式图标。请使用以下方法之一:');
console.log('1. 在线转换: https://cloudconvert.com/svg-to-png');
console.log('2. 使用设计软件(Photoshop/GIMP)打开 SVG 并导出为 PNG');
console.log('3. 或者暂时使用 SVG(某些 Chrome 版本支持)');
