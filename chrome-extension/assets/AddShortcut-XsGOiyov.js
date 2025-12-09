import{c as C,u as P,r as t,j as e,b as Y,L as _,S as R,k as B,l as D,m as G}from"./index-CMts2itO.js";import{I as $}from"./IconSelector-Dd-T0Fkg.js";import{M as w}from"./monitor-Dk6ZFcPN.js";import"./loader-circle-Biu7hZOv.js";/**
 * @license lucide-react v0.556.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]],J=C("calendar",q);/**
 * @license lucide-react v0.556.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=[["path",{d:"M12 6v6l4 2",key:"mmk7yg"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],O=C("clock",K),Q=[{type:"clock",label:"时钟",icon:O,desc:"精美的模拟时钟"},{type:"calendar",label:"日历",icon:J,desc:"当前日期显示"},{type:"weather",label:"天气",icon:B,desc:"天气信息卡片"},{type:"custom",label:"自定义 HTML",icon:D,desc:"嵌入自定义代码"},{type:"iframe",label:"网页嵌入",icon:w,desc:"嵌入外部网页"}],ae=({onAdd:g,onClose:d})=>{P();const[o,h]=t.useState("app"),[r,f]=t.useState(""),[s,y]=t.useState(""),[i,S]=t.useState(!1),[j,T]=t.useState(""),[v,I]=t.useState("");t.useRef(null);const p=t.useRef(!1),[M,k]=t.useState(!1),[l,W]=t.useState("clock"),[m,z]=t.useState(2),[u,A]=t.useState(2),[x,N]=t.useState("");t.useEffect(()=>{const H=setTimeout(async()=>{let b=s.trim();if(b&&!r&&!p.current&&b.match(/^https?:\/\/.+/)){k(!0),p.current=!0;try{const c=await G(b);if(c&&!r){const L=c.split(" - ")[0].split(" – ")[0].split("|")[0].trim();f(L)}}catch(c){console.warn("Failed to fetch title:",c)}finally{k(!1)}}},800);return()=>clearTimeout(H)},[s]);const F=a=>{f(a),a&&(p.current=!0)},U=()=>{let a=s.trim();a&&(a=a.replace(/。/g,"."),a.match(/^https?:\/\//i)||(a="https://"+a),y(a))},E=()=>{o==="app"?r&&s&&(g({title:r,url:s,isApp:i,type:"auto",size:{w:1,h:1},customIcon:v||j||void 0}),d()):(g({title:l.charAt(0).toUpperCase()+l.slice(1),type:"widget",widgetType:l,widgetContent:x,size:{w:m,h:u},color:"from-white to-gray-100"}),d())},n=o==="app"?r.trim()&&s.trim():!0;return e.jsxs("div",{className:"flex flex-col h-full text-white",onWheel:a=>a.stopPropagation(),onClick:a=>a.stopPropagation(),children:[e.jsx("div",{className:"p-4",style:{backgroundColor:"rgba(255, 255, 255, 0.03)"},children:e.jsxs("div",{className:"relative flex rounded-xl p-1",style:{backgroundColor:"rgba(255, 255, 255, 0.05)"},children:[e.jsx("button",{onClick:()=>h("app"),className:"relative flex-1 py-2 px-4 text-sm font-medium transition-all duration-200 rounded-lg z-10",style:{color:o==="app"?"rgba(255, 255, 255, 0.95)":"rgba(255, 255, 255, 0.5)"},children:e.jsxs("div",{className:"flex items-center justify-center gap-1.5",children:[e.jsx(Y,{size:16}),e.jsx("span",{children:"应用"})]})}),e.jsx("button",{onClick:()=>h("widget"),className:"relative flex-1 py-2 px-4 text-sm font-medium transition-all duration-200 rounded-lg z-10",style:{color:o==="widget"?"rgba(255, 255, 255, 0.95)":"rgba(255, 255, 255, 0.5)"},children:e.jsxs("div",{className:"flex items-center justify-center gap-1.5",children:[e.jsx(_,{size:16}),e.jsx("span",{children:"小组件"})]})}),e.jsx("div",{className:"absolute top-1 h-[calc(100%-8px)] rounded-lg shadow-sm transition-all duration-200 ease-out",style:{left:o==="app"?"4px":"calc(50% - 4px)",width:"calc(50% - 4px)",backgroundColor:"rgba(255, 255, 255, 0.15)"}})]})}),e.jsx("div",{className:"flex-1 overflow-y-auto apple-scrollbar relative",style:{backgroundColor:"rgba(255, 255, 255, 0.02)"},onWheel:a=>a.stopPropagation(),children:e.jsx("div",{className:"p-6 space-y-5",children:o==="app"?e.jsxs("div",{className:"space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs("label",{className:"block text-sm font-semibold px-1 flex items-center gap-2",style:{color:"rgba(255, 255, 255, 0.7)"},children:[e.jsx("span",{children:"应用名称"}),M&&e.jsx("span",{className:"inline-flex items-center",children:e.jsx(R,{className:"w-3.5 h-3.5 animate-pulse",style:{color:"#fbbf24"}})})]}),e.jsx("input",{className:"w-full px-4 py-2.5 rounded-lg outline-none transition-all",style:{backgroundColor:"rgba(255, 255, 255, 0.08)",border:"1px solid rgba(255, 255, 255, 0.1)",color:"rgba(255, 255, 255, 0.9)"},value:r,onChange:a=>F(a.target.value),placeholder:"留空将自动填充",autoFocus:!0})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"block text-sm font-semibold px-1",style:{color:"rgba(255, 255, 255, 0.7)"},children:"链接地址"}),e.jsx("input",{className:"w-full px-4 py-2.5 rounded-lg outline-none transition-all",style:{backgroundColor:"rgba(255, 255, 255, 0.08)",border:"1px solid rgba(255, 255, 255, 0.1)",color:"rgba(255, 255, 255, 0.9)"},value:s,onChange:a=>y(a.target.value),onBlur:U,placeholder:"https://example.com"})]}),s&&e.jsx("div",{className:"animate-in fade-in slide-in-from-top-2 duration-300",children:e.jsx($,{url:s,currentIcon:v||j,onSelect:I,onCustom:T})}),e.jsxs("div",{onClick:()=>S(!i),className:"flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all",style:{backgroundColor:"rgba(255, 255, 255, 0.05)",border:"1px solid rgba(255, 255, 255, 0.1)"},children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-9 h-9 rounded-lg flex items-center justify-center",style:{backgroundColor:"rgba(59, 130, 246, 0.2)",color:"#60a5fa"},children:e.jsx(w,{size:18})}),e.jsxs("div",{children:[e.jsx("div",{className:"text-sm font-medium",style:{color:"rgba(255, 255, 255, 0.9)"},children:"窗口模式"}),e.jsx("div",{className:"text-xs mt-0.5",style:{color:"rgba(255, 255, 255, 0.5)"},children:"在独立窗口中打开"})]})]}),e.jsx("div",{className:"relative w-12 h-7 rounded-full transition-all duration-200",style:{backgroundColor:i?"#34C759":"rgba(255, 255, 255, 0.2)"},children:e.jsx("div",{className:`absolute top-0.5 w-6 h-6 rounded-full shadow-md transition-all duration-200 ${i?"left-[23px]":"left-0.5"}`,style:{backgroundColor:"rgba(255, 255, 255, 0.95)"}})})]})]}):e.jsxs("div",{className:"space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"block text-sm font-semibold px-1",style:{color:"rgba(255, 255, 255, 0.7)"},children:"类型"}),e.jsx("div",{className:"grid grid-cols-5 gap-2",children:Q.map(a=>e.jsx("button",{onClick:()=>W(a.type),className:"relative p-3 rounded-lg border transition-all",style:{backgroundColor:l===a.type?"#3b82f6":"rgba(255, 255, 255, 0.05)",borderColor:l===a.type?"#3b82f6":"rgba(255, 255, 255, 0.1)",color:l===a.type?"white":"rgba(255, 255, 255, 0.7)"},children:e.jsxs("div",{className:"flex flex-col items-center gap-1.5",children:[e.jsx(a.icon,{size:20,strokeWidth:l===a.type?2.5:2}),e.jsx("span",{className:"text-[10px] font-medium leading-tight text-center",children:a.label})]})},a.type))})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"block text-sm font-semibold px-1",style:{color:"rgba(255, 255, 255, 0.7)"},children:"尺寸"}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs("div",{className:"flex items-center justify-between px-1",children:[e.jsx("span",{className:"text-xs",style:{color:"rgba(255, 255, 255, 0.6)"},children:"宽度"}),e.jsx("span",{className:"text-xs font-semibold",style:{color:"rgba(255, 255, 255, 0.9)"},children:m})]}),e.jsx("input",{type:"number",min:"1",max:"6",value:m,onChange:a=>z(Math.max(1,Math.min(6,parseInt(a.target.value)||1))),className:"w-full px-4 py-2.5 rounded-lg outline-none transition-all text-center font-medium",style:{backgroundColor:"rgba(255, 255, 255, 0.08)",border:"1px solid rgba(255, 255, 255, 0.1)",color:"rgba(255, 255, 255, 0.9)"},placeholder:"1-6"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs("div",{className:"flex items-center justify-between px-1",children:[e.jsx("span",{className:"text-xs",style:{color:"rgba(255, 255, 255, 0.6)"},children:"高度"}),e.jsx("span",{className:"text-xs font-semibold",style:{color:"rgba(255, 255, 255, 0.9)"},children:u})]}),e.jsx("input",{type:"number",min:"1",max:"6",value:u,onChange:a=>A(Math.max(1,Math.min(6,parseInt(a.target.value)||1))),className:"w-full px-4 py-2.5 rounded-lg outline-none transition-all text-center font-medium",style:{backgroundColor:"rgba(255, 255, 255, 0.08)",border:"1px solid rgba(255, 255, 255, 0.1)",color:"rgba(255, 255, 255, 0.9)"},placeholder:"1-6"})]})]})]}),(l==="custom"||l==="iframe")&&e.jsxs("div",{className:"space-y-2 animate-in fade-in slide-in-from-top-2 duration-300",children:[e.jsx("label",{className:"block text-sm font-semibold px-1",style:{color:"rgba(255, 255, 255, 0.7)"},children:l==="iframe"?"网页链接":"HTML 代码"}),l==="iframe"?e.jsx("input",{className:"w-full px-4 py-2.5 rounded-lg outline-none transition-all",style:{backgroundColor:"rgba(255, 255, 255, 0.08)",border:"1px solid rgba(255, 255, 255, 0.1)",color:"rgba(255, 255, 255, 0.9)"},value:x,onChange:a=>N(a.target.value),placeholder:"https://example.com"}):e.jsx("textarea",{className:"w-full h-32 px-4 py-3 rounded-lg outline-none transition-all font-mono text-sm resize-none",style:{backgroundColor:"rgba(255, 255, 255, 0.08)",border:"1px solid rgba(255, 255, 255, 0.1)",color:"rgba(255, 255, 255, 0.9)"},value:x,onChange:a=>N(a.target.value),placeholder:"<div class='widget'>Hello World</div>"})]})]})})}),e.jsx("div",{className:"p-4",style:{background:"linear-gradient(to top, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",borderTop:"0.5px solid rgba(255, 255, 255, 0.1)"},children:e.jsxs("div",{className:"flex gap-3",children:[e.jsx("button",{onClick:d,className:"flex-1 py-2.5 rounded-lg font-medium transition-all hover:bg-white/10 active:scale-95",style:{backgroundColor:"rgba(255, 255, 255, 0.08)",border:"1px solid rgba(255, 255, 255, 0.15)",color:"rgba(255, 255, 255, 0.8)"},children:"取消"}),e.jsx("button",{onClick:E,disabled:!n,className:"flex-1 py-2.5 rounded-lg font-semibold transition-all active:scale-95",style:{backgroundColor:n?"#007AFF":"rgba(255, 255, 255, 0.1)",color:n?"white":"rgba(255, 255, 255, 0.4)",cursor:n?"pointer":"not-allowed",boxShadow:n?"0 2px 8px rgba(0, 122, 255, 0.4)":"none"},children:"添加"})]})}),e.jsx("style",{children:`
                .apple-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .apple-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .apple-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: padding-box;
                }
                .apple-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                    background-clip: padding-box;
                }
                @keyframes slide-in-from-bottom-4 {
                    from {
                        opacity: 0;
                        transform: translateY(1rem);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes slide-in-from-top-2 {
                    from {
                        opacity: 0;
                        transform: translateY(-0.5rem);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-in {
                    animation-duration: 0.5s;
                    animation-fill-mode: both;
                }
                .fade-in {
                    animation-name: fadeIn;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .slide-in-from-bottom-4 {
                    animation-name: slide-in-from-bottom-4;
                }
                .slide-in-from-top-2 {
                    animation-name: slide-in-from-top-2;
                }
            `})]})};export{ae as AddShortcutApp};
