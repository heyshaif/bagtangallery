import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, Music, Plus, Search, Heart, 
  ListMusic, Sparkles, Disc, AlertCircle, 
  ExternalLink, ArrowUpRight, Clock, Compass, Flame, CheckCircle, Video
} from 'lucide-react';
import { useBackend } from '../context/BackendContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  duration: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  externalUrl?: string;
  published?: boolean;
  lyrics?: string;
  description?: string;
  genre?: string;
  tags?: string[] | string;
  releaseDate?: string;
  featured?: boolean;
  pinned?: boolean;
}

interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  tracksCount: number;
  trackIds: string[];
}

interface Era {
  year: string;
  description: string;
  coverUrl: string;
}

interface MonthlySpotlight {
  title: string;
  coverUrl: string;
  description: string;
  songTitle: string;
  albumTitle: string;
  performanceUrl?: string;
  songAudioUrl?: string;
  spotifyUrl?: string;
  additionalLinks?: Array<{ label: string; url: string }>;
}

const ERA_YEARS = ['All', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];

export default function MusicSection({ config }: { config?: any }) {
  const { currentUser, showToast } = useBackend();
  const audioContext = useAudioPlayer();

  // General states
  const [digitalTracks, setDigitalTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [eras, setEras] = useState<Era[]>([]);
  const [monthlySpotlight, setMonthlySpotlight] = useState<MonthlySpotlight | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEraYear, setActiveEraYear] = useState('All');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [faveTracks, setFaveTracks] = useState<string[]>([]);
  const [activeLyricsTrack, setActiveLyricsTrack] = useState<Track | null>(null);

  // Submissions state
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [pubTitle, setPubTitle] = useState('');
  const [pubArtist, setPubArtist] = useState('BTS');
  const [pubAudioUrl, setPubAudioUrl] = useState('');
  const [pubSpotifyUrl, setPubSpotifyUrl] = useState('');
  const [pubYoutubeUrl, setPubYoutubeUrl] = useState('');
  const [pubCoverUrl, setPubCoverUrl] = useState('');
  const [pubDescription, setPubDescription] = useState('');
  const [pubLyrics, setPubLyrics] = useState('');
  const [pubGenre, setPubGenre] = useState('2020');
  const [pubTags, setPubTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subFileError, setSubFileError] = useState('');

  const applyConfigData = (data: any) => {
    if (!data) return;
    const rawTracks = Array.isArray(data.digitalTracks) ? data.digitalTracks : [];
    const liveTracks = rawTracks.filter((t: Track) => t.published !== false);
    setDigitalTracks(liveTracks);

    if (Array.isArray(data.albums)) {
      setAlbums(data.albums);
    }

    if (Array.isArray(data.playlists)) {
      setPlaylists(data.playlists);
    } else {
      setPlaylists([
        { id: 'p-1', title: 'Festa Gold Classics', description: 'Curated legendary tracks from annual BTS Festa archives.', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', tracksCount: 3, trackIds: ['dt-1', 'dt-2', 'dt-3'] },
        { id: 'p-2', title: 'Moonlight Study Echoes', description: 'Chill instrumental revisions perfect for study and focus.', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400', tracksCount: 2, trackIds: ['dt-2', 'dt-3'] }
      ]);
    }

    if (Array.isArray(data.eras)) {
      setEras(data.eras);
    }

    if (data.monthlySpotlight) {
      setMonthlySpotlight(data.monthlySpotlight);
    }
  };

  // Fetch website CMS configurations
  const fetchMusicData = async () => {
    try {
      const res = await fetch('/api/config/published');
      if (res.ok) {
        const data = await res.json();
        applyConfigData(data);
      }
    } catch (err) {
      console.error('Failed to load music cms context:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (config) {
      applyConfigData(config);
      setIsLoading(false);
    }
  }, [config]);

  useEffect(() => {
    fetchMusicData();
    
    // Load local storage favorites and recents
    const savedFaves = localStorage.getItem('bts_favorite_song_ids');
    if (savedFaves) setFaveTracks(JSON.parse(savedFaves));

    const savedRecents = localStorage.getItem('bts_recently_played_songs');
    if (savedRecents) setRecentlyPlayed(JSON.parse(savedRecents));
  }, []);

  const handleToggleFavorite = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (faveTracks.includes(trackId)) {
      updated = faveTracks.filter(id => id !== trackId);
      showToast('Removed from your favorites link.', 'info');
    } else {
      updated = [...faveTracks, trackId];
      showToast('Added to your BTS favorites gallery! 💜', 'success');
    }
    setFaveTracks(updated);
    localStorage.setItem('bts_favorite_song_ids', JSON.stringify(updated));
  };

  const handlePlaySongTrack = (track: Track) => {
    const filteredRecents = recentlyPlayed.filter(t => t.id !== track.id);
    const updatedRecents = [track, ...filteredRecents].slice(0, 8);
    setRecentlyPlayed(updatedRecents);
    localStorage.setItem('bts_recently_played_songs', JSON.stringify(updatedRecents));

    const playerTrackObj = {
      id: track.id,
      title: track.title,
      artist: track.artist || 'BTS',
      duration: track.duration,
      audioUrl: track.audioUrl || ''
    };

    const playerAlbumObj = {
      id: `album-${track.album || 'Digital Single'}`,
      title: track.album || 'Digital Single Archive',
      artist: track.artist || 'BTS',
      year: track.genre || '2020',
      coverUrl: track.coverUrl
    };

    audioContext.playTrack(playerTrackObj, playerAlbumObj, true);
  };

  const handleUploadCoverSubmitImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const res = await fetch('/api/media/upload-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, base64: event.target?.result as string, category: 'Image' })
          });
          if (res.ok) {
            const data = await res.json();
            setPubCoverUrl(data.url);
            showToast('Submission cover uploaded completely!', 'success');
          } else {
            showToast('Cover upload refused by server.', 'error');
          }
        } catch {
          showToast('Image upload failed.', 'error');
        }
      };
      reader.readAsDataURL(file);
    } catch {
      showToast('FileReader failed.', 'error');
    }
  };

  const handleUploadAudioSubmitFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const res = await fetch('/api/media/upload-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, base64: event.target?.result as string, category: 'Audio' })
          });
          if (res.ok) {
            const data = await res.json();
            setPubAudioUrl(data.url);
            showToast('Direct stream audio audio file uploaded!', 'success');
          } else {
            showToast('Audio file upload refused.', 'error');
          }
        } catch {
          showToast('Audio upload server error.', 'error');
        }
      };
      reader.readAsDataURL(file);
    } catch {
      showToast('FileReader sound failure.', 'error');
    }
  };

  const handleFormSubmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubTitle.trim()) {
      setSubFileError('Song title is required.');
      return;
    }
    
    setIsSubmitting(true);
    setSubFileError('');

    const newSubmissionObj = {
      id: 'sub-' + Date.now(),
      title: pubTitle.trim(),
      artist: pubArtist.trim(),
      album: 'Fan Pitch Project',
      coverUrl: pubCoverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300',
      audioUrl: pubAudioUrl,
      spotifyUrl: pubSpotifyUrl.trim(),
      youtubeUrl: pubYoutubeUrl.trim(),
      description: pubDescription.trim(),
      lyrics: pubLyrics.trim(),
      genre: pubGenre,
      tags: pubTags.split(',').map(s => s.trim()).filter(Boolean),
      submittedBy: currentUser?.username || 'guest',
      displayName: currentUser?.displayName || pubArtist.trim(),
      releaseDate: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/music/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubmissionObj)
      });
      if (res.ok) {
        showToast('🚀 Thank you! Track coordinate submitted for evaluation!', 'success');
        setPubTitle('');
        setPubCoverUrl('');
        setPubAudioUrl('');
        setPubSpotifyUrl('');
        setPubYoutubeUrl('');
        setPubDescription('');
        setPubLyrics('');
        setPubTags('');
        setShowSubmissionForm(false);
      } else {
        const errorData = await res.json();
        setSubFileError(errorData.error || 'Server rejected submission.');
      }
    } catch {
      setSubFileError('Network request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search and Filter logic
  const filteredTracks = digitalTracks.filter(track => {
    const matchSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (track.album && track.album.toLowerCase().includes(searchQuery.toLowerCase()));
                        
    const hasGenre = activeEraYear === 'All' || 
                     (track.genre && track.genre.toLowerCase() === activeEraYear.toLowerCase());
                     
    return matchSearch && hasGenre;
  });

  // Spotlight Calculation (Fallback default is built-in if missing)
  const activeSpotlight = monthlySpotlight || {
    title: "Yet To Come (The Most Beautiful Moment)",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
    description: "Our beautiful moment is yet to come. Experience the emotional vocal peaks, retro hip-hop beats, and the legendary anthology journey of BTS.",
    songTitle: "Yet To Come",
    albumTitle: "Proof Anthology",
    performanceUrl: "https://www.youtube.com/watch?v=kXpOEzNZ8hQ",
    songAudioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  };

  // Handle play of the spotlit song track
  const handlePlaySpotlightTrack = () => {
    const mapped: Track = {
      id: 'spotlight-track-playing',
      title: activeSpotlight.songTitle || 'Yet To Come',
      artist: 'BTS',
      album: activeSpotlight.albumTitle || 'Proof Anthology',
      coverUrl: activeSpotlight.coverUrl,
      audioUrl: activeSpotlight.songAudioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: '3:19'
    };
    handlePlaySongTrack(mapped);
  };

  // Find selected Era's metadata banner
  const activeEraData = eras.find(e => e.year === activeEraYear);

  return (
    <div id="advanced-music-platform" className="max-w-7xl mx-auto space-y-12 animate-fadeIn p-4 md:p-6 lg:p-8 font-sans text-stone-200">
      
      {/* REDESIGNED PREMIUM MONTHLY SPOTLIGHT SECTION */}
      <div id="premium-monthly-spotlight" className="relative rounded-3xl overflow-hidden border border-purple-500/20 bg-[#070311] p-6 md:p-10 shadow-2xl">
        <div className="absolute inset-0 bg-radial-at-t from-purple-900/15 via-transparent to-transparent pointer-events-none opacity-60" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Cover Artwork with Play Hover states */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-72 h-72 md:w-80 md:h-80 xl:w-96 xl:h-96 rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl group shrink-0">
              <img 
                src={activeSpotlight.coverUrl} 
                alt={activeSpotlight.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button 
                  onClick={handlePlaySpotlightTrack}
                  className="p-4 bg-pink-600 rounded-full text-white hover:bg-pink-500 shadow-xl transition-transform duration-300 transform scale-90 group-hover:scale-100 cursor-pointer flex items-center justify-center"
                  id="spotlight-play-big-btn"
                >
                  <Play className="w-8 h-8 fill-current" />
                </button>
                <span className="text-xxs font-mono text-pink-300 mt-2 block font-bold tracking-wider uppercase">Click to Play Spotlight Audio</span>
              </div>
              
              <div className="absolute bottom-3 left-3 bg-black/75 px-3 py-1 rounded-full border border-purple-500/30 text-xxs font-mono text-purple-300 font-bold tracking-wider">
                🌌 BORAHAE FESTA
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic metadata fields and interactive play buttons */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center gap-3 justify-center lg:justify-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-500/15 border border-pink-500/30 rounded-full text-[10px] font-mono text-pink-300 uppercase tracking-widest font-bold">
                <Sparkles className="w-3.5 h-3.5" /> Monthly Spotlight Era
              </span>
              <span className="px-2.5 py-0.5 bg-purple-950/40 rounded-md border border-purple-500/25 text-[10px] text-purple-300 font-mono">
                Active Year: {activeSpotlight.albumTitle?.includes('Proof') ? '2022' : 'BTS Milestone'}
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-stone-100 to-purple-200 tracking-tight leading-tight">
                {activeSpotlight.title}
              </h1>
              <p className="text-sm md:text-base font-medium font-sans text-slate-350 leading-relaxed">
                {activeSpotlight.description}
              </p>
            </div>

            {/* Core spotlit items grid cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-purple-950/15 border border-purple-500/10 rounded-xl space-y-0.5 text-left">
                <span className="text-[9px] font-mono text-pink-400 block uppercase font-bold tracking-wider">Featured Track</span>
                <p className="text-xs font-bold text-white truncate">{activeSpotlight.songTitle}</p>
                <p className="text-[10px] text-slate-400">Audio Stream Ready</p>
              </div>

              <div className="p-3 bg-purple-950/15 border border-purple-500/10 rounded-xl space-y-0.5 text-left">
                <span className="text-[9px] font-mono text-pink-400 block uppercase font-bold tracking-wider">Featured Album</span>
                <p className="text-xs font-bold text-white truncate">{activeSpotlight.albumTitle}</p>
                <p className="text-[10px] text-slate-400">BTS anthology archive</p>
              </div>

              {activeSpotlight.performanceUrl && (
                <div className="p-3 bg-purple-950/15 border border-purple-500/10 rounded-xl space-y-0.5 text-left col-span-1 sm:col-span-2 xl:col-span-1">
                  <span className="text-[9px] font-mono text-pink-400 block uppercase font-bold tracking-wider">Stage Performance</span>
                  <a 
                    href={activeSpotlight.performanceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs font-bold text-white hover:text-pink-400 transition-colors flex items-center gap-1"
                  >
                    Watch Stage <Video className="w-3 h-3 text-red-500" />
                  </a>
                  <p className="text-[10px] text-slate-400 text-ellipsis truncate">Live Concert Stage Video</p>
                </div>
              )}
            </div>

            {/* Premium quick action buttons including link list */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-3">
              <button 
                onClick={handlePlaySpotlightTrack}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-pink-950/10 flex items-center gap-2 cursor-pointer select-none"
                id="spotlight-quick-play-btn"
              >
                <Play className="w-4 h-4 fill-current" /> Play Spotlight Track
              </button>

              {activeSpotlight.spotifyUrl && (
                <a 
                  href={activeSpotlight.spotifyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold font-mono text-stone-200 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Disc className="w-4 h-4 text-emerald-500" /> Play on Spotify
                </a>
              )}

              {/* Dynamic additional resource links array */}
              {activeSpotlight.additionalLinks && activeSpotlight.additionalLinks.map((link, idx) => (
                <a 
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-purple-950/20 hover:bg-purple-900/30 border border-purple-500/10 hover:border-purple-500/20 text-xxs font-mono text-purple-300 rounded-lg flex items-center gap-1 transition-all"
                >
                  {link.label} <ArrowUpRight className="w-3 h-3 text-purple-400" />
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* DOUBLE-GRID CONTAINER FOR DISCOGRAPHY CATALOGS AND FAVORITES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: PRIMARY CATALOG TRACKS */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Realtime filter input */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search songs, albums, artists or tags..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#090515]/70 border border-purple-500/15 focus:border-purple-400 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-400 transition-all font-sans"
              />
            </div>

            {/* Pitch submission button */}
            <button
              onClick={() => {
                setShowSubmissionForm(!showSubmissionForm);
                if (showSubmissionForm) setSubFileError('');
              }}
              className="px-4 py-2 border border-pink-500/30 bg-pink-950/10 text-pink-300 hover:text-white hover:bg-pink-900/20 text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap select-none animate-none"
            >
              <Plus className="w-4 h-4" />
              {showSubmissionForm ? 'Close Pitch Panel' : 'Pitch Alternate/Fan Song'}
            </button>
          </div>

          {/* CHASM FORM SUBMISSION BLOCK */}
          <AnimatePresence>
            {showSubmissionForm && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="p-6 rounded-2xl bg-gradient-to-b from-[#130624] to-[#080312] border border-pink-500/20 shadow-2xl space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-pink-500/10">
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-pink-400" /> Submit Fan / BTS Alternate Song Track
                  </h3>
                  <button 
                    onClick={() => setShowSubmissionForm(false)} 
                    className="text-xs text-slate-500 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleFormSubmissionSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Track Name / Title *</label>
                      <input 
                        type="text" 
                        required
                        value={pubTitle}
                        onChange={(e) => setPubTitle(e.target.value)}
                        placeholder="e.g. Dreamers (Fan Orchestral)"
                        className="w-full px-3 py-2 bg-black/40 text-xs text-white border border-purple-500/10 focus:border-purple-400 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Artist Profile Name</label>
                      <input 
                        type="text" 
                        value={pubArtist}
                        onChange={(e) => setPubArtist(e.target.value)}
                        placeholder="e.g. BTS or ARMY"
                        className="w-full px-3 py-2 bg-black/40 text-xs text-white border border-purple-500/10 focus:border-purple-400 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-purple-950/10 p-3 rounded-xl border border-purple-500/10">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-purple-300 block font-bold">Cover Art Photo</label>
                      <input 
                        type="file" 
                        id="sub-cover-upload" 
                        accept="image/*"
                        onChange={handleUploadCoverSubmitImage}
                        className="sr-only"
                      />
                      <label 
                        htmlFor="sub-cover-upload"
                        className="w-full py-1.5 rounded-lg border border-purple-500/30 text-center font-mono text-[10px] text-purple-400 hover:text-white bg-purple-950/20 hover:bg-purple-900/30 cursor-pointer flex items-center justify-center gap-1"
                      >
                        {pubCoverUrl ? '✓ Art Uploaded' : '📁 Upload Image...'}
                      </label>
                      {pubCoverUrl && (
                        <div className="text-[9px] text-[#93c5fd] font-mono truncate max-w-[200px]">{pubCoverUrl}</div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-purple-300 block font-bold">Audio Track (MP3)</label>
                      <input 
                        type="file" 
                        id="sub-audio-upload" 
                        accept="audio/mp3,audio/mpeg,audio/wav"
                        onChange={handleUploadAudioSubmitFile}
                        className="sr-only"
                      />
                      <label 
                        htmlFor="sub-audio-upload"
                        className="w-full py-1.5 rounded-lg border border-purple-500/30 text-center font-mono text-[10px] text-purple-400 hover:text-white bg-purple-950/20 hover:bg-purple-900/30 cursor-pointer flex items-center justify-center gap-1"
                      >
                        {pubAudioUrl ? '✓ Audio Linked' : '🎵 Upload Sound File...'}
                      </label>
                      {pubAudioUrl && (
                        <div className="text-[9px] text-[#a7f3d0] font-mono truncate max-w-[200px]">{pubAudioUrl}</div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Spotify coordinate</label>
                      <input 
                        type="text" 
                        value={pubSpotifyUrl}
                        onChange={(e) => setPubSpotifyUrl(e.target.value)}
                        placeholder="https://open.spotify.com/..."
                        className="w-full px-3 py-2 bg-black/40 text-xs text-white border border-purple-500/10 focus:border-purple-400 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono text-slate-400 block font-bold">YouTube coordinate</label>
                      <input 
                        type="text" 
                        value={pubYoutubeUrl}
                        onChange={(e) => setPubYoutubeUrl(e.target.value)}
                        placeholder="https://youtube.com/..."
                        className="w-full px-3 py-2 bg-black/40 text-xs text-white border border-purple-500/10 focus:border-purple-400 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Era / Year</label>
                      <select 
                        value={pubGenre}
                        onChange={(e) => setPubGenre(e.target.value)}
                        className="w-full px-3 py-2 bg-black/40 text-xs text-white border border-purple-500/10 focus:border-purple-400 rounded-lg focus:outline-none"
                      >
                        {ERA_YEARS.slice(1).map(y => (
                          <option key={y} value={y}>{y} Era</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Concept Story Description</label>
                    <textarea 
                      rows={1.5}
                      value={pubDescription}
                      onChange={(e) => setPubDescription(e.target.value)}
                      placeholder="Why did you pitch this track? Tell your fellow ARMYs..."
                      className="w-full px-3 py-2 bg-black/40 text-xs text-white border border-purple-500/10 focus:border-purple-400 rounded-lg focus:outline-none"
                    />
                  </div>

                  {subFileError && (
                    <div className="p-3 bg-red-950/30 border border-red-500/20 text-red-400 font-mono text-xs rounded-xl flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>{subFileError}</span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-mono font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Pitching Track details... 📡' : '🚀 Pitch to Global ARMY Stream'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* REDESIGNED MUSIC CATEGORIES PILLS: EXCLUSIVELY BTS ERA YEARS */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-purple-400 tracking-wider uppercase block font-bold">
              ⏳ Select Historical BTS Era Archive
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
              {ERA_YEARS.map(year => (
                <button
                  key={year}
                  onClick={() => {
                    setActiveEraYear(year);
                    setSelectedPlaylist(null);
                    setSelectedAlbum(null);
                  }}
                  className={`py-2 px-4 rounded-full font-mono text-2xxs uppercase font-bold shrink-0 tracking-wider transition-all select-none cursor-pointer border ${
                    activeEraYear === year && !selectedPlaylist && !selectedAlbum
                      ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-900/20'
                      : 'bg-[#090515] border-purple-500/10 text-slate-400 hover:text-slate-200 hover:border-purple-500/20'
                  }`}
                  id={`era-tab-${year}`}
                >
                  {year === 'All' ? '🌌 Complete Archive' : `💜 ${year}`}
                </button>
              ))}
            </div>
          </div>

          {/* DYNAMIC BTS ERA MILESTONE DESCRIPTION BANNER */}
          {activeEraYear !== 'All' && activeEraData && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 border border-purple-500/20 rounded-2xl bg-gradient-to-r from-[#110825] to-[#080414] flex flex-col md:flex-row gap-5 items-center shadow-lg"
              id="era-milestone-banner"
            >
              <img 
                src={activeEraData.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300'} 
                alt={`${activeEraYear} Cover`} 
                className="w-24 h-24 rounded-xl object-cover shrink-0 border border-purple-500/20"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1.5 text-center md:text-left">
                <span className="text-[10px] font-mono text-pink-400 font-bold block uppercase tracking-wider">
                  BTS Milestone Era Focus
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  The {activeEraYear} Chronicles
                </h3>
                <p className="text-xs text-slate-350 leading-relaxed max-w-xl">
                  {activeEraData.description}
                </p>
              </div>
            </motion.div>
          )}

          {/* CLEAR FILTER BUTTON FOR DYNAMIC STATE */}
          {(selectedPlaylist || selectedAlbum) && (
            <div className="p-3 bg-purple-950/20 border border-purple-500/15 rounded-xl flex items-center justify-between font-mono text-xs text-purple-300 animate-slideDown">
              <span className="flex items-center gap-1.5">
                <ListMusic className="w-4 h-4" /> Filtering by:{' '}
                <strong className="text-white">
                  {selectedPlaylist ? `Playlist Collection: ${selectedPlaylist.title}` : `Album Archive: ${selectedAlbum.title}`}
                </strong>
              </span>
              <button 
                onClick={() => { setSelectedPlaylist(null); setSelectedAlbum(null); }}
                className="text-pink-400 hover:text-white underline text-[10px] cursor-pointer"
              >
                Clear Filter
              </button>
            </div>
          )}

          {/* PLAYLIST FILTERED VIEW */}
          {selectedPlaylist && (
            <div className="p-5 border border-purple-500/15 rounded-2xl bg-[#090515] space-y-4 font-sans animate-fadeIn">
              <div className="flex gap-4 items-center">
                <img src={selectedPlaylist.coverUrl} className="w-16 h-16 rounded-xl object-cover border border-purple-500/15 shrink-0" alt="Cover" />
                <div className="flex-grow min-w-0">
                  <span className="text-[9px] uppercase font-mono text-pink-400 tracking-wider font-bold block">Playlist Collection</span>
                  <h3 className="text-base font-bold text-white leading-snug">{selectedPlaylist.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed truncate mt-0.5">{selectedPlaylist.description}</p>
                </div>
              </div>
              <div className="space-y-2">
                {digitalTracks
                  .filter(t => selectedPlaylist.trackIds.includes(t.id))
                  .map((track, trackIdx) => (
                    <div 
                      key={track.id} 
                      onClick={() => handlePlaySongTrack(track)}
                      className="p-3 border border-purple-500/5 hover:border-purple-500/15 rounded-xl bg-[#070311]/60 hover:bg-[#120822]/40 flex items-center justify-between gap-4 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-grow">
                        <span className="font-mono text-xs text-purple-400 font-bold w-4 text-center shrink-0">{trackIdx + 1}</span>
                        <img src={track.coverUrl} className="w-9 h-9 rounded object-cover shadow border border-purple-500/10 shrink-0" alt="Cover" />
                        <div className="min-w-0 flex-grow">
                          <h5 className="text-xs font-bold text-white truncate group-hover:text-purple-350">{track.title}</h5>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{track.artist}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-[9px] text-purple-300 bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-500/15 shrink-0 uppercase">{track.genre || '2020'}</span>
                        <span className="font-mono text-xs text-slate-500 w-10 text-right shrink-0">{track.duration}</span>
                        <button className="p-1 px-1.5 bg-purple-500/10 rounded group-hover:bg-purple-600 text-purple-400 group-hover:text-white transition-all select-none">
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ALBUM FILTERED VIEW */}
          {selectedAlbum && (
            <div className="p-5 border border-purple-500/15 rounded-2xl bg-[#090515] space-y-4 font-sans animate-fadeIn">
              <div className="flex gap-4 items-center">
                <img src={selectedAlbum.coverUrl} className="w-16 h-16 rounded-xl object-cover border border-purple-500/15 shrink-0" alt="Cover" />
                <div className="flex-grow min-w-0">
                  <span className="text-[9px] uppercase font-mono text-pink-400 tracking-wider font-bold block">Discography Studio Record</span>
                  <h3 className="text-base font-bold text-white leading-snug">{selectedAlbum.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed truncate mt-0.5">Year: {selectedAlbum.year || '2026'} • Artist: {selectedAlbum.artist || 'BTS'}</p>
                </div>
              </div>
              <div className="space-y-2">
                {(!selectedAlbum.tracks || selectedAlbum.tracks.length === 0) ? (
                  <p className="text-xs font-mono text-slate-500 text-center py-6 italic">No tracks loaded inside this studio collection container.</p>
                ) : (
                  selectedAlbum.tracks.map((track: any, trackIdx: number) => {
                    const mappedTrack: Track = {
                      id: track.id || `track-${trackIdx}`,
                      title: track.title,
                      artist: track.artist || selectedAlbum.artist || 'BTS',
                      album: selectedAlbum.title,
                      coverUrl: track.coverUrl || selectedAlbum.coverUrl,
                      audioUrl: track.audioUrl,
                      duration: track.duration || '3:30',
                      lyrics: track.lyrics,
                      genre: track.genre || selectedAlbum.year
                    };
                    return (
                      <div 
                        key={mappedTrack.id} 
                        onClick={() => handlePlaySongTrack(mappedTrack)}
                        className="p-3 border border-purple-500/5 hover:border-purple-500/15 rounded-xl bg-[#070311]/60 hover:bg-[#120822]/40 flex items-center justify-between gap-4 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-grow">
                          <span className="font-mono text-xs text-purple-400 w-4 text-center shrink-0 font-bold">{trackIdx + 1}</span>
                          <img src={mappedTrack.coverUrl} className="w-9 h-9 rounded object-cover shadow border border-purple-500/10 shrink-0" alt="Cover" />
                          <div className="min-w-0 flex-grow">
                            <h5 className="text-xs font-bold text-white truncate group-hover:text-purple-350">{mappedTrack.title}</h5>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{mappedTrack.artist}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono text-xs text-slate-500 w-10 text-right shrink-0">{mappedTrack.duration}</span>
                          <button className="p-1 px-1.5 bg-purple-500/10 rounded group-hover:bg-purple-600 text-purple-400 group-hover:text-white transition-all select-none">
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* THE GENERAL TRACK LISTING */}
          {!selectedPlaylist && !selectedAlbum && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase font-mono tracking-widest text-[#faf5ff] flex items-center gap-2">
                <Flame className="w-4 h-4 text-pink-400" /> 
                {activeEraYear === 'All' ? 'All Era Tracks & Songs' : `${activeEraYear} Track Collection`}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTracks.slice(0, 12).map(track => (
                  <div
                    key={track.id}
                    onClick={() => handlePlaySongTrack(track)}
                    className="p-3.5 border border-purple-500/10 hover:border-purple-500/20 rounded-2xl bg-[#090515] hover:bg-[#120824]/40 transition-all flex items-center justify-between gap-4 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-grow">
                      <div className="relative overflow-hidden w-11 h-11 rounded-lg border border-purple-500/10 shadow shrink-0">
                        <img src={track.coverUrl} className="w-full h-full object-cover group-hover:scale-105 duration-300" alt="Cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play className="w-3.5 h-3.5 text-white fill-current" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-grow">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate leading-tight group-hover:text-purple-350">{track.title}</h4>
                          <span className="shrink-0 px-1.5 py-[1.5px] rounded text-[8px] font-mono leading-none bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold uppercase tracking-wide">
                            {track.genre || '2020'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#94a3b8] truncate mt-0.5">{track.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={(e) => handleToggleFavorite(track.id, e)}
                        className={`p-1.5 rounded-lg select-none border transition-all cursor-pointer ${
                          faveTracks.includes(track.id)
                            ? 'bg-red-500/10 border-red-500/30 text-rose-500'
                            : 'bg-white/5 border-transparent text-slate-500 hover:text-rose-400 hover:bg-white/10'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                      
                      {track.lyrics && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLyricsTrack(activeLyricsTrack?.id === track.id ? null : track);
                          }}
                          className={`p-1.5 rounded-lg text-slate-400 hover:text-white border border-transparent hover:border-purple-500/15 cursor-pointer ${
                            activeLyricsTrack?.id === track.id ? 'bg-purple-950/40 text-purple-350' : 'bg-white/5'
                          }`}
                        >
                          <Disc className="w-3.5 h-3.5" />
                        </button>
                      )}
                      
                      <span className="font-mono text-xs text-slate-500 w-8 text-right shrink-0">{track.duration}</span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTracks.length === 0 && (
                <div className="p-8 border border-dashed border-purple-500/10 rounded-2xl bg-purple-950/5 text-center">
                  <Music className="w-8 h-8 text-purple-600 mx-auto animate-pulse mb-2" />
                  <p className="text-xs text-slate-400 font-mono">No matching songs uploaded in this era coordinates yet. Pitch a resource!</p>
                </div>
              )}
            </div>
          )}

          {/* ACTIVE DRAWER FOR LYRICS PREVIEW */}
          <AnimatePresence>
            {activeLyricsTrack && activeLyricsTrack.lyrics && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-6"
              >
                <div className="p-6 rounded-2xl bg-[#090513] border border-purple-500/20 shadow-inner space-y-3 relative">
                  <div className="flex justify-between items-center pb-2 border-b border-purple-500/10">
                    <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-widest flex items-center gap-1.5">
                      <ListMusic className="w-4 h-4 text-purple-400" /> Complete Lyrics for "{activeLyricsTrack.title}"
                    </span>
                    <button 
                      onClick={() => setActiveLyricsTrack(null)} 
                      className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer font-bold font-mono border-0"
                    >
                      CLOSE [X]
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto pt-2 text-sm text-purple-100 font-sans leading-relaxed whitespace-pre-wrap text-center max-w-2xl mx-auto italic">
                    {activeLyricsTrack.lyrics}
                  </div>
                  <div className="absolute bottom-2 right-4 text-[9px] font-mono text-slate-600 block">Borahae Singalong Guide 💜</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* RIGHT COLUMN: RECENTLY PLAYED AND PERSONAL STATE SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* CURATED DISCOGRAPHY STUDIO ALBUMS */}
          {!selectedPlaylist && !selectedAlbum && albums.length > 0 && (
            <div className="p-5 border border-purple-500/10 rounded-2xl bg-gradient-to-b from-[#0e071e] to-[#070311] space-y-4">
              <h3 className="text-xs font-mono font-bold text-pink-400 block uppercase tracking-wider">
                💿 Discography Milestones
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {albums.slice(0, 4).map(album => (
                  <div
                    key={album.id}
                    onClick={() => setSelectedAlbum(album)}
                    className="p-3 border border-purple-500/5 hover:border-purple-500/15 rounded-xl bg-[#090515] flex gap-3 cursor-pointer group items-center"
                  >
                    <img src={album.coverUrl} className="w-10 h-10 rounded-lg object-cover border border-purple-500/10 group-hover:rotate-6 transition-all duration-300" alt={album.title} />
                    <div className="min-w-0 flex-grow">
                      <h4 className="text-xs font-bold text-white group-hover:text-pink-400 truncate leading-snug">{album.title}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Year: {album.year} • {album.tracks?.length || 0} Tracks</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RECENTLY PLAYED CONTAINER */}
          {recentlyPlayed.length > 0 && (
            <div className="p-5 border border-purple-500/10 rounded-2xl bg-purple-950/5 space-y-4 animate-fadeIn">
              <h3 className="text-xs font-mono font-bold text-pink-400 block uppercase tracking-wider">
                🕒 Recently Listened
              </h3>
              <div className="space-y-3">
                {recentlyPlayed.slice(0, 5).map((track, idx) => (
                  <div
                    key={'rec-' + track.id + '-' + idx}
                    onClick={() => handlePlaySongTrack(track)}
                    className="flex justify-between items-center gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-grow">
                      <img src={track.coverUrl} className="w-8 h-8 rounded object-cover border border-purple-500/10 shrink-0 shadow-sm" alt="Cover" />
                      <div className="min-w-0 flex-grow">
                        <h4 className="text-xs font-bold text-white truncate leading-tight group-hover:text-purple-300">{track.title}</h4>
                        <p className="text-[9px] text-[#94a3b8] truncate mt-0.5">{track.artist}</p>
                      </div>
                    </div>
                    <span className="font-mono text-[9px] text-slate-500 shrink-0">{track.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LOCAL USER SYSTEM FAVORITES */}
          <div className="p-5 border border-purple-500/10 rounded-2xl bg-purple-950/5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-pink-400 block uppercase tracking-wider">
              💖 Your Favorite Anthems
            </h3>
            {faveTracks.length === 0 ? (
              <p className="text-xxs italic font-mono text-slate-500 leading-relaxed text-center py-4">
                No items marked with heart. Tap the heart icon on any song!
              </p>
            ) : (
              <div className="space-y-3">
                {digitalTracks
                  .filter(t => faveTracks.includes(t.id))
                  .slice(0, 5)
                  .map(track => (
                    <div
                      key={'fav-' + track.id}
                      onClick={() => handlePlaySongTrack(track)}
                      className="flex justify-between items-center gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-grow">
                        <img src={track.coverUrl} className="w-8 h-8 rounded object-cover border border-purple-500/10 shrink-0 shadow-sm" alt="Cover" />
                        <div className="min-w-0 flex-grow">
                          <h4 className="text-xs font-bold text-white truncate leading-tight group-hover:text-purple-350">{track.title}</h4>
                          <p className="text-[9px] text-[#94a3b8] truncate mt-0.5">{track.artist}</p>
                        </div>
                      </div>
                      <span className="font-mono text-[9px] text-purple-400 shrink-0 uppercase">{track.genre || '2020'}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* PLAYLIST BULLETS */}
          {playlists.length > 0 && (
            <div className="p-5 border border-purple-500/10 rounded-2xl bg-purple-950/5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-pink-400 block uppercase tracking-wider">
                📂 Personal Playlists
              </h3>
              <div className="space-y-2.5">
                {playlists.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlaylist(p)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <img src={p.coverUrl} className="w-9 h-9 rounded-lg object-cover border border-purple-500/10 group-hover:scale-105 duration-200 shadow" alt={p.title} />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-stone-200 group-hover:text-[#c084fc] duration-200 truncate leading-snug">{p.title}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{p.tracksCount || p.trackIds?.length || 0} Songs</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INFO ANCHOR */}
          <div className="p-5 border border-dashed border-purple-500/15 rounded-2xl text-center bg-purple-950/5 text-xxs leading-relaxed text-slate-400">
            <Sparkles className="w-5 h-5 text-purple-400 mx-auto mb-1 animate-pulse" />
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Chronicles Era Space</h4>
            <p className="mt-1">
              Welcome to the unified BTS digital timeline platform. Select years above to explore high quality stream fallback files.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
