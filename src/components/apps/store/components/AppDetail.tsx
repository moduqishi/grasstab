import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Share } from 'lucide-react';
import { StoreApp, StoreWidget } from '../types';
import { t, Language } from '../../../../i18n';

interface AppDetailProps {
    item: StoreApp | StoreWidget;
    onClose: () => void;
    isInstalled: boolean;
    onInstall: (item: StoreApp | StoreWidget) => void;
    onOpen: (item: StoreApp | StoreWidget) => void;
    installing: boolean;
    lang: Language;
}

export const AppDetail = ({ item, onClose, isInstalled, onInstall, onOpen, installing, lang }: AppDetailProps) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute inset-0 z-50 bg-[#0d0d12] overflow-y-auto scrollbar-hide"
        >
            <div className="max-w-5xl mx-auto px-6 py-8 md:py-12 relative animate-fade-in">
                {/* Back Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 left-6 md:left-0 p-2 text-blue-400 hover:bg-white/5 rounded-full transition-colors flex items-center gap-1 text-sm font-medium"
                >
                    <ArrowLeft size={20} />
                    <span>{t(lang, 'back')}</span>
                </button>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mt-12 mb-12">
                    {/* Icon */}
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-32 h-32 md:w-44 md:h-44 flex-shrink-0 rounded-[22%] overflow-hidden shadow-2xl border border-white/10 bg-[#1c1c1e]"
                    >
                        {item.icon.startsWith('http') || item.icon.startsWith('data:') ? (
                             <img src={item.icon} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
                        )}
                    </motion.div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{item.name}</h1>
                            <p className="text-gray-400 text-lg">{item.category} • {item.author}</p>
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <button
                                onClick={() => isInstalled ? onOpen(item) : onInstall(item)}
                                disabled={installing}
                                className={`
                                    px-8 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all duration-200 transform active:scale-95
                                    ${isInstalled 
                                        ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20' 
                                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                    }
                                `}
                            >
                                {installing ? t(lang, 'installing') : isInstalled ? t(lang, 'open') : t(lang, 'get')}
                            </button>
                            <button className="p-2.5 rounded-full bg-white/5 hover:bg-blue-500/10 text-blue-400 transition-colors">
                                <Share size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-white/10 w-full mb-10" />

                {/* Screenshots Gallery */}
                {item.screenshots && item.screenshots.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-bold text-white mb-6">{t(lang, 'preview')}</h2>
                        <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-white/10 snap-x snap-mandatory">
                            {item.screenshots.map((src, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex-shrink-0 h-[300px] md:h-[400px] rounded-2xl overflow-hidden border border-white/5 shadow-2xl snap-center"
                                >
                                    <img src={src} className="h-full w-auto object-cover" alt="Screenshot" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Updates / Description */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-8">
                         <section>
                            <h2 className="text-xl font-bold text-white mb-4">{t(lang, 'description')}</h2>
                            <div className="text-gray-300 leading-relaxed text-base whitespace-pre-line">
                                {item.description}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white mb-4">{t(lang, 'information')}</h2>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between py-3 border-b border-white/5">
                                <span className="text-gray-500">{t(lang, 'provider')}</span>
                                <span className="text-white font-medium">{item.author}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-white/5">
                                <span className="text-gray-500">{t(lang, 'version')}</span>
                                <span className="text-white font-medium">{item.version}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-white/5">
                                <span className="text-gray-500">{t(lang, 'category')}</span>
                                <span className="text-white font-medium">{t(lang, item.category.toLowerCase() as any) || item.category}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-white/5">
                                <span className="text-gray-500">{t(lang, 'type')}</span>
                                <span className="text-white font-medium">
                                    {['Clock', 'Weather', 'Utility', 'Widget'].includes(item.category) ? t(lang, 'widget') : t(lang, 'app')}
                                </span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-white/5">
                                <span className="text-gray-500">{t(lang, 'displayMode')}</span>
                                <span className="text-white font-medium">
                                    {item.isWindowApp ? t(lang, 'window') : t(lang, 'fullscreen')}
                                </span>
                            </div>
                             <div className="flex justify-between py-3 border-b border-white/5">
                                <span className="text-gray-500">{t(lang, 'compatibility')}</span>
                                <span className="text-white font-medium">{t(lang, 'web')}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};
