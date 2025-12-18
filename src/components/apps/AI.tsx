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
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:bg-white/10 bg-white/5"
            >
                <Sparkles size={14} className="text-white/60" />
                <span className="text-xs font-medium text-white/90">
                    {currentProvider.name} · {currentModel}
                </span>
                <ChevronDown size={14} className="text-white/60" />
            </button>

            {isOpen && (
                <div
                    className="absolute top-full left-0 mt-2 w-72 rounded-xl shadow-2xl overflow-hidden z-50 bg-surface/98 border border-white/10 backdrop-blur-xl"
                >
                    {/* Provider Selection */}
                    <div className="p-3 border-b border-white/10">
                        <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-white/50">
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
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                                        provider.id === currentProviderId 
                                            ? 'bg-primary/20 text-primary' 
                                            : 'text-white/80 hover:bg-white/5'
                                    }`}
                                >
                                    {provider.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-3">
                        <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-white/50">
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
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                                            model === currentModel 
                                                ? 'bg-primary/20 text-primary' 
                                                : 'text-white/80 hover:bg-white/5'
                                        }`}
                                    >
                                        {model}
                                    </button>
                                ))
                            ) : (
                <div className="text-xs text-center py-4 text-white/50">
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
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const shouldAutoScrollRef = useRef(true); // 智能滚动控制

    const currentProvider = providers.find(p => p.id === currentProviderId);

    // 智能滚动处理
    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        // 增加阈值到 100px，提高容错率
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        shouldAutoScrollRef.current = isNearBottom;
    };

    const scrollToBottom = (force: boolean = false) => {
        if (shouldAutoScrollRef.current || force) {
            requestAnimationFrame(() => {
                endRef.current?.scrollIntoView({ behavior: 'smooth' });
            });
        }
    };

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
        // 消息列表变化时，强制滚动到底部
        scrollToBottom(true);
    }, [messages]);

    useEffect(() => {
        // 流式传输内容变化时，根据用户位置决定是否滚动
        scrollToBottom();
    }, [streamingContent]);

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
            
            return new Promise<string[]>((resolve, reject) => {
                const port = chrome.runtime.connect({ name: 'stream-fetch' });
                let responseBody = '';

                port.onMessage.addListener((msg) => {
                    if (msg.type === 'error') {
                        reject(new Error(msg.error));
                        port.disconnect();
                    } else if (msg.type === 'chunk') {
                         // 将 number[] 转回字符串 (简单的 ASCII/UTF8 处理)
                         // 注意：对于非流式的大 JSON，这样拼接可能有效。
                         // 更严谨的做法是拼接 Uint8Array 然后一次性 decode。
                         responseBody += new TextDecoder().decode(new Uint8Array(msg.value), { stream: true });
                    } else if (msg.type === 'end') {
                        try {
                            const data = JSON.parse(responseBody);
                            const modelIds = data.data?.map((m: any) => m.id) || [];
                            resolve(modelIds.filter((id: string) => 
                                id.includes('gpt') || 
                                id.includes('claude') || 
                                id.includes('llama') ||
                                id.includes('gemini') ||
                                !id.includes('whisper') && !id.includes('tts') && !id.includes('dall-e')
                            ));
                        } catch (e) {
                            reject(e);
                        }
                        port.disconnect();
                    }
                });

                port.postMessage({
                    url: modelsUrl,
                    options: {
                        headers: {
                            'Authorization': `Bearer ${provider.apiKey}`
                        }
                    }
                });
            });
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

    // 引用 Port 以便中止
    const portRef = useRef<chrome.runtime.Port | null>(null);

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
        shouldAutoScrollRef.current = true;

        setTimeout(() => {
            inputRef.current?.focus();
        }, 10);

        try {
            const port = chrome.runtime.connect({ name: 'stream-fetch' });
            portRef.current = port;
            
            const decoder = new TextDecoder();
            let fullContent = '';

            port.onMessage.addListener((msg) => {
                if (msg.type === 'error') {
                     // 错误处理
                     if (msg.error !== 'AbortError') {
                         setError(msg.error || '发送失败，请检查网络连接和 API 配置');
                         // 移除最后一条（如果还没生成任何内容）
                         if (!fullContent) setMessages(prev => prev.slice(0, -1));
                     }
                     setIsLoading(false);
                     setIsStreaming(false);
                     port.disconnect();
                     portRef.current = null;
                } else if (msg.type === 'response') {
                    if (msg.status !== 200) {
                        // 此时还没有 body error，等待 error 消息
                    } else {
                        setIsLoading(false);
                    }
                } else if (msg.type === 'chunk') {
                    // 处理流式数据
                    const chunk = decoder.decode(new Uint8Array(msg.value), { stream: true });
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
                            } catch (e) { }
                        }
                    }
                } else if (msg.type === 'end') {
                    // 完成
                    const assistantMessage: Message = {
                        role: 'assistant',
                        content: fullContent || '抱歉，我没有收到有效的回复。'
                    };
                    setMessages(prev => [...prev, assistantMessage]);
                    
                    setIsLoading(false);
                    setIsStreaming(false);
                    setStreamingContent('');
                    port.disconnect();
                    portRef.current = null;
                    
                    setTimeout(() => {
                        inputRef.current?.focus();
                    }, 10);
                }
            });

            port.postMessage({
                url: currentProvider.apiUrl,
                options: {
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
                    })
                }
            });

        } catch (err: any) {
            setError(err.message || '发送失败');
            setIsLoading(false);
            setIsStreaming(false);
        }
    };

    const stopGeneration = () => {
        if (portRef.current) {
            portRef.current.disconnect();
            portRef.current = null;
            setIsLoading(false);
            setIsStreaming(false);
            setError('请求已人为停止');
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
                className="flex items-center justify-between px-4 py-3 border-b border-white/10"
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
                        <span className="text-xs font-medium text-white/50">
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
                        <Trash2 size={16} className="text-white/60" />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div 
                className="flex-1 overflow-y-auto p-4 space-y-4"
                ref={scrollContainerRef}
                onScroll={handleScroll}
            >
                {messages.length === 0 && (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center space-y-3">
                            <div className="text-4xl">💬</div>
                            <div className="text-sm text-white/50">
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
                                    : 'text-white bg-white/8 border border-white/10'
                            }`}
                        >
                            {msg.role === 'user' ? (
                                <div className="text-sm leading-6 whitespace-pre-wrap break-words">
                                    {msg.content}
                                </div>
                            ) : (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            code({ node, inline, className, children, ...props }: any) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline && match ? (
                                                    <CodeBlock
                                                        language={match[1]}
                                                        value={String(children).replace(/\n$/, '')}
                                                    />
                                                ) : (
                                                    <code
                                                        className="px-1.5 py-0.5 rounded text-xs font-mono bg-white/15"
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
                                                        className="border-l-4 pl-4 my-3 italic border-white/30"
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
                            className="max-w-[85%] rounded-2xl px-4 py-3 text-white bg-white/8 border border-white/10"
                        >
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown
                                    components={{
                                        code({ node, inline, className, children, ...props }: any) {
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
                                    {streamingContent + (isStreaming ? ' ▍' : '')}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading && !isStreaming && (
                    <div className="flex justify-start">
                        <div
                            className="max-w-[85%] rounded-2xl px-4 py-3 flex items-center gap-2 bg-white/8 border border-white/10"
                        >
                            <Loader2 size={16} className="animate-spin text-white/60" />
                            <span className="text-sm text-white/60">思考中...</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex justify-center">
                        <div
                            className="max-w-[85%] rounded-2xl px-4 py-3 flex items-start gap-2 bg-red-500/10 border border-red-500/30"
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
                className="p-4 border-t border-white/10 backdrop-blur-xl bg-gradient-to-t from-surface/95 to-surface/85"
            >
                <div className="flex gap-2 items-end">
                    <textarea
                        ref={inputRef}
                        className="flex-1 rounded-2xl px-4 py-3 outline-none text-white text-sm resize-none leading-6 bg-white/10 min-h-[44px] max-h-[120px]"
                        placeholder={currentProvider?.apiKey && currentModel ? "输入消息... (Shift+Enter 换行)" : "请先在设置中添加 API 提供商并选择模型"}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        // 移除 isLoading 禁用，允许用户在生成时输入
                        disabled={!currentProvider?.apiKey || !currentModel}
                        rows={1}
                        autoFocus
                    />
                    <button
                        onClick={isStreaming ? stopGeneration : sendMessage}
                        // 禁用发送按钮的逻辑：无输入且非流式，或正在加载但非流式（普通请求），或无配置
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