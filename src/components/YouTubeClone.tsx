import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, Play, ExternalLink, RefreshCw, Sparkles, Youtube, Send, Video,
  Clock, Calendar, Info, Trash2, Heart, Share2, X, Plus, AlertCircle, Check, Download, Layers,
  Pin, Edit3, Film, Search, UploadCloud, Eye, Star, User, Compass, Music, AlertTriangle, PlayCircle
} from 'lucide-react';
import { useBackend } from '../context/BackendContext';
import { getYoutubeEmbedUrl, getYoutubeVideoId } from './youtubeUtils';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string; // This holds Month/Era e.g. "2020" or user select
  era?: string; // Selected Era/Year e.g. "2020"
  videoCategory?: string; // MV, Run BTS, Live Stream Session, Fan Made, Showcase
  isCustomUpload?: boolean;
  uploadedAt: string;
  submittedBy?: string;
  displayName?: string;
  imageUrl?: string;
  isPinned?: boolean;
}

// Media service helpers
const getPlatformName = (url: string): string => {
  if (!url) return 'YouTube';
  const l = url.toLowerCase();
  if (l.includes('twitter.com') || l.includes('x.com')) return 'X / Twitter';
  if (l.includes('t.me')) return 'Telegram';
  return 'YouTube';
};

const isValidVideoLink = (url: string): boolean => {
  if (!url) return false;
  const l = url.toLowerCase().trim();
  return l.includes('youtube.com') || l.includes('youtu.be') || l.includes('twitter.com') || l.includes('x.com') || l.includes('t.me');
};

const getTwitterTweetId = (url: string): string => {
  if (!url) return '';
  const match = url.match(/(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/([0-9]+)/);
  return match ? match[1] : '';
};

const getVideoThumbnail = (url: string, fallbackImg?: string): string => {
  if (fallbackImg) return fallbackImg;
  if (!url) return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=450';
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = getYoutubeVideoId(url);
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  
  if (url.includes('twitter.com') || url.includes('x.com')) {
    return 'https://images.unsplash.com/photo-1611605698335-8b15d27e03f9?w=450'; // Dark Twitter/X aesthetic
  }
  
  if (url.includes('t.me')) {
    return 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=450'; // Dark Telegram logo/symbol aesthetic
  }
  
  return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=450';
};

const getMediaEmbedUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return getYoutubeEmbedUrl(url);
  }
  if (url.includes('t.me/')) {
    const cleanUrl = url.split('?')[0];
    return `${cleanUrl}?embed=1`;
  }
  if (url.includes('twitter.com') || url.includes('x.com')) {
    const tweetId = getTwitterTweetId(url);
    if (tweetId) {
      return `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=dark`;
    }
  }
  return '';
};

const getPlatformIcon = (url: string): React.ReactNode => {
  if (!url) return <Youtube className="w-4 h-4" />;
  const l = url.toLowerCase();
  if (l.includes('twitter.com') || l.includes('x.com')) return <Video className="w-4 h-4 text-sky-400" />;
  if (l.includes('t.me')) return <Send className="w-4 h-4 text-blue-400" />;
  return <Youtube className="w-4 h-4 text-red-500" />;
};

const VIDEO_CATEGORIES = [
  'All Types',
  'MV',
  'Run BTS',
  'Live Stream Session',
  'Fan Made',
  'Showcase'
];

const TIMELINE_YEARS = [
  'All Years', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '25/26 Solos', '2020', '2021', '2022', '2023', '2024', '2025', '2026'
];

export default function YouTubeClone({ config: passedConfig }: { config?: any }) {
  const { currentUser, registerUser, refreshData } = useBackend();
  const isAdmin = !!localStorage.getItem('bts_admin_token');

  // Inline registration state
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerDisplayName, setRegisterDisplayName] = useState('');
  const [registerError, setRegisterError] = useState('');

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [featuredVideoId, setFeaturedVideoId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedCategory, setSelectedCategory] = useState('All Types');

  // Submit Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formYear, setFormYear] = useState('2026');
  const [formCategory, setFormCategory] = useState('MV'); // Default Category
  const [youtubeLink, setYoutubeLink] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Active Theater Player Modals
  const [activePlayVideo, setActivePlayVideo] = useState<VideoItem | null>(null);

  // Custom stylish Glass Delete Dialogue state
  const [deleteConfirmVideo, setDeleteConfirmVideo] = useState<VideoItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch from endpoint
  const fetchConfigAndVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/config/published');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          const list = Array.isArray(data.videos) ? data.videos : [];
          setVideos(list);
          if (data.featuredVideoId) {
            setFeaturedVideoId(data.featuredVideoId);
          } else {
            setFeaturedVideoId('');
          }
        }
      }
    } catch (err) {
      console.error('Failed to load published videos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigAndVideos();
    const interval = setInterval(fetchConfigAndVideos, 8000); // 8s polling
    return () => clearInterval(interval);
  }, []);

  // Sync state with parent passedConfig if any
  useEffect(() => {
    if (passedConfig) {
      const list = Array.isArray(passedConfig.videos) ? passedConfig.videos : [];
      setVideos(list);
      if (passedConfig.featuredVideoId) {
        setFeaturedVideoId(passedConfig.featuredVideoId);
      }
    }
  }, [passedConfig]);

  const handleRegisterUserInline = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    if (!registerUsername.trim()) {
      setRegisterError('Username is required.');
      return;
    }
    if (!registerDisplayName.trim()) {
      setRegisterError('Display name is required.');
      return;
    }
    const cleanUsername = registerUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername) {
      setRegisterError('Invalid username. Alphanumeric and underscore characters only.');
      return;
    }
    const ok = await registerUser(cleanUsername, registerDisplayName.trim());
    if (!ok) {
      setRegisterError('Registration failed. Username may be taken.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!currentUser || !currentUser.username) {
      setFormError('Establishing an ARMY username is required before pitching broadcasts.');
      return;
    }

    if (!formTitle.trim()) {
      setFormError('Video Title is required.');
      return;
    }

    if (!youtubeLink.trim()) {
      setFormError('Please provide a valid stream URL link first.');
      return;
    }

    if (!isValidVideoLink(youtubeLink)) {
      setFormError('Only links from YouTube, X / Twitter, or Telegram are supported for security.');
      return;
    }

    setUploading(true);
    setUploadProgress(30);

    try {
      const finalUrl = youtubeLink.trim();
      setUploadProgress(60);

      // Call submit API
      const response = await fetch('/api/video/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDesc.trim(),
          era: formYear, // selected Era/Year
          youtubeUrl: finalUrl,
          fileBase64: '',
          filename: '',
          fileType: '',
          submittedBy: currentUser.username,
          displayName: currentUser.displayName || currentUser.username,
          category: formCategory // Video Category (MV, Run BTS, Live Stream Session, Fan Made, Showcase)
        })
      });

      setUploadProgress(85);

      let resData: any = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        resData = await response.json();
      } else {
        await response.text();
        throw new Error(`Server returned HTML error content instead of JSON.`);
      }

      if (!response.ok) {
        throw new Error(resData?.error || 'Server error during submission.');
      }
      setUploadProgress(100);
      setFormSuccess('Video submitted & auto-published live instantly! 💜🔮');

      // Clear Form state
      setFormTitle('');
      setFormDesc('');
      setYoutubeLink('');

      // Refresh data
      fetchConfigAndVideos();
      if (refreshData) refreshData();

      // Close modal after delay
      setTimeout(() => {
        setShowUploadModal(false);
        setFormSuccess('');
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'An unexpected error occurred.');
    } finally {
      setUploading(false);
    }
  };

  // Admin select featured action helper
  const handleSetFeatured = async (videoId: string) => {
    try {
      const res = await fetch('/api/video/user-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set-featured',
          videoId,
          adminToken: localStorage.getItem('bts_admin_token') || ''
        })
      });
      if (res.ok) {
        setFeaturedVideoId(videoId);
        fetchConfigAndVideos();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update featured video.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Video API action call
  const handleDeleteConfirmCall = async () => {
    if (!deleteConfirmVideo) return;
    try {
      const res = await fetch('/api/video/user-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          videoId: deleteConfirmVideo.id,
          username: currentUser?.username || 'guest',
          adminToken: localStorage.getItem('bts_admin_token') || ''
        })
      });
      if (res.ok) {
        if (activePlayVideo?.id === deleteConfirmVideo.id) {
          setActivePlayVideo(null);
        }
        setDeleteConfirmVideo(null);
        fetchConfigAndVideos();
        if (refreshData) refreshData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete video.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Gather & Sort Videos: Featured always first, then Newest First!
  const getProcessedVideos = () => {
    let list = [...videos];

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(v => 
        (v.title || '').toLowerCase().includes(q) || 
        (v.description || '').toLowerCase().includes(q)
      );
    }

    // Filter by Selected Timeline Year
    if (selectedYear !== 'All Years') {
      const yearStr = selectedYear === '25/26 Solos' ? '2025' : selectedYear;
      list = list.filter(v => (v.category === yearStr || v.era === yearStr));
    }

    // Filter by custom category
    if (selectedCategory !== 'All Types') {
      list = list.filter(v => (v.videoCategory === selectedCategory || v.category === selectedCategory));
    }

    // Sort: Featured first, then newest first
    return list.sort((a, b) => {
      const isA_Featured = a.id === featuredVideoId;
      const isB_Featured = b.id === featuredVideoId;

      if (isA_Featured && !isB_Featured) return -1;
      if (!isA_Featured && isB_Featured) return 1;

      // Standard Chronological desc (fallback id timestamp comparison)
      const aTime = a.id.split('-').find(p => /^\d+$/.test(p)) || '0';
      const bTime = b.id.split('-').find(p => /^\d+$/.test(p)) || '0';
      return parseInt(bTime) - parseInt(aTime);
    });
  };

  const processedVideos = getProcessedVideos();
  const featuredVideoItem = videos.find(v => v.id === featuredVideoId) || videos[0];

  return (
    <div className="w-full space-y-10 py-2 animate-fade-in font-sans text-white">
      
      {/* 1. FEATURED VIDEO HERO PANEL */}
      {featuredVideoItem && (
        <section id="featured-video-hero-card" className="w-full rounded-3xl overflow-hidden border border-purple-500/20 bg-[#0c051a]/85 backdrop-blur-2xl relative shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-[#090412] via-transparent to-transparent z-[2]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-6 md:p-8 relative z-10 items-center">
            
            {/* Display Video Iframe / Image Preview */}
            <div className="lg:col-span-3 aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-inner relative group bg-black/60">
              <iframe
                title={`Featured Cinema: ${featuredVideoItem.title}`}
                className="w-full h-full"
                src={getYoutubeEmbedUrl(featuredVideoItem.url)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Featured Video Meta Details */}
            <div className="lg:col-span-2 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[10px] font-mono uppercase tracking-widest leading-none font-black animate-pulse">
                <Star className="w-3.5 h-3.5 fill-purple-400/30" /> SPOTLIGHT PREVIEW
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-purple-300 uppercase leading-tight tracking-wider line-clamp-2">
                  {featuredVideoItem.title}
                </h1>
                <p className="text-gray-400 text-xs md:text-sm font-sans font-normal leading-relaxed line-clamp-3">
                  {featuredVideoItem.description || "The central spotlight interactive broadcast promoted directly by the Admin CMS center. Tune in!"}
                </p>
              </div>

              {/* Status Row */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-purple-300/80">
                <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded border border-white/5 uppercase">
                  <Film className="w-3.5 h-3.5" />
                  {featuredVideoItem.videoCategory || "Official Release"}
                </span>
                <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded border border-white/5">
                  <Calendar className="w-3.5 h-3.5" />
                  {featuredVideoItem.era || featuredVideoItem.category || "All Eras"}
                </span>
                {featuredVideoItem.displayName && (
                  <span className="flex items-center gap-1 bg-purple-950/45 px-2.5 py-1 rounded border border-purple-500/20 text-purple-300">
                    <User className="w-3 h-3 text-purple-400" />
                    By: {featuredVideoItem.displayName}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => setActivePlayVideo(featuredVideoItem)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-sans font-bold text-xs flex items-center gap-2 cursor-pointer transition-all hover:shadow-lg hover:shadow-purple-600/25 active:scale-95"
                >
                  <PlayCircle className="w-4 h-4 fill-white/10" /> Cinema Mode
                </button>
                <a
                  href={featuredVideoItem.url}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  Open Stream <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* 2. CONTROLS NAVIGATION DECK */}
      <section className="p-6 rounded-3xl border border-purple-500/10 bg-[#090412]/80 backdrop-blur-xl space-y-6">
        
        {/* Top filter row: Seek & Submit */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          
          {/* Seek Input */}
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search through official BTS archives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#140b24]/80 border border-purple-500/20 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder:text-gray-500 transition-all font-sans"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {/* Category selection */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#140b24]/90 border border-purple-500/20 text-xs text-purple-200 focus:outline-none cursor-pointer font-mono uppercase tracking-wider"
            >
              {VIDEO_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Launch Submission CTA */}
            <button
              onClick={() => {
                setFormError('');
                setFormSuccess('');
                setShowUploadModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 font-sans font-black text-xs uppercase tracking-wider text-white shadow-lg shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer ml-auto transition-all active:scale-95 hover:brightness-110"
            >
              <Plus className="w-4 h-4" /> Submit Video
            </button>
          </div>

        </div>

        {/* Timeline Era Years Horizontal Scrollbar */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-black block">
            Chronology Timeline Filtering Coordinates
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent">
            {TIMELINE_YEARS.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                  selectedYear === year 
                    ? 'bg-purple-600 border border-purple-400/30 text-white shadow shadow-purple-600/30 scale-105'
                    : 'bg-[#180e2d]/60 border border-white/5 text-purple-300/70 hover:text-white hover:bg-purple-950/40'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

      </section>

      {/* 3. MAIN GALLERY GRID */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
          <p className="text-xs font-mono text-gray-500">Retrieving official video logs from Firestore...</p>
        </div>
      ) : processedVideos.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-white/5 bg-white/[0.01]">
          <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-400">No broadcasts found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">
            There are no videos matching "{searchQuery}" under {selectedYear} / {selectedCategory}. Be the first to share one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {processedVideos.map((vid, idx) => {
              const isFeatured = vid.id === featuredVideoId;
              const cardThumbnail = getVideoThumbnail(vid.url, vid.imageUrl);

              return (
                <motion.article
                  key={vid.id}
                  id={`video-card-${vid.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.4) }}
                  className={`group rounded-2xl border bg-[#0d071a]/80 backdrop-blur-xl overflow-hidden flex flex-col relative transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-600/10 ${
                    isFeatured 
                      ? 'border-purple-500/40 ring-1 ring-purple-500/20 shadow-purple-600/5' 
                      : 'border-white/5 hover:border-purple-500/20'
                  }`}
                >
                  {/* Aspect Video frame */}
                  <div className="aspect-video w-full overflow-hidden bg-black/40 relative cursor-pointer" onClick={() => setActivePlayVideo(vid)}>
                    <img
                      src={cardThumbnail}
                      alt={vid.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Play hover button overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-purple-600/90 flex items-center justify-center text-white shadow-xl transition-all scale-95 group-hover:scale-100">
                        <Play className="w-5 h-5 fill-white" />
                      </div>
                    </div>

                    {/* Left overlay chips */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                      <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur border border-white/10 text-[9px] font-mono uppercase tracking-wider text-white">
                        {vid.videoCategory || "Official Release"}
                      </span>
                      {isFeatured && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-600 border border-purple-400/20 text-[9px] font-mono uppercase tracking-widest text-white flex items-center gap-1 font-black">
                          <Star className="w-3 h-3 fill-white" /> SPOTLIGHT
                        </span>
                      )}
                    </div>

                    {/* Source platform badge overlay bottom-right */}
                    <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-md border border-white/5 text-[9px] font-mono text-purple-300 flex items-center gap-1.5">
                      {getPlatformIcon(vid.url)}
                      {getPlatformName(vid.url)}
                    </span>
                  </div>

                  {/* Body Text */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5 cursor-pointer" onClick={() => setActivePlayVideo(vid)}>
                      <h3 className="font-extrabold text-white text-sm line-clamp-2 leading-tight uppercase group-hover:text-purple-300 transition-colors">
                        {vid.title}
                      </h3>
                      <p className="text-gray-400 text-xs line-clamp-2 font-sans font-normal leading-relaxed">
                        {vid.description || "ARMY Submission community broadcast video on timeline."}
                      </p>
                    </div>

                    {/* Metadata block updated with date and username */}
                    <div className="flex flex-col gap-2.5 text-[10px] font-mono text-slate-500 pt-3 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 uppercase">
                          <Calendar className="w-3.5 h-3.5" />
                          Era: {vid.era || vid.category || "2026"}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          {vid.uploadedAt || "June 2026"}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-purple-300 font-bold truncate max-w-[120px]" title={`Uploaded by ${vid.displayName || "Anonymous ARMY"}`}>
                          By: @{vid.displayName || "Anonymous ARMY"}
                        </span>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setActivePlayVideo(vid)}
                            className="px-3 py-1.5 rounded bg-purple-600/35 hover:bg-purple-600 border border-purple-500/30 hover:border-purple-400 text-purple-200 hover:text-white font-bold uppercase tracking-wider text-[9px] transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" /> Watch Now
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* 4. SUBMIT VIDEO MODAL OVERLAY */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            id="video-submit-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-[#140b24]/95 border border-purple-500/30 rounded-3xl p-6 shadow-2xl relative space-y-5 overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white border border-white/10 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-purple-400 font-bold block">
                  COMMUNITY BOARD CASTING
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-400" /> Pitch BTS Broadcast
                </h3>
                <p className="text-gray-400 text-xs">
                  Acknowledge that your submission will be auto-published live instantly to the selected Era coordinates!
                </p>
              </div>

              {!currentUser ? (
                <form onSubmit={handleRegisterUserInline} className="space-y-4 font-sans text-xs">
                  <div className="p-3.5 rounded-2xl bg-purple-900/15 border border-purple-500/20 text-center space-y-2">
                    <User className="w-8 h-8 text-purple-400 mx-auto" />
                    <h4 className="font-bold text-white uppercase text-xs">Establish ARMY Identity</h4>
                    <p className="text-purple-300/80 text-[11px] leading-relaxed">
                      A registered ARMY nickname is required to pitch broadcasts or tracks onto the public timeline. Type yours below!
                    </p>
                  </div>

                  {registerError && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-red-400 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{registerError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] text-purple-300 uppercase block">Username * (only lowercase letters, numbers & underscore)</label>
                    <input
                      type="text"
                      required
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="e.g. dynamite_stan"
                      className="w-full bg-black/40 border border-purple-500/10 hover:border-purple-500/30 focus:border-purple-400 focus:outline-none rounded-lg p-2.5 text-white font-sans placeholder:text-gray-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] text-purple-300 uppercase block">Display Name *</label>
                    <input
                      type="text"
                      required
                      value={registerDisplayName}
                      onChange={(e) => setRegisterDisplayName(e.target.value)}
                      placeholder="e.g. Butter Bias ARMY 💜"
                      className="w-full bg-black/40 border border-purple-500/10 hover:border-purple-500/30 focus:border-purple-400 focus:outline-none rounded-lg p-2.5 text-white font-sans placeholder:text-gray-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black uppercase tracking-wider text-center cursor-pointer shadow-lg"
                  >
                    Register & Continue
                  </button>
                </form>
              ) : (
                <>
                  {/* Error / Success feedback blocks */}
                  {formError && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-red-400 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {formSuccess && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-green-950/40 border border-green-500/20 text-green-400 text-xs">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{formSuccess}</span>
                    </div>
                  )}

                  {/* Content form */}
                  <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-xs">
                
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] text-purple-300 uppercase block">Video Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Dynamite live showcase at Grand Central Station"
                    className="w-full bg-black/40 border border-purple-500/10 hover:border-purple-500/30 focus:border-purple-400 focus:outline-none rounded-lg p-2.5 text-white placeholder:text-gray-600 font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] text-purple-300 uppercase block">Short Description</label>
                  <textarea
                    rows={2}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Provide a short description of the live performance or edit..."
                    className="w-full bg-black/40 border border-purple-500/10 hover:border-purple-500/30 focus:border-purple-400 focus:outline-none rounded-lg p-2.5 text-white placeholder:text-gray-600 font-sans"
                  />
                </div>

                {/* Categories and chronology */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] text-purple-300 uppercase block">Video Category *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-black/40 border border-purple-500/10 hover:border-purple-500/30 focus:border-purple-400 focus:outline-none rounded-lg p-2.5 text-white font-mono uppercase tracking-wider"
                    >
                      {VIDEO_CATEGORIES.filter(c => c !== 'All Types').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="font-mono text-[10px] text-purple-300 uppercase block">Chronological Year *</label>
                    <select
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      className="w-full bg-black/40 border border-purple-500/10 hover:border-purple-500/30 focus:border-purple-400 focus:outline-none rounded-lg p-2.5 text-white font-mono"
                    >
                      {TIMELINE_YEARS.filter(y => y !== 'All Years').map(year => {
                        const val = year === '25/26 Solos' ? '2025' : year;
                        return <option key={year} value={val}>{year}</option>;
                      })}
                    </select>
                  </div>
                </div>

                {/* Links-only stream input address */}
                <div className="space-y-1.5 animate-fade-in">
                  <label className="font-mono text-[10px] text-purple-300 uppercase block">Stream Video URL Link Address *</label>
                  <input
                    type="url"
                    required
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                    placeholder="Paste YouTube, X (Twitter), or Telegram Video URL link..."
                    className="w-full bg-black/40 border border-purple-500/10 hover:border-purple-500/30 focus:border-purple-400 focus:outline-none rounded-lg p-2.5 text-white placeholder:text-gray-600 font-sans"
                  />
                  <p className="text-[10px] text-purple-400/80 font-mono">
                    Supported: YouTube, X/Twitter, and Telegram shared posts.
                  </p>
                </div>

                {/* Previews wrapper */}
                {youtubeLink && isValidVideoLink(youtubeLink) && (
                  <div className="space-y-3 p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/15 text-center animate-fade-in font-sans">
                    <span className="font-mono text-[9px] text-purple-400 uppercase tracking-wider block font-bold">
                      Live {getPlatformName(youtubeLink)} Video Preview (Pre-Publish)
                    </span>
                    <div className="aspect-video max-w-sm mx-auto rounded-xl overflow-hidden border border-white/10 shadow-2xl relative bg-black">
                      {youtubeLink.toLowerCase().includes('t.me') || youtubeLink.toLowerCase().includes('twitter.com') || youtubeLink.toLowerCase().includes('x.com') ? (
                        <iframe
                          title="Platform Live Post Embed Preview"
                          className="w-full h-full border-0 bg-black"
                          src={getMediaEmbedUrl(youtubeLink)}
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full relative">
                          <img
                            src={getVideoThumbnail(youtubeLink)}
                            alt="Platform Preview"
                            className="w-full h-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 text-left">
                            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/85 border border-white/5 text-[8.5px] font-mono text-purple-300 flex items-center gap-1">
                              {getPlatformIcon(youtubeLink)}
                              {getPlatformName(youtubeLink)}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-purple-600/95 absolute inset-0 m-auto flex items-center justify-center text-white border border-white/10 shadow-lg shadow-purple-600/30">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </div>
                            <h4 className="text-[11px] font-bold text-white truncate">{formTitle.trim() || 'Untitled Broadcast'}</h4>
                            <p className="text-[9px] text-purple-200/80 truncate font-light leading-none mt-0.5">{formDesc.trim() || 'No description...'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Upload progress indicator */}
                {uploading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-purple-400 font-mono">
                      <span>Uploading to fast CDN...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Submit trigger */}
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-sans font-black uppercase tracking-wider text-center cursor-pointer shadow-lg shadow-purple-600/15 disabled:opacity-50 transition-all"
                >
                  {uploading ? 'Processing Broadcast...' : 'Submit Pitch to Era Queue'}
                </button>

              </form>
                </>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. CINEMA THEATER OVERLAY PLAYER */}
      <AnimatePresence>
        {activePlayVideo && (
          <motion.div
            id="cinema-theater-overlay-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 lg:p-8"
          >
            <button
              onClick={() => setActivePlayVideo(null)}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white border border-white/10 cursor-pointer transition-all z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-4xl bg-[#090412] rounded-3xl overflow-hidden border border-purple-500/20 shadow-2xl relative"
            >
              <div className="aspect-video w-full bg-black relative flex items-center justify-center">
                {activePlayVideo.url && (activePlayVideo.url.includes('youtube.com') || activePlayVideo.url.includes('youtu.be')) ? (
                  <iframe
                    title={`Cinema Theater playing YouTube: ${activePlayVideo.title}`}
                    className="w-full h-full"
                    src={getMediaEmbedUrl(activePlayVideo.url)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : activePlayVideo.url && activePlayVideo.url.includes('t.me') ? (
                  <iframe
                    title={`Cinema Theater playing Telegram stream: ${activePlayVideo.title}`}
                    className="w-full h-full border-0"
                    src={getMediaEmbedUrl(activePlayVideo.url)}
                    allowFullScreen
                  />
                ) : activePlayVideo.url && (activePlayVideo.url.includes('twitter.com') || activePlayVideo.url.includes('x.com')) ? (
                  <iframe
                    title={`Cinema Theater playing X/Twitter post: ${activePlayVideo.title}`}
                    className="w-full h-full border-0 bg-black"
                    src={getMediaEmbedUrl(activePlayVideo.url)}
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#120625] to-[#040108] border-b border-white/5 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white shadow-lg shadow-black/40">
                      {getPlatformIcon(activePlayVideo.url)}
                    </div>
                    <div className="space-y-1.5 max-w-md">
                      <h4 className="text-sm font-semibold font-sans tracking-wide text-white uppercase">
                        Stream Posted on {getPlatformName(activePlayVideo.url)}
                      </h4>
                      <p className="text-xs text-purple-300/80 leading-relaxed font-sans">
                        To guarantee perfect resolution playback, this custom video stream runs directly on its native social portal grid. Click the option below to experience it!
                      </p>
                    </div>
                    <a
                      href={activePlayVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="no-referrer"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-xs font-bold font-sans tracking-wider text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      <span>Watch Live Streaming on {getPlatformName(activePlayVideo.url)}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Theater video documentation */}
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap gap-2 items-center text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono uppercase border border-purple-400/20">
                    {activePlayVideo.videoCategory || "Official Release"}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-400 font-mono">
                    Era Year: {activePlayVideo.era || activePlayVideo.category || "All"}
                  </span>
                  {activePlayVideo.displayName && (
                    <span className="text-purple-300 font-mono">
                      @Uploaded by {activePlayVideo.displayName}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg md:text-xl font-bold uppercase text-white leading-tight">
                    {activePlayVideo.title}
                  </h2>
                  <p className="text-gray-400 text-xs md:text-sm font-sans font-light leading-relaxed">
                    {activePlayVideo.description || "No secondary documentation available for this segment."}
                  </p>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. GLASS PANEL DEL CONFIRM DIALOGUE */}
      <AnimatePresence>
        {deleteConfirmVideo && (
          <div id="video-glass-delete-modal" className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <div className="w-full max-w-sm bg-[#1a082b] border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-4 text-center">
              <div className="mx-auto w-12 h-12 bg-red-950/40 border border-red-500/20 rounded-full flex items-center justify-center text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Delete Video Broadcast?</h3>
                <p className="text-xs text-purple-200/70 leading-relaxed font-sans">
                  Are you sure you want to permanently purge "{deleteConfirmVideo.title}" from the dynamic database store? This action is instant and permanent.
                </p>
              </div>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmVideo(null)}
                  className="px-4 py-2 bg-purple-950/40 hover:bg-purple-900 border border-purple-500/20 text-purple-300 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirmCall}
                  className="px-4 py-2 bg-red-650 hover:bg-red-600 font-bold text-white rounded-lg text-xs font-sans cursor-pointer transition-all"
                >
                  Delete permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
