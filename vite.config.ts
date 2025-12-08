import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // 扩展模式使用相对路径，其他情况使用 GitHub Pages 路径
    const isExtension = mode === 'extension';
    
    return {
      base: isExtension ? './' : '/grasstab/',
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
          output: {
            manualChunks: undefined,
          }
        },
        modulePreload: false,
        target: 'esnext',
        minify: 'esbuild',
      },
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        // 扩展模式下复制并修改manifest.json
        isExtension && {
          name: 'copy-extension-files',
          buildStart() {
            // 在构建开始前备份chrome-extension目录中的图标文件
            const chromeExtPath = path.resolve(__dirname, 'chrome-extension');
            const backupPath = path.resolve(__dirname, '.icon-backup');
            
            if (fs.existsSync(chromeExtPath)) {
              const icons = ['icon16.png', 'icon48.png', 'icon128.png'];
              
              // 创建备份目录
              if (!fs.existsSync(backupPath)) {
                fs.mkdirSync(backupPath, { recursive: true });
              }
              
              // 备份图标文件
              icons.forEach(icon => {
                const iconSrc = path.join(chromeExtPath, icon);
                const iconBackup = path.join(backupPath, icon);
                if (fs.existsSync(iconSrc)) {
                  fs.copyFileSync(iconSrc, iconBackup);
                }
              });
            }
          },
          closeBundle() {
            const distPath = path.resolve(__dirname, 'dist');
            const manifestSrc = path.resolve(__dirname, 'manifest.json');
            const manifestDest = path.resolve(distPath, 'manifest.json');
            
            // 复制并修改manifest.json
            if (fs.existsSync(manifestSrc)) {
              const manifest = JSON.parse(fs.readFileSync(manifestSrc, 'utf-8'));
              // CSP配置 - 不使用unsafe-inline以符合Manifest V3
              manifest.content_security_policy = {
                extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'; connect-src https://*"
              };
              fs.writeFileSync(manifestDest, JSON.stringify(manifest, null, 2));
              console.log('✓ manifest.json已复制并更新CSP配置');
            }
            
            // 复制_locales目录
            const localesSrc = path.resolve(__dirname, '_locales');
            const localesDest = path.resolve(distPath, '_locales');
            if (fs.existsSync(localesSrc)) {
              if (!fs.existsSync(localesDest)) {
                fs.mkdirSync(localesDest, { recursive: true });
              }
              // 复制所有语言文件夹
              const languages = fs.readdirSync(localesSrc);
              languages.forEach(lang => {
                const langSrc = path.join(localesSrc, lang);
                const langDest = path.join(localesDest, lang);
                if (fs.statSync(langSrc).isDirectory()) {
                  if (!fs.existsSync(langDest)) {
                    fs.mkdirSync(langDest, { recursive: true });
                  }
                  const files = fs.readdirSync(langSrc);
                  files.forEach(file => {
                    fs.copyFileSync(path.join(langSrc, file), path.join(langDest, file));
                  });
                }
              });
              console.log('✓ _locales目录已复制');
            }
            
            // 复制图标文件
            const icons = ['icon16.png', 'icon48.png', 'icon128.png'];
            icons.forEach(icon => {
              const iconSrc = path.resolve(__dirname, icon);
              const iconDest = path.resolve(distPath, icon);
              if (fs.existsSync(iconSrc)) {
                fs.copyFileSync(iconSrc, iconDest);
              }
            });
            console.log('✓ 图标文件已复制');
            
            // 复制所有文件到chrome-extension目录
            const chromeExtPath = path.resolve(__dirname, 'chrome-extension');
            const backupPath = path.resolve(__dirname, '.icon-backup');
            
            // 删除旧的chrome-extension目录(如果存在)
            if (fs.existsSync(chromeExtPath)) {
              fs.rmSync(chromeExtPath, { recursive: true, force: true });
            }
            
            // 创建新的chrome-extension目录
            if (!fs.existsSync(chromeExtPath)) {
              fs.mkdirSync(chromeExtPath, { recursive: true });
            }
            
            // 递归复制dist目录中的所有文件
            const copyRecursive = (src: string, dest: string) => {
              const entries = fs.readdirSync(src, { withFileTypes: true });
              for (const entry of entries) {
                const srcPath = path.join(src, entry.name);
                const destPath = path.join(dest, entry.name);
                if (entry.isDirectory()) {
                  if (!fs.existsSync(destPath)) {
                    fs.mkdirSync(destPath, { recursive: true });
                  }
                  copyRecursive(srcPath, destPath);
                } else {
                  fs.copyFileSync(srcPath, destPath);
                }
              }
            };
            
            copyRecursive(distPath, chromeExtPath);
            
            // 恢复备份的图标文件
            if (fs.existsSync(backupPath)) {
              const icons = ['icon16.png', 'icon48.png', 'icon128.png'];
              icons.forEach(icon => {
                const iconBackup = path.join(backupPath, icon);
                const iconDest = path.join(chromeExtPath, icon);
                if (fs.existsSync(iconBackup)) {
                  fs.copyFileSync(iconBackup, iconDest);
                }
              });
              
              // 清理备份目录
              fs.rmSync(backupPath, { recursive: true, force: true });
            }
            
            console.log('✓ 所有文件已复制到chrome-extension目录');
          }
        },
        // 非扩展模式下复制隐私政策页面到dist目录
        !isExtension && {
          name: 'copy-privacy-page',
          closeBundle() {
            const distPath = path.resolve(__dirname, 'dist');
            const privacySrc = path.resolve(__dirname, 'doc/privacy.html');
            const privacyDest = path.resolve(distPath, 'privacy.html');
            
            if (fs.existsSync(privacySrc)) {
              fs.copyFileSync(privacySrc, privacyDest);
              console.log('✓ privacy.html已复制到dist目录');
            }
          }
        }
      ].filter(Boolean),
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
