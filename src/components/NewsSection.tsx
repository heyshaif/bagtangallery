/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { NewsArticle } from '../types';
import { NEWS_ARTICLES } from '../data/btsData';
import { Search, Calendar, Award, ChevronLeft, CalendarDays, ExternalLink, X, BookOpen, Share2 } from 'lucide-react';

function CopyButton({ shareUrl }: { shareUrl: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <button
      onClick={handleCopy}
      className="text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-1 text-[10px] font-mono font-bold cursor-pointer"
      title="Copy Link"
    >
      <Share2 className="w-3.5 h-3.5" />
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function GoogleAdSenseAd() {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.warn('[AdSense] Error pushing slot:', e);
    }
  }, []);

  return (
    <div className="w-full flex justify-center py-4 border-y border-white/5 my-4 overflow-hidden">
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client="ca-pub-3637601187018890"
           data-ad-slot="9876543210"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
}

// Custom Third-Party Advertisement Script Loader
function AdContainer({ adKey, format, height, width, scriptSrc }: { adKey: string, format: string, height: number, width: number, scriptSrc: string }) {
  const containerId = `ad-container-${adKey}-${Math.random().toString(36).substr(2, 5)}`;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      container.innerHTML = '';
      
      const scriptConf = document.createElement('script');
      scriptConf.innerHTML = `
        atOptions = {
          'key' : '${adKey}',
          'format' : '${format}',
          'height' : ${height},
          'width' : ${width},
          'params' : {}
        };
      `;
      container.appendChild(scriptConf);
      
      const scriptSrcEl = document.createElement('script');
      scriptSrcEl.type = 'text/javascript';
      scriptSrcEl.src = scriptSrc;
      scriptSrcEl.async = true;
      container.appendChild(scriptSrcEl);
    }, 150);
    
    return () => {
      clearTimeout(timer);
    };
  }, [adKey, format, height, width, scriptSrc, containerId]);

  return (
    <div className="w-full flex flex-col items-center justify-center my-4 overflow-hidden">
      <span className="text-[9px] font-mono uppercase tracking-widest text-purple-400/50 mb-1">Sponsored Advertisement</span>
      <div 
        id={containerId} 
        className="overflow-hidden flex items-center justify-center bg-black/15 border border-white/5 rounded-lg max-w-full"
        style={{ minWidth: `${width}px`, minHeight: `${height}px` }}
      />
    </div>
  );
}

interface NewsSectionProps {
  items?: NewsArticle[];
  selectedArticleIdOrSlug?: string | null;
  onSelectArticle?: (slug: string | null) => void;
}

export default function NewsSection({ items, selectedArticleIdOrSlug, onSelectArticle }: NewsSectionProps) {
  const displayArticles = (items && items.length > 0) ? items : NEWS_ARTICLES;
  
  const getSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const [internalSelectedArticle, setInternalSelectedArticle] = useState<NewsArticle | null>(null);

  const selectedArticle = selectedArticleIdOrSlug 
    ? (displayArticles.find(a => a.id === selectedArticleIdOrSlug || getSlug(a.title) === selectedArticleIdOrSlug || a.slug === selectedArticleIdOrSlug) || null)
    : internalSelectedArticle;

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Dynamically load pop-up/social bar ad scripts only when the News section is mounted
  useEffect(() => {
    const scriptsToLoad = [
      'https://beavercolourfuldelinquent.com/96/b0/81/96b081c84962ad9696bc9ede738092f3.js',
      'https://beavercolourfuldelinquent.com/51/88/94/518894b483b474f8220f8770b6104fa0.js'
    ];

    const scriptElements: HTMLScriptElement[] = [];

    scriptsToLoad.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
      scriptElements.push(script);
    });

    // Cleanup when user leaves the News section tab
    return () => {
      scriptElements.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, []);

  // Categories list
  const categoryPills = ['All', 'Announcement', 'Comeback', 'Schedule', 'Award', 'Festa'];

  // Sub-filtering
  const filteredArticles = displayArticles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      art.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (art.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeCategory === 'All') return matchesSearch;
    return art.category === activeCategory && matchesSearch;
  });

  const handleReadArticle = (art: NewsArticle) => {
    if (onSelectArticle) {
      onSelectArticle(art.slug || getSlug(art.title) || art.id);
    } else {
      setInternalSelectedArticle(art);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToGrid = () => {
    if (onSelectArticle) {
      onSelectArticle(null);
    } else {
      setInternalSelectedArticle(null);
    }
  };

  // Safe related articles lookup
  const relatedArticles = selectedArticle 
    ? displayArticles.filter(a => a.id !== selectedArticle.id).slice(0, 2)
    : [];

  // Helper to split full article content and insert advertisements dynamically
  const renderContentWithAds = (content: string) => {
    if (!content) return null;
    const paragraphs = content.split('\n\n').filter(Boolean);
    if (paragraphs.length <= 2) {
      return (
        <div className="space-y-4">
          {paragraphs.map((p, idx) => (
            <p key={idx} className="leading-relaxed text-zinc-300 text-sm md:text-base">{p}</p>
          ))}
          <div className="pt-4">
            <AdContainer 
              adKey="57b1778a18bfab0b89f9329f8afd2f94" 
              format="iframe" 
              height={60} 
              width={468} 
              scriptSrc="https://beavercolourfuldelinquent.com/57b1778a18bfab0b89f9329f8afd2f94/invoke.js" 
            />
          </div>
        </div>
      );
    }
    
    const middleIndex = Math.floor(paragraphs.length / 2);
    return (
      <div className="space-y-4">
        {paragraphs.slice(0, middleIndex).map((p, idx) => (
          <p key={idx} className="leading-relaxed text-zinc-300 text-sm md:text-base">{p}</p>
        ))}
        
        {/* Middle Responsive Ad */}
        <div className="py-4 border-y border-white/5 my-6">
          <AdContainer 
            adKey="57b1778a18bfab0b89f9329f8afd2f94" 
            format="iframe" 
            height={60} 
            width={468} 
            scriptSrc="https://beavercolourfuldelinquent.com/57b1778a18bfab0b89f9329f8afd2f94/invoke.js" 
          />
        </div>

        {paragraphs.slice(middleIndex).map((p, idx) => (
          <p key={idx + middleIndex} className="leading-relaxed text-zinc-300 text-sm md:text-base">{p}</p>
        ))}
        
        {/* Near end of article Ad */}
        <div className="pt-6">
          <AdContainer 
            adKey="57b1778a18bfab0b89f9329f8afd2f94" 
            format="iframe" 
            height={60} 
            width={468} 
            scriptSrc="https://beavercolourfuldelinquent.com/57b1778a18bfab0b89f9329f8afd2f94/invoke.js" 
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {!selectedArticle ? (
        <>
          {/* Header bar and Filtering */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
            <div className="space-y-1">
              <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400 animate-pulse" /> Latest News & Broadcasts
              </h2>
              <p className="text-xs text-gray-400 font-mono">Independent updates, schedule calendars & comeback logs</p>
            </div>

            {/* Global News Search bar */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" />
              <input
                type="text"
                placeholder="Search headlines..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/45 border border-white/5 focus:border-purple-500/30 focus:outline-none rounded-full text-xs font-mono text-white placeholder-gray-500 transition-colors"
              />
            </div>
          </div>

          {/* Categories Pill selection */}
          <div className="flex gap-2 flex-wrap pb-2 overflow-x-auto select-scrollbar">
            {categoryPills.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/25 border border-purple-500/25'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Integrated Google AdSense Banner */}
          <GoogleAdSenseAd />

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
        <div className="w-full max-w-6xl mx-auto rounded-2xl border border-white/5 bg-black/60 backdrop-blur-xl overflow-hidden p-6 md:p-10 space-y-8 animate-fade-in">
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
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2.5 py-1 border border-purple-400/30 bg-purple-950/40 text-purple-200 rounded uppercase">
                  {selectedArticle.category}
                </span>
                <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                  <CalendarDays className="w-4 h-4 text-purple-400" /> {selectedArticle.date}
                </span>
              </div>
              
              {/* Premium Social Share Bar */}
              <div className="flex items-center gap-2.5 bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-full shrink-0">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mr-1">Share news:</span>
                
                {/* X / Twitter */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(selectedArticle.title)}&url=${encodeURIComponent(window.location.origin + '/news/' + (selectedArticle.slug || getSlug(selectedArticle.title) || selectedArticle.id))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Share on X (Twitter)"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/news/' + (selectedArticle.slug || getSlug(selectedArticle.title) || selectedArticle.id))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#1877F2] transition-colors"
                  title="Share on Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(selectedArticle.title + ' ' + window.location.origin + '/news/' + (selectedArticle.slug || getSlug(selectedArticle.title) || selectedArticle.id))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#25D366] transition-colors"
                  title="Share on WhatsApp"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.022-.014-.425-.21-.478-.23-.053-.02-.09-.03-.13-.03-.04 0-.083.01-.13.03-.047.02-.422.18-.518.27-.096.09-.193.1-.24.08-.05-.02-.21-.08-.4-.25-.15-.13-.25-.29-.28-.34-.03-.05-.004-.08.02-.1.023-.024.05-.06.077-.09.027-.03.037-.05.056-.09.018-.04.01-.07-.003-.1-.013-.03-.13-.31-.18-.42-.047-.12-.097-.1-.132-.1-.033-.002-.072-.002-.11-.002-.038 0-.1.014-.15.07-.053.055-.2.2-.2.48 0 .28.2.55.23.59.033.04 3.9 5.95 9.47 8.35 1.33.57 2.37.9 3.18 1.16 1.34.42 2.57.36 3.54.21 1.08-.16 2.23-.74 2.54-1.42.315-.68.315-1.26.22-1.38-.095-.12-.35-.19-.4-.22zM12.02 0a12.02 12.02 0 0 0-10.37 18.03L0 24l6.13-1.61A12.02 12.02 0 1 0 12.02 0zm0 22c-1.84 0-3.64-.49-5.21-1.41l-.37-.22-3.87 1.01 1.03-3.77-.24-.39A9.97 9.97 0 1 1 12.02 22z"/></svg>
                </a>

                {/* Telegram */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(window.location.origin + '/news/' + (selectedArticle.slug || getSlug(selectedArticle.title) || selectedArticle.id))}&text=${encodeURIComponent(selectedArticle.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#0088cc] transition-colors"
                  title="Share on Telegram"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.61l-1.91 9c-.14.63-.51.79-1.04.49l-2.91-2.15-1.4 1.35c-.15.15-.28.28-.58.28l.2-2.94 5.35-4.83c.23-.21-.05-.32-.36-.12L9.3 13.97l-2.85-.89c-.62-.19-.63-.62.13-.91l11.13-4.3c.52-.19.97.12.85.74z"/></svg>
                </a>

                {/* Copy Link button */}
                <CopyButton shareUrl={window.location.origin + '/news/' + (selectedArticle.slug || getSlug(selectedArticle.title) || selectedArticle.id)} />
              </div>
            </div>

            <h1 className="text-2xl md:text-4xl font-sans font-extrabold text-white leading-tight">
              {selectedArticle.title}
            </h1>

            <p className="text-base text-purple-200 font-medium pl-4 border-l border-purple-500 leading-relaxed font-serif italic">
              {selectedArticle.summary}
            </p>

            {selectedArticle.featuredImage ? (
              <div className="rounded-xl overflow-hidden max-h-[450px] relative shadow-lg">
                <img
                  src={selectedArticle.featuredImage}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover filter brightness-[0.8]"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden aspect-video relative shadow-lg">
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover filter brightness-[0.8]"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Layout with right sidebar for desktop and full-width on mobile */}
            <div className="lg:grid lg:grid-cols-4 lg:gap-8 items-start">
              {/* Main Content Column */}
              <div className="lg:col-span-3 space-y-6">
                <div className="text-gray-300 text-sm md:text-base leading-loose whitespace-pre-line space-y-4 font-sans">
                  {renderContentWithAds(selectedArticle.content || selectedArticle.summary)}
                </div>
                
                {/* Desktop and Mobile Responsive bottom Ad */}
                <div className="pt-4 border-t border-white/5">
                  <AdContainer 
                    adKey="57b1778a18bfab0b89f9329f8afd2f94" 
                    format="iframe" 
                    height={60} 
                    width={468} 
                    scriptSrc="https://beavercolourfuldelinquent.com/57b1778a18bfab0b89f9329f8afd2f94/invoke.js" 
                  />
                </div>
              </div>

              {/* Sidebar Column */}
              <div className="hidden lg:block space-y-6">
                <div className="sticky top-24 p-4 rounded-xl border border-white/5 bg-black/45 space-y-4 text-center">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold border-b border-white/5 pb-2">Trending Spotlight</h4>
                  <AdContainer 
                    adKey="bceb400c908a798012cbb710154135c4" 
                    format="iframe" 
                    height={300} 
                    width={160} 
                    scriptSrc="https://beavercolourfuldelinquent.com/bceb400c908a798012cbb710154135c4/invoke.js" 
                  />
                </div>
              </div>
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
                    className="p-4 rounded-xl border border-white/5 bg-black/40 hover:border-purple-500/20 transition-all cursor-pointer flex gap-4 animate-fade-in"
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
