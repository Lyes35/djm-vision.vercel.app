/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { Download, Sparkles, Edit3, Maximize2, X, ZoomIn, ZoomOut, RefreshCcw } from 'lucide-react';

interface InfographicProps {
  image: GeneratedImage;
  onEdit: (prompt: string) => void;
  isEditing: boolean;
}

const Infographic: React.FC<InfographicProps> = ({ image, onEdit, isEditing }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPrompt.trim()) return;
    onEdit(editPrompt);
    setEditPrompt('');
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
    setZoomLevel(1);
  }

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto animate-in fade-in zoom-in duration-700 mt-8">
      
      {/* Image Container */}
      <div className="relative group w-full bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700/50">
        {/* Decorative Corner Markers */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-2xl z-20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-2xl z-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-2xl z-20 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-500/30 rounded-br-2xl z-20 pointer-events-none"></div>

        <img 
          src={image.data} 
          alt={image.prompt} 
          onClick={() => setIsFullscreen(true)}
          className="w-full h-auto object-contain max-h-[80vh] bg-checkered relative z-10 cursor-zoom-in"
        />
        
        {/* Hover Overlay for Quick Actions */}
        <div className="absolute top-6 right-6 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-30">
          <button 
            onClick={() => setIsFullscreen(true)}
            className="bg-black/60 backdrop-blur-md text-white p-3 rounded-xl shadow-lg hover:bg-cyan-600 transition-colors border border-white/10 block"
            title="Fullscreen View"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <a 
            href={image.data} 
            download={`infographic-${image.id}.png`}
            className="bg-black/60 backdrop-blur-md text-white p-3 rounded-xl shadow-lg hover:bg-cyan-600 transition-colors border border-white/10 block"
            title="Download Image"
          >
            <Download className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Edit Bar */}
      <div className="w-full max-w-3xl -mt-6 sm:-mt-8 relative z-40 px-4">
        <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl p-3 sm:p-2 sm:pr-3 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row gap-2 items-center ring-1 ring-black/5 dark:ring-white/5">
            <div className="pl-4 text-cyan-600 dark:text-cyan-400 hidden sm:block">
                <Edit3 className="w-5 h-5" />
            </div>
            <form onSubmit={handleSubmit} className="flex-1 w-full flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Refine the visual (e.g., 'Make the background stars')..."
                    className="flex-1 bg-slate-50 dark:bg-slate-950/50 sm:bg-transparent border border-slate-200 dark:border-white/5 sm:border-none rounded-xl sm:rounded-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 px-4 py-3 sm:px-2 sm:py-2 font-medium text-base"
                    disabled={isEditing}
                />
                {/* Wrapped button in div to allow tooltip on disabled state */}
                <div className="w-full sm:w-auto" title={!editPrompt.trim() ? "Please enter a prompt to enhance" : "Enhance image"}>
                    <button
                        type="submit"
                        disabled={isEditing || !editPrompt.trim()}
                        className={`w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                            isEditing || !editPrompt.trim() 
                            ? 'bg-slate-200 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 cursor-not-allowed' 
                            : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-500/20'
                        }`}
                    >
                        {isEditing ? (
                            <span className="animate-spin w-5 h-5 block border-2 border-white/30 border-t-white rounded-full"></span>
                        ) : (
                            <>
                                <span>Enhance</span>
                                <Sparkles className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
      </div>
      
      <div className="mt-8 text-center space-y-2 px-4">
        <p className="text-xs text-slate-500 dark:text-slate-500 font-mono max-w-xl mx-auto truncate opacity-60">
            PROMPT: {image.prompt}
        </p>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-slate-100/95 dark:bg-slate-950/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
            {/* Toolbar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-none">
                <div className="flex gap-2 pointer-events-auto bg-white/10 backdrop-blur-md p-1 rounded-lg border border-black/5 dark:border-white/10">
                    <button onClick={handleZoomOut} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-md text-slate-800 dark:text-slate-200 transition-colors" title="Zoom Out">
                        <ZoomOut className="w-5 h-5" />
                    </button>
                    <button onClick={handleResetZoom} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-md text-slate-800 dark:text-slate-200 transition-colors" title="Reset Zoom">
                        <span className="text-xs font-bold">{Math.round(zoomLevel * 100)}%</span>
                    </button>
                    <button onClick={handleZoomIn} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-md text-slate-800 dark:text-slate-200 transition-colors" title="Zoom In">
                        <ZoomIn className="w-5 h-5" />
                    </button>
                </div>

                <button 
                    onClick={handleCloseFullscreen}
                    className="pointer-events-auto p-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-lg"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8">
                <img 
                    src={image.data} 
                    alt={image.prompt}
                    style={{ 
                        transform: `scale(${zoomLevel})`,
                        transition: 'transform 0.2s ease-out'
                    }}
                    className="max-w-full max-h-full object-contain shadow-2xl rounded-lg origin-center"
                />
            </div>
        </div>
      )}
    </div>
  );
};

export default Infographic;