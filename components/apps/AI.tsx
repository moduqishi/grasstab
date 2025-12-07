import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

export const AIApp = () => {
    const [msgs, setMsgs] = useState([{ role: 'ai', text: 'Hello. I am ready to help.' }]);
    const [inp, setInp] = useState('');
    const end = useRef<HTMLDivElement>(null);
    
    const send = () => { 
        if(!inp.trim()) return; 
        setMsgs(p=>[...p, {role:'user',text:inp}, {role:'ai', text:'This is a demo UI. Connect to an API to make me real!'}]); 
        setInp(''); 
    };
    
    useEffect(()=>end.current?.scrollIntoView({behavior:'smooth'}),[msgs]);
    
    return (
        <div className="flex flex-col h-full" onWheel={(e) => e.stopPropagation()}>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {msgs.map((m,i)=>(
                    <div key={i} className={`p-4 rounded-2xl max-w-[85%] text-sm leading-6 ${m.role==='user'?'ml-auto bg-[#0A84FF] text-white':'bg-white/10 text-gray-100'}`}>
                        {m.text}
                    </div>
                ))}
                <div ref={end} />
            </div>
            <div className="p-4 flex gap-3" style={{ borderTop: '0.5px solid rgba(255, 255, 255, 0.1)' }}>
                <input 
                    className="flex-1 rounded-full px-5 py-3 outline-none text-white text-sm" 
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    placeholder="Message..." 
                    value={inp} 
                    onChange={e=>setInp(e.target.value)} 
                    onKeyDown={e=>e.key==='Enter'&&send()} 
                />
                <button 
                    onClick={send} 
                    className="p-3 bg-[#0A84FF] rounded-full text-white hover:brightness-110 transition-all active:scale-95"
                    aria-label="Send message"
                    title="Send message"
                >
                    <ArrowRight size={18}/>
                </button>
            </div>
        </div>
    );
};