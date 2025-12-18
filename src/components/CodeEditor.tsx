import React, { useRef, useEffect, useState } from 'react';
import { useDialog } from './Dialog';
import * as monaco from 'monaco-editor';
import { Save, X, RotateCcw, FileJson, FileCode } from 'lucide-react';

interface CodeEditorProps {
    value: string;
    language: 'yaml' | 'json';
    onSave: (value: string) => void;
    onClose: () => void;
    readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, language, onSave, onClose, readOnly = false }) => {
    const dialog = useDialog();
    const editorRef = useRef<HTMLDivElement>(null);
    const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [initialValue] = useState(value);

    useEffect(() => {
        if (!editorRef.current) return;

        // 确保 Monaco 已配置（延迟加载优化）
        if (typeof (window as any).configureMonaco === 'function') {
            (window as any).configureMonaco();
        }

        // 配置Monaco编辑器主题
        monaco.editor.defineTheme('grasstab-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6A9955' },
                { token: 'keyword', foreground: 'C586C0' },
                { token: 'string', foreground: 'CE9178' },
                { token: 'number', foreground: 'B5CEA8' },
                { token: 'type', foreground: '4EC9B0' },
                { token: 'function', foreground: 'DCDCAA' },
                { token: 'variable', foreground: '9CDCFE' },
            ],
            colors: {
                'editor.background': '#1e1e1e',
                'editor.foreground': '#d4d4d4',
                'editor.lineHighlightBackground': '#2a2a2a',
                'editor.selectionBackground': '#264f78',
                'editorCursor.foreground': '#ffffff',
                'editorLineNumber.foreground': '#858585',
                'editorLineNumber.activeForeground': '#c6c6c6',
                'editor.inactiveSelectionBackground': '#3a3d41',
            }
        });

        // 创建编辑器实例
        const editor = monaco.editor.create(editorRef.current, {
            value: value,
            language: language,
            theme: 'grasstab-dark',
            automaticLayout: true,
            fontSize: 13,
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            minimap: { enabled: true },
            wordWrap: 'on',
            readOnly: readOnly,
            tabSize: 2,
            insertSpaces: true,
            folding: true,
            foldingStrategy: 'indentation',
            formatOnPaste: true,
            formatOnType: true,
            autoIndent: 'full',
            bracketPairColorization: { enabled: true },
            guides: {
                indentation: true,
                bracketPairs: true
            },
            suggest: {
                showKeywords: true,
                showSnippets: true,
            },
            quickSuggestions: {
                other: true,
                comments: false,
                strings: true
            }
        });

        monacoEditorRef.current = editor;

        // 监听内容变化
        editor.onDidChangeModelContent(() => {
            const currentValue = editor.getValue();
            setHasChanges(currentValue !== initialValue);
        });

        // 快捷键
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            handleSave();
        });

        return () => {
            editor.dispose();
        };
    }, []);

    const handleSave = () => {
        if (monacoEditorRef.current) {
            const currentValue = monacoEditorRef.current.getValue();
            onSave(currentValue);
            setHasChanges(false);
        }
    };

    const handleReset = async () => {
        if (monacoEditorRef.current && await dialog.showConfirm('确定要重置到初始内容吗？', '所有未保存的更改将丢失。')) {
            monacoEditorRef.current.setValue(initialValue);
            setHasChanges(false);
        }
    };

    const handleFormat = () => {
        if (monacoEditorRef.current) {
            monacoEditorRef.current.getAction('editor.action.formatDocument')?.run();
        }
    };

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#1e1e1e' }}>
            {/* 工具栏 */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <div className="flex items-center gap-3">
                    {language === 'yaml' ? (
                        <FileCode size={20} style={{ color: '#4EC9B0' }} />
                    ) : (
                        <FileJson size={20} style={{ color: '#DCDCAA' }} />
                    )}
                    <div>
                        <h3 className="text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                            配置编辑器
                        </h3>
                        <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            {language.toUpperCase()} {readOnly ? '(只读)' : ''}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!readOnly && (
                        <>
                            <button
                                onClick={handleFormat}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                }}
                                title="格式化代码 (Alt+Shift+F)"
                            >
                                格式化
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                }}
                                title="重置到初始内容"
                            >
                                <RotateCcw size={14} />
                                重置
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!hasChanges}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                                style={{
                                    backgroundColor: hasChanges ? '#0A84FF' : 'rgba(255, 255, 255, 0.1)',
                                    color: hasChanges ? 'white' : 'rgba(255, 255, 255, 0.4)',
                                    cursor: hasChanges ? 'pointer' : 'not-allowed',
                                }}
                                title="保存 (Ctrl/Cmd+S)"
                            >
                                <Save size={14} />
                                {hasChanges ? '保存更改' : '已保存'}
                            </button>
                        </>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'rgba(255, 255, 255, 0.7)',
                        }}
                        title="关闭编辑器"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* 编辑器区域 */}
            <div ref={editorRef} className="flex-1" />

            {/* 状态栏 */}
            <div className="flex items-center justify-between px-4 py-2 text-xs border-t" style={{ 
                borderColor: 'rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: 'rgba(255, 255, 255, 0.6)'
            }}>
                <div className="flex items-center gap-4">
                    <span>{language.toUpperCase()}</span>
                    <span>UTF-8</span>
                    {hasChanges && <span style={{ color: '#0A84FF' }}>● 未保存</span>}
                </div>
                <div>
                    💡 提示: 使用 Ctrl/Cmd+S 保存, Alt+Shift+F 格式化
                </div>
            </div>
        </div>
    );
};
