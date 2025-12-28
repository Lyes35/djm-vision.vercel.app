/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { Play, FileBarChart, Globe } from 'lucide-react';

interface IntroScreenProps {
  onComplete: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0); 
  // 0: Spinning Globe
  // 1: Data Extraction (Strands pulling out)
  // 2: Convergence (Forming graphic)
  // 3: Ready State

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase(1), 1200); // Start extraction
    const timer2 = setTimeout(() => setPhase(2), 4000); // Start formation
    const timer3 = setTimeout(() => setPhase(3), 5500); // Show UI

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleEnter = () => {
    onComplete();
  };

  const strands = Array.from({ length: 12 });
  const particles = Array.from({ length: 20 });

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-display">
      <style>{`
        @keyframes globe-spin {
          0% { transform: rotateY(0deg) rotateX(20deg); }
          100% { transform: rotateY(360deg) rotateX(20deg); }
        }
        @keyframes data-extract {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-150px) scale(1); opacity: 0; }
        }
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes spin-slow {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .will-change-transform { will-change: transform, opacity; }
      `}</style>

      {/* Background FX */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-black"></div>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}></div>

      {/* Scaled container for mobile */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center perspective-1000">
        
        {/* PHASE 0 & 1: THE GLOBE */}
        <div className={`relative w-40 h-40 md:w-48 md:h-48 transition-all duration-1000 preserve-3d ${phase >= 2 ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
          {/* Wireframe Sphere */}
          <div className="absolute inset-0 border border-cyan-500/30 rounded-full animate-[globe-spin_10s_linear_infinite]"></div>
          <div className="absolute inset-0 border border-dashed border-cyan-400/20 rounded-full animate-[globe-spin_15s_linear_infinite_reverse]" style={{ width: '120%', height: '120%', left: '-10%', top: '-10%' }}></div>
          
          {/* Lat/Long Rings */}
          {[0, 45, 90, 135].map((deg) => (
             <div key={deg} className="absolute inset-0 border border-indigo-500/20 rounded-full" style={{ transform: `rotateY(${deg}deg)` }}></div>
          ))}
          
          {/* Glowing Core */}
          <div className="absolute inset-0 bg-cyan-500/10 blur-xl rounded-full animate-pulse"></div>

          {/* PHASE 1: DATA EXTRACTION STRANDS */}
          {phase === 1 && strands.map((_, i) => (
            <div 
              key={i} 
              className="absolute left-1/2 top-1/2 w-0 h-0"
              style={{
                transform: `rotate(${i * (360 / strands.length)}deg)`,
              }}
            >
               <div 
                 className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_10px_cyan]"
                 style={{
                    left: '-2px',
                    top: '-2px',
                    animation: `data-extract 2s ease-out infinite ${i * 0.1}s`,
                 }}
               >
                 <div className="w-[1px] h-24 bg-gradient-to-t from-cyan-500 to-transparent absolute bottom-0 left-1/2 -translate-x-1/2"></div>
               </div>
            </div>
          ))}
        </div>

        {/* PHASE 2 & 3: THE GRAPHIC */}
        <div className={`absolute flex items-center justify-center transition-all duration-1000 ease-out will-change-transform ${phase >= 2 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
           
           {/* The Graphic Card */}
           <div className="relative w-32 h-48 md:w-40 md:h-56 bg-black border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden flex flex-col items-center pt-6 md:pt-8 gap-3 group">
              {/* Scan Line */}
              <div className="absolute w-full h-1 bg-cyan-400/50 blur-[2px] animate-[scan-line_3s_linear_infinite]"></div>
              
              {/* Holographic Grid Background */}
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(6,182,212,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.2)_1px,transparent_1px)] bg-[size:10px_10px]"></div>

              {/* Icon Content */}
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg relative z-10">
                  <FileBarChart className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>

              {/* Data Lines */}
              <div className="w-20 md:w-24 space-y-2 relative z-10">
                  <div className="h-1 w-full bg-slate-800 rounded overflow-hidden"><div className="h-full bg-cyan-500 w-3/4 animate-pulse"></div></div>
                  <div className="h-1 w-full bg-slate-800 rounded overflow-hidden"><div className="h-full bg-indigo-500 w-1/2 animate-pulse delay-75"></div></div>
                  <div className="h-1 w-full bg-slate-800 rounded overflow-hidden"><div className="h-full bg-purple-500 w-5/6 animate-pulse delay-150"></div></div>
              </div>
              
              {/* Floating Orbiting Elements */}
              <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 w-full h-full animate-[spin-slow_10s_linear_infinite]">
                      <div className="absolute top-0 left-1/2 w-2 h-2 bg-amber-400 rounded-full blur-[1px] shadow-lg -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
              </div>
           </div>

           {/* Connection Nodes around the graphic */}
           {phase >= 2 && particles.map((_, i) => {
             const angle = (i / particles.length) * 360;
             // Responsive radius calculation done in CSS/JS combo
             // Using a smaller base radius for mobile in the style calculation
             const isSmall = window.innerWidth < 768;
             const radius = isSmall ? 110 : 140;
             const x = Math.cos(angle * (Math.PI / 180)) * radius;
             const y = Math.sin(angle * (Math.PI / 180)) * radius;
             
             return (
                <div 
                    key={i}
                    className="absolute w-1 h-1 bg-cyan-400 rounded-full transition-all duration-1000 delay-500"
                    style={{ 
                        transform: `translate(${x}px, ${y}px)`,
                        opacity: phase === 3 ? 0.5 : 0 
                    }}
                >
                    {/* Connecting lines back to center */}
                    <div 
                        className={`absolute h-[1px] bg-cyan-800/30 origin-right transition-all`}
                        style={{ 
                            width: `${radius}px`,
                            right: '50%', 
                            top: '50%', 
                            transform: `rotate(${angle + 180}deg)` 
                        }}
                    />
                </div>
             );
           })}

        </div>
      </div>

      {/* PHASE 3: UI REVEAL */}
      <div className={`absolute bottom-16 md:bottom-20 flex flex-col items-center transition-all duration-1000 px-6 ${phase === 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
         <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight text-center">
            InfoGenius <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-400">Vision</span>
         </h1>
         
         <div className="flex flex-col items-center gap-3 mb-8 text-center">
            <p className="text-slate-400 text-xs md:text-sm uppercase tracking-[0.3em]">Knowledge. Visualized.</p>
            
            {/* Google Search Grounding Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 backdrop-blur-md animate-in fade-in zoom-in duration-1000 delay-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span className="text-[9px] md:text-[10px] font-bold text-cyan-100 uppercase tracking-wider">Now with Google Search Grounding</span>
            </div>
         </div>
         
         <button 
            onClick={handleEnter}
            className="group relative px-8 py-3 bg-transparent overflow-hidden rounded-full"
         >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-600 to-blue-600 opacity-20 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 border border-cyan-500/50 rounded-full group-hover:border-cyan-400 transition-colors"></div>
            
            <div className="relative flex items-center gap-3">
                <span className="text-cyan-300 group-hover:text-white font-bold tracking-widest text-sm transition-colors">INITIALIZE SYSTEM</span>
                <Play className="w-4 h-4 text-cyan-300 group-hover:text-white fill-current transition-colors" />
            </div>
         </button>
      </div>

      {/* Skip Button (Visible always for UX) */}
      <button 
        onClick={onComplete}
        className="absolute top-6 right-6 md:top-8 md:right-8 text-[10px] md:text-xs text-slate-600 hover:text-white transition-colors uppercase tracking-widest border border-transparent hover:border-white/10 px-3 py-1 rounded-full"
      >
        Skip Intro
      </button>

    </div>
  );
};

export default IntroScreen;