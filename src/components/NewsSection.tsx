/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { NewsArticle } from '../types';
import { NEWS_ARTICLES } from '../data/btsData';
import { Search, Calendar, Award, ChevronLeft, CalendarDays, ExternalLink, X, BookOpen } from 'lucide-react';

export default function NewsSection({ items }: { items?: NewsArticle[] }) {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Categories list
  const categoryPills = ['All', 'Announcement', 'Comeback', 'Schedule', 'Award', 'Festa'];

  // Sub-filtering
  const displayArticles = (items && items.length > 0) ? items : NEWS_ARTICLES;
  const filteredArticles = displayArticles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      art.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeCategory === 'All') return matchesSearch;
    return art.category === activeCategory && matchesSearch;
  });

  const handleReadArticle = (art: NewsArticle) => {
    setSelectedArticle(art);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToGrid = () => {
    setSelectedArticle(null);
  };

  // Safe related articles lookup
  const relatedArticles = selectedArticle 
    ? NEWS_ARTICLES.filter(a => a.id !== selectedArticle.id).slice(0, 2)
    : [];

  return (
    <div className="space-y-8 animate-fade-in">
      {!selectedArticle ? (
        <>
          {/* Header segment and search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-sans font-extrabold text-white">
                ARMY Broadcast Center
              </h2>
              <p className="text-gray-400 text-sm">
                Get the latest official announcements, comeback schedules, and awards milestones.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search headlines or contents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 text-xs pl-10 pr-4 py-2 rounded-lg border border-purple-500/20 focus:border-purple-500/50 text-white outline-none placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Categorical filters */}
          <div className="flex flex-wrap gap-2">
            {categoryPills.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-mono px-3.5 py-2 rounded-full border transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/20'
                    : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-dashed border-white/5 bg-white/[0.01]">
              <p className="text-gray-400 font-mono text-sm">No articles match your search parameters.</p>
            </div>
          ) : (
            /* News Grid items */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredArticles.map(article => (
                <div
                  key={article.id}
                  onClick={() => handleReadArticle(article)}
                  className="group rounded-xl border border-white/5 bg-black/45 overflow-hidden hover:border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/5 transition-all cursor-pointer flex flex-col h-full"
                >
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 border border-purple-400/30 bg-black/80 rounded text-purple-300">
                      {article.category}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <span className="flex items-center gap-1 text-[11px] font-mono text-gray-500">
                      <CalendarDays className="w-3.5 h-3.5" /> {article.date}
                    </span>
                    
                    <h3 className="font-sans font-bold text-base text-white group-hover:text-purple-300 transition-colors mt-2 leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-xs text-gray-400 leading-relaxed mt-2.5 line-clamp-3">
                      {article.summary}
                    </p>

                    <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between font-mono text-xs text-purple-400">
                      <span>Related to BTS</span>
                      <span className="group-hover:underline flex items-center gap-1 font-semibold">Read Article &rarr;</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Detailed Overlay pane */
        <div className="w-full max-w-4xl mx-auto rounded-2xl border border-white/5 bg-black/60 backdrop-blur-xl overflow-hidden p-6 md:p-10 space-y-8 animate-fade-in">
          {/* Back btn */}
          <button
            onClick={handleBackToGrid}
            id="news-back-to-grid-btn"
            className="flex items-center gap-1.5 text-sm font-mono text-purple-400 hover:text-purple-300 cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to News Archive
          </button>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
              <span className="text-xs font-mono px-2.5 py-1 border border-purple-400/30 bg-purple-950/40 text-purple-200 rounded uppercase">
                {selectedArticle.category}
              </span>
              <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                <CalendarDays className="w-4 h-4 text-purple-400" /> {selectedArticle.date}
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-sans font-extrabold text-white leading-tight">
              {selectedArticle.title}
            </h1>

            <p className="text-base text-purple-200 font-medium pl-4 border-l border-purple-500 leading-relaxed font-serif italic">
              {selectedArticle.summary}
            </p>

            <div className="rounded-xl overflow-hidden aspect-video relative shadow-lg">
              <img
                src={selectedArticle.imageUrl}
                alt={selectedArticle.title}
                className="w-full h-full object-cover filter brightness-[0.8]"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="text-gray-300 text-sm md:text-base leading-loose whitespace-pre-line space-y-4 font-sans max-w-3xl">
              {selectedArticle.content}
            </div>
          </div>

          {/* Related Articles shelf */}
          {relatedArticles.length > 0 && (
            <div className="space-y-4 pt-8 border-t border-white/5">
              <h3 className="text-sm font-mono font-bold text-purple-300 uppercase tracking-widest">More BTS Broadcasts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedArticles.map(art => (
                  <div
                    key={art.id}
                    onClick={() => handleReadArticle(art)}
                    className="p-4 rounded-xl border border-white/5 bg-black/40 hover:border-purple-500/20 transition-all cursor-pointer flex gap-4"
                  >
                    <div className="w-20 h-16 rounded overflow-hidden shrink-0 relative bg-purple-900/10">
                      <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      <span className="font-mono text-[9px] text-purple-400 uppercase">{art.category}</span>
                      <h4 className="font-sans font-semibold text-xs text-white line-clamp-1 mt-0.5">{art.title}</h4>
                      <p className="text-[10px] text-gray-500 font-mono mt-1">Read article &rarr;</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
