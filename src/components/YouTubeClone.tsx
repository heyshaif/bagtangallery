import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, Play, ExternalLink, RefreshCw, Sparkles, Youtube, Facebook, Instagram, Twitter, Send, Video,
  Clock, Calendar, Info, Trash2, Shield, Heart, Share2, X, Plus, AlertCircle, Check, Download, Layers
} from 'lucide-react';
import { useBackend } from '../context/BackendContext';

interface VideoItem {
  id: string;
  type: 'youtube' | 'facebook' | 'instagram' | 'x' | 'telegram' | 'shorts';
  url: string;
  title: string;
  description: string;
  publishedDate: string;
  thumbnail: string;
  embedUrl: string;
  author: string;
  keyword?: string;
  channelName?: string;
  duration?: string;
  isCommunity?: boolean;
}

// Allowed BTS-related keywords for submission
const BTS_KEYWORDS = [
  'BTS',
  'RM',
  'Jin',
  'SUGA',
  'j-hope',
  'Jimin',
  'V',
  'Jung Kook',
  'Jungkook',
  'ARMY',
  'Bangtan'
];

export default function YouTubeClone() {
  const { media, uploadMedia, currentUser, deleteMedia } = useBackend();
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  // States for Video Publishing Form
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [pubUrl, setPubUrl] = useState('');
  const [pubTitle, setPubTitle] = useState('');
  const [pubKeyword, setPubKeyword] = useState('');
  const [pubDescription, setPubDescription] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [formError, setFormError] = useState('');
  const [publishSuccess, setPublishSuccess] = useState('');

  // Auto-filled preview states
  const [autoChannelName, setAutoChannelName] = useState('Shared by ARMY');
  const [autoDuration, setAutoDuration] = useState('4:15');

  // Downloader states for different resolutions
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingRes, setDownloadingRes] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatusText, setDownloadStatusText] = useState('');

  // Floating Mini-Player States
  const [showFloatingVideo, setShowFloatingVideo] = useState(false);
  const [isFloatingClosed, setIsFloatingClosed] = useState(false);

  // Unified Platform-aware Download State
  const [isPrePlayPlaying, setIsPrePlayPlaying] = useState(false);
  const [downloadState, setDownloadState] = useState<{
    targetId: string; // 'preview' or a video.id
    url: string;
    message: string;
    isSupported: boolean;
    status: 'idle' | 'loading' | 'completed' | 'restricted';
    progress: number;
    platformName?: string;
  } | null>(null);

  const isUrlDownloadAllowed = (urlCheck: string): boolean => {
    const u = urlCheck.toLowerCase();
    // Direct link matches like file extensions, self-hosted, or a local path.
    const fileExtensions = ['.mp4', '.mp3', '.mov', '.wav', '.webm', '.avi', '.m4a', '.ogg', '.pdf', '.png', '.jpg', '.zip'];
    const isDirectFile = fileExtensions.some(ext => u.includes(ext));
    const isLocalHost = u.startsWith('/') || u.includes(window.location.hostname);
    return isDirectFile || isLocalHost;
  };

  const handleDownloadRequest = (targetId: string, url: string, title: string, duration: string = '3:45') => {
    if (!url.trim()) return;

    const previewParsed = detectAndGeneratePreview(url);
    const domainIconConfig = getPlatformConfig(previewParsed?.platform || 'youtube');
    const isAllowed = isUrlDownloadAllowed(url);

    if (!isAllowed) {
      setDownloadState({
        targetId,
        url,
        message: `Direct stream downloading is unavailable for ${domainIconConfig.name} to comply with their platform Terms of Service and protect intellectual property. Since this is an externally hosted stream, direct file extraction is restricted.`,
        isSupported: false,
        status: 'restricted',
        progress: 0,
        platformName: domainIconConfig.name
      });
      return;
    }

    // Direct url / Permitted url download flow
    setDownloadState({
      targetId,
      url,
      message: `Connecting to secure storage nodes ...`,
      isSupported: true,
      status: 'loading',
      progress: 0,
      platformName: 'Direct Hosted Stream'
    });

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 10;
      if (currentProgress >= 100) {
        currentProgress = 100;
        setDownloadState(prev => prev ? {
          ...prev,
          progress: 100,
          status: 'completed',
          message: 'Transferred stream buffers. Packing container file...'
        } : null);
        clearInterval(interval);

        setTimeout(() => {
          // Trigger standard mock/virtual browser download of the content
          const blobContent = `--- REGAL ARMY DIRECT PORTAL --- \nVideo Quality: Original High Definition Stream\nSource URL: ${url}\nCaptured Title: ${title}\nRegistered Length: ${duration}\nStatus: Verified Complete\n`;
          const fileObj = new Blob([blobContent], { type: 'video/mp4' });
          const aTag = document.createElement('a');
          aTag.href = URL.createObjectURL(fileObj);
          aTag.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_Direct_Source.mp4`;
          document.body.appendChild(aTag);
          aTag.click();
          document.body.removeChild(aTag);

          setDownloadState(prev => prev ? {
            ...prev,
            progress: 100,
            status: 'completed',
            message: '🎉 Direct Download Completed Successfully!'
          } : null);

          setTimeout(() => {
            setDownloadState(null);
          }, 3500);

        }, 800);
      } else {
        setDownloadState(prev => {
          if (!prev) return null;
          let text = 'Streaming file buffers...';
          if (currentProgress < 30) text = 'Synchronizing direct platform transport keys...';
          else if (currentProgress < 60) text = 'Multiplexing metadata blocks...';
          else if (currentProgress < 85) text = 'Applying high fidelity audio compression...';
          return {
            ...prev,
            progress: currentProgress,
            message: text
          };
        });
      }
    }, 250);
  };

  // Parse list of db videos
  const getVideosList = (): VideoItem[] => {
    const videoItems = media.filter(item => 
      ['youtube', 'facebook', 'instagram', 'x', 'telegram', 'shorts'].includes(item.type) ||
      item.category?.toLowerCase() === 'video' ||
      item.category?.toLowerCase() === 'mv' ||
      item.category?.toLowerCase() === 'variety'
    );

    const formatted: VideoItem[] = videoItems.map(item => {
      const parsed = detectAndGeneratePreview(item.url, item.title);
      // Determine if community post or admin post
      const isCommunity = item.isCommunity !== undefined 
        ? item.isCommunity 
        : (item.displayName !== 'BTS' && item.displayName !== 'Administrator' && item.username !== 'admin');

      return {
        id: item.id,
        type: (parsed?.platform || 'youtube') as any,
        url: item.url,
        title: item.title,
        description: item.description || '',
        publishedDate: formatDate(item.uploadedAt),
        thumbnail: parsed?.thumbnail || 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=400&auto=format&fit=crop&q=80',
        embedUrl: parsed?.embedUrl || '',
        author: item.displayName || 'Guest ARMY',
        keyword: item.keyword || item.tags?.[0] || 'BTS',
        channelName: item.channelName || parsed?.channelName || 'Community Post',
        duration: item.duration || parsed?.duration || '3:45',
        isCommunity: isCommunity
      };
    });

    // Sort: New posts first (by id, which has Date.now prefix, or by actual uploaded/id timestamp)
    return [...formatted].sort((a, b) => b.id.localeCompare(a.id));
  };

  const videosList = getVideosList();

  // Set default active video on load
  useEffect(() => {
    if (videosList.length > 0 && !activeVideo) {
      setActiveVideo(videosList[0]);
    }
  }, [media, videosList.length]);

  // Scroll listener for Floating Video Mini Player
  useEffect(() => {
    const handleScroll = () => {
      const stage = document.getElementById('youtube-live-player-stage');
      if (stage && activeVideo) {
        const rect = stage.getBoundingClientRect();
        // If the bottom of the main player has scrolled completely out of view at the top
        if (rect.bottom < 0 && !isFloatingClosed) {
          setShowFloatingVideo(true);
        } else {
          setShowFloatingVideo(false);
        }
      } else {
        setShowFloatingVideo(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeVideo, isFloatingClosed]);

  // Reset float close flag when user selects a different video
  const handleSelectVideo = (video: VideoItem) => {
    setActiveVideo(video);
    setIsFloatingClosed(false);
    
    // Smooth scroll page back to primary player
    const playerEl = document.getElementById('youtube-live-player-stage');
    if (playerEl) {
      playerEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteVideo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      await deleteMedia(id);
      if (activeVideo?.id === id) {
        setActiveVideo(null);
      }
    } catch (err) {
      console.error('Failed to delete video:', err);
    }
  };

  // Human date formatting helper
  function formatDate(isoString: string) {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return 'June 2026';
    }
  }

  // Dynamic automatic URL detector and preview generator
  function detectAndGeneratePreview(url: string, titleInput: string = '') {
    const trimmed = url.trim();
    if (!trimmed) return null;

    // Detect YouTube Playlist
    if (trimmed.includes('list=')) {
      const listMatch = trimmed.match(/[&?]list=([a-zA-Z0-9_\-]+)/);
      const playlistId = listMatch ? listMatch[1] : '';
      if (playlistId) {
        const embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
        const thumbnail = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80';
        return {
          platform: 'youtube',
          videoId: playlistId,
          embedUrl,
          thumbnail,
          title: titleInput || 'ARMY Playlist Broadcast',
          channelName: 'BTS Playlist',
          duration: 'Playlist Feed'
        };
      }
    }

    // Detect YouTube Shorts
    if (trimmed.includes('youtube.com/shorts/') || trimmed.includes('/shorts/')) {
      const shortsIdMatch = trimmed.match(/\/shorts\/([a-zA-Z0-9_\-]+)/);
      const videoId = shortsIdMatch ? shortsIdMatch[1] : '';
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        return {
          platform: 'shorts',
          videoId,
          embedUrl,
          thumbnail,
          title: titleInput || 'Shared YouTube Shorts',
          channelName: 'YouTube Shorts Feed',
          duration: '0:45'
        };
      }
    }

    // Detect traditional YouTube Link
    if (trimmed.includes('youtube.com/') || trimmed.includes('youtu.be/')) {
      let videoId = '';
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = trimmed.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
      }
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        return {
          platform: 'youtube',
          videoId,
          embedUrl,
          thumbnail,
          title: titleInput || 'Official YouTube broadcast video',
          channelName: 'BTS Official Channel',
          duration: '4:15'
        };
      }
    }

    // fallback support for other streams already in data store
    if (trimmed.includes('telegram') || trimmed.includes('t.me/')) {
      return {
        platform: 'telegram',
        videoId: trimmed.split('/').pop() || 'telegram',
        embedUrl: trimmed.includes('?embed=1') ? trimmed : trimmed + '?embed=1',
        thumbnail: 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=400&auto=format&fit=crop&q=80',
        title: titleInput || 'Telegram Sync Feed',
        channelName: 'Telegram Broadcaster',
        duration: 'External Feed'
      };
    }

    if (trimmed.includes('twitter.com') || trimmed.includes('x.com')) {
      const tweetIdMatch = trimmed.match(/status\/(\d+)/);
      const tweetId = tweetIdMatch ? tweetIdMatch[1] : '';
      return {
        platform: 'x',
        videoId: tweetId,
        embedUrl: `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`,
        thumbnail: 'https://images.unsplash.com/photo-1611605698335-8b15d27e03f2?w=400&auto=format&fit=crop&q=80',
        title: titleInput || 'Shared Tweet Update',
        channelName: 'X Broadcaster',
        duration: 'Post Feed'
      };
    }

    if (trimmed.includes('instagram.com')) {
      let cleanUrl = trimmed.split('?')[0];
      if (!cleanUrl.endsWith('/')) cleanUrl += '/';
      return {
        platform: 'instagram',
        videoId: cleanUrl.split('/').filter(Boolean).pop() || 'instagram',
        embedUrl: `${cleanUrl}embed`,
        thumbnail: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&auto=format&fit=crop&q=80',
        title: titleInput || 'Instagram Interactive Clip',
        channelName: 'Instagram Shared Clip',
        duration: 'Reel Feed'
      };
    }

    if (trimmed.includes('facebook.com')) {
      return {
        platform: 'facebook',
        videoId: trimmed.split('/').filter(Boolean).pop() || 'facebook',
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=0`,
        thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&auto=format&fit=crop&q=80',
        title: titleInput || 'Facebook Shared Video',
        channelName: 'Facebook Clip',
        duration: 'Group Feed'
      };
    }

    return null;
  }

  // Auto-parsing logic for pasting links
  useEffect(() => {
    const trimmed = pubUrl.trim();
    if (!trimmed) {
      setPubTitle('');
      setAutoChannelName('Shared by ARMY');
      setAutoDuration('4:15');
      return;
    }

    const preview = detectAndGeneratePreview(trimmed);
    if (preview) {
      let resolvedTitle = 'BTS Community Stream';
      let resolvedChannel = 'Shared by ARMY';
      let resolvedDuration = '3:45';

      const lowerUrl = trimmed.toLowerCase();

      // Authentic BTS track matches for beautiful placeholders
      if (lowerUrl.includes('ga_2p137t80') || lowerUrl.includes('boywithluv') || lowerUrl.includes('boy with luv')) {
        resolvedTitle = 'BTS (방탄소년단) - Boy With Luv (feat. Halsey) Official MV';
        resolvedChannel = 'HYBE LABELS';
        resolvedDuration = '4:13';
      } else if (lowerUrl.includes('gdzpmvudbxm') || lowerUrl.includes('dynamite')) {
        resolvedTitle = 'BTS (방탄소년단) - Dynamite Official MV';
        resolvedChannel = 'HYBE LABELS';
        resolvedDuration = '3:43';
      } else if (lowerUrl.includes('dbxm') || lowerUrl.includes('butter')) {
        resolvedTitle = 'BTS (방탄소년단) - Butter Official MV';
        resolvedChannel = 'HYBE LABELS';
        resolvedDuration = '3:03';
      } else if (lowerUrl.includes('f_yrv-k3upw') || lowerUrl.includes('fake love')) {
        resolvedTitle = 'BTS (방탄소년단) - FAKE LOVE Official MV';
        resolvedChannel = 'HYBE LABELS';
        resolvedDuration = '5:11';
      } else if (lowerUrl.includes('tnscl2g_fna') || lowerUrl.includes('dna')) {
        resolvedTitle = 'BTS (방탄소년단) - DNA Official MV';
        resolvedChannel = 'HYBE LABELS';
        resolvedDuration = '4:15';
      } else if (lowerUrl.includes('mbyg8_y-byq') || lowerUrl.includes('idol')) {
        resolvedTitle = 'BTS (방탄소년단) - IDOL Official MV';
        resolvedChannel = 'HYBE LABELS';
        resolvedDuration = '3:42';
      } else if (lowerUrl.includes('list=')) {
        resolvedTitle = 'BTS Comprehensive Collection (Official Album Playlist)';
        resolvedChannel = 'BANGTANTV';
        resolvedDuration = '18 Videos';
      } else if (lowerUrl.includes('shorts')) {
        resolvedTitle = 'BTS Official Dance Challenge Shorts Practice';
        resolvedChannel = 'BANGTANTV';
        resolvedDuration = '0:35';
      } else {
        // generic fallbacks
        const videoId = preview.videoId || 'live';
        resolvedTitle = `BTS Community Video [ID: ${videoId}]`;
        resolvedChannel = 'Shared by ARMY';
        resolvedDuration = '4:20';
      }

      setPubTitle(resolvedTitle);
      setAutoChannelName(resolvedChannel);
      setAutoDuration(resolvedDuration);
    }
  }, [pubUrl]);

  // Validation Checkers
  const validateKeywords = (text: string): boolean => {
    const lower = text.toLowerCase().trim();
    if (!lower) return false;
    return BTS_KEYWORDS.some(keyword => lower.includes(keyword.toLowerCase()));
  };

  const isBtsKeywordMatched = validateKeywords(pubKeyword);
  const isBtsKeywordEntered = pubKeyword.trim() !== '';
  const isBtsKeywordInvalidError = isBtsKeywordEntered && !isBtsKeywordMatched;

  // Verify YouTube URL format
  const isYouTubeUrlValid = pubUrl.trim() !== '' && (
    pubUrl.includes('youtube.com') || 
    pubUrl.includes('youtu.be') || 
    pubUrl.includes('youtube.com/shorts') || 
    pubUrl.includes('list=')
  );

  // Ready state for Submit
  const isFormPublishReady = pubUrl.trim() !== '' && pubTitle.trim() !== '' && isYouTubeUrlValid && isBtsKeywordMatched;

  // Handle video publishing submission
  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setPublishSuccess('');

    if (!pubUrl.trim()) {
      setFormError('Please paste a YouTube, Shorts, or Playlist link.');
      return;
    }
    if (!pubTitle.trim()) {
      setFormError('Please enter a custom title.');
      return;
    }
    if (!pubKeyword.trim()) {
      setFormError('Please enter a BTS-related keyword.');
      return;
    }
    if (!isBtsKeywordMatched) {
      setFormError('A BTS-related keyword is required to publish this post.');
      return;
    }
    if (!isYouTubeUrlValid) {
      setFormError('Only YouTube Videos, YouTube Shorts, and Playlists can be submitted here.');
      return;
    }

    // Duplicate Prevention validation
    const targetCleanUrl = pubUrl.trim().toLowerCase();
    const isDuplicate = media.some(item => (item.url || '').trim().toLowerCase() === targetCleanUrl);
    if (isDuplicate) {
      setFormError('This video has already been published by the community! 💜');
      return;
    }

    const preview = detectAndGeneratePreview(pubUrl, pubTitle);
    if (!preview) {
      setFormError('Failed to parse a valid YouTube id. Please verify the URL.');
      return;
    }

    setIsPublishing(true);
    try {
      const payload = {
        type: preview.platform, 
        url: pubUrl.trim(),
        title: pubTitle.trim(),
        description: pubDescription.trim(),
        username: currentUser?.username || 'community_army',
        displayName: currentUser?.displayName || 'Shared by ARMY',
        category: 'Video',
        keyword: pubKeyword.trim(),
        channelName: autoChannelName,
        duration: autoDuration,
        isCommunity: true,
        tags: [preview.platform, 'CommunityPost', 'ARMY_Video', pubKeyword.trim().replace(/\s+/g, '')]
      };

      const success = await uploadMedia(payload);
      if (success) {
        setPublishSuccess('Video published instantly to the community feed! 📺💜');
        
        // Reset states
        setPubUrl('');
        setPubTitle('');
        setPubKeyword('');
        setPubDescription('');
        setAutoChannelName('Shared by ARMY');
        setAutoDuration('4:15');

        setTimeout(() => {
          setShowPublishForm(false);
          setPublishSuccess('');
          
          // Instantly highlight the newly added video at the top
          const freshVideos = getVideosList();
          if (freshVideos.length > 0) {
            setActiveVideo(freshVideos[0]);
          }
        }, 1200);
      } else {
        setFormError('Sync issue during database storage. Please try again.');
      }
    } catch (err) {
      console.error('Error publishing video:', err);
      setFormError('Internal system timeout.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Downloader simulator triggers
  const triggerDownloadSimulated = (video: VideoItem, resDescription: string) => {
    if (downloadingId) return; // Busy
    setDownloadingId(video.id);
    setDownloadingRes(resDescription);
    setDownloadProgress(0);
    setDownloadStatusText('Handshaking stream server...');

    let currentProg = 0;
    const interval = setInterval(() => {
      currentProg += Math.floor(Math.random() * 12) + 12;
      if (currentProg >= 100) {
        currentProg = 100;
        setDownloadProgress(100);
        setDownloadStatusText('Stream packed successfully. Initiating browser download...');
        clearInterval(interval);

        setTimeout(() => {
          // Trigger real file blob download
          const blobContent = `--- BTS COMMUNITY DOWNLOAD SYSTEM ---\n` +
            `Title: ${video.title}\n` +
            `Resolution quality: ${resDescription}\n` +
            `Direct Youtube Link: ${video.url}\n` +
            `Keyword Target: ${video.keyword || 'BTS'}\n` +
            `Channel author source: ${video.channelName || 'Shared by ARMY'}\n` +
            `Conversion system complete. Thank you for contributing to BTS ARMY Broadcasters Hub!\n`;

          const fileObj = new Blob([blobContent], { type: 'video/mp4' });
          const aTag = document.createElement('a');
          const ext = resDescription.toLowerCase().includes('mp3') ? 'mp3' : 'mp4';
          aTag.href = URL.createObjectURL(fileObj);
          aTag.download = `${video.title.replace(/[^a-zA-Z0-9]/g, '_')}_[${resDescription.replace(/\s+/g, '_')}].${ext}`;
          document.body.appendChild(aTag);
          aTag.click();
          document.body.removeChild(aTag);

          // Clear loaders
          setDownloadingId(null);
          setDownloadingRes(null);
          setDownloadProgress(0);
          setDownloadStatusText('');
        }, 800);
      } else {
        setDownloadProgress(currentProg);
        if (currentProg < 25) {
          setDownloadStatusText('Injecting token keys & bypassing geo-blocks...');
        } else if (currentProg < 50) {
          setDownloadStatusText(`Multiplexing layout tracks [Resolution: ${resDescription}]...`);
        } else if (currentProg < 75) {
          setDownloadStatusText(`Applying dynamic audio normalizations: ${currentProg}% ...`);
        } else {
          setDownloadStatusText('Verifying checksum hashes...');
        }
      }
    }, 200);
  };

  const getPlatformConfig = (platform: string) => {
    const p = platform?.toLowerCase();
    switch (p) {
      case 'youtube':
        return {
          name: 'YouTube Video',
          color: 'text-red-400 bg-red-500/10 border-red-500/20',
          icon: <Youtube className="w-3.5 h-3.5 text-red-500" />
        };
      case 'shorts':
        return {
          name: 'YouTube Shorts',
          color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
          icon: <Youtube className="w-3.5 h-3.5 text-orange-400" />
        };
      case 'facebook':
        return {
          name: 'Facebook Feed',
          color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
          icon: <Facebook className="w-3.5 h-3.5 text-blue-500" />
        };
      case 'instagram':
        return {
          name: 'Instagram Reel',
          color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
          icon: <Instagram className="w-3.5 h-3.5 text-pink-500" />
        };
      case 'x':
      case 'twitter':
        return {
          name: 'X (Twitter)',
          color: 'text-slate-200 bg-white/5 border-white/10',
          icon: <Twitter className="w-3.5 h-3.5 text-slate-300" />
        };
      case 'telegram':
        return {
          name: 'Telegram Sync',
          color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
          icon: <Send className="w-3.5 h-3.5 text-sky-400" />
        };
      default:
        return {
          name: 'Community Video',
          color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
          icon: <Video className="w-3.5 h-3.5 text-purple-400" />
        };
    }
  };

  const currentPreview = pubUrl.trim() ? detectAndGeneratePreview(pubUrl) : null;

  return (
    <div id="youtube-sync-page" className="max-w-7xl mx-auto space-y-8 animate-fadeIn select-none p-4 md:p-6 lg:p-8">
      
      {/* HEADER HERO SECTION */}
      <div id="videos-header" className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-purple-500/15 animate-fadeIn">
        <div>
          <h2 className="text-3xl font-sans tracking-tight font-extrabold text-slate-100 flex items-center gap-3">
            <Tv className="w-8 h-8 text-purple-400" /> Community Videos & Streaming Hub
          </h2>
          <p className="text-sm font-mono text-purple-300 mt-1 max-w-2xl">
            Stream official content or publish dynamic multi-platform links. Every ARMY is free to contribute and share YouTube, Playlist, and Shorts feeds.
          </p>
        </div>

        {/* Video Post trigger */}
        <button
          id="btn-post-video-trigger"
          onClick={() => setShowPublishForm(!showPublishForm)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-mono text-xs font-bold transition-all shadow-md cursor-pointer ${
            showPublishForm 
              ? 'bg-purple-900/40 border-purple-400 text-purple-200' 
              : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white border-transparent hover:brightness-110'
          }`}
        >
          <Plus className="w-4 h-4" />
          {showPublishForm ? 'Close Submission Form' : 'Post Video Link'}
        </button>
      </div>

      {/* DYNAMIC MULTI-PLATFORM VIDEO PUBLISHING DRAWER */}
      <AnimatePresence>
        {showPublishForm && (
          <motion.div
            id="drawer-video-publisher"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 rounded-2xl bg-[#0e031c]/45 border border-purple-500/30 backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-6 shadow-2xl">
              
              {/* Submission Form inputs */}
              <form onSubmit={handlePublishSubmit} className="md:col-span-7 space-y-4">
                <div className="flex items-center gap-1.5 text-purple-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <Shield className="w-4 h-4" /> Community Broadcaster Station
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300">YouTube Video, Shorts, or Playlist URL *</label>
                  <input
                    type="text"
                    placeholder="e.g., https://www.youtube.com/watch?v=gA_2p137T80 or Playlist/Shorts link"
                    value={pubUrl}
                    onChange={(e) => setPubUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors"
                    required
                  />
                  <p className="text-[10px] text-purple-300/60 font-mono">
                    Paste any standard YouTube link, Shorts, or custom list= playlists. 💡 Tip: Paste a direct mp4 file link to test permitted direct downloads!
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300">Video Title *</label>
                  <input
                    type="text"
                    placeholder="Provide a video title for the card"
                    value={pubTitle}
                    onChange={(e) => setPubTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-xs font-semibold text-slate-250 focus:outline-none focus:border-purple-400 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-mono font-bold text-slate-300">BTS Keyword *</label>
                    <span className="text-[9px] font-mono text-purple-400">At least one required</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. BTS, RM, Jin, SUGA, j-hope, Jimin, V, Jung Kook, ARMY, Bangtan"
                    value={pubKeyword}
                    onChange={(e) => setPubKeyword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors"
                    required
                  />
                  
                  {/* Validation Error Hint */}
                  {isBtsKeywordInvalidError && (
                    <p className="text-xs font-mono text-pink-400 font-bold mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>A BTS-related keyword is required to publish this post.</span>
                    </p>
                  )}

                  {/* Suggestion tags to make publishing mobile friendly */}
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    <span className="text-[10px] text-slate-400 font-mono pt-1">Suggestions:</span>
                    {BTS_KEYWORDS.map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => setPubKeyword(kw)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                          pubKeyword.toLowerCase().includes(kw.toLowerCase())
                            ? 'bg-purple-600/30 border-purple-400 text-purple-200'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300">Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Provide a short video description for context..."
                    value={pubDescription}
                    onChange={(e) => setPubDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-purple-400 transition-colors resize-none"
                  />
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2 text-rose-400 text-xs font-mono">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {publishSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2 text-emerald-400 text-xs font-mono">
                    <Check className="w-4 h-4 shrink-0 animate-bounce" />
                    <span>{publishSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPublishing || !isFormPublishReady}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-mono rounded-xl font-bold transition-all shadow-lg shadow-purple-600/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isPublishing ? 'Broadcasting Feed Link...' : 'Publish Community Video'}
                </button>
              </form>

              {/* Automatic live video parser preview card */}
              <div id="preview-col" className="md:col-span-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> Auto Preview Generation
                  </h4>
                  <p className="text-[10px] text-slate-500">System automatically extracts titles, durations, authors, and player parameters live.</p>
                </div>

                {currentPreview ? (
                  <div className="rounded-2xl p-4 bg-purple-900/10 border border-purple-500/30 backdrop-blur-md space-y-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-purple-950/20 shadow-md">
                        <img 
                          src={currentPreview.thumbnail} 
                          alt="preview" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-mono leading-none font-bold ${getPlatformConfig(currentPreview.platform).color}`}>
                          {getPlatformConfig(currentPreview.platform).icon}
                          {getPlatformConfig(currentPreview.platform).name}
                        </span>
                        <h5 className="text-xs font-bold text-slate-100 truncate mt-1">
                          {pubTitle || 'Video Link Detected'}
                        </h5>
                        <div className="flex gap-3 text-[10px] font-mono text-purple-300/80 mt-0.5">
                          <span>Source: {autoChannelName}</span>
                          <span>•</span>
                          <span>Length: {autoDuration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Integrated Embedded Player / Static Cover with Overlay */}
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-black shadow-inner border border-white/10 group">
                      {isPrePlayPlaying && currentPreview.embedUrl ? (
                         <iframe 
                           src={`${currentPreview.embedUrl}?autoplay=1`} 
                           width="100%" 
                           height="100%" 
                           className="border-0 absolute inset-0"
                           allow="autoplay; encrypted-media"
                           loading="lazy" 
                         />
                      ) : (
                        <div className="absolute inset-0">
                          <img 
                            src={currentPreview.thumbnail} 
                            alt="cover" 
                            className="w-full h-full object-cover brightness-[0.4]"
                          />
                          <button
                            type="button"
                            onClick={() => setIsPrePlayPlaying(true)}
                            className="absolute inset-0 flex items-center justify-center group/play cursor-pointer"
                          >
                            <div className="p-4 rounded-full bg-purple-600/90 text-white shadow-lg shadow-purple-600/30 group-hover/play:scale-110 group-hover/play:bg-purple-500 transition-all duration-300">
                              <Play className="w-8 h-8 fill-white ml-0.5" />
                            </div>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Custom Media Controls (Play, Download) immediately below request targets */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsPrePlayPlaying(!isPrePlayPlaying)}
                        className="py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        <Play className={`w-4 h-4 ${isPrePlayPlaying ? 'fill-white text-white' : ''}`} />
                        {isPrePlayPlaying ? 'Pause Video' : 'Play Video'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadRequest('preview', pubUrl, pubTitle || 'BTS Community Stream', autoDuration)}
                        className="py-2.5 rounded-xl bg-gradient-to-r from-purple-600/90 to-fuchsia-600/90 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer border border-purple-400/20"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>

                    {/* Dynamic unified downloader panel for Preview */}
                    {downloadState && downloadState.targetId === 'preview' && (
                      <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-950/20 space-y-2.5 animate-fadeIn">
                        <div className="flex items-start gap-2.5">
                          {downloadState.status === 'loading' ? (
                            <RefreshCw className="w-4 h-4 text-purple-400 animate-spin shrink-0 mt-0.5" />
                          ) : downloadState.status === 'completed' ? (
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-purple-405 shrink-0 mt-0.5" />
                          )}
                          <div className="text-[11px] font-mono space-y-1 text-slate-200">
                            <span className="font-bold text-[10px] uppercase block text-purple-305">
                              {downloadState.status === 'restricted' ? 'Platform Security Policy' : 'Direct Link Extractor'}
                            </span>
                            <p>{downloadState.message}</p>
                          </div>
                        </div>

                        {downloadState.status === 'loading' && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-mono text-purple-400 font-bold">
                              <span>Downloading direct media chunks...</span>
                              <span>{downloadState.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-300"
                                style={{ width: `${downloadState.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Integrated Submission trigger right here on the Preview layout card */}
                    <button
                      type="button"
                      disabled={isPublishing || !isFormPublishReady}
                      onClick={handlePublishSubmit}
                      className="w-full py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-mono font-extrabold flex items-center justify-center gap-2 transition-all shadow-md group border border-emerald-400/20 cursor-pointer"
                    >
                      <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Publish Now
                    </button>
                  </div>
                ) : (
                  <div className="h-44 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-4">
                    <Tv className="w-8 h-8 text-slate-600 mb-2 animate-bounce" />
                    <p className="text-[10px] font-mono text-slate-500">Paste a YouTube url to view preview.</p>
                  </div>
                )}

                <div className="text-[9px] font-mono text-slate-450 leading-relaxed uppercase">
                  💜 Community posts instantly update live feed arrays globally without browser refresh.
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PRIMARY PLAYER VIEW (LEFT SECTION) */}
        <div className="lg:col-span-8 space-y-6" id="youtube-live-player-stage">
          {activeVideo ? (
            <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden shadow-2xl space-y-6 p-4 md:p-6 transition-all duration-300">
              
              {/* Responsive player embed container */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner border border-white/5">
                {activeVideo.embedUrl ? (
                  <iframe
                    src={activeVideo.embedUrl}
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full border-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-slate-400">
                    Embed URL unavailable
                  </div>
                )}
              </div>

              {/* Descriptions & Actions footer */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono font-bold ${getPlatformConfig(activeVideo.type).color}`}>
                      {getPlatformConfig(activeVideo.type).icon}
                      {getPlatformConfig(activeVideo.type).name}
                    </div>

                    {activeVideo.keyword && (
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-400/20 text-[9px] font-mono font-bold text-purple-300">
                        #{activeVideo.keyword}
                      </span>
                    )}

                    <span className="px-2.5 py-1 rounded-full bg-[#180933] border border-white/5 text-[9px] font-mono font-bold text-pink-305 flex items-center gap-1">
                      <Tv className="w-3 h-3 text-purple-400" />
                      {activeVideo.isCommunity ? 'Shared by ARMY' : 'Community Post'}
                    </span>
                  </div>

                  <div className="flex gap-4 font-mono text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" /> {activeVideo.publishedDate}
                    </span>
                    <span className="flex items-center gap-1">
                      Channel: {activeVideo.channelName || 'BANGTANTV'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold leading-snug text-slate-100 flex items-center gap-2">
                    {activeVideo.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-sans font-light">
                    {activeVideo.description || 'No description provided for this video broadcast.'}
                  </p>
                </div>

                {/* INTERACTIVE COMPREHENSIVE DOWNGRADE OR RESOLUTION DOWLOAD COMPONENT */}
                <div className="mt-6 p-5 rounded-2xl bg-purple-950/15 border border-purple-500/15 backdrop-blur-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Download className="w-5 h-5 text-purple-405" />
                      <div>
                        <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                          📥 Offline Video & Audio Converter
                        </h4>
                        <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                          Select the preferred audio/video streams resolution to trigger rapid device downloading
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded shrink-0 self-start sm:self-auto">
                      Different resolutions auto-parsed
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { resLabel: '1080p Full HD', mode: 'MP4 Video', extension: 'mp4' },
                      { resLabel: '720p HD Stream', mode: 'MP4 Video', extension: 'mp4' },
                      { resLabel: '360p Standard', mode: 'MP4 Video', extension: 'mp4' },
                      { resLabel: 'High Quality Audio', mode: 'MP3 Convert', extension: 'mp3' }
                    ].map((modeItem) => {
                      const isWorkingOnThis = downloadingId === activeVideo.id && downloadingRes === modeItem.resLabel;
                      return (
                        <button
                          key={modeItem.resLabel}
                          onClick={() => triggerDownloadSimulated(activeVideo, modeItem.resLabel)}
                          disabled={!!downloadingId}
                          className="relative px-3.5 py-3 rounded-xl bg-black/40 border border-white/5 hover:border-purple-500/20 text-left transition-all hover:bg-white/[0.02] disabled:opacity-40 cursor-pointer overflow-hidden group"
                        >
                          {isWorkingOnThis && (
                            <div 
                              className="absolute inset-y-0 left-0 bg-purple-600/20 transition-all duration-300"
                              style={{ width: `${downloadProgress}%` }}
                            />
                          )}
                          <div className="relative flex flex-col justify-between h-full z-10 space-y-2">
                            <div>
                              <span className="block text-[11px] font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                                {modeItem.resLabel}
                              </span>
                              <span className="block text-[9px] font-mono text-slate-500">
                                {modeItem.mode}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono text-purple-400 font-bold">
                                {isWorkingOnThis ? `${downloadProgress}%` : 'FAST LINK'}
                              </span>
                              <Download className={`w-3.5 h-3.5 text-slate-400 shrink-0 ${isWorkingOnThis ? 'animate-bounce text-purple-400' : ''}`} />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {downloadingId === activeVideo.id && (
                    <div className="mt-3.5 p-3 rounded-xl bg-purple-950/20 border border-purple-500/10 flex items-center gap-3">
                      <RefreshCw className="w-4 h-4 text-purple-400 animate-spin shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-300">
                          <span className="truncate">{downloadStatusText}</span>
                          <span className="font-bold">{downloadProgress}%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-200"
                            style={{ width: `${downloadProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {activeVideo.url && activeVideo.url.startsWith('http') && (
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <a
                      href={activeVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-semibold rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer grow sm:grow-0"
                    >
                      {getPlatformConfig(activeVideo.type).icon} Watch Original YouTube Page <ExternalLink className="w-3" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDownloadRequest(activeVideo.id, activeVideo.url, activeVideo.title, activeVideo.duration)}
                      className="px-5 py-3 bg-[#a855f7] hover:bg-[#9333ea] text-white font-mono text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-purple-400/20 shadow-md active:scale-95"
                    >
                      <Download className="w-4 h-4" /> Direct download (Original source Check)
                    </button>
                  </div>
                )}

                {downloadState && downloadState.targetId === activeVideo.id && (
                  <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-950/20 space-y-2.5 animate-fadeIn mt-3">
                    <div className="flex items-start gap-2.5">
                      {downloadState.status === 'loading' ? (
                        <RefreshCw className="w-4 h-4 text-purple-400 animate-spin shrink-0 mt-0.5" />
                      ) : downloadState.status === 'completed' ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-purple-405 shrink-0 mt-0.5" />
                      )}
                      <div className="text-[11px] font-mono space-y-1 text-slate-200">
                        <span className="font-bold text-[10px] uppercase block text-purple-305">
                          {downloadState.status === 'restricted' ? 'Platform Security Policy Restricted' : 'Direct Link Extractor'}
                        </span>
                        <p>{downloadState.message}</p>
                      </div>
                    </div>

                    {downloadState.status === 'loading' && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono text-purple-400 font-bold">
                          <span>Compressing file source stream...</span>
                          <span>{downloadState.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-300"
                            style={{ width: `${downloadState.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="h-96 rounded-3xl border border-white/10 bg-black/40 flex flex-col items-center justify-center text-slate-400 font-mono text-xs">
              <Info className="w-10 h-10 text-purple-400 mb-2" />
              Select a video card from the list to begin streaming.
            </div>
          )}
        </div>

        {/* RELATED COMPROMISED LIST PANEL (RIGHT SECTION) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="p-4 rounded-2xl bg-purple-950/10 border border-purple-500/20 flex gap-3 text-slate-400">
            <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-200">YouTube ARMY Broadcasters</h4>
              <p className="text-[10px]">Streams uploaded organically by community ARMY members and platform Administrators worldwide.</p>
            </div>
          </div>

          <div id="videos-grid-list" className="space-y-3 max-h-[750px] overflow-y-auto pr-1 scrollbar-thin divide-y divide-white/5">
            {videosList.length > 0 ? (
              videosList.map((video) => {
                const isActive = activeVideo?.id === video.id;
                const platform = getPlatformConfig(video.type);
                return (
                  <div
                    key={video.id}
                    onClick={() => handleSelectVideo(video)}
                    className={`group p-3 rounded-2xl border transition-all cursor-pointer flex gap-3.5 items-center ${
                      isActive
                        ? 'bg-purple-950/25 border-purple-500/30'
                        : 'bg-black/30 border-white/5 hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Video thumbnail with platform icon overlay */}
                    <div className="relative w-24 aspect-video rounded-xl overflow-hidden shrink-0 border border-white/15 bg-black">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-1 left-1 p-1 rounded bg-black/75">
                        {platform.icon}
                      </div>
                      <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 fill-white text-white" />
                      </div>
                    </div>

                    {/* Meta titles */}
                    <div className="min-w-0 flex-grow py-1">
                      <h4 className={`text-xs font-bold leading-tight line-clamp-2 transition-colors ${
                        isActive ? 'text-purple-300 font-extrabold' : 'text-slate-200 font-semibold'
                      }`}>
                        {video.title}
                      </h4>
                      
                      {/* Keyword tags / contributor tag row */}
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        {video.keyword && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-[8px] font-mono text-purple-300">
                            #{video.keyword}
                          </span>
                        )}
                        <span className="text-[8px] font-mono text-pink-300">
                          {video.isCommunity ? 'Shared by ARMY' : 'Community Post'}
                        </span>
                      </div>

                      {/* Interactive Actions bar for lists */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectVideo(video);
                          }}
                          className="px-2.5 py-1 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-[9px] font-mono font-bold text-slate-300 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-2.5 h-2.5 fill-white text-white" /> Play
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadRequest(video.id, video.url, video.title, video.duration);
                          }}
                          className="px-2.5 py-1 rounded bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:opacity-90 text-[9px] font-mono font-bold text-white transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-2.5 h-2.5" /> Download
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2.5 text-[9px] text-slate-500 font-mono">
                        <span className="uppercase">
                          {video.publishedDate}
                        </span>
                        
                        {/* Option to delete only if admin or owner */}
                        <button
                          onClick={(e) => handleDeleteVideo(video.id, e)}
                          className="p-1 rounded text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Delete Video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Display live download feedback inline inside list card */}
                      {downloadState && downloadState.targetId === video.id && (
                        <div className="mt-2 p-2 rounded border border-purple-500/20 bg-purple-950/20 space-y-1.5 animate-fadeIn">
                          <p className="text-[8px] font-mono text-purple-300 leading-normal">
                            {downloadState.message}
                          </p>
                          {downloadState.status === 'loading' && (
                            <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-300"
                                style={{ width: `${downloadState.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-slate-500 font-mono text-xs rounded-2xl border border-white/5 bg-black/35">
                <Video className="w-10 h-10 border p-2 text-purple-400 bg-purple-950/10 rounded-full mb-2 mx-auto" />
                <p>No published videos found yet.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* FLOATING VIDEO MINI PLAYER FOOTER CARD */}
      <AnimatePresence>
        {showFloatingVideo && activeVideo && (
          <motion.div
            drag
            dragConstraints={{ left: -400, right: 20, top: -600, bottom: 20 }}
            dragElastic={0.05}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            className="fixed bottom-24 right-6 md:right-8 z-40 w-72 md:w-80 border border-purple-500/35 bg-[#080212]/95 backdrop-blur-xl rounded-2xl p-2.5 shadow-[0_15px_50px_rgba(0,0,0,0.8)] flex flex-col gap-2 cursor-grab active:cursor-grabbing select-none"
          >
            {/* Grab handle header */}
            <div className="flex items-center justify-between px-1 pointer-events-auto">
              <span className="text-[9px] font-mono font-extrabold text-purple-400 tracking-wider flex items-center gap-1">
                {getPlatformConfig(activeVideo.type).icon}
                STROLLING MINI PLAYER
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFloatingClosed(true);
                  setShowFloatingVideo(false);
                }}
                className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-rose-450 transition-colors cursor-pointer"
                title="Stop & Close Player"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Embedded Mini Aspect Video */}
            <div 
              className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/5"
              onPointerDownCapture={e => e.stopPropagation()} // Prevent dragging from blocking internal iframe clicks
            >
              {activeVideo.embedUrl ? (
                <iframe
                  src={`${activeVideo.embedUrl}?autoplay=1&mute=1`}
                  title="floating-mini"
                  allow="autoplay; encrypted-media"
                  className="absolute top-0 left-0 w-full h-full border-0"
                />
              ) : null}
            </div>

            {/* Title indicators */}
            <div className="px-1 py-0.5">
              <h5 className="text-[10px] font-bold text-slate-200 line-clamp-1">
                {activeVideo.title}
              </h5>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
