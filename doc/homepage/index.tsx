import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { 
  Download, Cpu, LayoutGrid, Zap, Shield, Globe, Maximize2, Terminal, Sparkles, Layers, 
  MousePointer2, Command, ArrowRight, Check, Play, Loader2, ExternalLink, RotateCw, 
  MonitorPlay, Bot, X, Lock, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';

// --- 0. 品牌图标 (SVG Assets) ---

const ChromeIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.954 5.954 0 0 1 12 6.001h9.368A12.003 12.003 0 0 0 12 0Z" />
    <path d="M12 6.001a5.954 5.954 0 0 0-3.321 1.652L2.632 4.501C1.047 6.55.152 9.074.004 11.777c-.147 2.703.567 5.297 2.01 7.456l5.044-8.737A5.962 5.962 0 0 1 12 6.001Z" />
    <path d="M12 18.001a5.962 5.962 0 0 0 5.378-3.056l5.044 8.737c-2.126 1.258-4.576 1.919-7.068 1.919-2.73 0-5.32-.78-7.55-2.25l3.953-6.848a5.972 5.972 0 0 0 .243 1.498Z" />
    <path d="M15.378 14.945A5.962 5.962 0 0 0 18 12.001a5.954 5.954 0 0 0-.243-1.498L13.804 3.655l3.953 6.848a12.002 12.002 0 0 1-.379 4.442Z" />
    <circle cx="12" cy="12" r="3.5" />
  </svg>
);

const EdgeIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M.485 10.865c-.015.347-.024.707-.024 1.077C.461 17.65 4.562 23.36 10.38 23.36c4.01 0 7.371-2.032 9.356-4.908.083-.122.03-.306-.115-.365-2.434-.98-4.226-2.91-4.706-5.467-.023-.118-.112-.218-.23-.228a6.34 6.34 0 0 0-.825-.035c-3.153 0-5.32 2.37-5.32 5.093 0 .74.153 1.346.368 1.838.077.177-.11.365-.285.259-3.237-1.937-4.912-4.98-4.823-8.682ZM11.455 1.05c-3.793 0-7.373 1.944-8.86 5.397-.074.17.07.357.247.312 2.115-.55 4.354-.265 6.273 1.002.102.067.236.035.297-.071a6.65 6.65 0 0 1 2.383-2.31c.108-.06.126-.208.033-.292C11.328 4.636 10.5 3.965 10.5 2.768c0-.77.29-1.282.68-1.574.075-.056.05-.173-.042-.186A6.24 6.24 0 0 0 11.454 1.05Zm9.262 5.07c-1.92-2.73-4.94-4.522-7.85-5.074-.15-.029-.247.135-.145.247.96 1.052 1.58 2.685 1.58 4.385 0 3.394-2.583 6.745-6.852 7.828-.13.033-.174.2-.07.288 1.854 1.575 4.567 1.99 7.357 1.258 2.924-.768 5.485-3.085 6.264-6.52.038-.168-.108-.31-.284-.412Z" />
  </svg>
);

// --- 1. 高级 UI 组件 ---

// 3D 倾斜容器 (通用版)
const TiltContainer = ({ children, className = "", maxRotate = 5 }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [maxRotate, -maxRotate]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-maxRotate, maxRotate]);

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative perspective-1000 ${className}`}
    >
      {children}
    </motion.div>
  );
};

// 流光边框按钮
const BorderBeamButton = ({ children, onClick, primary, icon: Icon }) => (
  <button 
    onClick={onClick}
    className={`relative group overflow-hidden rounded-full p-[1px] focus:outline-none transition-transform active:scale-95`}
  >
    <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#3B82F6_50%,#E2E8F0_100%)]" />
    <span className={`inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full px-8 py-4 text-sm font-medium backdrop-blur-3xl transition-all gap-2 ${
        primary 
        ? 'bg-slate-900 text-white hover:bg-slate-800' 
        : 'bg-white text-slate-900 hover:bg-slate-50'
    }`}>
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </span>
  </button>
);

// 模拟代码窗口
const CodeWindow = ({ title, children, className = "" }) => (
  <div className={`bg-slate-950/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col ${className}`}>
    <div className="h-8 bg-white/5 border-b border-white/5 flex items-center px-3 space-x-2">
      <div className="flex space-x-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
      </div>
      <div className="flex-1 text-center text-[10px] text-slate-400 font-mono tracking-wide">{title}</div>
      <div className="w-10"></div>
    </div>
    <div className="flex-1 overflow-hidden relative">
      {children}
    </div>
  </div>
);

// --- 2. 页面部分 ---

const Header = () => (
  <motion.header 
    initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }}
    className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-white/10 backdrop-blur-md border-b border-white/20"
  >
    <div className="flex items-center gap-2 font-bold text-xl tracking-tighter text-slate-900 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
      <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-black rounded-lg flex items-center justify-center shadow-lg text-white">
        <LayoutGrid className="w-5 h-5" />
      </div>
      GrassTab
    </div>
    <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
      <a href="#ai-demo" className="hover:text-black transition-colors">AI 智能</a>
      <a href="#showcase" onClick={(e) => { e.preventDefault(); document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' }) }} className="hover:text-black transition-colors cursor-pointer">
        <span className="relative">
          实时体验
          <span className="absolute -top-1 -right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </span>
      </a>
    </nav>
    <div className="hidden sm:flex gap-3">
        <button className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">登录</button>
        <button className="px-4 py-2 text-xs font-bold bg-black text-white rounded-full hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">免费安装</button>
    </div>
  </motion.header>
);

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // 下载按钮状态
  const [chromeBtnText, setChromeBtnText] = useState("添加至 Chrome");
  const [edgeBtnText, setEdgeBtnText] = useState("添加至 Edge");

  const handleChromeClick = () => setChromeBtnText("提交审核中，敬请期待");
  const handleEdgeClick = () => setEdgeBtnText("提交审核中，敬请期待");

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-50 pt-20">
      {/* 动态网格背景 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
      
      {/* 极光效果 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full mix-blend-multiply opacity-50 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-purple-500/20 blur-[120px] rounded-full mix-blend-multiply opacity-50"></div>

      <div className="container relative z-10 px-4 text-center mt-[-5vh]">
        <motion.div 
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-white/60 text-slate-600 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm shadow-sm"
        >
          <Sparkles className="w-3 h-3 text-yellow-500" />
          <span>v1.0 震撼发布</span>
        </motion.div>

        <motion.h1 
          style={{ opacity }}
          className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-slate-900 via-slate-800 to-slate-500 tracking-tighter mb-6 leading-[1.1] md:leading-[1]"
        >
          重塑你的 <br />
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">数字桌面。</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-lg md:text-2xl text-slate-500 max-w-2xl mx-auto mb-10 font-medium leading-relaxed"
        >
          GrassTab 不仅仅是一个新标签页。<br/>
          它是基于 <strong>React</strong> 构建的窗口化操作系统，集成了 <strong>AI 助手</strong> 与 <strong>极速网格引擎</strong>。
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <BorderBeamButton 
            primary 
            icon={chromeBtnText.includes("提交") ? null : ChromeIcon}
            onClick={handleChromeClick}
          >
            {chromeBtnText}
          </BorderBeamButton>
          <BorderBeamButton 
            icon={edgeBtnText.includes("提交") ? null : EdgeIcon}
            onClick={handleEdgeClick}
          >
            {edgeBtnText}
          </BorderBeamButton>
        </motion.div>
      </div>

      {/* 3D 悬浮组件展示 */}
      <motion.div style={{ y: y1 }} className="absolute -bottom-[20%] w-full h-[60vh] z-0 pointer-events-none">
         <div className="relative w-full h-full max-w-6xl mx-auto">
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-0 left-[10%] p-4 bg-white rounded-2xl shadow-2xl border border-white/50">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center text-white">
                    <Bot className="w-8 h-8" />
                </div>
            </motion.div>
            <motion.div animate={{ y: [0, 30, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} className="absolute top-[20%] right-[15%] p-4 bg-white rounded-2xl shadow-2xl border border-white/50">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center text-white">
                    <Zap className="w-8 h-8" />
                </div>
            </motion.div>
         </div>
      </motion.div>
    </section>
  );
};

// --- 3. AI 演示部分 ---

const AIDemo = () => {
    const [text, setText] = useState("");
    const fullText = "我想知道如何优化我的工作流？\n\nGrassTab 的窗口化设计允许你并行处理多个任务。你可以将'日历'放在左侧，'待办事项'固定在右侧，并通过 AI 助手快速检索信息。";
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setIsTyping(true);
            }
        });
        const el = document.getElementById("ai-demo-trigger");
        if (el) observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isTyping) return;
        if (text.length < fullText.length) {
            const timeout = setTimeout(() => {
                setText(fullText.slice(0, text.length + 1));
            }, 50);
            return () => clearTimeout(timeout);
        }
    }, [text, isTyping]);

    return (
        <section id="ai-demo" className="py-32 bg-slate-900 text-white relative overflow-hidden">
            <div id="ai-demo-trigger" className="absolute top-1/2 left-0 w-1 h-1" />
            
            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                <div className="relative z-10">
                    <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                        <div className="flex items-center gap-2 text-blue-400 font-mono mb-4">
                            <Bot className="w-5 h-5" />
                            <span>Artificial Intelligence</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            不仅是标签页。<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">它是你的第二大脑。</span>
                        </h2>
                        <p className="text-slate-400 text-lg mb-8">
                            深度集成的 AI 助手 (基于强大的自定义模型)，随时待命。选中文字即可翻译、总结，或者让它帮你写代码。
                        </p>
                    </motion.div>
                </div>

                {/* AI 终端窗口 */}
                <TiltContainer className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                    <CodeWindow title="Grass AI Chat" className="h-[400px]">
                        <div className="p-6 font-mono text-sm h-full flex flex-col text-slate-300">
                            <div className="flex gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                                    <span className="text-xs text-white">You</span>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-lg rounded-tl-none border border-white/5">
                                    如何提高效率？
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg text-white">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="flex-1 bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg rounded-tl-none">
                                    <p className="whitespace-pre-wrap leading-relaxed">
                                        {text}
                                        <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse align-middle" />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CodeWindow>
                </TiltContainer>
            </div>
        </section>
    );
};

// --- 4. 沉浸式滚动放大预览 (Immersive Scroll Zoom) ---

const InteractivePreview = () => {
    const [isLoading, setIsLoading] = useState(true);
    const iframeRef = useRef(null);
    const containerRef = useRef(null);

    // 滚动驱动的动画配置
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end end"] // 从进入视口开始计算
    });

    // 动画映射 (调整为保留边框的效果)：
    // 宽度: 70vw -> 95vw (不完全占满)
    const width = useTransform(scrollYProgress, [0.1, 0.5], ["70vw", "95vw"]);
    // 高度: 65vh -> 92vh (留出一点缝隙)
    const height = useTransform(scrollYProgress, [0.1, 0.5], ["65vh", "92vh"]);
    
    // 阴影和边框：保持不透明，保留窗口质感
    const shadowOpacity = 0.3;
    const borderOpacity = 1;

    // 文字提示淡出
    const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const textY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

    const reloadIframe = () => {
        setIsLoading(true);
        if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src;
        }
    };

    return (
        // 高度设置为 300vh，给予足够的滚动行程
        <section ref={containerRef} id="showcase" className="relative h-[300vh] bg-slate-50">
             
             {/* Sticky 容器：保持内容在屏幕中心 */}
             <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
                
                {/* 标题文案 (随滚动淡出) */}
                <motion.div 
                    style={{ opacity: textOpacity, y: textY }}
                    className="absolute top-10 md:top-20 z-10 text-center px-4"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-bold mb-6 shadow-sm">
                        <MonitorPlay className="w-4 h-4 text-blue-500" />
                        <span>无需安装，即刻体验</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tighter mb-4">
                        不仅仅是演示。
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">这是真实的云端桌面。</span>
                    </h2>
                    <p className="text-slate-500 text-lg">向下滚动，沉浸式体验 &darr;</p>
                </motion.div>

                {/* 动态放大的容器 */}
                <motion.div 
                    style={{ 
                        width, 
                        height, 
                        borderRadius: 24, // 始终保留圆角
                        boxShadow: useMotionTemplate`0 50px 100px -20px rgba(50, 50, 93, ${shadowOpacity})`,
                        borderColor: useMotionTemplate`rgba(226, 232, 240, ${borderOpacity})`
                    }}
                    className="relative bg-white border border-slate-200 overflow-hidden ring-1 ring-black/5 z-20 transition-colors duration-300"
                >
                    {/* 浏览器高级工具栏 */}
                    <div className="flex-none h-14 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center px-6 gap-6 z-20 relative">
                        {/* 窗口控制按钮 */}
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] shadow-sm" />
                            <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24] shadow-sm" />
                            <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] shadow-sm" />
                        </div>
                        
                        {/* 导航按钮 */}
                        <div className="flex gap-2 text-slate-400">
                            <button className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                            <button className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"><ChevronRight className="w-4 h-4" /></button>
                            <button onClick={reloadIframe} className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"><RotateCw className="w-4 h-4" /></button>
                        </div>

                        {/* 地址栏 */}
                        <div className="flex-1 flex justify-center">
                            <div className="h-9 w-full max-w-2xl bg-slate-100/50 hover:bg-slate-100 transition-colors rounded-lg border border-slate-200 flex items-center justify-between px-3 text-sm text-slate-500 font-medium group-focus-within:border-blue-400 group-focus-within:ring-2 group-focus-within:ring-blue-100">
                                <div className="flex items-center gap-2 flex-1">
                                    <Lock className="w-3.5 h-3.5 text-green-500" />
                                    <span className="truncate">moduqishi.github.io/grasstab</span>
                                </div>
                                <a 
                                    href="https://moduqishi.github.io/grasstab/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:bg-blue-50 p-1 rounded transition-colors"
                                    title="在新窗口打开"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>
                        
                        {/* 右侧占位 */}
                        <div className="w-16" />
                    </div>

                    {/* 内容区域 (Iframe) */}
                    <div className="flex-1 relative w-full h-[calc(100%-3.5rem)] overflow-hidden bg-slate-50">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 border-4 border-blue-100 rounded-full" />
                                        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
                                    </div>
                                    <span className="text-slate-500 text-sm font-medium animate-pulse">正在建立安全连接...</span>
                                </div>
                            </div>
                        )}
                        
                        <iframe 
                            ref={iframeRef}
                            src="https://moduqishi.github.io/grasstab/"
                            className="w-full h-full border-0 bg-transparent"
                            title="GrassTab Live Preview"
                            onLoad={() => setIsLoading(false)}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        />
                        
                        {/* 反光效果层 (仅在未全屏时明显) */}
                        <motion.div 
                            style={{ opacity: useTransform(scrollYProgress, [0.4, 0.5], [1, 0]) }}
                            className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" 
                        />
                    </div>
                </motion.div>
             </div>
        </section>
    )
}

// --- 5. 页脚 ---

const Footer = () => {
  const [chromeBtnText, setChromeBtnText] = useState("Chrome 下载");
  const [edgeBtnText, setEdgeBtnText] = useState("Edge 下载");

  const handleChromeClick = () => setChromeBtnText("提交审核中，敬请期待");
  const handleEdgeClick = () => setEdgeBtnText("提交审核中，敬请期待");

  return (
    <footer className="bg-slate-50 pt-32 pb-10 border-t border-slate-200">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-20">
          <h2 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tighter mb-8">
            你的浏览器，<br/>值得更好的。
          </h2>
          <p className="text-slate-500 text-xl max-w-xl mx-auto mb-10 font-medium">
            加入数千名极客用户的行列。<br/>开源，免费，注重隐私。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                  onClick={handleChromeClick}
                  className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 hover:scale-105 transition-all shadow-xl shadow-slate-900/20"
              >
                  {!chromeBtnText.includes("提交") && <ChromeIcon className="w-5 h-5 text-white" />}
                  {chromeBtnText}
              </button>
              <button 
                  onClick={handleEdgeClick}
                  className="flex items-center justify-center gap-2 bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 hover:scale-105 transition-all shadow-sm"
              >
                  {!edgeBtnText.includes("提交") && <EdgeIcon className="w-5 h-5 text-slate-900" />}
                  {edgeBtnText}
              </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm mt-20 pt-10 border-t border-slate-200">
          <p>© 2025 ModuQishi. Open Source (MIT License).</p>
          <div className="flex gap-8 mt-4 md:mt-0 font-medium">
            <a href="https://github.com/moduqishi/grasstab" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">GitHub</a>
            <a href="https://moduqishi.github.io/grasstab/privacy.html" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">隐私政策</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Twitter</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Discord</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- 6. 主程序 ---

const GrassTabLanding = () => {
  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      <style>{`
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
      <Header />
      <Hero />
      <AIDemo />
      <InteractivePreview />
      <Footer />
    </div>
  );
};

export default GrassTabLanding;