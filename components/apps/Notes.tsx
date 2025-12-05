import React, { useState, useEffect } from 'react';

export const NotesApp = () => {
    const [txt, setTxt] = useState(localStorage.getItem('os-note')||'');
    useEffect(()=>localStorage.setItem('os-note', txt),[txt]);
    return (
        <div className="h-full bg-[#1e1e1e] flex flex-col">
            <div className="p-4 border-b border-white/5 text-xs text-white/40 flex justify-between"><span>{new Date().toLocaleString()}</span><span>{txt.length} chars</span></div>
            <textarea className="flex-1 bg-transparent p-6 text-white/90 text-lg leading-relaxed outline-none resize-none font-sans" value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Type your thoughts..." />
        </div>
    );
};