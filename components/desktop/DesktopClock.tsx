import React from 'react';

interface DesktopClockProps {
    time: Date;
    viewState: 'hero' | 'desktop';
    isAnyWindowMaximized: boolean;
}

export const DesktopClock: React.FC<DesktopClockProps> = ({ time, viewState, isAnyWindowMaximized }) => {
    return (
        <div 
            className={`w-full h-[18%] flex flex-col items-center justify-end pb-4 transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1) z-50 ${
                viewState === 'hero' 
                    ? 'translate-y-[20vh] scale-125' 
                    : 'translate-y-0 scale-100'
            }`}
            style={{ opacity: isAnyWindowMaximized ? 0 : 1, pointerEvents: 'none' }}
        >
            <div className="text-center drop-shadow-md select-none pointer-events-auto">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-thin tracking-tighter text-white/95">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 mt-1 font-light tracking-widest uppercase">
                    {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </div>
        </div>
    );
};
