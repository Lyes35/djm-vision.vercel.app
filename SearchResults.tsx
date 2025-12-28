/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { SearchResultItem } from '../types';
import { ExternalLink, BookOpen, Link as LinkIcon } from 'lucide-react';

interface SearchResultsProps {
  results: SearchResultItem[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  if (!results || results.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex items-center gap-3 mb-6 border-t border-slate-200 dark:border-white/10 pt-8 transition-colors">
        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-white/10 text-cyan-600 dark:text-cyan-400 shadow-sm">
            <BookOpen className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Research Sources</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result, index) => (
          <a 
            key={index} 
            href={result.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative flex flex-col p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-xl hover:border-cyan-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/0 group-hover:bg-cyan-500/50 transition-all duration-300"></div>
            
            <div className="flex items-start justify-between gap-3 mb-3">
               <h4 className="font-display font-bold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 leading-tight text-sm">
                 {result.title}
               </h4>
               <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 flex-shrink-0 transition-colors mt-0.5" />
            </div>
            
            <div className="mt-auto flex items-center gap-2 text-[10px] text-slate-500 font-mono">
              <LinkIcon className="w-3 h-3" />
              <span className="truncate max-w-full opacity-70 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                {(() => {
                  try {
                    return new URL(result.url).hostname.replace('www.', '');
                  } catch {
                    return 'External Source';
                  }
                })()}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;