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
        <div className="flex flex-col h-full bg-[#1e1e1e]">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {msgs.map((m,i)=>(
                    <div key={i} className={`p-4 rounded-2xl max-w-[85%] text-sm leading-6 ${m.role==='user'?'ml-auto bg-[#0A84FF] text-white':'bg-[#2c2c2e] text-gray-100'}`}>
                        {m.text}
                    </div>
                ))}
                <div ref={end} />
            </div>
            <div className="p-4 border-t border-white/10 flex gap-3 bg-[#1c1c1e]">
                <input 
                    className="flex-1 bg-[#2c2c2e] rounded-full px-5 py-3 outline-none text-white text-sm" 
                    placeholder="Message..." 
                    value={inp} 
                    onChange={e=>setInp(e.target.value)} 
                    onKeyDown={e=>e.key==='Enter'&&send()} 
                />
                <button 
                    onClick={send} 
                    className="p-3 bg-[#0A84FF] rounded-full text-white hover:bg-[#007AFF] transition-colors"
                    aria-label="Send message"
                    title="Send message"
                >
                    <ArrowRight size={18}/>
                </button>
            </div>
        </div>
    );
};