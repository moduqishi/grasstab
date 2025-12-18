import React, { useState, useEffect } from 'react';
import { CloudSun } from 'lucide-react';
import { formatDate } from '../../utils';

interface WidgetProps {
    w: number;
    h: number;
    content?: string;
}

export const ClockWidget: React.FC<WidgetProps> = ({ w, h }) => {
    const [time, setTime] = useState(new Date());
    
    useEffect(() => {
        let frameId: number;
        const update = () => {
            setTime(new Date());
            frameId = requestAnimationFrame(update);
        };
        update();
        return () => cancelAnimationFrame(frameId);
    }, []);

    const secondsDegrees = time.getSeconds() * 6;
    const minutesDegrees = time.getMinutes() * 6 + time.getSeconds() * 0.1;
    const hoursDegrees = (time.getHours() % 12) * 30 + time.getMinutes() * 0.5;

    return (
        <div className="w-full h-full flex items-center justify-center bg-[#f5f5f5] text-black font-sans overflow-hidden select-none">
            {/* Clock Face */}
            <div className="relative w-[90%] h-[90%] rounded-full bg-gradient-to-br from-[#ffffff] to-[#e6e6e6] shadow-[inset_0_0_10px_rgba(0,0,0,0.1),0_0_20px_rgba(0,0,0,0.2)] flex items-center justify-center">
                
                {/* Branding */}
                <div className="absolute top-[20%] text-[0.6rem] sm:text-xs text-[#666] font-bold tracking-widest z-0">
                    PREMIUM WATCH
                </div>

                {/* Markers */}
                <div className="absolute inset-0">
                    {[...Array(60)].map((_, i) => {
                        const isHour = i % 5 === 0;
                        return (
                            <div
                                key={i}
                                className="absolute top-0 left-1/2 -translate-x-1/2 h-full pointer-events-none"
                                style={{ 
                                    width: isHour ? '3%' : '1%',
                                    transform: `rotate(${i * 6}deg)` 
                                }}
                            >
                                <div 
                                    className={`mx-auto mt-[2%] bg-[#333] ${!isHour && 'bg-[#666]'}`}
                                    style={{ 
                                        width: '100%', 
                                        height: isHour ? '6%' : '2%' 
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Center Dot */}
                <div className="absolute top-1/2 left-1/2 w-[4%] h-[4%] bg-[#333] rounded-full -translate-x-1/2 -translate-y-1/2 z-20 shadow-md" />

                {/* Hour Hand */}
                <div 
                    className="absolute top-1/2 left-1/2 w-[2.5%] h-[25%] bg-[#333] -translate-x-1/2 -translate-y-full origin-bottom rounded-full z-10 shadow-sm"
                    style={{ transform: `translate(-50%, -100%) rotate(${hoursDegrees}deg)` }} 
                />

                {/* Minute Hand */}
                <div 
                    className="absolute top-1/2 left-1/2 w-[1.8%] h-[35%] bg-[#555] -translate-x-1/2 -translate-y-full origin-bottom rounded-full z-10 shadow-sm"
                    style={{ transform: `translate(-50%, -100%) rotate(${minutesDegrees}deg)` }} 
                />

                {/* Second Hand */}
                <div 
                    className="absolute top-1/2 left-1/2 w-[0.8%] h-[42%] bg-[#e74c3c] -translate-x-1/2 -translate-y-full origin-bottom rounded-full z-10 shadow-sm"
                    style={{ transform: `translate(-50%, -100%) rotate(${secondsDegrees}deg)` }} 
                />
            </div>
        </div>
    );
};

export const CalendarWidget: React.FC<WidgetProps> = () => {
    const today = new Date();
    const day = today.getDate();
    const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });

    return (
        <div className="w-full h-full flex flex-col bg-white text-black select-none">
             <div className="bg-red-500 text-white text-xs font-bold uppercase tracking-widest py-1 text-center w-full">
                {today.toLocaleDateString('en-US', { month: 'long' })}
             </div>
             <div className="flex-1 flex flex-col items-center justify-center -mt-1">
                 <span className="text-sm text-gray-400 font-medium">{weekday}</span>
                 <span className="text-5xl font-light tracking-tighter">{day}</span>
             </div>
        </div>
    );
};

export const WeatherWidget: React.FC<WidgetProps> = () => {
    return (
        <div className="w-full h-full flex flex-col justify-between p-3 bg-gradient-to-br from-blue-400 to-blue-600 text-white select-none">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold opacity-80">Cupertino</span>
                    <span className="text-3xl font-light">72°</span>
                </div>
                <CloudSun size={24} className="opacity-90"/>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-xs font-medium">Sunny</span>
                <span className="text-[10px] opacity-70">H:76° L:62°</span>
            </div>
        </div>
    );
};

export const CustomHTMLWidget: React.FC<WidgetProps> = ({ content }) => {
    return (
        <div className="w-full h-full bg-white text-black overflow-hidden relative">
            <div dangerouslySetInnerHTML={{ __html: content || '' }} className="w-full h-full overflow-auto" />
        </div>
    );
};

export const IFrameWidget: React.FC<WidgetProps> = ({ content }) => {
    return (
         <div className="w-full h-full bg-white overflow-hidden relative">
            <iframe 
                src={content} 
                title="widget" 
                className="w-full h-full border-none" 
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
        </div>
    );
};