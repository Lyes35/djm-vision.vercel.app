
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Channel } from './types';
import { SecurityManager } from './security';
import { getChannelInsight } from './geminiService';
import { INTERNAL_PLAYLIST } from './playlist';
import IntroScreen from './IntroScreen';
import Loading from './Loading';
import { 
  Search, Tv, ShieldCheck, Play, RefreshCw, Cloud, AlertTriangle, 
  Settings, CheckCircle2, Link as LinkIcon, X, Github, Layers, Zap, Activity, Info
} from 'lucide-react';

import React, { useState, useEffect, useRef } from 'react';
import logger from './logger.client';

declare var mpegts: any;

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [channelInsight, setChannelInsight] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'done'>('idle');
  const [showConfig, setShowConfig] = useState(false);
  const [mixedContentWarning, setMixedContentWarning] = useState(false);
  const [cloudUrl, setCloudUrl] = useState(localStorage.getItem('djm_cloud_url') || "https://raw.githubusercontent.com/Lyes35/djm-vision.vercel.app/main/DJM.m3u");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  // ⚠️ Avertissement pour les développeurs : vérifier la clé GEMINI au démarrage (utile en dev local)
  useEffect(() => {
    // process.env is not available in the browser; Vite injects env vars at build time.
    // On runtime we can at least check a client-side exposed env variable if configured.
    // We check both client-injected and fallback possibilities to be robust in dev.
    const key = (process as any)?.env?.GEMINI_API_KEY ?? (window as any)?.__GEMINI_API_KEY;
    if (!key) {
      console.warn("⚠️ La variable d'environnement GEMINI_API_KEY n'est pas définie. Créez un fichier .env.local contenant GEMINI_API_KEY=... ou exportez la variable pour que /api/analyze fonctionne en local.");
    }
  }, []);

  // تحميل القنوات المدمجة فوراً عند بدء التطبيق
  useEffect(() => {
    if (!showIntro) {
      setLoading(true);
      setLoadingStep(1);
      
      // نبدأ بالقائمة المدمجة لضمان ظهور القنوات فوراً
      parseM3U(INTERNAL_PLAYLIST);
      
      // ثم نحاول المزامنة من السحابة في الخلفية
      setTimeout(() => {
        fetchCloudPlaylist();
      }, 500);
    }
  }, [showIntro]);

  const fetchCloudPlaylist = async (customUrl?: string) => {
    const urlToFetch = customUrl || cloudUrl;
    setSyncStatus('syncing');

    try {
        const response = await fetch(urlToFetch);
        if (!response.ok) throw new Error("Source unreachable");
        
        const content = await response.text();
        if (content.includes('#EXTM3U')) {
            localStorage.setItem('djm_playlist', SecurityManager.encrypt(content));
            localStorage.setItem('djm_cloud_url', urlToFetch);
            parseM3U(content);
            setSyncStatus('done');
        }
    } catch (error) {
        logger.warn("Cloud sync failed, using internal database.");
        setSyncStatus('error');
        // إذا فشل كل شيء، نتأكد أن القائمة المدمجة معروضة
        if (channels.length === 0) parseM3U(INTERNAL_PLAYLIST);
    } finally {
        setLoading(false);
    }
  };

  const parseM3U = (content: string) => {
    setLoadingStep(2);
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const parsed: Channel[] = [];
    const cats = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toUpperCase().includes('#EXTINF')) {
        const metadata = lines[i];
        // البحث عن الرابط في السطور التالية (قد يكون هناك أسطر تعليق بينها)
        let streamUrl = "";
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
            if (lines[j].startsWith('http')) {
                streamUrl = lines[j];
                break;
            }
        }
        
        if (streamUrl) {
          const nameParts = metadata.split(',');
          const name = nameParts[nameParts.length - 1]?.trim() || "قناة غير معروفة";
          
          const logoMatch = metadata.match(/tvg-logo="([^"]*)"/i);
          const groupMatch = metadata.match(/group-title="([^"]*)"/i);
          
          const group = groupMatch ? groupMatch[1] : "قنوات عامة";
          parsed.push({
            id: Math.random().toString(36).substr(2, 9),
            name: name,
            logo: logoMatch ? SecurityManager.obfuscateUrl(logoMatch[1]) : '',
            group: group,
            url: streamUrl
          });
          cats.add(group);
        }
      }
    }
    
    setChannels(parsed);
    setFilteredChannels(parsed);
    setCategories(['الكل', ...Array.from(cats)]);
  };

  const playChannel = async (channel: Channel) => {
    setCurrentChannel(channel);
    setChannelInsight('');
    setAiLoading(true);
    setMixedContentWarning(false);

    // التحقق من نوع البروتوكول (HTTP vs HTTPS)
    if (window.location.protocol === 'https:' && channel.url.startsWith('http:')) {
        setMixedContentWarning(true);
    }

    if (playerRef.current) playerRef.current.destroy();

    if (videoRef.current) {
      try {
        playerRef.current = mpegts.createPlayer({ 
            type: 'mse', 
            isLive: true, 
            url: channel.url,
            cors: true
        });
        playerRef.current.attachMediaElement(videoRef.current);
        playerRef.current.load();
        playerRef.current.play().catch(() => {
            if (videoRef.current) videoRef.current.muted = true;
            playerRef.current.play();
        });
      } catch (e) { 
          logger.error("Stream Error", e);
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    const insight = await getChannelInsight(channel.name);
    setChannelInsight(insight);
    setAiLoading(false);
  };

  if (showIntro) return <IntroScreen onComplete={() => setShowIntro(false)} />;

  return (
    <div className="min-h-screen bg-[#020406] text-white font-['Cairo'] dir-rtl pb-12 selection:bg-cyan-500/30">
      
      {/* Settings Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#0a0d14] border border-white/10 rounded-[2.5rem] w-full max-w-xl p-10 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
                <button onClick={() => setShowConfig(false)} className="absolute top-6 left-6 text-gray-500 hover:text-white transition-colors p-2"><X /></button>
                
                <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
                        <Settings className="text-cyan-500 w-9 h-9 animate-[spin_8s_linear_infinite]" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white">إعدادات سحابة DJM</h2>
                        <p className="text-gray-500 text-sm font-bold">تخصيص مصادر البث الذكي</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest px-1">رابط المصدر المباشر</label>
                        <div className="relative group">
                            <LinkIcon className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-cyan-500 transition-colors" />
                            <input 
                                type="text" 
                                value={cloudUrl}
                                onChange={(e) => setCloudUrl(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pr-14 pl-5 outline-none focus:border-cyan-500/50 transition-all font-mono text-xs text-cyan-100/70"
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold px-1 italic">ملاحظة: إذا تعذر الوصول للرابط، سيستخدم التطبيق القائمة المدمجة (500+ قناة).</p>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <button 
                            onClick={() => fetchCloudPlaylist()}
                            className="bg-cyan-600 text-black font-black py-4 rounded-2xl hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/10 flex items-center justify-center gap-3 active:scale-95"
                        >
                            <RefreshCw className={`w-5 h-5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                            مزامنة الآن
                        </button>
                        <button 
                            onClick={() => {
                                setCloudUrl("https://raw.githubusercontent.com/Lyes35/djm-vision.vercel.app/main/DJM.m3u");
                                fetchCloudPlaylist("https://raw.githubusercontent.com/Lyes35/djm-vision.vercel.app/main/DJM.m3u");
                            }}
                            className="bg-white/5 text-gray-400 font-bold py-4 rounded-2xl hover:bg-white/10 transition-all border border-white/10"
                        >
                            إعادة ضبط المصدر
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#05070a]/90 backdrop-blur-2xl border-b border-white/5 px-6 md:px-12 py-5 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-all duration-500">
            <Tv className="text-white font-bold w-7 h-7" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-2xl font-black tracking-tighter text-white">DJM <span className="text-cyan-400">VISION</span></h1>
            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'done' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></div>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    {syncStatus === 'done' ? 'Cloud Connected' : 'Local Engine Active'}
                </span>
            </div>
          </div>
        </div>

        <div className="relative flex-1 max-w-xl mx-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="بحث في القنوات (بي إن، أو إس إن، إم بي سي...)" 
            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 outline-none focus:border-cyan-500/40 transition-all text-sm font-bold placeholder:text-gray-600"
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                const val = e.target.value.toLowerCase();
                setFilteredChannels(channels.filter(c => c.name.toLowerCase().includes(val) || c.group.toLowerCase().includes(val)));
            }}
          />
        </div>

        <button onClick={() => setShowConfig(true)} className="p-3.5 bg-white/5 text-gray-400 rounded-2xl hover:bg-cyan-500/10 hover:text-cyan-400 transition-all border border-white/5 group">
            <Layers className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </button>
      </header>

      <main className="pt-32 px-6 md:px-12 max-w-[1600px] mx-auto">
        {loading ? (
          <Loading status="جاري تشغيل محرك Lyes35..." step={loadingStep} facts={["يتم استدعاء القنوات من الذاكرة المشفرة", "تجهيز خادم البث عالي الجودة", "تفعيل الذكاء الاصطناعي للمعاينة"]} />
        ) : (
          <>
            {/* Mixed Content Warning Alert */}
            {mixedContentWarning && (
                <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2 duration-500">
                    <AlertTriangle className="text-amber-500 w-6 h-6 shrink-0" />
                    <div className="text-xs font-bold text-amber-200/80">
                        <p>تنبيه أمني: القناة تستخدم بروتوكول HTTP. إذا لم يعمل البث، يرجى تفعيل "المحتوى غير الآمن" من إعدادات المتصفح (أيقونة القفل بجانب الرابط).</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 mb-16">
              {/* Player Area */}
              <div className="lg:col-span-3 space-y-6">
                <div className="aspect-video bg-black rounded-[3.5rem] overflow-hidden border border-white/10 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] relative ring-1 ring-white/5 group">
                  <video ref={videoRef} controls className="w-full h-full object-contain" />
                  {!currentChannel && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#020406] px-8 text-center">
                       <div className="w-32 h-32 bg-cyan-500/5 rounded-full flex items-center justify-center mb-10 border border-cyan-500/10 animate-pulse">
                         <Zap className="w-16 h-16 text-cyan-500/40" />
                       </div>
                       <h3 className="text-4xl font-black mb-4 text-white uppercase tracking-tighter">نظام DJM جاهز</h3>
                       <p className="text-gray-500 max-w-sm font-bold text-base leading-relaxed">تم تحميل {channels.length} قناة بنجاح. اختر قناتك المفضلة واستمتع بمشاهدة احترافية.</p>
                       <div className="mt-8 flex gap-4">
                           <button onClick={() => setActiveCategory('الكل')} className="px-10 py-4 bg-cyan-600 text-black font-black rounded-2xl hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-600/20">تصفح الكل</button>
                           <button onClick={() => setShowConfig(true)} className="px-10 py-4 bg-white/5 text-gray-400 font-black rounded-2xl hover:bg-white/10 border border-white/10 transition-all">الإعدادات</button>
                       </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-8 bg-[#0a0d14] rounded-[2.5rem] border border-white/5 shadow-lg">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                        <Activity className="text-cyan-500 w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white">{currentChannel?.name || "جاري انتظار اختيار القناة"}</h2>
                        <div className="flex items-center gap-3 mt-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <p className="text-gray-500 text-[11px] font-black uppercase tracking-widest">تشفير البث: نشط وآمن</p>
                        </div>
                    </div>
                  </div>
                  {currentChannel && (
                      <div className="mt-4 sm:mt-0 flex gap-3">
                          <div className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                             <span className="text-emerald-500 text-[10px] font-black uppercase tracking-tighter">Live Streaming</span>
                          </div>
                          <button onClick={() => playChannel(currentChannel)} className="p-3 bg-white/5 text-gray-400 rounded-xl hover:text-cyan-400 border border-white/5 transition-all"><RefreshCw className="w-5 h-5" /></button>
                      </div>
                  )}
                </div>
              </div>

              {/* Sidebar / AI Insight */}
              <div className="space-y-8">
                <div className="bg-[#0a0d14] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group min-h-[300px] flex flex-col">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl transition-opacity group-hover:opacity-100 opacity-50"></div>
                    <div className="flex items-center gap-3 mb-8 text-cyan-400">
                        <Zap className="w-6 h-6 fill-current" />
                        <h3 className="font-black text-sm uppercase tracking-[0.2em]">تحليل القناة (AI)</h3>
                    </div>
                    <div className="flex-1 flex items-center justify-center bg-black/40 rounded-3xl p-8 border border-white/5 backdrop-blur-xl">
                    {aiLoading ? (
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest animate-pulse">Scanning Signal...</span>
                        </div>
                    ) : (
                        <p className="text-gray-300 text-sm leading-relaxed text-center font-bold italic opacity-80">
                        {channelInsight || "المحرك الذكي مستعد لتحليل أي قناة تقوم بتشغيلها حالياً."}
                        </p>
                    )}
                    </div>
                    <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                        <Info className="w-4 h-4 text-cyan-500" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Powered by Gemini 3.5</span>
                    </div>
                </div>

                <div className="p-8 bg-gradient-to-br from-indigo-700 to-blue-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <h4 className="text-white font-black text-xl mb-1">PRO SERVER</h4>
                        <p className="text-cyan-100 text-[10px] font-bold opacity-70 uppercase tracking-widest">Active Core: {channels.length} Nodes</p>
                        <div className="mt-8 flex -space-x-2 rtl:space-x-reverse">
                           {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0d14] bg-white/10 flex items-center justify-center text-[10px] font-black text-white/50">{i}</div>)}
                        </div>
                    </div>
                    <Github className="absolute -bottom-8 -right-8 w-40 h-40 text-white/5 group-hover:scale-110 transition-transform duration-1000 rotate-12" />
                </div>
              </div>
            </div>

            {/* Categories */}
            {channels.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-12 no-scrollbar scroll-smooth">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => {
                            setActiveCategory(cat);
                            setFilteredChannels(cat === 'الكل' ? channels : channels.filter(c => c.group === cat));
                        }}
                        className={`px-10 py-4.5 rounded-[1.5rem] text-[12px] font-black transition-all whitespace-nowrap border-2 ${
                            activeCategory === cat 
                            ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_15px_40px_-10px_rgba(6,182,212,0.5)] scale-105' 
                            : 'bg-[#0a0d14] text-gray-400 border-white/5 hover:border-cyan-500/30'
                        }`}
                    >
                    {cat}
                    </button>
                ))}
                </div>
            )}

            {/* Channels Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                {filteredChannels.length > 0 ? filteredChannels.slice(0, 1000).map(channel => (
                <div key={channel.id} onClick={() => playChannel(channel)} className="group cursor-pointer">
                    <div className={`aspect-[4/3] bg-[#0a0d14] rounded-[2.5rem] border overflow-hidden transition-all duration-500 shadow-xl relative ring-1 ring-white/5 ${currentChannel?.id === channel.id ? 'border-cyan-500 ring-cyan-500/30' : 'border-white/5 group-hover:border-cyan-500/40'}`}>
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#10141d] to-[#050608] p-8">
                           {channel.logo ? (
                               <img src={channel.logo} alt={channel.name} loading="lazy" className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700" onError={(e) => (e.currentTarget.style.display = 'none')} />
                           ) : (
                               <Zap className={`w-12 h-12 transition-colors ${currentChannel?.id === channel.id ? 'text-cyan-500' : 'text-white/5 group-hover:text-cyan-500/20'}`} />
                           )}
                        </div>
                        <div className={`absolute inset-0 bg-black/60 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px] ${currentChannel?.id === channel.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <div className={`w-14 h-14 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-transform duration-500 ${currentChannel?.id === channel.id ? 'scale-110' : 'scale-50 group-hover:scale-100'}`}>
                                <Play className="text-black fill-current w-6 h-6" />
                            </div>
                        </div>
                    </div>
                    <h4 className={`mt-5 text-[12px] font-black text-center transition-colors line-clamp-1 uppercase tracking-tighter px-2 ${currentChannel?.id === channel.id ? 'text-cyan-400' : 'text-gray-500 group-hover:text-cyan-400'}`}>{channel.name}</h4>
                </div>
                )) : (
                    <div className="col-span-full py-40 text-center flex flex-col items-center">
                        <div className="p-10 bg-white/5 rounded-full mb-10 border border-white/5 shadow-inner">
                            <AlertTriangle className="w-20 h-20 text-amber-500/20" />
                        </div>
                        <p className="font-black text-3xl text-gray-700">لا تتوفر نتائج لهذا البحث</p>
                        <button onClick={() => { setSearchTerm(''); setFilteredChannels(channels); }} className="mt-8 text-cyan-500 font-black hover:text-cyan-400 flex items-center gap-2">عرض جميع القنوات <RefreshCw className="w-4 h-4" /></button>
                    </div>
                )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-40 border-t border-white/5 py-24 px-12 bg-[#05070a] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-gray-600">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 hover:border-cyan-500/20 transition-colors">
                    <Github className="w-8 h-8" />
                 </div>
                 <div>
                    <p className="text-sm font-black text-white uppercase tracking-widest">Lyes35 Vision Cloud Core</p>
                    <p className="text-[10px] font-bold opacity-40 truncate max-w-[350px] mt-1.5 font-mono">{cloudUrl}</p>
                 </div>
              </div>
              <div className="flex flex-col items-center md:items-end text-center md:text-right">
                <p className="text-[11px] font-black tracking-[0.4em] uppercase text-cyan-500/30 mb-3">AI Powered Streaming • Ultimate Security • v3.5.8</p>
                <p className="text-[11px] font-bold opacity-20 italic">جميع الحقوق محفوظة © 2025 - مطور بواسطة فريق DJM PRO</p>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default App;
