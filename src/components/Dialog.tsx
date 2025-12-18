import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface DialogButton {
    label: string;
    variant?: 'primary' | 'secondary' | 'danger';
    onClick: () => void;
}

interface DialogConfig {
    title?: string;
    message: string;
    detail?: string;
    buttons?: DialogButton[];
    showCancel?: boolean;
    type?: 'alert' | 'confirm' | 'prompt';
    defaultValue?: string;
}

interface DialogContextType {
    showDialog: (config: DialogConfig) => Promise<boolean | string | null>;
    showAlert: (message: string, detail?: string) => Promise<void>;
    showConfirm: (message: string, detail?: string) => Promise<boolean>;
    showPrompt: (message: string, defaultValue?: string) => Promise<string | null>;
}

const DialogContext = createContext<DialogContextType | null>(null);

export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within DialogProvider');
    }
    return context;
};

interface DialogState {
    isOpen: boolean;
    config: DialogConfig | null;
    resolve: ((value: boolean | string | null) => void) | null;
    inputValue: string;
    position: { x: number; y: number };
    isDragging: boolean;
    dragOffset: { x: number; y: number };
}

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<DialogState>({
        isOpen: false,
        config: null,
        resolve: null,
        inputValue: '',
        position: { x: 0, y: 0 },
        isDragging: false,
        dragOffset: { x: 0, y: 0 }
    });

    const showDialog = useCallback((config: DialogConfig): Promise<boolean | string | null> => {
        return new Promise((resolve) => {
            // 居中位置
            const centerX = (window.innerWidth - 420) / 2;
            const centerY = (window.innerHeight - 300) / 2;
            
            setState({
                isOpen: true,
                config,
                resolve,
                inputValue: config.defaultValue || '',
                position: { x: centerX, y: centerY },
                isDragging: false,
                dragOffset: { x: 0, y: 0 }
            });
        });
    }, []);

    const showAlert = useCallback((message: string, detail?: string): Promise<void> => {
        return showDialog({
            message,
            detail,
            type: 'alert',
            buttons: [{ label: '好的', variant: 'primary', onClick: () => {} }]
        }).then(() => {});
    }, [showDialog]);

    const showConfirm = useCallback((message: string, detail?: string): Promise<boolean> => {
        return showDialog({
            message,
            detail,
            type: 'confirm',
            showCancel: true
        }).then(result => result === true);
    }, [showDialog]);

    const showPrompt = useCallback((message: string, defaultValue?: string): Promise<string | null> => {
        return showDialog({
            message,
            type: 'prompt',
            defaultValue,
            showCancel: true
        }).then(result => typeof result === 'string' ? result : null);
    }, [showDialog]);

    const handleClose = useCallback((result: boolean | string | null) => {
        if (state.resolve) {
            state.resolve(result);
        }
        setState({
            isOpen: false,
            config: null,
            resolve: null,
            inputValue: '',
            position: { x: 0, y: 0 },
            isDragging: false,
            dragOffset: { x: 0, y: 0 }
        });
    }, [state.resolve]);

    const handleConfirm = useCallback(() => {
        const { config } = state;
        if (config?.type === 'prompt') {
            handleClose(state.inputValue);
        } else {
            handleClose(true);
        }
    }, [state, handleClose]);

    const handleCancel = useCallback(() => {
        handleClose(false);
    }, [handleClose]);

    const handleButtonClick = useCallback((button: DialogButton) => {
        button.onClick();
        handleClose(true);
    }, [handleClose]);

    // 拖动处理
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button, input')) return;
        
        setState(prev => ({
            ...prev,
            isDragging: true,
            dragOffset: {
                x: e.clientX - prev.position.x,
                y: e.clientY - prev.position.y
            }
        }));
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!state.isDragging) return;
        
        setState(prev => ({
            ...prev,
            position: {
                x: e.clientX - prev.dragOffset.x,
                y: e.clientY - prev.dragOffset.y
            }
        }));
    }, [state.isDragging]);

    const handleMouseUp = useCallback(() => {
        setState(prev => ({
            ...prev,
            isDragging: false
        }));
    }, []);

    React.useEffect(() => {
        if (state.isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [state.isDragging, handleMouseMove, handleMouseUp]);

    return (
        <DialogContext.Provider value={{ showDialog, showAlert, showConfirm, showPrompt }}>
            {children}
            {state.isOpen && state.config && (
                <div className="fixed inset-0 z-[9999] pointer-events-none">
                    <div
                        className="absolute flex flex-col overflow-hidden pointer-events-auto transition-none"
                        style={{
                            left: `${state.position.x}px`,
                            top: `${state.position.y}px`,
                            backgroundColor: 'rgba(30, 30, 35, 0.85)',
                            backdropFilter: 'blur(60px)',
                            WebkitBackdropFilter: 'blur(60px)',
                            boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6), 0 0 0 0.5px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                            borderRadius: '16px',
                            width: '420px',
                            maxWidth: '90vw',
                            cursor: state.isDragging ? 'grabbing' : 'default'
                        }}
                    >
                        {/* Window Header - 可拖动标题栏 */}
                        <div 
                            className="h-[52px] flex items-center justify-between px-5 select-none shrink-0 relative cursor-grab active:cursor-grabbing"
                            style={{
                                background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                                borderBottom: '0.5px solid rgba(255, 255, 255, 0.1)'
                            }}
                            onMouseDown={handleMouseDown}
                        >
                            {/* 左侧红色关闭按钮 */}
                            <div className="flex gap-2.5 group">
                                <button 
                                    onClick={state.config.showCancel ? handleCancel : handleConfirm}
                                    className="w-[13px] h-[13px] rounded-full bg-[#FF5F56] border border-[#E0443E]/50 flex items-center justify-center text-black/40 shadow-sm transition-transform active:scale-90 hover:text-black/60" 
                                    aria-label="Close dialog"
                                >
                                    <svg className="opacity-0 group-hover:opacity-100 transition-opacity" width="8" height="8" viewBox="0 0 8 8" fill="none">
                                        <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    </svg>
                                </button>
                            </div>
                            
                            {/* 居中标题 */}
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[15px] font-medium text-white/90 tracking-wide drop-shadow-sm pointer-events-none">
                                {state.config.title || (state.config.type === 'confirm' ? '确认' : state.config.type === 'prompt' ? '输入' : '提示')}
                            </span>
                            
                            {/* 右侧占位保持对称 */}
                            <div className="w-[13px]"></div>
                        </div>
                        
                        {/* Content Area */}
                        <div className="flex-1 bg-transparent px-6 py-6 overflow-auto">
                            <div className="text-center space-y-3">
                                {/* 消息 */}
                                <p className="text-[15px] leading-relaxed font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                    {state.config.message}
                                </p>
                                
                                {/* 详细信息 */}
                                {state.config.detail && (
                                    <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                        {state.config.detail}
                                    </p>
                                )}

                                {/* Prompt输入框 */}
                                {state.config.type === 'prompt' && (
                                    <input
                                        type="text"
                                        className="mt-4 w-full px-4 py-3 rounded-lg outline-none transition-all text-[14px]"
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            color: 'rgba(255, 255, 255, 0.9)'
                                        }}
                                        value={state.inputValue}
                                        onChange={(e) => setState(prev => ({ ...prev, inputValue: e.target.value }))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleConfirm();
                                            } else if (e.key === 'Escape') {
                                                handleCancel();
                                            }
                                        }}
                                        autoFocus
                                        placeholder="请输入..."
                                    />
                                )}
                            </div>
                        </div>

                        {/* 按钮区域 - 灵活优雅的设计 */}
                        <div className="px-6 py-4 flex gap-3 justify-end shrink-0">
                            {state.config.showCancel && (
                                <button
                                    onClick={handleCancel}
                                    className="px-6 py-2.5 rounded-lg font-medium text-[14px] transition-all min-w-[80px]"
                                    style={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    }}
                                >
                                    取消
                                </button>
                            )}
                            {state.config.buttons ? (
                                state.config.buttons.map((button, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleButtonClick(button)}
                                        className="px-6 py-2.5 rounded-lg font-semibold text-[14px] transition-all min-w-[80px]"
                                        style={{
                                            color: button.variant === 'danger' 
                                                ? '#ffffff'
                                                : button.variant === 'secondary'
                                                ? 'rgba(255, 255, 255, 0.7)'
                                                : '#ffffff',
                                            backgroundColor: button.variant === 'danger'
                                                ? '#ff453a'
                                                : button.variant === 'secondary'
                                                ? 'rgba(255, 255, 255, 0.08)'
                                                : '#0a84ff',
                                            border: button.variant === 'secondary' 
                                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                                : 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (button.variant === 'danger') {
                                                e.currentTarget.style.backgroundColor = '#ff5247';
                                            } else if (button.variant === 'secondary') {
                                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                                            } else {
                                                e.currentTarget.style.backgroundColor = '#0f8fff';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (button.variant === 'danger') {
                                                e.currentTarget.style.backgroundColor = '#ff453a';
                                            } else if (button.variant === 'secondary') {
                                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                                            } else {
                                                e.currentTarget.style.backgroundColor = '#0a84ff';
                                            }
                                        }}
                                    >
                                        {button.label}
                                    </button>
                                ))
                            ) : (
                                <button
                                    onClick={handleConfirm}
                                    className="px-6 py-2.5 rounded-lg font-semibold text-[14px] transition-all min-w-[80px]"
                                    style={{
                                        color: '#ffffff',
                                        backgroundColor: '#0a84ff'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#0f8fff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#0a84ff';
                                    }}
                                >
                                    确定
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DialogContext.Provider>
    );
};
