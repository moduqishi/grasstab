import React, { useState, useEffect, useRef } from 'react';
import { useDialog } from '../Dialog';
import { ArrowRight, Loader2, AlertCircle, Trash2, Copy, Check, ChevronDown, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface AIProvider {
    id: string;
    name: string;
    apiUrl: string;
    apiKey: string;
    models: string[];
    customModels: string[];
    temperature: number;
    maxTokens: number;
}

interface ModelSelectProps {
    providers: AIProvider[];
    currentProviderId: string;
    currentModel: string;
    onProviderChange: (providerId: string) => void;
    onModelChange: (model: string) => void;
}

const ModelSelect: React.FC<ModelSelectProps> = ({ 
    providers, 
    currentProviderId, 
    currentModel, 
    onProviderChange, 
    onModelChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentProvider = providers.find(p => p.id === currentProviderId);
    if (!currentProvider) return null;

    const allModels = currentProvider.customModels || [];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:bg-white/10"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            >
                <Sparkles size={14} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                <span className="text-xs font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {currentProvider.name} · {currentModel}
                </span>
                <ChevronDown size={14} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
            </button>

            {isOpen && (
                <div
                    className="absolute top-full left-0 mt-2 w-72 rounded-xl shadow-2xl overflow-hidden z-50"
                    style={{
                        backgroundColor: 'rgba(30, 30, 35, 0.98)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    {/* Provider Selection */}
                    <div className="p-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            API 提供商
                        </div>
                        <div className="space-y-1">
                            {providers.map(provider => (
                                <button
                                    key={provider.id}
                                    onClick={() => {
                                        onProviderChange(provider.id);
                                        const firstModel = provider.customModels?.[0];
                                        if (firstModel) {
                                            onModelChange(firstModel);
                                        }
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-lg transition-all text-sm"
                                    style={{
                                        backgroundColor: provider.id === currentProviderId ? 'rgba(10, 132, 255, 0.2)' : 'transparent',
                                        color: provider.id === currentProviderId ? '#0A84FF' : 'rgba(255, 255, 255, 0.8)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (provider.id !== currentProviderId) {
                                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (provider.id !== currentProviderId) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    {provider.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Model Selection */}
                    <div className="p-3">
                        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            模型
                        </div>
                        <div className="space-y-1 max-h-64 overflow-y-auto">
                            {allModels.length > 0 ? (
                                allModels.map(model => (
                                    <button
                                        key={model}
                                        onClick={() => {
                                            onModelChange(model);
                                            setIsOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2 rounded-lg transition-all text-sm"
                                        style={{
                                            backgroundColor: model === currentModel ? 'rgba(10, 132, 255, 0.2)' : 'transparent',
                                            color: model === currentModel ? '#0A84FF' : 'rgba(255, 255, 255, 0.8)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (model !== currentModel) {
                                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (model !== currentModel) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        {model}
                                    </button>
                                ))
                            ) : (
                                <div className="text-xs text-center py-4" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                    暂无可用模型
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CodeBlock = ({ language, value }: { language: string; value: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-4">
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all"
                    title="复制代码"
                >
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-gray-300" />}
                </button>
            </div>
            <SyntaxHighlighter
                language={language || 'text'}
                style={oneDark}
                customStyle={{
                    margin: 0,
                    borderRadius: '12px',
                    fontSize: '13px',
                    padding: '16px'
                }}
            >
                {value}
            </SyntaxHighlighter>
        </div>
    );
};

export const AIApp = () => {
    const dialog = useDialog();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [providers, setProviders] = useState<AIProvider[]>(() => {
        try {
            const saved = localStorage.getItem('ai-providers');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [currentProviderId, setCurrentProviderId] = useState<string>(() => {
        const saved = localStorage.getItem('ai-current-provider');
        return saved || (providers.length > 0 ? providers[0].id : '');
    });
    const [currentModel, setCurrentModel] = useState<string>(() => {
        const saved = localStorage.getItem('ai-current-model');
        if (saved) return saved;
        const currentProvider = providers.find(p => p.id === currentProviderId);
        return currentProvider?.customModels?.[0] || '';
    });
    const [streamingContent, setStreamingContent] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const currentProvider = providers.find(p => p.id === currentProviderId);

    useEffect(() => {
        localStorage.setItem('ai-providers', JSON.stringify(providers));
    }, [providers]);

    useEffect(() => {
        localStorage.setItem('ai-current-provider', currentProviderId);
    }, [currentProviderId]);

    useEffect(() => {
        localStorage.setItem('ai-current-model', currentModel);
    }, [currentModel]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
        }
    }, [input]);

    const fetchModels = async (provider: AIProvider) => {
        try {
            // 智能构建 models 端点 URL
            let modelsUrl = provider.apiUrl;
            
            if (modelsUrl.includes('/chat/completions')) {
                // 标准格式：替换 /chat/completions 为 /models
                modelsUrl = modelsUrl.replace('/chat/completions', '/models');
            } else if (modelsUrl.includes('/v1')) {
                // 如果包含 /v1 但没有 /chat/completions，添加 /models
                modelsUrl = modelsUrl.replace(/\/+$/, '') + '/models';
            } else {
                // 基础 URL，添加 /v1/models
                modelsUrl = modelsUrl.replace(/\/+$/, '') + '/v1/models';
            }
            
            const response = await fetch(modelsUrl, {
                headers: {
                    'Authorization': `Bearer ${provider.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error('无法获取模型列表');
            }

            const data = await response.json();
            const modelIds = data.data?.map((m: any) => m.id) || [];
            
            return modelIds.filter((id: string) => 
                id.includes('gpt') || 
                id.includes('claude') || 
                id.includes('llama') ||
                id.includes('gemini') ||
                !id.includes('whisper') && !id.includes('tts') && !id.includes('dall-e')
            );
        } catch (err) {
            console.error('Failed to fetch models:', err);
            return [];
        }
    };

    const handleProviderChange = (providerId: string) => {
        setCurrentProviderId(providerId);
        const provider = providers.find(p => p.id === providerId);
        if (provider) {
            const firstModel = provider.customModels?.[0];
            if (firstModel) {
                setCurrentModel(firstModel);
            }
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading || isStreaming) return;

        if (!currentProvider || !currentProvider.apiKey) {
            setError('请先在设置中添加并配置 API 提供商');
            return;
        }

        if (!currentModel) {
            setError('请选择一个模型');
            return;
        }

        const userMessage: Message = { role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setIsStreaming(true);
        setStreamingContent('');
        setError('');

        // 创建中止控制器
        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch(currentProvider.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentProvider.apiKey}`
                },
                body: JSON.stringify({
                    model: currentModel,
                    messages: [...messages, userMessage],
                    temperature: currentProvider.temperature,
                    max_tokens: currentProvider.maxTokens,
                    stream: true
                }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API 错误: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            if (reader) {
                setIsLoading(false);
                
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n').filter(line => line.trim() !== '');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') continue;

                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices[0]?.delta?.content;
                                if (content) {
                                    fullContent += content;
                                    setStreamingContent(fullContent);
                                }
                            } catch (e) {
                                // 忽略解析错误
                            }
                        }
                    }
                }

                // 流式传输完成，添加完整消息
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: fullContent || '抱歉，我没有收到有效的回复。'
                };
                setMessages(prev => [...prev, assistantMessage]);
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                setError('请求已取消');
            } else {
                setError(err.message || '发送失败，请检查网络连接和 API 配置');
            }
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
            setStreamingContent('');
            abortControllerRef.current = null;
        }
    };

    const stopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    const clearChat = async () => {
        if (await dialog.showConfirm('确定要清空对话历史吗？')) {
            setMessages([]);
            setError('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full" onWheel={(e) => e.stopPropagation()}>
            {/* Header */}
            <div 
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '0.5px solid rgba(255, 255, 255, 0.1)' }}
            >
                <div className="flex items-center gap-3">
                    {providers.length > 0 && currentProvider ? (
                        <>
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <ModelSelect
                                providers={providers}
                                currentProviderId={currentProviderId}
                                currentModel={currentModel}
                                onProviderChange={handleProviderChange}
                                onModelChange={setCurrentModel}
                            />
                        </>
                    ) : (
                        <span className="text-xs font-medium" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            请在设置中添加 API 提供商
                        </span>
                    )}
                </div>
                {messages.length > 0 && (
                    <button
                        onClick={clearChat}
                        className="p-2 rounded-lg hover:bg-white/10 transition-all"
                        title="清空对话"
                    >
                        <Trash2 size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center space-y-3">
                            <div className="text-4xl">💬</div>
                            <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                {providers.length > 0 && currentProvider?.apiKey ? '开始对话吧' : '请先在设置中添加 API 提供商'}
                            </div>
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                msg.role === 'user'
                                    ? 'bg-[#0A84FF] text-white'
                                    : 'text-white'
                            }`}
                            style={msg.role === 'assistant' ? {
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            } : {}}
                        >
                            {msg.role === 'user' ? (
                                <div className="text-sm leading-6 whitespace-pre-wrap break-words">
                                    {msg.content}
                                </div>
                            ) : (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            code({ inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline && match ? (
                                                    <CodeBlock
                                                        language={match[1]}
                                                        value={String(children).replace(/\n$/, '')}
                                                    />
                                                ) : (
                                                    <code
                                                        className="px-1.5 py-0.5 rounded text-xs font-mono"
                                                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                                                        {...props}
                                                    >
                                                        {children}
                                                    </code>
                                                );
                                            },
                                            p({ children }) {
                                                return <p className="text-sm leading-6 mb-3 last:mb-0">{children}</p>;
                                            },
                                            ul({ children }) {
                                                return <ul className="text-sm leading-6 mb-3 pl-5 space-y-1">{children}</ul>;
                                            },
                                            ol({ children }) {
                                                return <ol className="text-sm leading-6 mb-3 pl-5 space-y-1">{children}</ol>;
                                            },
                                            h1({ children }) {
                                                return <h1 className="text-xl font-bold mb-3 mt-4">{children}</h1>;
                                            },
                                            h2({ children }) {
                                                return <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>;
                                            },
                                            h3({ children }) {
                                                return <h3 className="text-base font-bold mb-2 mt-3">{children}</h3>;
                                            },
                                            blockquote({ children }) {
                                                return (
                                                    <blockquote 
                                                        className="border-l-4 pl-4 my-3 italic"
                                                        style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                                                    >
                                                        {children}
                                                    </blockquote>
                                                );
                                            },
                                            a({ href, children }) {
                                                return (
                                                    <a
                                                        href={href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 hover:underline"
                                                    >
                                                        {children}
                                                    </a>
                                                );
                                            }
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* 流式传输中的消息 */}
                {isStreaming && streamingContent && (
                    <div className="flex justify-start">
                        <div
                            className="max-w-[85%] rounded-2xl px-4 py-3 text-white"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown
                                    components={{
                                        code({ inline, className, children, ...props }) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            return !inline && match ? (
                                                <CodeBlock
                                                    language={match[1]}
                                                    value={String(children).replace(/\n$/, '')}
                                                />
                                            ) : (
                                                <code
                                                    className="px-1.5 py-0.5 rounded text-xs font-mono"
                                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                                                    {...props}
                                                >
                                                    {children}
                                                </code>
                                            );
                                        },
                                        p({ children }) {
                                            return <p className="text-sm leading-6 mb-3 last:mb-0">{children}</p>;
                                        },
                                        ul({ children }) {
                                            return <ul className="text-sm leading-6 mb-3 pl-5 space-y-1">{children}</ul>;
                                        },
                                        ol({ children }) {
                                            return <ol className="text-sm leading-6 mb-3 pl-5 space-y-1">{children}</ol>;
                                        },
                                        h1({ children }) {
                                            return <h1 className="text-xl font-bold mb-3 mt-4">{children}</h1>;
                                        },
                                        h2({ children }) {
                                            return <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>;
                                        },
                                        h3({ children }) {
                                            return <h3 className="text-base font-bold mb-2 mt-3">{children}</h3>;
                                        },
                                        blockquote({ children }) {
                                            return (
                                                <blockquote 
                                                    className="border-l-4 pl-4 my-3 italic"
                                                    style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                                                >
                                                    {children}
                                                </blockquote>
                                            );
                                        },
                                        a({ href, children }) {
                                            return (
                                                <a
                                                    href={href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:underline"
                                                >
                                                    {children}
                                                </a>
                                            );
                                        }
                                    }}
                                >
                                    {streamingContent}
                                </ReactMarkdown>
                                <span className="inline-block w-1.5 h-4 bg-blue-400 animate-pulse ml-0.5" />
                            </div>
                        </div>
                    </div>
                )}

                {isLoading && !isStreaming && (
                    <div className="flex justify-start">
                        <div
                            className="max-w-[85%] rounded-2xl px-4 py-3 flex items-center gap-2"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <Loader2 size={16} className="animate-spin" style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                            <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>思考中...</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex justify-center">
                        <div
                            className="max-w-[85%] rounded-2xl px-4 py-3 flex items-start gap-2"
                            style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)'
                            }}
                        >
                            <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-red-300">{error}</span>
                        </div>
                    </div>
                )}

                <div ref={endRef} />
            </div>

            {/* Input Area */}
            <div
                className="p-4"
                style={{
                    borderTop: '0.5px solid rgba(255, 255, 255, 0.1)',
                    background: 'linear-gradient(to top, rgba(30, 30, 35, 0.95) 0%, rgba(30, 30, 35, 0.85) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)'
                }}
            >
                <div className="flex gap-2 items-end">
                    <textarea
                        ref={inputRef}
                        className="flex-1 rounded-2xl px-4 py-3 outline-none text-white text-sm resize-none leading-6"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            minHeight: '44px',
                            maxHeight: '120px'
                        }}
                        placeholder={currentProvider?.apiKey && currentModel ? "输入消息... (Shift+Enter 换行)" : "请先在设置中添加 API 提供商并选择模型"}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={!currentProvider?.apiKey || isLoading || !currentModel}
                        rows={1}
                    />
                    <button
                        onClick={isStreaming ? stopGeneration : sendMessage}
                        disabled={(!input.trim() && !isStreaming) || (isLoading && !isStreaming) || !currentProvider?.apiKey || !currentModel}
                        className={`p-3 rounded-full text-white hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
                            isStreaming ? 'bg-red-500' : 'bg-[#0A84FF]'
                        }`}
                        aria-label={isStreaming ? '停止生成' : '发送消息'}
                        title={isStreaming ? '停止生成' : '发送消息'}
                    >
                        {isLoading && !isStreaming ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : isStreaming ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="6" width="12" height="12" rx="1" />
                            </svg>
                        ) : (
                            <ArrowRight size={18} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};