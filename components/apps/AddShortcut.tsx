import React, { useState } from 'react';
import { Plus, AppWindow, LayoutGrid, Clock, Calendar, CloudSun, Code, Monitor } from 'lucide-react';
import { Shortcut, WidgetType } from '../../types';

interface AddShortcutProps {
    onAdd: (data: Partial<Shortcut>) => void;
    onClose: () => void;
}

const WIDGET_TYPES: { type: WidgetType, label: string, icon: any }[] = [
    { type: 'clock', label: 'Clock', icon: Clock },
    { type: 'calendar', label: 'Calendar', icon: Calendar },
    { type: 'weather', label: 'Weather', icon: CloudSun },
    { type: 'custom', label: 'Custom HTML', icon: Code },
    { type: 'iframe', label: 'Web Embed', icon: Monitor },
];

const WIDGET_SIZES = [
    { w: 1, h: 1, label: 'Small (1x1)' },
    { w: 2, h: 1, label: 'Wide (2x1)' },
    { w: 2, h: 2, label: 'Large (2x2)' },
    { w: 4, h: 2, label: 'Extra (4x2)' },
];

export const AddShortcutApp: React.FC<AddShortcutProps> = ({ onAdd, onClose }) => {
    const [mode, setMode] = useState<'app' | 'widget'>('app');
    
    // App State
    const [t, setT] = useState(''); 
    const [u, setU] = useState(''); 
    const [isA, setIsA] = useState(false);

    // Widget State
    const [wType, setWType] = useState<WidgetType>('clock');
    const [wSize, setWSize] = useState(WIDGET_SIZES[0]);
    const [wContent, setWContent] = useState('');

    const handleSubmit = () => {
        if (mode === 'app') {
            if(t && u) {
                onAdd({ title: t, url: u, isApp: isA, type: 'auto', size: {w:1, h:1} });
                onClose();
            }
        } else {
            onAdd({ 
                title: wType.charAt(0).toUpperCase() + wType.slice(1), 
                type: 'widget', 
                widgetType: wType, 
                widgetContent: wContent, 
                size: { w: wSize.w, h: wSize.h },
                color: 'from-white to-gray-100' // Default light theme for widgets
            });
            onClose();
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] text-white">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
                <button onClick={()=>setMode('app')} className={`flex-1 py-4 text-sm font-medium transition-colors ${mode==='app'?'bg-white/10 text-white':'text-white/40 hover:text-white/70'}`}>App Shortcut</button>
                <button onClick={()=>setMode('widget')} className={`flex-1 py-4 text-sm font-medium transition-colors ${mode==='widget'?'bg-white/10 text-white':'text-white/40 hover:text-white/70'}`}>Widget</button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                {mode === 'app' ? (
                    <div className="flex flex-col gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</label>
                            <input className="w-full bg-[#2c2c2e] p-3 rounded-lg text-white outline-none focus:ring-2 ring-[#0A84FF]" value={t} onChange={e=>setT(e.target.value)} placeholder="e.g. My Blog" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">URL</label>
                            <input className="w-full bg-[#2c2c2e] p-3 rounded-lg text-white outline-none focus:ring-2 ring-[#0A84FF]" value={u} onChange={e=>setU(e.target.value)} placeholder="https://..." />
                        </div>
                        <div onClick={()=>setIsA(!isA)} className="flex items-center gap-3 cursor-pointer py-2 group">
                            <div className={`w-5 h-5 border border-gray-500 rounded flex items-center justify-center transition-colors ${isA?'bg-[#0A84FF] border-transparent':''}`}>
                                {isA&&<Plus size={14} className="text-white"/>}
                            </div>
                            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Open in Window</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {/* Type Selector */}
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Widget Type</label>
                            <div className="grid grid-cols-3 gap-3">
                                {WIDGET_TYPES.map(wt => (
                                    <button 
                                        key={wt.type}
                                        onClick={()=>setWType(wt.type)}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${wType===wt.type ? 'bg-[#0A84FF] border-[#0A84FF] text-white' : 'bg-[#2c2c2e] border-transparent hover:bg-white/10'}`}
                                    >
                                        <wt.icon size={24} />
                                        <span className="text-xs">{wt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Size Selector */}
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Size</label>
                            <div className="grid grid-cols-2 gap-3">
                                {WIDGET_SIZES.map(ws => (
                                    <button
                                        key={ws.label}
                                        onClick={()=>setWSize(ws)}
                                        className={`p-3 rounded-xl border text-sm transition-all ${wSize.label===ws.label ? 'bg-[#0A84FF] border-[#0A84FF] text-white' : 'bg-[#2c2c2e] border-transparent hover:bg-white/10'}`}
                                    >
                                        {ws.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Input */}
                        {(wType === 'custom' || wType === 'iframe') && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{wType === 'iframe' ? 'URL' : 'HTML Content'}</label>
                                {wType === 'iframe' ? (
                                    <input className="w-full bg-[#2c2c2e] p-3 rounded-lg text-white outline-none focus:ring-2 ring-[#0A84FF]" value={wContent} onChange={e=>setWContent(e.target.value)} placeholder="https://..." />
                                ) : (
                                    <textarea className="w-full h-32 bg-[#2c2c2e] p-3 rounded-lg text-white outline-none focus:ring-2 ring-[#0A84FF] font-mono text-xs" value={wContent} onChange={e=>setWContent(e.target.value)} placeholder="<div>Hello World</div>" />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-8 border-t border-white/10">
                <button 
                    onClick={handleSubmit} 
                    className="w-full bg-[#0A84FF] hover:bg-[#007AFF] py-3 rounded-lg text-white font-medium shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                    {mode === 'app' ? 'Add Shortcut' : 'Add Widget'}
                </button>
            </div>
        </div>
    );
};