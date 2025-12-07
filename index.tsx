import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './src/index.css';

// Configure Monaco Editor workers for Chrome Extension
// Use getWorker to avoid hard-coded file names
(window as any).MonacoEnvironment = {
  getWorker(_: string, label: string) {
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
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);