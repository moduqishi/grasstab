import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './src/index.css';

// 全局错误捕获
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    console.error('Error message:', event.message);
    console.error('Error at:', event.filename, event.lineno, event.colno);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// 延迟 Monaco 配置直到真正需要，避免阻塞初始加载
let monacoConfigured = false;
function configureMonaco() {
  if (monacoConfigured) return;
  monacoConfigured = true;
  
  (window as any).MonacoEnvironment = {
    getWorker(_: string, label: string) {
      // 检测是否在Chrome扩展环境中
      const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
      
      if (isExtension) {
        // 在扩展环境中,使用打包后的worker文件(无哈希文件名)
        const workerPath = (() => {
          switch (label) {
            case 'json':
              return 'assets/json.worker.js';
            case 'css':
            case 'scss':
            case 'less':
              return 'assets/css.worker.js';
            case 'html':
            case 'handlebars':
            case 'razor':
              return 'assets/html.worker.js';
            case 'typescript':
            case 'javascript':
              return 'assets/ts.worker.js';
            default:
              return 'assets/editor.worker.js';
          }
        })();
        
        // 使用chrome.runtime.getURL获取正确的扩展内部URL
        const workerUrl = chrome.runtime.getURL(workerPath);
        return new Worker(workerUrl);
      } else {
        // 非扩展环境使用标准方式
        const getWorkerModule = (moduleUrl: string, label: string) => {
          return new Worker(new URL(moduleUrl, import.meta.url), {
            name: label,
            type: 'module'
          });
        };

        switch (label) {
          case 'json':
            return getWorkerModule('monaco-editor/esm/vs/language/json/json.worker?worker', label);
          case 'css':
          case 'scss':
          case 'less':
            return getWorkerModule('monaco-editor/esm/vs/language/css/css.worker?worker', label);
          case 'html':
          case 'handlebars':
          case 'razor':
            return getWorkerModule('monaco-editor/esm/vs/language/html/html.worker?worker', label);
          case 'typescript':
          case 'javascript':
            return getWorkerModule('monaco-editor/esm/vs/language/typescript/ts.worker?worker', label);
          default:
            return getWorkerModule('monaco-editor/esm/vs/editor/editor.worker?worker', label);
        }
      }
    }
  };
}

// 导出配置函数供 CodeEditor 组件使用
(window as any).configureMonaco = configureMonaco;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}const root = ReactDOM.createRoot(rootElement);
root.render(<App />);