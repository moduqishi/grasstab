import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  // 本地预览使用相对路径，GitHub Pages 使用绝对路径
  const isGitHubPages = mode === 'github';
  
  return {
    plugins: [react()],
    base: isGitHubPages ? '/grasstab/' : './',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        }
      }
    },
    server: {
      port: 3001,
      host: '0.0.0.0',
    }
  };
});
