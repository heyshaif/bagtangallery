/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { UserPreferences, Member, Album, Video, GalleryItem, TimelineEvent, NewsArticle } from './types';
import { MEMBERS, ALBUMS, VIDEOS, GALLERY_ITEMS, TIMELINE_EVENTS, NEWS_ARTICLES, DOWNLOADS, FAN_ARTS, EVENTS, FAQS } from './data/btsData';

// Component imports
import AuroraBackground from './components/AuroraBackground';
import MemberProfileDetail from './components/MemberProfileDetail';
import MusicSection from './components/MusicSection';
import YouTubeClone from './components/YouTubeClone';
import GallerySection from './components/GallerySection';
import TimelineSection from './components/TimelineSection';
import NewsSection from './components/NewsSection';
import DownloadsSection from './components/DownloadsSection';
import FanArtSection from './components/FanArtSection';
import EventsSection from './components/EventsSection';
import MemesSection from './components/MemesSection';
import TourCountdownCarousel from './components/TourCountdownCarousel';
import FAQSection from './components/FAQSection';
import ContactSection from './components/ContactSection';
import FeedbackSection from './components/FeedbackSection';
import SettingsSection from './components/SettingsSection';
import ThemeCustomizerPanel from './components/ThemeCustomizerPanel';
import { ThemeCustomProvider } from './context/ThemeContext';
import WelcomePopup from './components/WelcomePopup';
import AdminPanel from './components/AdminPanel';
import BTSGlobalQuest from './components/BTSGlobalQuest';
import LiveStreamSection from './components/LiveStreamSection';
import VotingCenterSection from './components/VotingCenterSection';

// New Premium Landing Page Components
import Preloader from './components/Preloader';
import InteractiveMediaWall from './components/InteractiveMediaWall';
import SupportersWall from './components/SupportersWall';
import BTSQuotesCarousel from './components/BTSQuotesCarousel';
import TrendingCarousel from './components/TrendingCarousel';
import InteractiveCategories from './components/InteractiveCategories';
import HomeFeed from './components/HomeFeed';
import GeneratePicStudio from './components/GeneratePicStudio';
import PurpleLoveOverlay from './components/PurpleLoveOverlay';
import DraggableButton from './components/DraggableButton';
import { DisclaimerPopup } from './components/DisclaimerPopup';
import { motion, AnimatePresence } from 'motion/react';

// Lucide Icons
import {
  Home, Users, Music, Video as VideoIcon, Image as ImageIcon, Clock, BookOpen, Gift, Calendar, Download,
  Heart, HelpCircle, Mail, Settings as SettingsIcon, Menu, X, Search, Globe, Cloud, Sun,
  CheckCircle, Palette, MessageSquareHeart, Flame, ArrowUp, Zap, UserCheck, Smile, Gamepad2,
  Instagram, Twitter, Youtube, Coffee, Github, Linkedin, Facebook, Send, MoreHorizontal, Pin, Wand2, Lock,
  Radio, Vote
} from 'lucide-react';
import { Sparkles } from './components/CustomSparkles';

import { AudioPlayerProvider, useAudioPlayer } from './context/AudioPlayerContext';
import GlobalMiniPlayer from './components/GlobalMiniPlayer';

export function AppContent() {
  const audioPlayer = useAudioPlayer();
  
  // Dynamic Web Publisher Configuration (Admin CMS Integration)
  const [publishedConfig, setPublishedConfig] = useState<any>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(() => {
    return window.location.pathname === '/admin' || window.location.hash === '#admin' || window.location.hash === '#/admin';
  });

  const copyrightClickTimes = useRef<number[]>([]);

  const handleCopyrightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    const validClicks = [...copyrightClickTimes.current.filter(t => now - t < 3000), now];
    copyrightClickTimes.current = validClicks;

    if (validClicks.length >= 3) {
      window.location.hash = 'admin';
      setIsAdminOpen(true);
      copyrightClickTimes.current = [];
    }
  };

  const sanitizeConfig = (config: any) => {
    if (!config) return config;
    const arrKeys = ['showcase', 'trending', 'timeline', 'faqs', 'gallery', 'events', 'downloads', 'news', 'members', 'albums', 'videos', 'digitalTracks', 'playlists', 'musicSubmissions', 'eras', 'votingEvents', 'votingSubmissions'];
    const sanitized = { ...config };
    for (const key of arrKeys) {
      if (sanitized[key]) {
        if (!Array.isArray(sanitized[key])) {
          if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            if (Array.isArray(sanitized[key]['null'])) {
              sanitized[key] = sanitized[key]['null'];
            } else {
              const values = Object.values(sanitized[key]);
              const foundArray = values.find(v => Array.isArray(v));
              if (foundArray) {
                sanitized[key] = foundArray;
              } else {
                sanitized[key] = values;
              }
            }
          } else {
            sanitized[key] = [];
          }
        }
      } else {
        sanitized[key] = [];
      }

      // Restore client defaults if empty
      if (sanitized[key].length === 0) {
        if (key === 'members') sanitized[key] = MEMBERS;
        else if (key === 'albums') sanitized[key] = ALBUMS;
        else if (key === 'videos') sanitized[key] = VIDEOS;
        else if (key === 'gallery') sanitized[key] = GALLERY_ITEMS;
        else if (key === 'timeline') sanitized[key] = TIMELINE_EVENTS;
        else if (key === 'news') sanitized[key] = NEWS_ARTICLES;
        else if (key === 'downloads') sanitized[key] = DOWNLOADS;
        else if (key === 'events') sanitized[key] = EVENTS;
        else if (key === 'faqs') sanitized[key] = FAQS;
      }
    }
    return sanitized;
  };

  const fetchPublishedConfig = () => {
    fetch('/api/config/published')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(data => {
        const cleanData = sanitizeConfig(data);
        setPublishedConfig(cleanData);
        if (cleanData.theme?.accentColor) {
          setPreferences((prev: any) => ({
            ...prev,
            accentColor: cleanData.theme.accentColor
          }));
        }
      })
      .catch((err) => {
        console.warn('Failed to load published portal config, falling back to offline defaults.', err);
      });
  };

  useEffect(() => {
    fetchPublishedConfig();
    const interval = setInterval(fetchPublishedConfig, 4000); // 4s polling for instant live-syncing!

    const handleLocationChange = () => {
      const isUrlAdmin = window.location.pathname === '/admin' || window.location.hash === '#admin' || window.location.hash === '#/admin';
      setIsAdminOpen(isUrlAdmin);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Update browser tab Title and Favicon dynamically based on CMS config
  useEffect(() => {
    if (publishedConfig?.seo) {
      if (publishedConfig.seo.metaTitle) {
        document.title = publishedConfig.seo.metaTitle;
      }
      if (publishedConfig.seo.faviconUrl) {
        let link: HTMLLinkElement | null = document.querySelector("link[id='app-favicon']");
        if (!link) {
          link = document.querySelector("link[rel~='icon']");
        }
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          link.id = 'app-favicon';
          document.head.appendChild(link);
        }
        link.href = publishedConfig.seo.faviconUrl;
      }
    }
  }, [publishedConfig]);

  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<string>('Home');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [introLoading, setIntroLoading] = useState(true);

  // Global search keywords & suggestions states
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Time & Weather States
  const [currentTime, setCurrentTime] = useState('');

  const [seoulTemp, setSeoulTemp] = useState('22.4°C');
  const [seoulWeather, setSeoulWeather] = useState('Nebula Breezes');

  // Typing effect on Hero
  const [typedText, setTypedText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const typingPhrases = publishedConfig?.home?.typingPhrases || [
    'We had only seven. But we have you all now. 💜',
    'Living without passion is like being dead. 🐰',
    'Speak yourself. Find your name. Find your voice. 🐨',
    'I purple you for an eternity. Borahae! 🐯'
  ];
  const [phraseIdx, setPhraseIdx] = useState(0);

  // User personalization variables stored locally
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('bts_gallery_preferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      theme: 'dark',
      accentColor: 'purple',
      animationsEnabled: true,
      fontSize: 'base',
      language: 'EN'
    };
  });

  const [isPurpleLove, setIsPurpleLove] = useState<boolean>(() => {
    return localStorage.getItem('bts_purple_love_active') === 'true';
  });

  const [isFireworks, setIsFireworks] = useState<boolean>(() => {
    return localStorage.getItem('bts_fireworks_active') === 'true';
  });

  const [isAmbientActive, setIsAmbientActive] = useState<boolean>(() => {
    return localStorage.getItem('bts_ambient_bg_active') !== 'false';
  });

  // Disclaimer popup states and events
  const [disclaimerActive, setDisclaimerActive] = useState(false);
  const [previewDisclaimer, setPreviewDisclaimer] = useState<any>(null);

  // Auto trigger disclaimer when publishedConfig successfully loads
  useEffect(() => {
    if (publishedConfig?.disclaimer?.enabled) {
      const shown = sessionStorage.getItem('bts_disclaimer_shown');
      if (!shown) {
        setDisclaimerActive(true);
      }
    }
  }, [publishedConfig]);

  // Handle preview and live update trigger
  useEffect(() => {
    const handlePreview = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setPreviewDisclaimer(customEvent.detail);
        setDisclaimerActive(true);
      }
    };
    window.addEventListener('bts-preview-disclaimer', handlePreview);
    return () => {
      window.removeEventListener('bts-preview-disclaimer', handlePreview);
    };
  }, []);

  const handleDisclaimerClose = () => {
    setDisclaimerActive(false);
    if (previewDisclaimer) {
      setPreviewDisclaimer(null);
    } else {
      sessionStorage.setItem('bts_disclaimer_shown', 'true');
    }
  };

  const togglePurpleLove = () => {
    const newValue = !isPurpleLove;
    setIsPurpleLove(newValue);
    localStorage.setItem('bts_purple_love_active', String(newValue));
  };

  const toggleFireworks = () => {
    const newValue = !isFireworks;
    setIsFireworks(newValue);
    localStorage.setItem('bts_fireworks_active', String(newValue));
  };

  // Save changes
  const handlePreferencesChange = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    localStorage.setItem('bts_gallery_preferences', JSON.stringify(newPrefs));
  };

  // Weather & ticking clock effects
  useEffect(() => {
    const interval = setInterval(() => {
      // Formatted KST for Seoul matching 2026
      const formatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
        timeZone: 'Asia/Seoul',
        timeZoneName: 'short'
      });
      setCurrentTime(formatter.format(new Date()));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simulating random charming weather conditions for Seoul (KST timezone)
  useEffect(() => {
    const weatherConditions = ['Clear Stardust', 'Purple Clouds', 'Golden Sunbeams', 'Acoustic Raindrops'];
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * weatherConditions.length);
      setSeoulWeather(weatherConditions[idx]);
      const temp = (Math.random() * 5 + 18).toFixed(1);
      setSeoulTemp(`${temp}°C`);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Typing Hero message loop
  useEffect(() => {
    const currentPhrase = typingPhrases[phraseIdx];
    if (typingIndex < currentPhrase.length) {
      const timeout = setTimeout(() => {
        setTypedText(currentPhrase.slice(0, typingIndex + 1));
        setTypingIndex(prev => prev + 1);
      }, 75);
      return () => clearTimeout(timeout);
    } else {
      // Pause at end, then advance phrase
      const timeout = setTimeout(() => {
        setTypingIndex(0);
        setPhraseIdx(prev => (prev + 1) % typingPhrases.length);
        setTypedText('');
      }, 3500);
      return () => clearTimeout(timeout);
    }
  }, [typingIndex, phraseIdx]);

  // Click outside listener for search suggestion panel
  useEffect(() => {
    const clickListener = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchSuggestions(false);
      }
    };
    document.addEventListener('mousedown', clickListener);
    return () => document.removeEventListener('mousedown', clickListener);
  }, []);

  // Global index search suggestions builder
  const getSearchSuggestions = () => {
    const q = globalSearchQuery.trim().toLowerCase();
    if (!q) return [];

    const matches: { title: string; subtitle: string; tab: string; payload?: any }[] = [];

    // Search members profile
    (publishedConfig?.members || MEMBERS).forEach(m => {
      if (m.name.toLowerCase().includes(q) || m.fullName.toLowerCase().includes(q)) {
        matches.push({ title: `${m.emoji} ${m.name}`, subtitle: `Member Bio Profile`, tab: 'Members', payload: m });
      }
    });

    // Search albums
    ALBUMS.forEach(a => {
      if (a.title.toLowerCase().includes(q)) {
        matches.push({ title: `💿 ${a.title}`, subtitle: `Music Album Details`, tab: 'Music', payload: a });
      }
      // Tracks
      a.tracks.forEach(t => {
        if (t.title.toLowerCase().includes(q)) {
          matches.push({ title: `🎵 ${t.title}`, subtitle: `Song Track in ${a.title}`, tab: 'Music', payload: a });
        }
      });
    });

    // Search news
    NEWS_ARTICLES.forEach(n => {
      if (n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q)) {
        matches.push({ title: `📰 ${n.title}`, subtitle: `ARMY News & Schedules`, tab: 'News' });
      }
    });

    // Match exact and related keywords to direct navigation links (resolving keyword link searches)
    const keywordsMap = [
      { keywords: ['home', 'portal', 'main', 'index', 'welcome', 'lounge'], tab: 'Home', title: '🏠 Welcome Home Portal', subtitle: 'BTS Fan Lounge Entrance' },
      { keywords: ['members', 'profiles', 'bts septet', 'rm', 'jin', 'suga', 'j-hope', 'jimin', 'v', 'jungkook', 'names', 'agust', 'hobi', 'rap', 'vocals'], tab: 'Members', title: '👥 BTS Members Profile Directory', subtitle: 'HD portraits, vital bios, quotes & MBTIs' },
      { keywords: ['music', 'songs', 'albums', 'tracks', 'discography', 'spotify', 'lyrics', 'player', 'proof', 'be', 'golden'], tab: 'Music', title: '💿 Music Discography', subtitle: 'Listen, view tracks, lyrics & streaming lists' },
      { keywords: ['video', 'videos', 'mv', 'youtube', 'clips', 'clips player', 'media', 'theatre', 'watch'], tab: 'Videos', title: '🎥 Video & MV Cinema Portal', subtitle: 'Interactive video portal, embed links & review logs' },
      { keywords: ['gallery', 'photos', 'images', 'artworks', 'visuals', 'pictures', 'stage'], tab: 'Gallery', title: '🖼️ HD Photo Gallery', subtitle: 'Beautiful conceptual photos and stage pictures' },
      { keywords: ['timeline', 'history', 'debut', 'anniversary dates', 'milestones', 'chronology', 'years'], tab: 'Timeline', title: '🕰️ Bangtan Chronicles Timeline', subtitle: 'Trace historical BTS events from 2013' },
      { keywords: ['news', 'articles', 'schedules', 'updates', 'hybe official', 'notices'], tab: 'News', title: '📰 News & Official Schedules', subtitle: 'BTS current notices, albums timeline' },
      { keywords: ['memes', 'meme', 'upload memes', 'funny', 'pictures', 'laughter'], tab: 'Memes', title: '😆 ARMY Meme Vault', subtitle: 'Discover and upload community memes' },
      { keywords: ['festa', 'anniversary', 'june 13', 'festa countdown', 'celebration', 'events', 'concerts', 'tours', 'world tour', 'tickets', 'locations'], tab: 'Events', title: '📅 Events & Tour Hub', subtitle: 'Concerts schedules, tickers, maps & notices' },
      { keywords: ['download', 'downloads', 'wallpapers', 'assets', 'saves', 'cards'], tab: 'Downloads', title: '📥 Downloads & Wallpapers Room', subtitle: 'Grab high resolution screens & sheets' },
      { keywords: ['faq', 'questions', 'support help', 'rules', 'frequently', 'answers'], tab: 'FAQ', title: '❓ Help FAQ Accordions', subtitle: 'Answers to essential ARMY portal guidelines' },
      { keywords: ['contact', 'mail', 'support', 'office address', 'email', 'form'], tab: 'Contact', title: '✉️ Support Office Contact', subtitle: 'Reach out to our global team' },
      { keywords: ['feedback', 'rating', 'star reviews', 'write review', 'guestbook'], tab: 'Feedback', title: '💬 Portal Guestbook Feedback', subtitle: 'Leave custom star reviews & messages' },
      { keywords: ['settings', 'themes', 'preferences', 'text size', 'dark', 'light', 'fontsize'], tab: 'Settings', title: '⚙️ Experience Portal Settings', subtitle: 'Configure ambient modes, colors & sizes' }
    ];

    keywordsMap.forEach(item => {
      const matchesKeyword = item.keywords.some(kw => kw.includes(q) || q.includes(kw));
      if (matchesKeyword) {
        matches.push({ title: item.title, subtitle: item.subtitle, tab: item.tab });
      }
    });

    return matches.slice(0, 6);
  };

  const handlesSuggestionClick = (sug: any) => {
    setGlobalSearchQuery('');
    setShowSearchSuggestions(false);
    if (sug.tab === 'Members' && sug.payload) {
      setSelectedMember(sug.payload);
      setActiveTab('Members');
    } else {
      setSelectedMember(null);
      setActiveTab(sug.tab);
    }
    setMobileMenuOpen(false);
  };

  const handleQuickAccess = (tabName: string) => {
    setSelectedMember(null);
    setActiveTab(tabName);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // Nav categories matching headers & sidebar
  const navItems = [
    { name: 'Home', icon: <Home className="w-4 h-4" /> },
    { name: 'Voting Center', icon: <Vote className="w-4 h-4 text-purple-400 animate-pulse" /> },
    { name: 'Live Stream', icon: <Radio className="w-4 h-4 text-rose-500 animate-pulse" /> },
    { name: 'Members', icon: <Users className="w-4 h-4" /> },
    { name: 'Generate Pic', icon: <Wand2 className="w-4 h-4 text-pink-400 animate-pulse" /> },
    { name: 'Music', icon: <Music className="w-4 h-4" /> },
    { name: 'Videos', icon: <VideoIcon className="w-4 h-4" /> },
    { name: 'Gallery', icon: <ImageIcon className="w-4 h-4" /> },
    { name: 'Timeline', icon: <Clock className="w-4 h-4" /> },
    { name: 'News', icon: <BookOpen className="w-4 h-4 animate-pulse" /> },
    { name: 'Events', icon: <Calendar className="w-4 h-4" /> },
    { name: 'Memes', icon: <Smile className="w-4 h-4 text-purple-400" /> },
    { name: 'Downloads', icon: <Download className="w-4 h-4" /> },
    { name: 'Play Game', icon: <Gamepad2 className="w-4 h-4 text-purple-400" /> },
    { name: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> },
    { name: 'Contact', icon: <Mail className="w-4 h-4" /> },
    { name: 'Feedback', icon: <MessageSquareHeart className="w-4 h-4" /> },
    { name: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> }
  ].filter(item => {
    const settings = publishedConfig?.sidebar;
    if (!settings) return true;
    if (item.name === 'Home') return settings.showHome !== false;
    if (item.name === 'Members') return settings.showMembers !== false;
    if (item.name === 'Music') return settings.showMusic !== false;
    if (item.name === 'Videos') return settings.showVideos !== false;
    if (item.name === 'Gallery') return settings.showGallery !== false;
    if (item.name === 'Timeline') return settings.showTimeline !== false;
    if (item.name === 'News') return settings.showNews !== false;
    if (item.name === 'Events') return settings.showEvents !== false;
    if (item.name === 'Downloads') return settings.showDownloads !== false;
    if (item.name === 'FAQ') return settings.showFAQ !== false;
    return true;
  });

  // Helper to determine accent background color
  const getAccentColorClass = () => {
    switch (preferences.accentColor) {
      case 'crimson': return 'text-rose-500 border-rose-500 bg-rose-500/10 focus:ring-rose-500';
      case 'indigo': return 'text-indigo-500 border-indigo-500 bg-indigo-500/10 focus:ring-indigo-500';
      case 'amber': return 'text-amber-500 border-amber-500 bg-amber-500/10 focus:ring-amber-500';
      case 'violet': return 'text-violet-500 border-violet-500 bg-violet-500/10 focus:ring-violet-500';
      default: return 'text-purple-500 border-purple-500 bg-purple-500/10 focus:ring-purple-500';
    }
  };

  const getAccentBgClass = () => {
    switch (preferences.accentColor) {
      case 'crimson': return 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30';
      case 'indigo': return 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30';
      case 'amber': return 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/30';
      case 'violet': return 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/30';
      default: return 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30';
    }
  };

  const getAccentTextClass = () => {
    switch (preferences.accentColor) {
      case 'crimson': return 'text-rose-400';
      case 'indigo': return 'text-indigo-400';
      case 'amber': return 'text-amber-400';
      case 'violet': return 'text-violet-400';
      default: return 'text-purple-400';
    }
  };

  const getFontSizeClass = () => {
    switch (preferences.fontSize) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-base';
      case 'xl': return 'text-lg';
      default: return 'text-sm';
    }
  };

  const searchSuggestions = getSearchSuggestions();

  return (
    <>
      <AnimatePresence mode="wait">
        {introLoading && <Preloader onComplete={() => setIntroLoading(false)} />}
      </AnimatePresence>

      <div className={`min-h-screen selection:bg-purple-500/30 flex flex-col font-sans ${getFontSizeClass()} ${
        preferences.theme === 'light' ? 'light bg-[#faf8fd] text-slate-900' : 'bg-[#05000a] text-slate-100'
      }`}>
      
      {/* Aurora Particle Canvas Background */}
      <AuroraBackground theme={preferences.theme} isAmbientActive={isAmbientActive} />

      {/* Global Immersive Overlay: Floating Hearts & Sparks */}
      {(isPurpleLove || isFireworks) && <PurpleLoveOverlay isPurpleLove={isPurpleLove} isFireworks={isFireworks} />}

      {/* Dynamic Disclaimer Popup */}
      <DisclaimerPopup
        isOpen={disclaimerActive}
        config={previewDisclaimer || publishedConfig?.disclaimer}
        onClose={handleDisclaimerClose}
        isPreview={!!previewDisclaimer}
      />

      {/* Header Sticky Navigation bar */}
      <header className="sticky top-0 z-40 bg-black/20 backdrop-blur-md border-b border-white/5 shadow-lg">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4.5 flex items-center justify-between">
          
          {/* Logo brand and subtitle */}
          <div
            onClick={() => handleQuickAccess('Home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/10 group-hover:bg-purple-600 group-hover:border-purple-400 transition-all duration-300">
              <span className="font-sans font-black text-white text-lg tracking-tight select-none">
                ⟭⟬⁷
              </span>
            </div>
            <div>
              <h1 className="font-sans font-bold text-sm md:text-base tracking-widest text-slate-100 uppercase group-hover:text-purple-300 transition-colors flex items-center gap-1.5 font-sans">
                {publishedConfig?.sidebar?.logoText || 'BANGTAN GALLERY'} <Sparkles className="w-3.5 h-3.5 text-purple-400 fill-purple-400/20" />
              </h1>
              <p className="text-[9px] font-mono text-slate-400 uppercase tracking-[0.2em] leading-none hidden md:block mt-1">
                Premium Fan Experience &bull; 2026
              </p>
            </div>
          </div>

          {/* Desktop Search sug Bar */}
          <div ref={searchContainerRef} className="relative w-64 md:w-80 hidden lg:block">
            <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 opacity-60">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search members, songs, FAQ tabs..."
              value={globalSearchQuery}
              onChange={(e) => {
                setGlobalSearchQuery(e.target.value);
                setShowSearchSuggestions(true);
              }}
              onFocus={() => setShowSearchSuggestions(true)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-11 pr-5 text-xs text-white outline-none focus:border-purple-500/50 placeholder:text-slate-500 transition-all"
            />
            {showSearchSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/10 bg-[#05000a]/95 backdrop-blur-xl shadow-2xl p-2.5 space-y-1.5 z-50 animate-fade-in">
                {searchSuggestions.map((sug, i) => (
                  <div
                    key={i}
                    onClick={() => handlesSuggestionClick(sug)}
                    className="p-2 rounded-xl hover:bg-purple-900/40 border border-transparent hover:border-white/10 transition-all cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <h4 className="text-white text-xs font-semibold leading-tight">{sug.title}</h4>
                      <p className="text-[10px] text-purple-400 font-mono mt-0.5">{sug.subtitle}</p>
                    </div>
                    <span className="text-[9px] font-mono text-purple-400 uppercase border border-white/10 px-1.5 py-0.5 rounded-full">
                      Go
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop small settings overview */}
          <div className="flex items-center gap-3">
            {/* Local clock indication */}
            <div className="hidden xl:flex flex-col text-right font-mono text-[10px] text-gray-400 leading-none">
              <span className="text-white font-semibold flex items-center gap-1 justify-end">
                <Cloud className="w-3.5 h-3.5 text-purple-400" /> SEOUL {seoulTemp}
              </span>
              <span className="mt-1">{seoulWeather}</span>
            </div>

            {/* Quick settings link */}
            <button
              onClick={() => handleQuickAccess('Settings')}
              className="p-2 rounded-lg hover:bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer hidden md:block"
              title="Personalize Site color"
            >
              <Palette className="w-4 h-4" />
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/5 border border-white/5 text-purple-300 hover:text-purple-200 transition-colors cursor-pointer block lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Theme Studio Customizer trigger button (Always visible at far right) */}
            <button
              onClick={() => setIsThemeOpen(true)}
              className="p-2 rounded-xl bg-gradient-to-r from-red-650 via-purple-650 to-fuchsia-600 hover:from-red-500 hover:to-fuchsia-500 text-white shadow-lg cursor-pointer flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-xs font-bold gap-1 shrink-0"
              title="Open Theme Studio Customizer Panel"
            >
              <Palette className="w-4 h-4 text-white" />
              <span className="text-[9px] uppercase font-mono tracking-wider hidden sm:inline-block">Theme Studio</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Body container */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex-grow flex flex-col lg:flex-row gap-8 py-8">
        
        {/* Left PERSISTENT Desktop Sidebar (Column span 1) */}
        <aside className="w-64 shrink-0 hidden lg:flex flex-col gap-4">
          <div className="sticky top-24 p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl flex flex-col gap-6 shadow-2xl relative">
            <div className="px-1 border-b border-white/10 pb-2">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 block">Navigation</span>
              <span className="text-xs text-purple-400 font-mono mt-0.5 block">Explore Portal Index</span>
            </div>

            <nav className="flex flex-col gap-1.5 bg-transparent">
              {navItems.map(item => {
                const isActive = activeTab === item.name;
                
                // Immersive UI Active status class builder
                let dotColor = 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]';
                switch (preferences.accentColor) {
                  case 'crimson':
                    dotColor = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]';
                    break;
                  case 'indigo':
                    dotColor = 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]';
                    break;
                  case 'amber':
                    dotColor = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]';
                    break;
                  case 'violet':
                    dotColor = 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]';
                    break;
                  default:
                    dotColor = 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]';
                }

                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setSelectedMember(null);
                      setActiveTab(item.name);
                      if (item.name === 'Music') {
                        audioPlayer.startPlayingFirstTime();
                      }
                    }}
                    className="flex items-center h-10 px-4 rounded-lg font-medium transition-all text-left cursor-pointer group relative overflow-hidden"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebarIndicator"
                        className={`absolute inset-0 border-l-2 ${
                          preferences.accentColor === 'crimson' ? 'bg-rose-600/20 border-rose-500' :
                          preferences.accentColor === 'indigo' ? 'bg-indigo-600/20 border-indigo-500' :
                          preferences.accentColor === 'amber' ? 'bg-amber-600/20 border-amber-500' :
                          preferences.accentColor === 'violet' ? 'bg-violet-600/20 border-violet-500' :
                          'bg-purple-600/20 border-purple-500'
                        } rounded-r-lg z-0`}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className={`relative z-10 font-sans text-sm flex items-center gap-2.5 transition-colors duration-200 ${
                      isActive ? 'font-semibold text-white' : 'text-slate-400 group-hover:text-white'
                    }`}>
                      {isActive ? (
                        <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0 animate-pulse`} style={{ content: '""' }} />
                      ) : (
                        <span className="text-slate-500 group-hover:text-slate-300 transition-colors shrink-0">{item.icon}</span>
                      )}
                      <span>{item.name}</span>
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-white/10 pt-4 mt-2 space-y-4">
              <div>
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-500 block mb-2 text-center">
                  Official Socials
                </span>
                <div className="flex flex-wrap items-center gap-1.5 justify-center max-w-[180px] mx-auto">
                  <a
                    href={publishedConfig?.socialLinks?.instagram || "https://instagram.com/bts.bighitofficial"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-fuchsia-950/40 border border-white/5 hover:border-fuchsia-500/30 flex items-center justify-center text-slate-400 hover:text-fuchsia-400 transition-all group cursor-pointer"
                    title="Instagram Official"
                  >
                    <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </a>
                  <a
                    href={publishedConfig?.socialLinks?.twitter || "https://twitter.com/bts_bighit"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-sky-950/40 border border-white/5 hover:border-sky-500/30 flex items-center justify-center text-slate-400 hover:text-sky-400 transition-all group cursor-pointer"
                    title="X (Twitter) Official"
                  >
                    <Twitter className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </a>
                  <a
                    href={publishedConfig?.socialLinks?.youtube || "https://www.youtube.com/user/BANGTANTV"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-950/40 border border-white/5 hover:border-red-500/30 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all group cursor-pointer"
                    title="YouTube Official"
                  >
                    <Youtube className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </a>
                  <a
                    href={publishedConfig?.socialLinks?.facebook || "https://www.facebook.com/bangtan.official"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-blue-950/40 border border-white/5 hover:border-blue-500/30 flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all group cursor-pointer"
                    title="Facebook Official"
                  >
                    <Facebook className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </a>
                  <a
                    href={publishedConfig?.socialLinks?.pinterest || "https://www.pinterest.com/btsbighit/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-pink-950/40 border border-white/5 hover:border-pink-500/30 flex items-center justify-center text-slate-400 hover:text-pink-400 transition-all group cursor-pointer"
                    title="Pinterest Official"
                  >
                    <Pin className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </a>
                  <a
                    href={publishedConfig?.socialLinks?.telegram || "https://t.me/bts_bighit"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-cyan-950/40 border border-white/5 hover:border-cyan-500/30 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all group cursor-pointer"
                    title="Telegram Official"
                  >
                    <Send className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </a>
                  <a
                    href={publishedConfig?.socialLinks?.weverse || "https://weverse.io/bts/feed"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-teal-950/40 border border-white/5 hover:border-teal-500/30 flex items-center justify-center text-slate-400 hover:text-teal-400 transition-all group cursor-pointer"
                    title="More Official Channels"
                  >
                    <MoreHorizontal className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </a>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-500 block mb-2 text-center">
                  Website Owner
                </span>
                <div className="flex items-center gap-2.5 justify-center">
                  <a
                    href={publishedConfig?.socialLinks?.github || "https://github.com/shaifsiam"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-purple-950/40 border border-white/5 hover:border-purple-500/30 flex items-center justify-center text-slate-400 hover:text-purple-400 transition-all group cursor-pointer"
                    title="Developer GitHub"
                  >
                    <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </a>
                  <a
                    href={publishedConfig?.socialLinks?.linkedin || "https://linkedin.com/in/shaifsiam"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-blue-950/40 border border-white/5 hover:border-blue-500/30 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all group cursor-pointer"
                    title="Developer LinkedIn"
                  >
                    <Linkedin className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </a>
                  <a
                    href={publishedConfig?.socialLinks?.email ? `mailto:${publishedConfig.socialLinks.email}` : "mailto:shaifsiam@gmail.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-950/40 border border-white/5 hover:border-emerald-500/30 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all group cursor-pointer"
                    title="Email Creator"
                  >
                    <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile menu drawer Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%', filter: 'blur(8px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: '100%', filter: 'blur(8px)' }}
              transition={{ duration: 0.42, ease: [0.19, 1, 0.22, 1] }}
              className="fixed inset-0 z-50 bg-[#05000a]/98 backdrop-blur-xl flex flex-col p-6 block lg:hidden border-l border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <span className="font-sans font-black text-base text-white tracking-widest flex items-center gap-1.5 uppercase">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" /> Bangtan Portal
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

            {/* Mobile Instant search filter */}
            <div className="relative mb-6">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search portal index..."
                value={globalSearchQuery}
                onChange={(e) => {
                  setGlobalSearchQuery(e.target.value);
                  setShowSearchSuggestions(true);
                }}
                className="w-full bg-white/5 text-xs pl-10 pr-4 py-3 rounded-lg border border-white/10 text-white outline-none placeholder:text-slate-500 focus:border-purple-500/50"
              />
              {showSearchSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-white/10 bg-[#05000a] p-2.5 space-y-1.5 z-50 shadow-2xl">
                  {searchSuggestions.map((sug, i) => (
                    <div
                      key={i}
                      onClick={() => handlesSuggestionClick(sug)}
                      className="p-2 rounded hover:bg-purple-900/30 text-xs text-white cursor-pointer flex justify-between items-center border border-transparent hover:border-white/5"
                    >
                      <span>{sug.title}</span>
                      <span className="text-[10px] text-purple-400 font-mono">{sug.tab}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile List menu */}
            <div className="flex-grow overflow-y-auto space-y-1.5 flex flex-col pr-1">
              {navItems.map(item => {
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setSelectedMember(null);
                      setActiveTab(item.name);
                      setMobileMenuOpen(false);
                      if (item.name === 'Music') {
                        audioPlayer.startPlayingFirstTime();
                      }
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-left cursor-pointer transition-all ${
                      isActive 
                        ? `${getAccentBgClass()} text-white font-bold shadow-lg` 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="text-sm font-sans">{item.name}</span>
                  </button>
                );
              })}

              <div className="border-t border-white/10 pt-4 mt-4 space-y-4">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-500 block mb-2 text-center">
                    Official Socials
                  </span>
                  <div className="flex flex-wrap items-center gap-2 justify-center max-w-[240px] mx-auto">
                    <a
                      href={publishedConfig?.socialLinks?.instagram || "https://instagram.com/bts.bighitofficial"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/5 hover:bg-fuchsia-950/40 border border-white/5 flex items-center justify-center text-slate-400 hover:text-fuchsia-400 transition-all cursor-pointer"
                      title="Instagram Official"
                    >
                      <Instagram className="w-4.5 h-4.5" />
                    </a>
                    <a
                      href={publishedConfig?.socialLinks?.twitter || "https://twitter.com/bts_bighit"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/5 hover:bg-sky-950/40 border border-white/5 flex items-center justify-center text-slate-400 hover:text-sky-400 transition-all cursor-pointer"
                      title="X (Twitter) Official"
                    >
                      <Twitter className="w-4.5 h-4.5" />
                    </a>
                    <a
                      href={publishedConfig?.socialLinks?.youtube || "https://www.youtube.com/user/BANGTANTV"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/5 hover:bg-red-950/40 border border-white/5 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                      title="YouTube Official"
                    >
                      <Youtube className="w-4.5 h-4.5" />
                    </a>
                    <a
                      href={publishedConfig?.socialLinks?.facebook || "https://www.facebook.com/bangtan.official"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/5 hover:bg-blue-950/40 border border-white/5 flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all cursor-pointer"
                      title="Facebook Official"
                    >
                      <Facebook className="w-4.5 h-4.5" />
                    </a>
                    <a
                      href={publishedConfig?.socialLinks?.pinterest || "https://www.pinterest.com/btsbighit/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/5 hover:bg-pink-950/40 border border-white/5 flex items-center justify-center text-slate-400 hover:text-pink-400 transition-all cursor-pointer"
                      title="Pinterest Official"
                    >
                      <Pin className="w-4.5 h-4.5" />
                    </a>
                    <a
                      href={publishedConfig?.socialLinks?.telegram || "https://t.me/bts_bighit"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/5 hover:bg-cyan-950/40 border border-white/5 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all cursor-pointer"
                      title="Telegram Official"
                    >
                      <Send className="w-4.5 h-4.5" />
                    </a>
                    <a
                      href={publishedConfig?.socialLinks?.weverse || "https://weverse.io/bts/feed"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/5 hover:bg-teal-950/40 border border-white/5 flex items-center justify-center text-slate-400 hover:text-teal-400 transition-all cursor-pointer"
                      title="More Official Channels"
                    >
                      <MoreHorizontal className="w-4.5 h-4.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-500 block mb-2 text-center">
                    Website Owner
                  </span>
                  <div className="flex items-center gap-3 justify-center">
                    <a
                      href={publishedConfig?.socialLinks?.github || "https://github.com/shaifsiam"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/5 hover:bg-purple-950/40 border border-white/5 flex items-center justify-center text-slate-400 hover:text-purple-400 transition-all cursor-pointer"
                      title="Developer GitHub"
                    >
                      <Github className="w-4.5 h-4.5" />
                    </a>
                    <a
                      href={publishedConfig?.socialLinks?.linkedin || "https://linkedin.com/in/shaifsiam"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/5 hover:bg-blue-950/40 border border-white/5 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all cursor-pointer"
                      title="Developer LinkedIn"
                    >
                      <Linkedin className="w-4.5 h-4.5" />
                    </a>
                    <a
                      href={publishedConfig?.socialLinks?.email ? `mailto:${publishedConfig.socialLinks.email}` : "mailto:shaifsiam@gmail.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/5 hover:bg-emerald-950/40 border border-white/5 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all cursor-pointer"
                      title="Email Creator"
                    >
                      <Mail className="w-4.5 h-4.5" />
                    </a>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Main View Area */}
        <main className="flex-grow min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (selectedMember ? `-${selectedMember.id}` : '')}
              initial={{ opacity: 0, y: 24, scale: 0.97, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, scale: 0.97, filter: 'blur(8px)' }}
              transition={{ duration: 0.48, ease: [0.19, 1, 0.22, 1] }}
              className="outline-none"
            >
              
              {/* VIEW: HOME VIEW */}
              {activeTab === 'Home' && !selectedMember && (
                <div className="space-y-12 font-sans">
                  
                  {/* Premium cinematic Hero Banner */}
                  <div className="relative rounded-3xl border border-white/10 bg-black overflow-hidden shadow-2xl p-8 md:p-14 flex flex-col justify-between min-h-[380px] group/hero">
                    
                    {/* Background Banner Image */}
                    <div className="absolute inset-0 z-0 opacity-35 group-hover/hero:opacity-45 transition-opacity duration-1000 select-none pointer-events-none">
                      <img 
                        src={publishedConfig?.home?.heroImageUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80"} 
                        alt="Purple Wembley Stadium Stage Concert Background" 
                        className="w-full h-full object-cover scale-105 group-hover/hero:scale-100 transition-transform duration-[2000ms]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-950/90 via-purple-900/60 to-black/80" />
                    </div>

                    {/* Moving gradient background aura */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/10 via-transparent to-red-950/10 z-0 pointer-events-none" />
                    <div className="absolute top-0 right-0 p-6 md:p-10 flex items-start gap-4">
                      <div className="bg-red-600 text-[10px] font-bold px-2.5 py-1 rounded text-white flex items-center gap-1.5 shadow-lg shadow-red-600/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        LIVE
                      </div>
                    </div>

                    <div className="relative z-10 max-w-xl space-y-4">
                      {/* Festa Tag overlay */}
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono tracking-wider text-purple-300 uppercase">
                        <Gift className="w-3.5 h-3.5 text-purple-400 animate-bounce" /> FESTA Anniversary Showcase Live
                      </div>
                      
                      <h1 className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase mb-2">
                        BANGTAN <span className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)] font-sans">⟭⟬⁷</span> <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-red-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)] font-sans">
                          GALLERY
                        </span>
                      </h1>

                      <div className="h-14 md:h-12 flex items-center">
                        <p className="text-slate-300 font-sans italic text-sm md:text-base leading-relaxed">
                          " {typedText || 'Discovering beauty in the bulletproof path... 💜'} "
                          <span className="inline-block w-1.5 h-4 ml-1 bg-purple-400 animate-pulse" />
                        </p>
                      </div>

                      {/* Interconnected quick access CTA actions from Immersive UI design theme */}
                      <div className="flex gap-4 pt-3 flex-wrap">
                        <button 
                          onClick={() => handleQuickAccess('Videos')}
                          className="px-6 py-2.5 bg-white text-black hover:bg-slate-200 rounded-full font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-white/10"
                        >
                          Watch Now
                        </button>
                        <button 
                          onClick={() => handleQuickAccess('Timeline')}
                          className="px-6 py-2.5 bg-white/10 border border-white/25 hover:bg-white/15 rounded-full font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </div>

                    {/* Info status pill footers under Hero */}
                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/5 font-mono text-xs">
                      <div>
                        <span className="text-gray-500 uppercase block">Seoul Time KST</span>
                        <span className="text-xs text-white font-semibold block mt-0.5">{currentTime || '12:00:00 PM'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 uppercase block">Weather in Seoul</span>
                        <span className="text-xs text-white font-semibold block mt-0.5">🌥️ {seoulTemp} &bull; Breezy</span>
                      </div>
                      <div>
                        <span className="text-gray-500 uppercase block">Active Database</span>
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Online local data
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* circular 7-Members Ripple showcase */}
                  <section className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-1.5 group cursor-pointer" onClick={() => handleQuickAccess('Members')}>
                          Meet BTS Members <UserCheck className="w-5 h-5 text-purple-400" />
                        </h2>
                        <p className="text-gray-400 text-xs">Click circular portrait vectors below to open their deep biographies.</p>
                      </div>
                      <button onClick={() => handleQuickAccess('Members')} className="text-xs font-mono text-purple-400 hover:underline">See Profiles &rarr;</button>
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap justify-around gap-4 p-6 rounded-2xl border border-white/5 bg-black/45 backdrop-blur-md">
                      {(publishedConfig?.members || MEMBERS).map(m => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setSelectedMember(m);
                            setActiveTab('Members');
                          }}
                          className="flex flex-col items-center gap-2 cursor-pointer group"
                        >
                          <div className="relative">
                            {/* Ripple glowing layer on hover */}
                            <div className="absolute inset-0 rounded-full bg-purple-500/0 outline-none group-hover:scale-110 group-hover:bg-purple-600/35 transition-all duration-300" />
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 to-rose-500 opacity-0 group-hover:opacity-70 blur-md transition-all duration-300" />
                            <img
                              src={m.portraitUrl}
                              alt={m.name}
                              className="relative w-14 h-14 md:w-20 md:h-20 rounded-full object-cover border-2 border-white/10 group-hover:border-purple-400 transition-colors shadow-lg"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="font-sans font-bold text-xs text-gray-300 group-hover:text-purple-300 transition-colors">
                            {m.name} {m.emoji}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Golden Quotes & Lyrics - APPEARS AFTER MEMBER SECTION */}
                  <div className="w-full">
                    <BTSQuotesCarousel />
                  </div>

                  {/* Tour Countdown Carousel with daily live starlight ticks */}
                  <div className="w-full">
                    <TourCountdownCarousel config={publishedConfig?.countdown} />
                  </div>

                  {/* Curated Interactive Curved 3D Media Wall */}
                  <div className="w-full">
                    <InteractiveMediaWall config={publishedConfig?.showcase} onTileClick={handleQuickAccess} />
                  </div>

                  {/* Trending Showcase Snapping Carousel */}
                  <div className="w-full">
                    <TrendingCarousel config={publishedConfig?.trending} onNavigate={handleQuickAccess} />
                  </div>

                  {/* Glow Responsive Category Grid */}
                  <div className="w-full">
                    <InteractiveCategories config={publishedConfig?.categories} onCategoryClick={handleQuickAccess} />
                  </div>

                  {/* Curated Mixed Multiplatform Feed */}
                  <div className="w-full">
                    <HomeFeed config={publishedConfig} />
                  </div>

                  {/* Mini Highlights grid lists bento-like */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* News announcements highlights */}
                    <div className="p-6 rounded-2xl border border-white/5 bg-black/45 flex flex-col justify-between space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h3 className="font-sans font-bold text-white text-sm flex items-center gap-1.5 uppercase tracking-widest text-[#a855f7]">
                          <BookOpen className="w-4 h-4 text-purple-400" /> Latest Broadcasts
                        </h3>
                      </div>

                      <div className="space-y-3 flex-grow">
                        {(publishedConfig?.news && publishedConfig.news.length > 0 ? publishedConfig.news : NEWS_ARTICLES).slice(0, 2).map((n, idx) => (
                          <div key={idx} onClick={() => handleQuickAccess('News')} className="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.03] rounded-lg transition-colors cursor-pointer flex gap-3 min-w-0">
                            <div className="w-12 h-12 rounded overflow-hidden shrink-0 bg-purple-900/10">
                              <img src={n.imageUrl} alt={n.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-xs text-white line-clamp-1 leading-tight">{n.title}</h4>
                              <p className="text-[10px] text-gray-500 mt-1">{n.date} &rarr;</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => handleQuickAccess('News')} className="w-full py-2 bg-purple-950/30 text-purple-300 border border-purple-500/20 hover:bg-purple-900/35 text-xs font-mono rounded-lg font-semibold transition-colors">
                        See More News Archive
                      </button>
                    </div>

                    {/* Music/Albums highlights */}
                    <div className="p-6 rounded-2xl border border-white/5 bg-black/45 flex flex-col justify-between space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h3 className="font-sans font-bold text-white text-sm flex items-center gap-1.5 uppercase tracking-widest text-purple-450">
                          <Music className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} /> Featured Albums
                        </h3>
                      </div>

                      <div className="space-y-3 flex-grow">
                        {(publishedConfig?.albums && publishedConfig.albums.length > 0 ? publishedConfig.albums : ALBUMS).slice(0, 2).map((a, idx) => (
                          <div key={idx} onClick={() => handleQuickAccess('Music')} className="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.03] rounded-lg transition-colors cursor-pointer flex gap-3 min-w-0 select-none">
                            <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                              <img src={a.coverUrl} alt={a.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-xs text-white line-clamp-1 leading-tight">{a.title}</h4>
                              <p className="text-[10px] text-gray-500 mt-1">Tracks: {a.tracks?.length || 0} listed &rarr;</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button onClick={() => handleQuickAccess('Music')} className="w-full py-2 bg-purple-950/30 text-purple-300 border border-purple-500/20 hover:bg-purple-900/35 text-xs font-mono rounded-lg font-semibold transition-colors">
                        Search Full Tracklist
                      </button>
                    </div>

                  </div>

                  {/* Live Supporters Wall & Comunidad Section placed last before footer */}
                  <div className="w-full mt-10">
                    <SupportersWall />
                  </div>

                </div>
              )}

          {/* VIEW: MEMBERS LIST AND INDIVIDUAL BIOGRAPHIES */}
          {activeTab === 'Members' && (
            <div className="space-y-8 animate-fade-in font-sans">
              {!selectedMember ? (
                <>
                  <div className="border-b border-white/5 pb-6">
                    <h2 className="text-2xl md:text-3xl font-sans font-extrabold text-white">
                      Meet BTS Septet (Seven Members)
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Select any member profile to explore HD portraits, vital stats, complete biography, quotes and career journeys.
                    </p>
                  </div>

                  {/* Members Profiles Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(publishedConfig?.members || MEMBERS).map(member => (
                      <div
                        key={member.id}
                        onClick={() => setSelectedMember(member)}
                        className="group relative rounded-2xl border border-white/5 bg-black/55 overflow-hidden hover:border-purple-500/35 transition-all duration-300 hover:shadow-[0_10px_25px_-10px_rgba(168,85,247,0.2)] cursor-pointer"
                      >
                        <div className="h-64 overflow-hidden relative">
                          <img
                            src={member.portraitUrl}
                            alt={member.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                          
                          {/* Banner Floating Name */}
                          <div className="absolute bottom-4 left-4 z-10 text-white">
                            <div className="flex items-center gap-1 ml-0.5">
                              <span className="text-2xl font-sans font-extrabold">{member.name}</span>
                              <span className="text-xl">{member.emoji}</span>
                            </div>
                            <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider">{member.fullName}</span>
                          </div>
                        </div>

                        <div className="p-4 space-y-3.5">
                          <div className="flex flex-wrap gap-1">
                            {member.position.slice(0, 2).map((pos, idx) => (
                              <span key={idx} className="text-[9px] font-mono px-2 py-0.5 rounded border border-purple-500/20 bg-purple-950/20 text-purple-300">
                                {pos}
                              </span>
                            ))}
                          </div>
                          
                          <p className="text-xs text-gray-400 leading-relaxed font-sans line-clamp-2">
                            {member.biography}
                          </p>

                          <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-purple-400">
                            <span>MBTI: {member.mbti}</span>
                            <span className="group-hover:underline">Detailed Bio &rarr;</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Detail sub component */
                <MemberProfileDetail
                  member={(publishedConfig?.members || MEMBERS).find((m: any) => m.id === selectedMember?.id) || selectedMember}
                  onBack={() => setSelectedMember(null)}
                />
              )}
            </div>
          )}

          {/* VIEW: MUSIC SECTION */}
          {activeTab === 'Music' && <MusicSection config={publishedConfig} />}

          {/* VIEW: LIVE STREAM */}
          {activeTab === 'Live Stream' && <LiveStreamSection />}

          {/* VIEW: GENERATE PIC STUDIO SECTION */}
          {activeTab === 'Generate Pic' && (
            <GeneratePicStudio 
              onBack={() => setActiveTab('Home')} 
              accentColor={preferences.accentColor} 
            />
          )}

          {/* VIEW: VIDEO SECTION CLONE */}
          {activeTab === 'Videos' && <YouTubeClone config={publishedConfig} />}

          {/* VIEW: PHOTO GALLERY MASONRY */}
          {activeTab === 'Gallery' && <GallerySection items={publishedConfig?.gallery} />}

          {/* VIEW: TIMELINE MILESTONES */}
          {activeTab === 'Timeline' && <TimelineSection items={publishedConfig?.timeline} />}

          {/* VIEW: LATEST NEWS */}
          {activeTab === 'News' && <NewsSection items={publishedConfig?.news} />}

          {/* VIEW: EVENTS AND COORDINATES */}
          {activeTab === 'Events' && <EventsSection items={publishedConfig?.events} />}

          {/* VIEW: COMMUNITY MEME VAULT */}
          {activeTab === 'Memes' && <MemesSection />}

          {/* VIEW: DOWNLOADS BASE */}
          {activeTab === 'Downloads' && <DownloadsSection items={publishedConfig?.downloads} />}

          {/* VIEW: BTS GLOBAL QUEST */}
          {activeTab === 'Play Game' && <BTSGlobalQuest config={publishedConfig} />}

          {/* VIEW: FAQ DIRECTORY */}
          {activeTab === 'FAQ' && <FAQSection items={publishedConfig?.faqs} />}

          {/* VIEW: VOTING CENTER */}
          {activeTab === 'Voting Center' && (
            <VotingCenterSection 
              votingEvents={publishedConfig?.votingEvents} 
              onRefresh={fetchPublishedConfig} 
            />
          )}

          {/* VIEW: CONTACT TRANSMITTER */}
          {activeTab === 'Contact' && <ContactSection config={publishedConfig} />}

          {/* VIEW: FEEDBACK INTERACTION */}
          {activeTab === 'Feedback' && <FeedbackSection />}

          {/* VIEW: GLOBAL SETTINGS PANEL */}
          {activeTab === 'Settings' && (
            <SettingsSection
              preferences={preferences}
              onPreferencesChange={handlePreferencesChange}
            />
          )}



            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Footer System */}
      <footer className="mt-20 border-t border-white/10 bg-black/45 backdrop-blur-xl py-12 text-sm text-slate-400 font-sans">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <h3 className="text-white font-sans font-black flex items-center gap-2 uppercase text-base shrink-0 select-none">
              <span className="text-purple-400">⟭⟬⁷</span> {publishedConfig?.sidebar?.logoText || 'BANGTAN GALLERY'}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
              {publishedConfig?.footer?.description || 'The ultimate independent fan coordinates created by ARMY to track BTS. Enjoy music sheets, media players and 13 June anniversary countdown animations.'}
            </p>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-purple-300 font-mono text-xs uppercase font-bold tracking-wider">Quick Navigation</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['Home', 'Members', 'Music', 'Videos', 'Gallery', 'Timeline', 'News', 'Events', 'Memes'].map(link => (
                <span
                  key={link}
                  onClick={() => handleQuickAccess(link)}
                  className="hover:text-purple-300 transition-colors cursor-pointer"
                >
                  {link}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-purple-300 font-mono text-xs uppercase font-bold tracking-wider">Resources</h4>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <span onClick={() => handleQuickAccess('FAQ')} className="hover:text-purple-300 transition-colors cursor-pointer">Help FAQ Accordion</span>
              <span onClick={() => handleQuickAccess('Downloads')} className="hover:text-purple-300 transition-colors cursor-pointer">Device Wallpapers (HD)</span>
              <span onClick={() => handleQuickAccess('Contact')} className="hover:text-purple-300 transition-colors cursor-pointer">Feedback support team</span>
            </div>
          </div>

          <div className="space-y-3.5 font-sans">
            <h4 className="text-purple-300 font-mono text-xs uppercase font-bold tracking-wider">Fan Disclaimer</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              This website is an independent tribute site. Any trademarks, audio embeds, trademarks, or visual imagery belong to HYBE, BIGHIT Music, or official artists. No infringement is intended.
            </p>
            <div className="pt-2 text-xs border-t border-white/5 flex justify-between items-center text-gray-500">
              <div className="flex items-center gap-1.5">
                <span>Borahae! ARMY 💜</span>
              </div>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                id="back-to-top-btn"
                className="hover:text-purple-300 font-mono text-[10px] flex items-center gap-1 cursor-pointer bg-white/5 px-2 py-1 rounded"
              >
                Top <ArrowUp className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-8 mt-8 border-t border-white/10 text-center text-xs text-slate-500 font-mono flex flex-col md:flex-row justify-between items-center gap-4">
          <span onClick={handleCopyrightClick} className="cursor-default select-none">
            {publishedConfig?.footer?.copyright || `© ${new Date().getFullYear()} Bangtan Gallery. Crafted for BTS and ARMY.`}
          </span>
          <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> BTS 13 Winters & Springs</span>
        </div>
      </footer>

      {/* Persistent Mini Controller for Background Audio Playback */}
      <GlobalMiniPlayer 
        onNavigateToMusic={() => {
          setSelectedMember(null);
          setActiveTab('Music');
        }}
        activeTab={activeTab}
      />

      {/* Immediacy blocker Welcome popup prompt */}
      <WelcomePopup onAccept={() => {}} />

      {/* Draggable Immersive Visual Mode Controller Buttons */}
      <DraggableButton
        id="purple_love"
        icon="💜"
        label="Purple Love"
        tooltipText={isPurpleLove ? '💜 Disable Purple Love' : '💜 Enable Purple Love'}
        isActive={isPurpleLove}
        onToggle={togglePurpleLove}
        defaultTop={20}
        defaultRight={20}
      />

      <DraggableButton
        id="fireworks"
        icon="🎆"
        label="Fireworks"
        tooltipText={isFireworks ? '🎆 Disable Fireworks' : '🎆 Enable Fireworks'}
        isActive={isFireworks}
        onToggle={toggleFireworks}
        defaultTop={80}
        defaultRight={20}
      />

      {/* Styled Floating Customizer Drawer */}
      <AnimatePresence>
        {isThemeOpen && (
          <ThemeCustomizerPanel isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />
        )}
      </AnimatePresence>

      {/* Floating Ko-fi Me CTA Button (permanently active on bottom-right corner) */}
      {(() => {
        const kofiUrl = publishedConfig?.footer?.kofiUrl !== undefined ? publishedConfig.footer.kofiUrl : "https://ko-fi.com/shaifsiam";
        if (!kofiUrl || kofiUrl.trim() === "") return null;
        return (
          <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 pointer-events-auto">
            <a
              href={kofiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-gradient-to-r from-[#ff5e5b] to-[#ea3834] text-white flex items-center justify-center shadow-[0_8px_30px_rgba(255,94,91,0.4)] hover:shadow-[0_8px_40px_rgba(236,72,153,0.5)] border border-white/10 hover:border-white/25 transition-all hover:scale-110 active:scale-95 cursor-pointer group"
              title="Support on Ko-fi"
            >
              <Coffee className="w-5 h-5 text-white animate-bounce" style={{ animationDuration: '2.5s' }} />
            </a>
          </div>
        );
      })()}

      {/* Admin Panel Portal Overlays */}
      {isAdminOpen && (
        <AdminPanel 
          onClose={() => {
            setIsAdminOpen(false);
            if (window.location.pathname === '/admin') {
              window.history.pushState({}, '', '/');
            } else if (window.location.hash.startsWith('#admin')) {
              window.location.hash = '';
            }
          }}
          publicThemeConfig={publishedConfig?.theme}
          onThemeConfigChange={(newTheme: any) => {
            if (newTheme?.accentColor) {
              setPreferences((prev: any) => ({ ...prev, accentColor: newTheme.accentColor }));
            }
          }}
          onPublishSuccess={() => {
            fetchPublishedConfig();
          }}
        />
      )}

    </div>
    </>
  );
}

import { BackendProvider } from './context/BackendContext';

export default function App() {
  return (
    <BackendProvider>
      <ThemeCustomProvider>
        <AudioPlayerProvider>
          <AppContent />
        </AudioPlayerProvider>
      </ThemeCustomProvider>
    </BackendProvider>
  );
}
