import React, { useState } from 'react';

export const CalculatorApp = () => {
    const [disp, setDisp] = useState('0');
    const click = (v: string) => { 
        if(v==='C') setDisp('0'); 
        else if(v==='=') { 
            try { 
                // eslint-disable-next-line no-new-func
                setDisp(String(new Function('return '+disp)())); 
            } catch { setDisp('Error'); } 
        } else setDisp(disp==='0'?v:disp+v); 
    };
    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex-1 flex items-end justify-end mb-4 px-2">
                <span className="text-6xl font-light text-white tracking-tight drop-shadow-md truncate">{disp}</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
                {['C','(',')','/','7','8','9','*','4','5','6','-','1','2','3','+','0','.','='].map(b => (
                    <button 
                        key={b} 
                        onClick={()=>click(b)} 
                        className={`
                            h-[64px] rounded-full text-2xl font-medium transition-all duration-100 active:brightness-125 flex items-center justify-center
                            ${b==='=' 
                                ? 'col-span-2 bg-orange-500 text-white' 
                                : ['/','*','-','+'].includes(b) 
                                    ? 'bg-orange-500 text-white' 
                                    : ['C','(',')'].includes(b)
                                        ? 'bg-[#a5a5a5] text-black'
                                        : 'bg-[#333333] text-white'
                            }
                        `}
                    >
                        {b}
                    </button>
                ))}
            </div>
        </div>
    );
};