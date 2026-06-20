import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Award, Flame, Play, Clock, Sparkles, Check, CheckCircle2, 
  X, AlertCircle, RefreshCw, Lock, Mail, User, Shield, Key, Eye, 
  Trash, Ban, HelpCircle, Shuffle, Volume2, Heart, Star, ChevronRight, UserCheck,
  Upload, Camera, Globe, Settings, EyeOff, Save, Calendar, Printer, Copy, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types for the Game
export interface GameHistoryItem {
  id: string;
  type: string;
  description: string;
  pointsEarned: number;
  xpEarned: number;
  timestamp: string;
}

export interface GameUserProfile {
  username: string;
  email: string;
  joinDate: string;
  armyPoints: number;
  xp: number;
  currentLevel: number;
  badges: string[];
  completedMissions: string[];
  dailyStreak: number;
  totalScore: number;
  lastLogin: string;
  isAdmin: boolean;
  status: 'active' | 'banned';
  history: GameHistoryItem[];
  avatarUrl?: string | null;
  displayName?: string | null;
  bio?: string | null;
  favoriteMember?: string | null;
  country?: string | null;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  } | null;
  isPublic?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  pointsReward: number;
  xpReward: number;
}

export interface MemoryCard {
  id: number;
  label: string;
  emoji: string;
  imgUrl?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// 1. Synth Audio cue generator for "Guess The Song" using Web Audio API
const playSongSynthCue = (songName: string) => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Notes sequence for iconic BTS melodies
    let notes: { note: number; dur: number; delay: number }[] = [];
    
    if (songName === 'Dynamite') {
      // Chorus: "Cause I, I, I'm in the stars tonight"
      notes = [
        { note: 392, dur: 0.15, delay: 0.0 },  // G4
        { note: 440, dur: 0.15, delay: 0.2 },  // A4
        { note: 392, dur: 0.15, delay: 0.4 },  // G4
        { note: 440, dur: 0.15, delay: 0.6 },  // A4
        { note: 440, dur: 0.25, delay: 0.8 },  // A4
        { note: 392, dur: 0.25, delay: 1.1 },  // G4
        { note: 440, dur: 0.3, delay: 1.4 },   // A4
        { note: 494, dur: 0.4, delay: 1.8 },   // B4
      ];
    } else if (songName === 'Butter') {
      // Intro/Chorus bounce: "Smooth like butter, like a criminal undercover"
      notes = [
        { note: 440, dur: 0.15, delay: 0.0 },  // A4
        { note: 440, dur: 0.15, delay: 0.2 },  // A4
        { note: 440, dur: 0.15, delay: 0.4 },  // A4
        { note: 440, dur: 0.15, delay: 0.6 },  // A4
        { note: 494, dur: 0.2, delay: 0.8 },   // B4
        { note: 440, dur: 0.2, delay: 1.0 },   // A4
        { note: 392, dur: 0.4, delay: 1.2 },   // G4
      ];
    } else if (songName === 'Yet To Come (The Most Beautiful Moment)') {
      // Melody hook
      notes = [
        { note: 294, dur: 0.2, delay: 0.0 },   // D4
        { note: 330, dur: 0.2, delay: 0.25 },  // E4
        { note: 392, dur: 0.3, delay: 0.5 },   // G4
        { note: 440, dur: 0.3, delay: 0.85 },  // A4
        { note: 392, dur: 0.4, delay: 1.2 }    // G4
      ];
    } else if (songName === 'Life Goes On') {
      // Acoustic chord lead feel
      notes = [
        { note: 330, dur: 0.25, delay: 0.0 },  // E4
        { note: 294, dur: 0.25, delay: 0.3 },  // D4
        { note: 261, dur: 0.25, delay: 0.6 },  // C4
        { note: 294, dur: 0.25, delay: 0.9 },  // D4
        { note: 330, dur: 0.4, delay: 1.2 }    // E4
      ];
    } else {
      // Standard magic sound
      notes = [
        { note: 523.25, dur: 0.1, delay: 0.0 },
        { note: 659.25, dur: 0.1, delay: 0.15 },
        { note: 783.99, dur: 0.1, delay: 0.3 },
        { note: 1046.50, dur: 0.3, delay: 0.45 }
      ];
    }
    
    notes.forEach((item) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.note, ctx.currentTime + item.delay);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime + item.delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + item.delay + item.dur);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + item.delay);
      osc.stop(ctx.currentTime + item.delay + item.dur);
    });
  } catch (err) {
    console.warn('Web Audio Context not active or unsupported:', err);
  }
};

interface BTSGlobalQuestProps {
  config?: any;
}

export default function BTSGlobalQuest({ config }: BTSGlobalQuestProps = {}) {
  const [activeScreen, setActiveScreen] = useState<'auth' | 'dashboard' | 'game_quiz' | 'game_memory' | 'game_puzzle' | 'game_guess_member' | 'game_guess_song' | 'game_lyric' | 'leaderboard' | 'profile_settings' | 'guest_profile_view'>('auth');
  
  const playSound = (type: 'click' | 'notification' | 'reward' | 'effect') => {
    const audioSettings = config?.audioSettings || {};
    const gameSoundsEnabled = audioSettings.gameSoundsEnabled !== false;
    if (!gameSoundsEnabled) return;
    
    const defaultVolume = (audioSettings.defaultVolume !== undefined ? audioSettings.defaultVolume : 50) / 100;
    
    let url = '';
    if (type === 'click') {
      url = audioSettings.clickSoundUrl || 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav';
    } else if (type === 'notification') {
      url = audioSettings.notificationSoundUrl || 'https://assets.mixkit.co/active_storage/sfx/911/911-84.wav';
    } else if (type === 'reward') {
      url = audioSettings.rewardSoundUrl || 'https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav';
    } else if (type === 'effect') {
      url = audioSettings.effectSoundUrl || 'https://assets.mixkit.co/active_storage/sfx/1005/1005-84.wav';
    }
    
    if (!url) return;
    try {
      const audio = new Audio(url);
      audio.volume = defaultVolume;
      audio.play().catch(e => console.log('Sound effect play blocked:', e));
    } catch (err) {
      console.warn('Audio play failed:', err);
    }
  };

  // Play click sound on screen changes
  useEffect(() => {
    playSound('click');
  }, [activeScreen]);

  // Continuous Loop BGM player for in-game screens (except auth)
  useEffect(() => {
    const audioSettings = config?.audioSettings || {};
    const bgmEnabled = audioSettings.bgmEnabled !== false;
    const bgmUrl = audioSettings.bgmMusicUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3';
    const autoPlay = audioSettings.autoPlay !== false;
    const loop = audioSettings.loop !== false;
    const defaultVolume = (audioSettings.defaultVolume !== undefined ? audioSettings.defaultVolume : 50) / 100;

    let bgmAudio: HTMLAudioElement | null = null;

    if (bgmEnabled && bgmUrl && activeScreen !== 'auth') {
      bgmAudio = new Audio(bgmUrl);
      bgmAudio.loop = loop;
      bgmAudio.volume = defaultVolume;
      if (autoPlay) {
        bgmAudio.play().catch(e => {
          console.log('BGM autoplay blocked by browser policy. Interaction needed.', e);
        });
      }
    }

    return () => {
      if (bgmAudio) {
        bgmAudio.pause();
        bgmAudio.src = '';
      }
    };
  }, [config?.audioSettings, activeScreen]);
  
  // Auth Form State
  const [authTab, setAuthTab] = useState<'login' | 'signup' | 'recover'>('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Password Recovery via Custom Seed Phrase States
  const [recoveryLoginHandle, setRecoveryLoginHandle] = useState('');
  const [recoverySeedPhraseInput, setRecoverySeedPhraseInput] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoveryConfirmNewPassword, setRecoveryConfirmNewPassword] = useState('');

  // Seed Phrase display state (shown once upon successful registration or recovery)
  const [displayedSeedPhrase, setDisplayedSeedPhrase] = useState<string | null>(null);
  const [hasConfirmedSaved, setHasConfirmedSaved] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Profile password modification current password state
  const [editCurrentPassword, setEditCurrentPassword] = useState('');

  // Remaining wizard elements
  const [forgotStep, setForgotStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');
  const [recoveryUsername, setRecoveryUsername] = useState('');
  const [broadcastedCode, setBroadcastedCode] = useState('');
  const [forgotEmailInput, setForgotEmailInput] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Math CAPTCHA states
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaAnsInput, setCaptchaAnsInput] = useState('');

  // Profile Customization States
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileEditSuccess, setProfileEditSuccess] = useState('');
  const [profileEditError, setProfileEditError] = useState('');

  const [editDisplayName, setEditDisplayName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editFavoriteMember, setEditFavoriteMember] = useState('None');
  const [editCountry, setEditCountry] = useState('');
  const [editTwitter, setEditTwitter] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editYoutube, setEditYoutube] = useState('');
  const [editTiktok, setEditTiktok] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState<string | null>(null);
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');

  // Public profile search/view states
  const [selectedPublicUser, setSelectedPublicUser] = useState<GameUserProfile | null>(null);
  const [guestProfile, setGuestProfile] = useState<GameUserProfile | null>(null);
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState('');

  // Check URL on init to render /profile/:username Structure statically
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/profile/')) {
      const parts = path.split('/profile/');
      const u = parts[parts.length - 1]?.trim();
      if (u) {
        fetchGuestProfile(u);
      }
    }
  }, []);

  const fetchGuestProfile = async (uname: string) => {
    setGuestLoading(true);
    setGuestError('');
    try {
      const res = await fetch(`/api/game/user/${uname}`);
      if (res.ok) {
        const data = await res.json();
        setGuestProfile(data);
        setActiveScreen('guest_profile_view');
      } else {
        setGuestError("Standard player profile not found.");
      }
    } catch (e) {
      setGuestError("Failed to fetch public player profile.");
    } finally {
      setGuestLoading(false);
    }
  };

  // Generate dynamic captcha numbers
  const generateMathCaptcha = () => {
    const n1 = Math.floor(3 + Math.random() * 12);
    const n2 = Math.floor(3 + Math.random() * 12);
    setCaptchaNum1(n1);
    setCaptchaNum2(n2);
    setCaptchaAnsInput('');
  };

  // Trigger resets when navigating to authorization tabs
  useEffect(() => {
    if (authTab === 'recover') {
      setRecoveryLoginHandle('');
      setRecoverySeedPhraseInput('');
      setRecoveryNewPassword('');
      setRecoveryConfirmNewPassword('');
    }
    setAuthError('');
    setAuthSuccess('');
  }, [authTab]);

  const handleCopySeedPhrase = () => {
    if (!displayedSeedPhrase) return;
    navigator.clipboard.writeText(displayedSeedPhrase);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownloadSavedSeedPhrase = () => {
    if (!displayedSeedPhrase) return;
    const element = document.createElement("a");
    const file = new Blob([
      `💜 BTS GLOBAL QUEST - ARMY PORTAL RECOVERY SEED PHRASE 💜\n\n` +
      `Your 12-Word Recovery Seed Phrase is:\n` +
      `-----------------------------------------------------------------\n` +
      `${displayedSeedPhrase}\n` +
      `-----------------------------------------------------------------\n\n` +
      `⚠️ WARNING:\n` +
      `- Save this Recovery Seed Phrase carefully.\n` +
      `- It will NEVER be shown again.\n` +
      `- If you lose this phrase, you may permanently lose access to your account.\n` +
      `- Never share this recovery seed phrase with anyone, including admins.\n`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "army_recovery_seed_phrase.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrintSavedSeedPhrase = () => {
    if (!displayedSeedPhrase) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>ARMY Security Recovery Seed Phrase</title>
            <style>
              body { font-family: monospace; padding: 40px; color: #1e1b4b; background-color: #faf5ff; }
              .card { border: 2px dashed #a855f7; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; background-color: #fff; }
              h1 { color: #8b5cf6; text-align: center; font-size: 20px; }
              .phrase { font-size: 20px; font-weight: bold; letter-spacing: 0.05em; line-height: 1.8; text-align: center; margin: 30px 0; color: #5b21b6; background: #f3e8ff; padding: 15px; border-radius: 8px; border: 1px solid #d8b4fe; }
              .warning { font-weight: bold; color: #b91c1c; border-top: 1px solid #e9d5ff; padding-top: 15px; margin-top: 15px; font-size: 13px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>💜 ARMY Portal Security Recovery Seed Phrase 💜</h1>
              <p style="text-align: center; font-size: 13px; color: #6b21a8;">ARMY Global Security Credentials Checklist</p>
              <div class="phrase">${displayedSeedPhrase}</div>
              <div class="warning">
                ⚠️ WARNING:<br/>
                Keep this document in a safe physical place. It will never be shown again in the application interface. Without it, your play profile cannot be recovered.
              </div>
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };
  
  // Auth Loading & Helpers
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  
  // Logged-in User Info
  const [userProfile, setUserProfile] = useState<GameUserProfile | null>(null);
  
  // Leaderboard data
  const [leaderboardUsers, setLeaderboardUsers] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  
  // Admin Data & states
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [selectedAdminUser, setSelectedAdminUser] = useState<any | null>(null);
  const [pointsAdjustment, setPointsAdjustment] = useState('');
  const [xpAdjustment, setXpAdjustment] = useState('');
  const [levelAdjustment, setLevelAdjustment] = useState('');
  const [adminAnalytics, setAdminAnalytics] = useState<any>(null);

  // General App stats
  const [refreshing, setRefreshing] = useState(false);

  // SHA-256 Client-Side Hashing helper
  const hashPassword = async (pwd: string): Promise<string> => {
    try {
      const msgBuffer = new TextEncoder().encode(pwd);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // Fallback simple checksum if subtle crypto is blocked (e.g. non-HTTPS iframe)
      let hash = 0;
      for (let i = 0; i < pwd.length; i++) {
        hash = (hash << 5) - hash + pwd.charCodeAt(i);
        hash |= 0;
      }
      return 'fb_hash_' + hash;
    }
  };

  // Check login session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('bts_quest_user') || sessionStorage.getItem('bts_quest_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        fetchUserProfile(parsed.username);
      } catch (e) {
        console.warn('Stale auth session dropped', e);
      }
    }
  }, []);

  const fetchUserProfile = async (uname: string) => {
    try {
      setAuthLoading(true);
      const response = await fetch(`/api/game/user/${uname.toLowerCase().trim()}`);
      if (response.ok) {
        const profile = await response.json();
        if (profile.status === 'banned') {
          setAuthError('This profile has been banned by the Administrator.');
          handleLogout();
          return;
        }
        setUserProfile(profile);
        setActiveScreen('dashboard');
        setAuthError('');
        
        // Handle Remember Me / Local storage
        if (rememberMe) {
          localStorage.setItem('bts_quest_user', JSON.stringify({ username: profile.username }));
        } else {
          sessionStorage.setItem('bts_quest_user', JSON.stringify({ username: profile.username }));
        }
      } else {
        setAuthError('Failed to synchronize user session with global server.');
      }
    } catch (err) {
      console.error('Error loading game session', err);
    } finally {
      setAuthLoading(false);
    }
  };

  // Synchronize profile state forms
  useEffect(() => {
    if (userProfile) {
      setEditDisplayName(userProfile.displayName || userProfile.username);
      setEditUsername(userProfile.username);
      setEditBio(userProfile.bio || '');
      setEditFavoriteMember(userProfile.favoriteMember || 'None');
      setEditCountry(userProfile.country || '');
      setEditTwitter(userProfile.socialLinks?.twitter || '');
      setEditInstagram(userProfile.socialLinks?.instagram || '');
      setEditYoutube(userProfile.socialLinks?.youtube || '');
      setEditTiktok(userProfile.socialLinks?.tiktok || '');
      setEditAvatarUrl(userProfile.avatarUrl || null);
      setEditIsPublic(userProfile.isPublic !== false);
      setEditEmail(userProfile.email || '');
      setEditPassword('');
      setEditConfirmPassword('');
    }
  }, [userProfile]);

  // Sync profile data to backend asynchronously after earning points/XP
  const syncEarnedPoints = async (uname: string, pointsEarned: number, xpEarned: number, description: string) => {
    if (!userProfile) return;
    if (pointsEarned > 0) {
      playSound('reward');
    }
    try {
      const response = await fetch(`/api/game/earn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: uname,
          pointsEarned,
          xpEarned,
          description
        })
      });
      if (response.ok) {
        const updated = await response.json();
        setUserProfile(updated.profile);
        
        // Check for newly unlocked level or badge notify
        if (updated.profile.currentLevel > userProfile.currentLevel) {
          triggerLevelUpSynth();
        }
      }
    } catch (err) {
      console.error('Failed to sync scores', err);
      // Fallback local upgrade if offline
      const localProfile = { ...userProfile };
      localProfile.armyPoints += pointsEarned;
      localProfile.xp += xpEarned;
      localProfile.history.unshift({
        id: 'offline-' + Date.now(),
        type: 'offline',
        description,
        pointsEarned,
        xpEarned,
        timestamp: new Date().toISOString()
      });
      setUserProfile(localProfile);
    }
  };

  const triggerLevelUpSynth = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {}
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;
    if (!forgotEmailInput) {
      setAuthError('Email identity is missing.');
      return;
    }
    setAuthLoading(true);
    setAuthSuccess('');
    setAuthError('');
    try {
      const res = await fetch('/api/game/recover-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: forgotEmailInput })
      });
      const data = await res.json();
      if (res.ok) {
        setAuthSuccess('Verification code sent successfully.');
        setResendCountdown(60);
      } else {
        setAuthError(data.error || 'Failed to send verification code. Please try again.');
      }
    } catch (e) {
      setAuthError('Failed to establish connection with security gateway.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handles Auth Actions
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    
    if (authTab === 'signup') {
      if (!usernameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
        setAuthError('All fields are required.');
        return;
      }
      if (passwordInput !== confirmPasswordInput) {
        setAuthError('Passwords do not match.');
        return;
      }
      if (usernameInput.length < 3 || usernameInput.length > 20) {
        setAuthError('Username must be between 3 and 20 characters.');
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(usernameInput)) {
        setAuthError('Username can only contain letters, numbers, and underscores.');
        return;
      }
      
      setAuthLoading(true);
      try {
        const hashedPassword = await hashPassword(passwordInput);
        const res = await fetch('/api/game/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: usernameInput,
            email: emailInput,
            passwordHash: hashedPassword
          })
        });
        const data = await res.json();
        if (res.ok) {
          // Display the newly generated recovery seed phrase once
          setDisplayedSeedPhrase(data.recoverySeedPhrase);
          setHasConfirmedSaved(false);
          
          setAuthSuccess('ARMY Account created successfully! 💜 Please save your Recovery Seed Phrase carefully below before continuing.');
          setUsernameInput('');
          setEmailInput('');
          setPasswordInput('');
          setConfirmPasswordInput('');
        } else {
          setAuthError(data.error || 'Registration failed.');
        }
      } catch (err) {
        setAuthError('Could not connect to authentication gateway.');
      } finally {
        setAuthLoading(false);
      }
    } 
    
    else if (authTab === 'login') {
      if (!usernameInput || !passwordInput) {
        setAuthError('Username/Email and Password are required.');
        return;
      }
      
      setAuthLoading(true);
      try {
        const hashedPassword = await hashPassword(passwordInput);
        const res = await fetch('/api/game/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            loginHandle: usernameInput,
            passwordHash: hashedPassword
          })
        });
        const data = await res.json();
        if (res.ok) {
          setUserProfile(data.profile);
          setActiveScreen('dashboard');
          
          if (rememberMe) {
            localStorage.setItem('bts_quest_user', JSON.stringify({ username: data.profile.username }));
          } else {
            sessionStorage.setItem('bts_quest_user', JSON.stringify({ username: data.profile.username }));
          }
        } else {
          setAuthError(data.error || 'Invalid credentials.');
        }
      } catch (err) {
        setAuthError('Unable to authenticate at this moment.');
      } finally {
        setAuthLoading(false);
      }
    }
    
    else if (authTab === 'recover') {
      if (!recoveryLoginHandle || !recoverySeedPhraseInput || !recoveryNewPassword || !recoveryConfirmNewPassword) {
        setAuthError('All fields (Identity, 12-word seed phrase, and safe password credentials) are required.');
        return;
      }

      if (recoveryNewPassword !== recoveryConfirmNewPassword) {
        setAuthError('Passwords do not match.');
        return;
      }

      if (recoveryNewPassword.length < 4) {
        setAuthError('Password must be at least 4 characters long.');
        return;
      }

      // Validate counts of words in seed phrase locally
      const words = recoverySeedPhraseInput.trim().split(/\s+/);
      if (words.length !== 12) {
        setAuthError('Invalid account information or recovery phrase.');
        return;
      }

      setAuthLoading(true);
      try {
        const hashNewPassword = await hashPassword(recoveryNewPassword);
        const res = await fetch('/api/game/recover-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            loginHandle: recoveryLoginHandle,
            seedPhrase: recoverySeedPhraseInput,
            newPasswordHash: hashNewPassword
          })
        });
        const data = await res.json();
        if (res.ok) {
          // Save and show raw brand-new generated seed phrase once
          setDisplayedSeedPhrase(data.recoverySeedPhrase);
          setHasConfirmedSaved(false);
          
          setRecoveryLoginHandle('');
          setRecoverySeedPhraseInput('');
          setRecoveryNewPassword('');
          setRecoveryConfirmNewPassword('');
          setAuthSuccess('Account recovered successfully! Below is your BRAND NEW Recovery Seed Phrase. Save it carefully.');
        } else {
          setAuthError(data.error || 'Invalid account information or recovery phrase.');
        }
      } catch (err) {
        setAuthError('Could not process credentials recovery.');
      } finally {
        setAuthLoading(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bts_quest_user');
    sessionStorage.removeItem('bts_quest_user');
    setUserProfile(null);
    setIsAdminMode(false);
    setActiveScreen('auth');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setProfileSaving(true);
    setProfileEditError('');
    setProfileEditSuccess('');

    try {
      if (editUsername.trim().length < 3) {
        setProfileEditError("Username must be at least 3 characters long.");
        setProfileSaving(false);
        return;
      }

      let passwordHashPayload = undefined;
      let currentPasswordHashPayload = undefined;
      if (editPassword) {
        if (!editCurrentPassword) {
          setProfileEditError("Your current password is required block change to a new password.");
          setProfileSaving(false);
          return;
        }
        if (editPassword !== editConfirmPassword) {
          setProfileEditError("New Password confirmation does not match.");
          setProfileSaving(false);
          return;
        }
        if (editPassword.length < 4) {
          setProfileEditError("Password must be at least 4 characters long.");
          setProfileSaving(false);
          return;
        }
        passwordHashPayload = await hashPassword(editPassword);
        currentPasswordHashPayload = await hashPassword(editCurrentPassword);
      }

      const payload = {
        currentUsername: userProfile.username,
        newUsername: editUsername.trim(),
        displayName: editDisplayName.trim(),
        bio: editBio,
        favoriteMember: editFavoriteMember,
        country: editCountry,
        avatarUrl: editAvatarUrl,
        isPublic: editIsPublic,
        email: editEmail.trim(),
        socialLinks: {
          twitter: editTwitter.trim(),
          instagram: editInstagram.trim(),
          youtube: editYoutube.trim(),
          tiktok: editTiktok.trim(),
        },
        passwordHash: passwordHashPayload,
        currentPasswordHash: currentPasswordHashPayload
      };

      const res = await fetch('/api/game/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setProfileEditSuccess("Your custom settings saved successfully! 💜");
        setUserProfile(data.profile);
        
        if (editUsername.trim().toLowerCase() !== userProfile.username) {
          localStorage.setItem('bts_quest_user', JSON.stringify({ username: data.profile.username }));
        }

        if (editPassword) {
          setProfileEditSuccess("Password updated and settings preserved! 💜");
          setEditCurrentPassword('');
          setEditPassword('');
          setEditConfirmPassword('');
        }
      } else {
        setProfileEditError(data.error || "Failed to finalize profile modifications.");
      }
    } catch (e) {
      setProfileEditError("Gateway security failed to process update.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAdminEditProfileDetail = async (uname: string, fields: any) => {
    if (!selectedAdminUser) return;
    try {
      setAdminLoading(true);
      const res = await fetch(`/api/game/admin/edit-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: uname,
          ...fields
        })
      });
      if (res.ok) {
        const u = await res.json();
        setSelectedAdminUser(u.profile);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdminLoading(false);
    }
  };

  // Fetch Global Leaderboard
  const fetchLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      const res = await fetch('/api/game/leaderboard');
      if (res.ok) {
        const list = await res.json();
        setLeaderboardUsers(list);
      }
    } catch (err) {
      console.warn('Leaderboard lookup error', err);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Fetch Admin Section data
  const fetchAdminData = async () => {
    try {
      setAdminLoading(true);
      const [usersRes, statsRes] = await Promise.all([
        fetch('/api/game/admin/users'),
        fetch('/api/game/admin/analytics')
      ]);
      if (usersRes.ok) {
        setAdminUsers(await usersRes.json());
      }
      if (statsRes.ok) {
        setAdminAnalytics(await statsRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminUpdateUser = async (uname: string) => {
    if (!selectedAdminUser) return;
    try {
      setAdminLoading(true);
      const res = await fetch(`/api/game/admin/user-modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: uname,
          pointsAdjust: parseInt(pointsAdjustment) || 0,
          xpAdjust: parseInt(xpAdjustment) || 0,
          levelAdjust: parseInt(levelAdjustment) || 0
        })
      });
      if (res.ok) {
        const u = await res.json();
        setSelectedAdminUser(u.profile);
        setPointsAdjustment('');
        setXpAdjustment('');
        setLevelAdjustment('');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminBanUser = async (uname: string, banState: 'active' | 'banned') => {
    try {
      setAdminLoading(true);
      const res = await fetch(`/api/game/admin/user-ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: uname, status: banState })
      });
      if (res.ok) {
        const u = await res.json();
        setSelectedAdminUser(u.profile);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdminLoading(false);
    }
  };

  const claimDailyMission = async (missionId: string, pts: number, xp: number) => {
    if (!userProfile) return;
    await syncEarnedPoints(userProfile.username, pts, xp, `Claimed Daily Mission: ${missionId}`);
  };

  // -------------------------------------------------------------
  // GAME #1: ARMY Quiz Trivia Game Loop
  // -------------------------------------------------------------
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [isQuizAnswered, setIsQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTimer, setQuizTimer] = useState(15);
  const quizTimerRef = useRef<NodeJS.Timeout | null>(null);

  const quizQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      question: 'In which year did BTS officially debut with the song "No More Dream"?',
      options: ['2011', '2012', '2013', '2014'],
      answer: '2013',
      pointsReward: 25,
      xpReward: 35
    },
    {
      id: 'q2',
      question: 'What does the abbreviation "BTS" literally translate to in Korean?',
      options: ['Bulletproof Boy Scouts (Bangtan Sonyeondan)', 'Beyond The Scene Team', 'Born To Sing Star', 'Bangtan Team Supporters'],
      answer: 'Bulletproof Boy Scouts (Bangtan Sonyeondan)',
      pointsReward: 25,
      xpReward: 35
    },
    {
      id: 'q3',
      question: 'Who is the official leader and main rapper of BTS?',
      options: ['SUGA', 'Jin', 'Jimin', 'RM'],
      answer: 'RM',
      pointsReward: 20,
      xpReward: 30
    },
    {
      id: 'q4',
      question: 'Which of the following tracks became BTS\' first-ever English single to launch at No.1 on the Billboard Hot 100?',
      options: ['Dynamite', 'Butter', 'Life Goes On', 'Boy With Luv'],
      answer: 'Dynamite',
      pointsReward: 20,
      xpReward: 30
    },
    {
      id: 'q5',
      question: 'Which member is also known for his beautiful solo album "GOLDEN" and nicknamed the Golden Maknae?',
      options: ['V', 'Jungkook', 'j-hope', 'Jimin'],
      answer: 'Jungkook',
      pointsReward: 20,
      xpReward: 30
    },
    {
      id: 'q6',
      question: 'What is the beautiful phrase BTS often uses to express eternal devotion, meaning "I purple you"?',
      options: ['Borahae', 'Saranghae', 'Kamsahamnida', 'Bogoshipda'],
      answer: 'Borahae',
      pointsReward: 20,
      xpReward: 35
    },
    {
      id: 'q7',
      question: 'Which custom BTS album contains comforting tracks like "Life Goes On" and was produced during the pandemic in 2020?',
      options: ['BE', 'Proof', 'Map of the Soul: 7', 'Love Yourself: Tear'],
      answer: 'BE',
      pointsReward: 25,
      xpReward: 35
    }
  ];

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuizIndex(0);
    setSelectedQuizOption(null);
    setIsQuizAnswered(false);
    setQuizScore(0);
    startQuizTimer();
  };

  const startQuizTimer = () => {
    if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    setQuizTimer(15);
    quizTimerRef.current = setInterval(() => {
      setQuizTimer((prev) => {
        if (prev <= 1) {
          handleQuizAnswerSubmit(''); // Timeout answer
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleQuizAnswerSubmit = (option: string) => {
    if (isQuizAnswered) return;
    if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    
    setSelectedQuizOption(option);
    setIsQuizAnswered(true);
    
    const correct = option === quizQuestions[currentQuizIndex].answer;
    if (correct) {
      setQuizScore((prev) => prev + 1);
      playSynthSuccess();
    } else {
      playSynthFail();
    }
  };

  const playSynthSuccess = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  };

  const playSynthFail = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
      osc.frequency.setValueAtTime(147, ctx.currentTime + 0.12); // D3
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  const handleNextQuiz = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedQuizOption(null);
      setIsQuizAnswered(false);
      startQuizTimer();
    } else {
      // Quiz complete
      setQuizStarted(false);
      const points = quizScore * 15;
      const xp = quizScore * 20;
      syncEarnedPoints(userProfile!.username, points, xp, `Completed Quiz Game with score ${quizScore}/${quizQuestions.length}`);
    }
  };

  useEffect(() => {
    return () => {
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    };
  }, []);

  // -------------------------------------------------------------
  // GAME #2: BTS Member Memory Card Game
  // -------------------------------------------------------------
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [memorySelected, setMemorySelected] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryGameOver, setMemoryGameOver] = useState(false);

  const memoryElements = [
    { label: 'RM', emoji: '🐨' },
    { label: 'Jin', emoji: '🐹' },
    { label: 'SUGA', emoji: '🐱' },
    { label: 'j-hope', emoji: '🐿️' },
    { label: 'Jimin', emoji: '🐥' },
    { label: 'V', emoji: '🐯' },
    { label: 'Jungkook', emoji: '🐰' },
    { label: 'ARMY', emoji: '💜' }
  ];

  const initMemoryGame = () => {
    const list: MemoryCard[] = [];
    // Duplicate element pairings
    [...memoryElements, ...memoryElements].forEach((el, index) => {
      list.push({
        id: index,
        label: el.label,
        emoji: el.emoji,
        isFlipped: false,
        isMatched: false
      });
    });
    // Shuffle
    list.sort(() => Math.random() - 0.5);
    setMemoryCards(list);
    setMemorySelected([]);
    setMemoryMoves(0);
    setMemoryGameOver(false);
  };

  const handleMemoryCardClick = (cardIndex: number) => {
    if (memoryCards[cardIndex].isFlipped || memoryCards[cardIndex].isMatched || memorySelected.length >= 2) return;
    
    const updated = [...memoryCards];
    updated[cardIndex].isFlipped = true;
    setMemoryCards(updated);
    
    const selected = [...memorySelected, cardIndex];
    setMemorySelected(selected);
    
    if (selected.length === 2) {
      setMemoryMoves((prev) => prev + 1);
      const firstCard = memoryCards[selected[0]];
      const secondCard = memoryCards[selected[1]];
      
      if (firstCard.label === secondCard.label) {
        // Matched!
        setTimeout(() => {
          const matchCards = [...memoryCards];
          matchCards[selected[0]].isMatched = true;
          matchCards[selected[1]].isMatched = true;
          setMemoryCards(matchCards);
          setMemorySelected([]);
          
          playSynthSuccess();
          
          // Check game over
          if (matchCards.every(c => c.isMatched)) {
            setMemoryGameOver(true);
            const scorePoints = Math.max(10, 100 - memoryMoves);
            syncEarnedPoints(userProfile!.username, scorePoints, scorePoints + 50, `Won Memory Game in ${memoryMoves} moves!`);
          }
        }, 600);
      } else {
        // Flop back
        setTimeout(() => {
          const flopCards = [...memoryCards];
          flopCards[selected[0]].isFlipped = false;
          flopCards[selected[1]].isFlipped = false;
          setMemoryCards(flopCards);
          setMemorySelected([]);
          playSynthFail();
        }, 1100);
      }
    }
  };

  // -------------------------------------------------------------
  // GAME #3: BTS Slide Jigsaw Puzzle Game
  // -------------------------------------------------------------
  const [puzzleGrid, setPuzzleGrid] = useState<number[]>([]); // Array of indices (0 to 8 where 8 is blank spot)
  const [puzzleWon, setPuzzleWon] = useState(false);
  const [puzzleMoves, setPuzzleMoves] = useState(0);
  const [puzzleDiff, setPuzzleDiff] = useState<'easy' | 'medium' | 'hard'>('easy');

  const puzzleImgPieces = [
    '🐨 Leader RM', '🐹 Vocal Jin', '🐱 Rapper SUGA',
    '🐿️ Dancer j-hope', '🐥 Singer Jimin', '🐯 Actor V',
    '🐰 Maknae JK', '💜 ARMY Forever', '👑 BTS Kings'
  ];

  const initPuzzleGame = () => {
    // Correct grid is [0, 1, 2, 3, 4, 5, 6, 7, 8] where 8 is the blank tile
    let grid = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    
    // Scramble valid sliding moves to ensure it is solvable
    for (let i = 0; i < 60; i++) {
      const blankIndex = grid.indexOf(8);
      const validSlides: number[] = [];
      const row = Math.floor(blankIndex / 3);
      const col = blankIndex % 3;
      
      if (row > 0) validSlides.push(blankIndex - 3); // Up
      if (row < 2) validSlides.push(blankIndex + 3); // Down
      if (col > 0) validSlides.push(blankIndex - 1); // Left
      if (col < 2) validSlides.push(blankIndex + 1); // Right
      
      const randomSlide = validSlides[Math.floor(Math.random() * validSlides.length)];
      // Swap blank tile
      const blankVal = grid[blankIndex];
      grid[blankIndex] = grid[randomSlide];
      grid[randomSlide] = blankVal;
    }
    
    setPuzzleGrid(grid);
    setPuzzleMoves(0);
    setPuzzleWon(false);
  };

  const handlePuzzleTileClick = (index: number) => {
    if (puzzleWon) return;
    const blankIndex = puzzleGrid.indexOf(8);
    const tileRow = Math.floor(index / 3);
    const tileCol = index % 3;
    const blankRow = Math.floor(blankIndex / 3);
    const blankCol = blankIndex % 3;
    
    // Adjacent checkout
    const isAdjacent = (Math.abs(tileRow - blankRow) + Math.abs(tileCol - blankCol)) === 1;
    if (isAdjacent) {
      const updated = [...puzzleGrid];
      updated[blankIndex] = puzzleGrid[index];
      updated[index] = 8;
      
      setPuzzleGrid(updated);
      setPuzzleMoves((m) => m + 1);
      
      // Check Win [0,1,2,3,4,5,6,7,8]
      const solved = updated.every((val, idx) => val === idx);
      if (solved) {
        setPuzzleWon(true);
        playSynthSuccess();
        let ptsBonus = 60;
        if (puzzleDiff === 'medium') ptsBonus = 100;
        if (puzzleDiff === 'hard') ptsBonus = 150;
        syncEarnedPoints(userProfile!.username, ptsBonus, ptsBonus * 1.5, `Solved ${puzzleDiff} BTS Slide Puzzle!`);
      }
    }
  };

  // -------------------------------------------------------------
  // GAME #4: Guess The Member (Blurred Screen)
  // -------------------------------------------------------------
  const [guessMemberId, setGuessMemberId] = useState<string>('');
  const [guessBlur, setGuessBlur] = useState(25);
  const [memberOptions, setMemberOptions] = useState<string[]>([]);
  const [guessStatus, setGuessStatus] = useState<'playing' | 'winner' | 'loser'>('playing');
  const [guessAttempts, setGuessAttempts] = useState(0);

  const memberDb = [
    { name: 'RM', emoji: '🐨' },
    { name: 'Jin', emoji: '🐹' },
    { name: 'SUGA', emoji: '🐱' },
    { name: 'j-hope', emoji: '🐿️' },
    { name: 'Jimin', emoji: '🐥' },
    { name: 'V', emoji: '🐯' },
    { name: 'Jungkook', emoji: '🐰' }
  ];

  const initGuessMemberGame = () => {
    const randomMember = memberDb[Math.floor(Math.random() * memberDb.length)];
    setGuessMemberId(randomMember.name);
    setGuessBlur(25);
    setGuessAttempts(0);
    setGuessStatus('playing');
    
    // Scramble alternatives
    const options = [randomMember.name];
    while(options.length < 4) {
      const alternative = memberDb[Math.floor(Math.random() * memberDb.length)].name;
      if (!options.includes(alternative)) {
        options.push(alternative);
      }
    }
    options.sort(() => Math.random() - 0.5);
    setMemberOptions(options);
  };

  const submitMemberGuess = (option: string) => {
    if (guessStatus !== 'playing') return;
    
    if (option === guessMemberId) {
      setGuessStatus('winner');
      setGuessBlur(0);
      playSynthSuccess();
      const bonusPts = Math.max(10, 45 - guessAttempts * 10);
      syncEarnedPoints(userProfile!.username, bonusPts, bonusPts + 25, `Guessed BTS Member correctly: ${guessMemberId}`);
    } else {
      setGuessAttempts((v) => v + 1);
      playSynthFail();
      
      // Decrease blur slightly to assist next attempts
      setGuessBlur((b) => Math.max(5, b - 6));
      if (guessAttempts >= 2) {
        setGuessStatus('loser');
        setGuessBlur(0); // Reveal
      }
    }
  };

  // -------------------------------------------------------------
  // GAME #5: Guess The Song (Synth Audio Cue Game)
  // -------------------------------------------------------------
  const [songCorrectName, setSongCorrectName] = useState('');
  const [songOptions, setSongOptions] = useState<string[]>([]);
  const [songStatus, setSongStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');

  const btsSongTriviaList = [
    'Dynamite', 'Butter', 'Yet To Come (The Most Beautiful Moment)', 'Life Goes On'
  ];

  const initGuessSongGame = () => {
    const selectedSong = btsSongTriviaList[Math.floor(Math.random() * btsSongTriviaList.length)];
    setSongCorrectName(selectedSong);
    setSongStatus('playing');
    
    // Set 4 options
    const options = [selectedSong];
    const alternates = btsSongTriviaList.filter(s => s !== selectedSong);
    alternates.sort(() => Math.random() - 0.5);
    options.push(...alternates.slice(0, 3));
    options.sort(() => Math.random() - 0.5);
    setSongOptions(options);
  };

  const submitSongGuess = (option: string) => {
    if (songStatus !== 'playing') return;
    if (option === songCorrectName) {
      setSongStatus('correct');
      playSynthSuccess();
      syncEarnedPoints(userProfile!.username, 40, 50, `Guessed Song Synth: ${songCorrectName}`);
    } else {
      setSongStatus('wrong');
      playSynthFail();
    }
  };

  // -------------------------------------------------------------
  // GAME #6: BTS Lyric Challenge
  // -------------------------------------------------------------
  const [lyricPrompt, setLyricPrompt] = useState('');
  const [lyricCorrectWord, setLyricCorrectWord] = useState('');
  const [lyricInput, setLyricInput] = useState('');
  const [lyricFeedback, setLyricFeedback] = useState<'playing' | 'correct' | 'wrong'>('playing');

  const lyricChallenges = [
    { prompt: "Cause I-I-I'm in the _______ tonight, so watch me bring the fire and set the night alight!", ans: "stars" },
    { prompt: "Smooth like _______, like a criminal undercover", ans: "butter" },
    { prompt: "We had only seven. But we have you _______ now", ans: "all" },
    { prompt: "One day the world stopped without any _______.", ans: "warning" },
    { prompt: "Yeah, the past was honestly the best, but my best is what _______ next.", ans: "comes" }
  ];

  const initLyricChallenge = () => {
    const r = lyricChallenges[Math.floor(Math.random() * lyricChallenges.length)];
    setLyricPrompt(r.prompt);
    setLyricCorrectWord(r.ans);
    setLyricInput('');
    setLyricFeedback('playing');
  };

  const submitLyricAnswer = () => {
    if (lyricFeedback !== 'playing') return;
    if (lyricInput.trim().toLowerCase() === lyricCorrectWord.toLowerCase()) {
      setLyricFeedback('correct');
      playSynthSuccess();
      syncEarnedPoints(userProfile!.username, 30, 45, `Passed Lyric Challenge: "${lyricCorrectWord}"`);
    } else {
      setLyricFeedback('wrong');
      playSynthFail();
    }
  };


  return (
    <div className="w-full min-h-screen bg-black/10 text-white flex flex-col items-center">
      
      {/* ─────────────────────────────────────────────────────────────
          SCREEN: AUTHENTICATION
          ───────────────────────────────────────────────────────────── */}
      {activeScreen === 'auth' && (
        <div className="w-full max-w-md mx-auto my-12 p-8 rounded-2xl border border-purple-500/20 bg-slate-950/70 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          {/* Neon Orb Backgrounds */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-fuchsia-600/30 rounded-full blur-3xl pointer-events-none" />
          
          <div className="text-center space-y-2 mb-8 relative z-10">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono tracking-widest bg-purple-950 text-fuchsia-300 border border-purple-500/30 uppercase">
              🎮 ARMY Portal Arcade
            </span>
            <h2 className="text-2xl font-bold font-sans tracking-tight bg-gradient-to-r from-purple-300 via-fuchsia-200 to-indigo-300 bg-clip-text text-transparent">
              BTS GLOBAL QUEST
            </h2>
            <p className="text-xs text-purple-200/70 px-4">
              Join exclusive missions, level up, unlock badges, and score global leaderboard spots.
            </p>
          </div>

          {/* Tab Selector */}
          {!displayedSeedPhrase && (
            <div className="flex border-b border-white/5 mb-6">
              <button
                onClick={() => { setAuthTab('login'); setAuthError(''); setAuthSuccess(''); }}
                className={`flex-1 pb-3 text-xs sm:text-sm font-semibold transition-all border-b-2 hover:text-white cursor-pointer ${
                  authTab === 'login' ? 'border-purple-500 text-white' : 'border-transparent text-purple-300/60'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthTab('signup'); setAuthError(''); setAuthSuccess(''); }}
                className={`flex-1 pb-3 text-xs sm:text-sm font-semibold transition-all border-b-2 hover:text-white cursor-pointer ${
                  authTab === 'signup' ? 'border-purple-500 text-white' : 'border-transparent text-purple-300/60'
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => {
                  setAuthTab('recover');
                  setRecoveryLoginHandle('');
                  setRecoverySeedPhraseInput('');
                  setRecoveryNewPassword('');
                  setRecoveryConfirmNewPassword('');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className={`flex-1 pb-3 text-[10px] sm:text-xs font-semibold transition-all border-b-2 hover:text-white cursor-pointer ${
                  authTab === 'recover' ? 'border-purple-500 text-white' : 'border-transparent text-purple-300/60'
                }`}
              >
                Recover Account
              </button>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4 relative z-10">
            {authError && (
              <div className="flex gap-2 items-start p-3.5 bg-red-950/20 border border-red-500/30 rounded-xl text-red-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}
            {authSuccess && (
              <div className="flex gap-2 items-start p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-emerald-200 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authSuccess}</span>
              </div>
            )}

            {displayedSeedPhrase ? (
              <div className="space-y-6 pt-2 animate-fade-in text-center">
                <div className="p-4 bg-purple-950/25 border border-purple-500/20 rounded-2xl shadow-inner">
                  <span className="text-[10px] font-mono tracking-wider uppercase bg-purple-950 text-fuchsia-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                    🔑 Security Credentials Released
                  </span>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {displayedSeedPhrase.split(' ').map((word, idx) => (
                      <div key={idx} className="flex flex-col items-center bg-black/40 border border-white/5 rounded-xl p-2 font-mono text-center">
                        <span className="text-[9px] text-purple-400 font-semibold mb-0.5">#{idx + 1}</span>
                        <span className="text-xs text-white font-bold select-all">{word}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-red-950/20 border border-red-500/30 rounded-xl text-left">
                  <div className="flex gap-2 items-start text-red-200 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <span>⚠️ Save this Recovery Seed Phrase carefully:</span>
                  </div>
                  <ul className="list-disc pl-5 mt-1 text-[11px] text-purple-200/70 space-y-0.5 font-sans">
                    <li>It will <strong className="text-red-300 font-bold">NEVER</strong> be shown again.</li>
                    <li>If you lose this phrase, you may permanently lose access to your play account.</li>
                    <li>Admins cannot retrieve this phrase for you.</li>
                  </ul>
                </div>

                {/* Download/Copy/Print layout */}
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopySeedPhrase}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/50 border border-purple-500/20 transition-all text-purple-200 text-xs font-mono cursor-pointer"
                  >
                    <Copy className="w-4 h-4 mb-1 text-purple-400" />
                    <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSavedSeedPhrase}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/50 border border-purple-500/20 transition-all text-purple-200 text-xs font-mono cursor-pointer"
                  >
                    <Download className="w-4 h-4 mb-1 text-purple-400" />
                    <span>Download TXT</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintSavedSeedPhrase}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/50 border border-purple-500/20 transition-all text-purple-200 text-xs font-mono cursor-pointer"
                  >
                    <Printer className="w-4 h-4 mb-1 text-purple-400" />
                    <span>Print PDF</span>
                  </button>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-purple-200/90 bg-purple-950/20 hover:bg-purple-950/30 border border-purple-500/20 p-3 rounded-xl transition-all mb-4">
                    <input
                      type="checkbox"
                      checked={hasConfirmedSaved}
                      onChange={(e) => setHasConfirmedSaved(e.target.checked)}
                      className="rounded border-white/10 text-purple-500 bg-black/30 focus:ring-0 cursor-pointer shrink-0"
                    />
                    <span className="text-left leading-tight">I have carefully written down and saved this Recovery Seed Phrase manually.</span>
                  </label>

                  <button
                    type="button"
                    disabled={!hasConfirmedSaved}
                    onClick={() => {
                      setDisplayedSeedPhrase(null);
                      setAuthTab('login');
                      setAuthSuccess('Registration and seed-phrase formulation confirmed! Please sign in below.');
                    }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-650 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-500 disabled:from-purple-950/30 disabled:to-fuchsia-950/30 text-white text-sm font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>I Have Saved It</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Tab: Login or Register */}
                {authTab !== 'recover' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-purple-300/80">
                      {authTab === 'signup' ? 'Desired Username' : 'Username or Email Address'}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                      <input
                        type="text"
                        required
                        placeholder={authTab === 'signup' ? 'e.g. bts_fan_99' : 'Enter registered identity'}
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                      />
                    </div>
                  </div>
                )}

                {/* Tab: Recover Account display fields */}
                {authTab === 'recover' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-purple-300/80">
                        Registered Username or Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. army_candidate or fan@domain.com"
                          value={recoveryLoginHandle}
                          onChange={(e) => setRecoveryLoginHandle(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-purple-300/80">
                        12-Word Recovery Seed Phrase (Strict Order & Spelling)
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Type all 12 words in precise order separated by standard spaces"
                        value={recoverySeedPhraseInput}
                        onChange={(e) => setRecoverySeedPhraseInput(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 font-mono resize-none leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-purple-300/80">New Password</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={recoveryNewPassword}
                          onChange={(e) => setRecoveryNewPassword(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-purple-300/80">Confirm New Password</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={recoveryConfirmNewPassword}
                          onChange={(e) => setRecoveryConfirmNewPassword(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {authTab === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-purple-300/80">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                      <input
                        type="email"
                        required
                        placeholder="Enter valid email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                      />
                    </div>
                  </div>
                )}

                {authTab !== 'recover' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-purple-300/80">Account Password</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                      />
                    </div>
                  </div>
                )}

                {authTab === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-purple-300/80">Confirm Password</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                      />
                    </div>
                  </div>
                )}

                {authTab === 'login' && (
                  <div className="flex items-center justify-between pb-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-purple-300/80">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-white/10 text-purple-500 bg-black/30 focus:ring-0 cursor-pointer"
                      />
                      <span>Remember Me</span>
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-650 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-500 text-white text-sm font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {authLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing Portal Auth...</span>
                    </>
                  ) : (
                    <span>
                      {authTab === 'login'
                        ? 'Secure Authentication'
                        : authTab === 'signup'
                          ? 'Complete My Registration'
                          : 'Complete Account Recovery'}
                    </span>
                  )}
                </button>
              </>
            )}
          </form>
        </div>
      )}


      {/* ─────────────────────────────────────────────────────────────
          SCREEN: GAME DASHBOARD OVERVIEW
          ───────────────────────────────────────────────────────────── */}
      {activeScreen === 'dashboard' && userProfile && (
        <div className="w-full space-y-8 max-w-6xl">
          
          {/* Section Heading with Profile Card */}
          <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-purple-950/40 to-slate-900/40 backdrop-blur-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-8 w-60 h-60 bg-fuchsia-600/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Profile Avatar */}
              <div className="relative shrink-0">
                {userProfile.avatarUrl ? (
                  <img 
                    src={userProfile.avatarUrl} 
                    alt={userProfile.username} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-400 shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-650 via-indigo-600 to-pink-500 flex items-center justify-center text-2xl shadow-lg border-2 border-purple-400 font-bold text-white uppercase select-none">
                    {userProfile.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-black rounded-full text-[9px] font-mono border border-purple-400 font-bold text-fuchsia-300">
                  Lvl {userProfile.currentLevel}
                </div>
              </div>

              {/* Profile Meta & Custom details */}
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold font-sans text-white truncate">
                    {userProfile.displayName || `@${userProfile.username}`}
                  </h3>
                  {userProfile.displayName && (
                    <span className="text-[10px] text-purple-300 font-mono">(@{userProfile.username})</span>
                  )}
                  {userProfile.isAdmin && (
                    <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-500/30 text-[9px] rounded-full font-mono font-bold flex items-center gap-1 shrink-0">
                      <Shield className="w-2.5 h-2.5" /> ADMIN
                    </span>
                  )}
                  {userProfile.country && (
                    <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-[9px] rounded-full font-mono font-bold flex items-center gap-1 shrink-0 uppercase">
                      <Globe className="w-2.5 h-2.5" /> {userProfile.country}
                    </span>
                  )}
                </div>

                {userProfile.bio && (
                  <p className="text-xs text-gray-300 italic max-w-sm line-clamp-2 md:max-w-md">{userProfile.bio}</p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] font-mono text-purple-300/75">
                  <span className="font-semibold flex items-center gap-1 text-fuchsia-300">
                    <Trophy className="w-3.5 h-3.5 text-fuchsia-400" /> {userProfile.armyPoints} Points
                  </span>
                  <span className="font-semibold flex items-center gap-1 text-indigo-300">
                    <Flame className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> {userProfile.dailyStreak}-Day Streak
                  </span>
                  {userProfile.favoriteMember && userProfile.favoriteMember !== 'None' && (
                    <span className="font-semibold text-rose-300 flex items-center gap-1">
                      💖 Biased: {userProfile.favoriteMember}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick stats items */}
            <div className="flex flex-wrap gap-2 md:self-end">
              {userProfile.isAdmin && !isAdminMode && (
                <button
                  onClick={() => { setIsAdminMode(true); fetchAdminData(); }}
                  className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Shield className="w-4 h-4 text-rose-400" /> Admin Console
                </button>
              )}
              
              {isAdminMode && (
                <button
                  onClick={() => setIsAdminMode(false)}
                  className="px-3.5 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <User className="w-4 h-4 text-purple-400" /> Back to Quest
                </button>
              )}

              <button
                onClick={() => setActiveScreen('profile_settings')}
                className="px-3.5 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800 border border-purple-500/35 text-purple-200 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Settings className="w-4 h-4 text-purple-400" /> Edit Profile
              </button>

              <button
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl bg-black/40 hover:bg-slate-900 text-gray-300 text-xs font-mono border border-white/5 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* ----------------- ADMIN MODE CONTAINER ----------------- */}
          {isAdminMode && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="lg:col-span-2 space-y-6">
                
                {/* Analytics */}
                <div className="p-5 rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-xl space-y-4">
                  <div className="border-b border-white/5 pb-2">
                    <h3 className="text-sm font-mono font-bold text-fuchsia-300 uppercase tracking-widest flex items-center gap-2">
                      📊 ARCHID ARCADE ANALYTICS
                    </h3>
                  </div>
                  {adminAnalytics && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                        <span className="text-[10px] text-gray-500 font-mono block">TOTAL PLAYERS</span>
                        <span className="text-xl font-bold font-mono text-purple-300">{adminAnalytics.totalUsers}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                        <span className="text-[10px] text-gray-500 font-mono block">ACTIVE TODAY</span>
                        <span className="text-xl font-bold font-mono text-indigo-300">{adminAnalytics.activeUsers}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                        <span className="text-[10px] text-gray-500 font-mono block">TOTAL POINTS DISTRIBUTED</span>
                        <span className="text-xl font-bold font-mono text-fuchsia-300">{adminAnalytics.totalPoints}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Search List */}
                <div className="p-5 rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h3 className="text-sm font-mono font-bold text-slate-300 uppercase">
                      👥 Registered Players ({adminUsers.length})
                    </h3>
                    <input
                      type="text"
                      placeholder="Search player username..."
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-lg text-xs px-3 py-1.5 focus:outline-none focus:border-purple-500 w-44"
                    />
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {adminUsers
                      .filter(u => u.username.includes(adminSearch.toLowerCase()))
                      .map(u => (
                        <div 
                          key={u.username}
                          onClick={() => setSelectedAdminUser(u)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            selectedAdminUser?.username === u.username 
                              ? 'bg-purple-900/30 border-purple-500' 
                              : 'bg-black/20 border-white/5 hover:bg-black/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">💜</span>
                            <div>
                              <span className="text-xs font-bold text-white block">@{u.username}</span>
                              <span className="text-[10px] text-gray-400 block">{u.email}</span>
                            </div>
                          </div>
                          <div className="text-right text-xs font-mono space-y-0.5">
                            <span className="text-fuchsia-300 block">{u.armyPoints} Points</span>
                            <span className="text-gray-500 text-[10px] block">Level {u.currentLevel}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

              </div>

              {/* Side controls */}
              <div className="space-y-6">
                {selectedAdminUser ? (
                  <div className="p-5 rounded-2xl border border-purple-500/20 bg-slate-950/60 backdrop-blur-xl space-y-6">
                    <div className="border-b border-white/5 pb-2">
                      <span className="text-[10px] font-mono text-fuchsia-400 block">SELECTED PLAYER</span>
                      <h4 className="text-sm font-bold text-white">@{selectedAdminUser.username}</h4>
                    </div>

                    {/* Quick Adjustment */}
                    <div className="space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 block">ADJUST ARMY POINTS</label>
                        <input
                          type="number"
                          placeholder="e.g. 100 or -50"
                          value={pointsAdjustment}
                          onChange={(e) => setPointsAdjustment(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 block">ADJUST XP</label>
                        <input
                          type="number"
                          value={xpAdjustment}
                          placeholder="e.g. 200 or -30"
                          onChange={(e) => setXpAdjustment(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 block">ADJUST LEVEL</label>
                        <input
                          type="number"
                          value={levelAdjustment}
                          placeholder="e.g. 5"
                          onChange={(e) => setLevelAdjustment(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAdminUpdateUser(selectedAdminUser.username)}
                          className="flex-1 py-2 bg-purple-650 hover:bg-purple-600 rounded-lg text-white font-bold transition-all cursor-pointer"
                        >
                          Apply Scores
                        </button>
                        {selectedAdminUser.status === 'active' ? (
                          <button
                            onClick={() => handleAdminBanUser(selectedAdminUser.username, 'banned')}
                            className="px-3 py-2 bg-red-950/80 hover:bg-red-900 border border-red-500/30 rounded-lg text-red-300 font-mono font-bold transition-all cursor-pointer flex items-center justify-center"
                            title="Ban Player"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAdminBanUser(selectedAdminUser.username, 'active')}
                            className="px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 rounded-lg text-emerald-300 font-mono font-bold transition-all cursor-pointer flex items-center justify-center"
                            title="Unban Player"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Advanced Admin Moderation Fields */}
                      <div className="pt-4 border-t border-white/5 space-y-3.5">
                        <span className="text-[10px] font-mono text-fuchsia-400 block uppercase tracking-wider">👮 Moderate Profile Information</span>
                        
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-gray-400 block">DISPLAY NAME</label>
                          <input
                            type="text"
                            value={selectedAdminUser.displayName || ''}
                            onChange={(e) => setSelectedAdminUser({ ...selectedAdminUser, displayName: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-gray-400 block">BIOGRAPHY</label>
                          <textarea
                            rows={2}
                            value={selectedAdminUser.bio || ''}
                            onChange={(e) => setSelectedAdminUser({ ...selectedAdminUser, bio: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block">FAV MEMBER</label>
                            <input
                              type="text"
                              value={selectedAdminUser.favoriteMember || 'None'}
                              onChange={(e) => setSelectedAdminUser({ ...selectedAdminUser, favoriteMember: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block">COUNTRY</label>
                            <input
                              type="text"
                              value={selectedAdminUser.country || ''}
                              onChange={(e) => setSelectedAdminUser({ ...selectedAdminUser, country: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>

                        {selectedAdminUser.avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setSelectedAdminUser({ ...selectedAdminUser, avatarUrl: null })}
                            className="w-full py-1.5 bg-rose-950/30 hover:bg-rose-900 border border-rose-500/20 text-rose-300 text-[10px] font-mono font-bold rounded-lg transition-all"
                          >
                            Remove Bad Avatar Image
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleAdminEditProfileDetail(selectedAdminUser.username, {
                            displayName: selectedAdminUser.displayName,
                            bio: selectedAdminUser.bio,
                            favoriteMember: selectedAdminUser.favoriteMember,
                            country: selectedAdminUser.country,
                            avatarUrl: selectedAdminUser.avatarUrl,
                            isPublic: selectedAdminUser.isPublic
                          })}
                          className="w-full py-2 bg-gradient-to-r from-purple-900 to-indigo-950 hover:from-purple-800 border border-purple-500/30 text-[10px] font-mono font-bold text-white tracking-widest uppercase rounded-lg transition-all"
                        >
                          Save Moderator Changes
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-white/10 bg-black/20 text-xs text-gray-500">
                    Click a player from the list to modify their score, ban, or inspect history.
                  </div>
                )}
              </div>
            </div>
          )}


          {/* ----------------- STANDARD PLAY MODE CONTAINER ----------------- */}
          {!isAdminMode && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* PRIMARY FEED: ARCADE MACHINES PANEL */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-xs font-mono font-bold text-fuchsia-300 uppercase tracking-[0.2em] mb-4">
                    🎮 ACTIVE ARCADE GUEST MACHINES
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* MACHINE 1: QUIZ */}
                    <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/40 hover:bg-purple-950/20 hover:border-purple-500/20 transition-all flex flex-col justify-between h-44 shadow-md group">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-2xl">🧠</span>
                          <span className="px-2 py-0.5 rounded bg-purple-950/50 text-[10px] font-mono text-purple-300 border border-purple-500/10">BTS Trivia</span>
                        </div>
                        <h4 className="text-sm font-bold font-sans text-white group-hover:text-purple-300 transition-colors">Trivia Quiz Game</h4>
                        <p className="text-[11px] text-gray-400">Prove your deep knowledge of BTS history, milestones, and lyrics!</p>
                      </div>
                      <button
                        onClick={() => { handleStartQuiz(); setActiveScreen('game_quiz'); }}
                        className="w-full mt-3 py-2 bg-purple-650 hover:bg-purple-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" /> Start Machine
                      </button>
                    </div>

                    {/* MACHINE 2: MEMORY */}
                    <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/40 hover:bg-purple-950/20 hover:border-purple-500/20 transition-all flex flex-col justify-between h-44 shadow-md group">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-2xl">🃏</span>
                          <span className="px-2 py-0.5 rounded bg-purple-950/50 text-[10px] font-mono text-purple-300 border border-purple-500/10">Cognition</span>
                        </div>
                        <h4 className="text-sm font-bold font-sans text-white group-hover:text-purple-300 transition-colors">Member Memory Card</h4>
                        <p className="text-[11px] text-gray-400">Match twin cards containing BTS members as fast as you can.</p>
                      </div>
                      <button
                        onClick={() => { initMemoryGame(); setActiveScreen('game_memory'); }}
                        className="w-full mt-3 py-2 bg-purple-650 hover:bg-purple-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" /> Start Machine
                      </button>
                    </div>

                    {/* MACHINE 3: PUZZLE */}
                    <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/40 hover:bg-purple-950/20 hover:border-purple-500/20 transition-all flex flex-col justify-between h-44 shadow-md group">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-2xl">🧩</span>
                          <span className="px-2 py-0.5 rounded bg-purple-950/50 text-[10px] font-mono text-purple-300 border border-purple-500/10">3x3 Slider</span>
                        </div>
                        <h4 className="text-sm font-bold font-sans text-white group-hover:text-purple-300 transition-colors">BTS Image Sliding Box</h4>
                        <p className="text-[11px] text-gray-400">Rearrange the sliding tiles to form a gorgeous photo of BTS.</p>
                      </div>
                      <button
                        onClick={() => { initPuzzleGame(); setActiveScreen('game_puzzle'); }}
                        className="w-full mt-3 py-2 bg-purple-650 hover:bg-purple-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" /> Start Machine
                      </button>
                    </div>

                    {/* MACHINE 4: GUESS MEMBER */}
                    <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/40 hover:bg-purple-950/20 hover:border-purple-500/20 transition-all flex flex-col justify-between h-44 shadow-md group">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-2xl">👤</span>
                          <span className="px-2 py-0.5 rounded bg-purple-950/50 text-[10px] font-mono text-purple-300 border border-purple-500/10">Visual</span>
                        </div>
                        <h4 className="text-sm font-bold font-sans text-white group-hover:text-purple-300 transition-colors">Guess Blurred Member</h4>
                        <p className="text-[11px] text-gray-400">Identify which BTS member is hidden behind intense blur!</p>
                      </div>
                      <button
                        onClick={() => { initGuessMemberGame(); setActiveScreen('game_guess_member'); }}
                        className="w-full mt-3 py-2 bg-purple-650 hover:bg-purple-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" /> Start Machine
                      </button>
                    </div>

                    {/* MACHINE 5: GUESS SONG */}
                    <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/40 hover:bg-purple-950/20 hover:border-purple-500/20 transition-all flex flex-col justify-between h-44 shadow-md group">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-2xl">🎹</span>
                          <span className="px-2 py-0.5 rounded bg-purple-950/50 text-[10px] font-mono text-purple-300 border border-purple-500/10">Audio Synth</span>
                        </div>
                        <h4 className="text-sm font-bold font-sans text-white group-hover:text-purple-300 transition-colors">Retro Synth Guess Song</h4>
                        <p className="text-[11px] text-gray-400">Play live audio synthesizer chords and identify the correct BTS track!</p>
                      </div>
                      <button
                        onClick={() => { initGuessSongGame(); setActiveScreen('game_guess_song'); }}
                        className="w-full mt-3 py-2 bg-purple-650 hover:bg-purple-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" /> Start Machine
                      </button>
                    </div>

                    {/* MACHINE 6: LYRIC CHALLENGE */}
                    <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/40 hover:bg-purple-950/20 hover:border-purple-500/20 transition-all flex flex-col justify-between h-44 shadow-md group">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-2xl">📝</span>
                          <span className="px-2 py-0.5 rounded bg-purple-950/50 text-[10px] font-mono text-purple-300 border border-purple-500/10">Lyrics</span>
                        </div>
                        <h4 className="text-sm font-bold font-sans text-white group-hover:text-purple-300 transition-colors">BTS Lyric Challenge</h4>
                        <p className="text-[11px] text-gray-400">Type in the missing word from famous lines inside BE/Proof albums.</p>
                      </div>
                      <button
                        onClick={() => { initLyricChallenge(); setActiveScreen('game_lyric'); }}
                        className="w-full mt-3 py-2 bg-purple-650 hover:bg-purple-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" /> Start Machine
                      </button>
                    </div>

                  </div>
                </div>

                {/* HISTORIC LOGS LIST */}
                <div className="p-5 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl space-y-4">
                  <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">
                    📜 RECENT ACTIVITY history
                  </h3>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {userProfile.history && userProfile.history.length > 0 ? (
                      userProfile.history.map((log) => (
                        <div 
                          key={log.id}
                          className="p-3 rounded-lg bg-black/40 border border-white/[0.02] flex justify-between items-center text-xs"
                        >
                          <div>
                            <span className="font-semibold block text-white">{log.description}</span>
                            <span className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="text-right text-xs font-mono shrink-0">
                            <span className="text-emerald-400 block font-bold">+{log.pointsEarned} Pts</span>
                            <span className="text-indigo-400 block text-[10px]">+{log.xpEarned} XP</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 text-center py-6">Your activity history is empty. Launch high-score games to populate!</p>
                    )}
                  </div>
                </div>

              </div>


              {/* SECONDARY SIDEBAR: DAILY MISSIONS & LEADERBOARDS */}
              <div className="space-y-6">
                
                {/* DAILY QUESTS TRACKER */}
                <div className="p-5 rounded-2xl border border-purple-500/10 bg-slate-900/40 backdrop-blur-xl space-y-4">
                  <div className="border-b border-white/5 pb-2">
                    <h3 className="text-xs font-mono font-bold text-fuchsia-300 uppercase tracking-widest flex items-center gap-1">
                      📅 DAILY QUEST LINEUP
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl border border-white/5 bg-black/40 flex justify-between items-center text-xs">
                      <div>
                        <h5 className="font-bold text-white">Daily Arcade Login</h5>
                        <p className="text-[10px] text-gray-400">+10 Points / +20 XP</p>
                      </div>
                      <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px] font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Done
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-white/5 bg-black/40 flex justify-between items-center text-xs">
                      <div>
                        <h5 className="font-bold text-white">Unlock any Game Machine</h5>
                        <p className="text-[10px] text-gray-400">+30 Points / +40 XP</p>
                      </div>
                      {userProfile.history?.some(h => ['quiz', 'memory', 'puzzle'].includes(h.type)) ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px] font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Done
                        </span>
                      ) : (
                        <button
                          onClick={() => claimDailyMission('play_game', 30, 40)}
                          className="px-2 py-1 bg-purple-650 hover:bg-purple-600 rounded text-[10px] font-bold text-white cursor-pointer"
                        >
                          Claim
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* EARNING UNLOCKED BADGES */}
                <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl space-y-4">
                  <h3 className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wide">
                    🏆 UNLOCKED MILITARY BADGES
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {/* Level Badges */}
                    <div className="p-2 py-1.5 rounded-lg bg-purple-950/50 border border-purple-500/20 flex items-center gap-1.5 text-xs font-medium" title="First join badge">
                      <span>👶</span>
                      <span>Card Cadet</span>
                    </div>
                    {userProfile.currentLevel >= 2 && (
                      <div className="p-2 py-1.5 rounded-lg bg-pink-950/40 border border-pink-500/20 flex items-center gap-1.5 text-xs font-medium">
                        <span>💜</span>
                        <span>Purple Heart</span>
                      </div>
                    )}
                    {userProfile.currentLevel >= 4 && (
                      <div className="p-2 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 flex items-center gap-1.5 text-xs font-medium">
                        <span>🎖️</span>
                        <span>Festa Hero</span>
                      </div>
                    )}
                    {userProfile.currentLevel >= 6 && (
                      <div className="p-2 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/20 flex items-center gap-1.5 text-xs font-medium">
                        <span>🔥</span>
                        <span>Active Legend</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* GLOBAL RANKING LEADERBOARD */}
                <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h3 className="text-xs font-mono font-bold text-gray-400 uppercase">
                      👑 GLOBAL LEADERBOARD
                    </h3>
                    <button
                      onClick={fetchLeaderboard}
                      className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                      title="Reload scores"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${leaderboardLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {leaderboardUsers.map((player, index) => (
                      <div 
                        key={player.username}
                        onClick={() => setSelectedPublicUser(player)}
                        className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer hover:scale-[1.01] transition-all duration-200 group ${
                          player.username === userProfile.username 
                            ? 'bg-purple-950/55 border-purple-500 shadow-md shadow-purple-500/10' 
                            : 'bg-black/45 border-white/[0.04] hover:bg-purple-900/10 hover:border-purple-500/25'
                        }`}
                        title="Click to view public game profile card"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Rank */}
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold text-white shrink-0 ${
                            index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-700' : 'bg-white/10'
                          }`}>
                            {index + 1}
                          </span>

                          {/* Profile Picture */}
                          {player.avatarUrl ? (
                            <img 
                              src={player.avatarUrl} 
                              alt={player.username} 
                              className="w-9 h-9 rounded-full object-cover border border-purple-500/40 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-purple-950/80 border border-purple-400/20 flex items-center justify-center text-xs font-mono font-bold text-purple-300 shrink-0 select-none">
                              {player.username.slice(0, 2).toUpperCase()}
                            </div>
                          )}

                          {/* Username & Stats */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-white block group-hover:text-purple-300 transition-colors truncate">
                                @{player.username}
                              </span>
                              {player.country && (
                                <span className="text-[10px]" title={`Country: ${player.country}`}>
                                  {player.country.includes('US') ? '🇺🇸' : player.country.includes('KR') ? '🇰🇷' : player.country.includes('BD') ? '🇧🇩' : '🌐'}
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-purple-400 font-mono block">
                              Lvl {player.currentLevel} • {player.xp} XP
                            </span>
                          </div>
                        </div>

                        {/* Badges / Points */}
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold font-mono text-fuchsia-300 block">
                            {player.armyPoints} Pts
                          </span>
                          {player.badges && player.badges.length > 0 && (
                            <span className="text-[8px] bg-indigo-950/80 text-indigo-300 border border-indigo-500/20 px-1 py-0.5 rounded font-medium inline-block max-w-[70px] truncate">
                              {player.badges[player.badges.length - 1]}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {leaderboardUsers.length === 0 && (
                      <div className="text-center py-6">
                        <button
                          onClick={fetchLeaderboard}
                          className="px-3 py-1.5 bg-purple-955 hover:bg-purple-900 rounded border border-purple-500/20 text-xs font-mono text-purple-300 font-bold cursor-pointer"
                        >
                          Sync Live Leaderboard
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      )}


      {/* ─────────────────────────────────────────────────────────────
          SCREEN: USER PORTAL SETTINGS & PROFILE CUSTOMIZATION
          ───────────────────────────────────────────────────────────── */}
      {activeScreen === 'profile_settings' && userProfile && (
        <div className="w-full max-w-2xl p-6 rounded-2xl border border-white/10 bg-slate-950/70 backdrop-blur-xl relative overflow-hidden space-y-6 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <h2 className="text-sm font-mono text-purple-400 font-bold uppercase tracking-widest flex items-center gap-1">
                🔧 Portal Settings // customize-army-card.config
              </h2>
              <p className="text-[11px] text-gray-400">Configure your global identity, stats visibilities, and credentials</p>
            </div>
            <button
              onClick={() => { setActiveScreen('dashboard'); setProfileEditSuccess(''); setProfileEditError(''); }}
              className="p-1 px-2 py-1 bg-black/40 hover:bg-slate-900 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-colors cursor-pointer text-[10px] uppercase font-mono"
            >
              Back to Dashboard [x]
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            {/* Success and Error messages */}
            {profileEditSuccess && (
              <div className="p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-950/30 text-emerald-300 text-xs flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 shrink-0" />
                <span>{profileEditSuccess}</span>
              </div>
            )}
            {profileEditError && (
              <div className="p-3.5 rounded-xl border border-rose-500/25 bg-rose-950/30 text-rose-300 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileEditError}</span>
              </div>
            )}

            {/* AVATAR HANDLER & PROFILE PIC */}
            <div className="p-4 rounded-xl border border-white/5 bg-black/35 space-y-3.5">
              <label className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wide block">
                🤳 AVATAR & UNIQUE IDENTIFIER
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Image Preview Canvas */}
                <div className="relative shrink-0">
                  {editAvatarUrl ? (
                    <img 
                      src={editAvatarUrl} 
                      alt="Avatar preview" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/50 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-purple-900/60 border-2 border-purple-400/20 flex items-center justify-center text-2xl font-bold uppercase text-purple-200 shadow-inner select-none">
                      {editUsername ? editUsername.slice(0, 2).toUpperCase() : 'AR'}
                    </div>
                  )}
                  {editAvatarUrl && (
                    <button
                      type="button"
                      onClick={() => { setEditAvatarUrl(null); setProfileEditSuccess("Avatar reset! Save changes below to finalize. 💜"); }}
                      className="absolute -bottom-1 -right-1 p-1 bg-rose-950/90 hover:bg-rose-900 rounded-full border border-rose-500/40 text-rose-300 hover:text-white transition-colors cursor-pointer shadow-md"
                      title="Remove avatar"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Drag and drop selection zone */}
                <div className="flex-1 w-full text-center sm:text-left space-y-1.5">
                  <div className="flex gap-2">
                    <label className="px-3.5 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800 border border-purple-500/30 text-xs text-purple-200 font-bold cursor-pointer transition-all flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" />
                      Upload Avatar Image
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/webp" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                            setProfileEditError("Only standard JPG, PNG, and WEBP profile types supported.");
                            return;
                          }
                          if (file.size > 5 * 1024 * 1024) {
                            setProfileEditError("Image is too heavy (max 5MB limit). Please optimize package.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const img = new Image();
                            img.onload = () => {
                              const canvas = document.createElement('canvas');
                              canvas.width = 160;
                              canvas.height = 160;
                              const ctx = canvas.getContext('2d');
                              if (ctx) {
                                const size = Math.min(img.width, img.height);
                                const sx = (img.width - size) / 2;
                                const sy = (img.height - size) / 2;
                                ctx.beginPath();
                                ctx.arc(80, 80, 80, 0, Math.PI * 2, true);
                                ctx.closePath();
                                ctx.clip();
                                ctx.drawImage(img, sx, sy, size, size, 0, 0, 160, 160);
                                setEditAvatarUrl(canvas.toDataURL('image/webp', 0.85));
                                setProfileEditSuccess("Circular crop generated! Press Save below to apply. 💜");
                              }
                            };
                            img.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="hidden" 
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-400">JPG, PNG, or WEBP. 5MB size limit. Automatically cropped to perfect standard circle.</p>
                </div>
              </div>
            </div>

            {/* IDENTITY DETAILS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-purple-300/80">Unique Username</label>
                <input 
                  type="text"
                  required
                  placeholder="armyusername"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-purple-300/80">Display Badge Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Bangtan Champion"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-purple-300/80">Favorite BTS Member (Bias)</label>
                <select 
                  value={editFavoriteMember} 
                  onChange={(e) => setEditFavoriteMember(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 block"
                >
                  <option value="None" className="bg-slate-950 text-white">Select favorite member / bias</option>
                  <option value="RM" className="bg-slate-950 text-white">RM (Kim Nam-joon)</option>
                  <option value="Jin" className="bg-slate-950 text-white">Jin (Kim Seok-jin)</option>
                  <option value="Suga" className="bg-slate-950 text-white">Suga (Min Yoon-gi)</option>
                  <option value="j-hope" className="bg-slate-950 text-white">j-hope (Jung Ho-seok)</option>
                  <option value="Jimin" className="bg-slate-950 text-white">Jimin (Park Ji-min)</option>
                  <option value="V" className="bg-slate-950 text-white">V (Kim Tae-hyung)</option>
                  <option value="Jungkook" className="bg-slate-950 text-white">Jungkook (Jeon Jung-kook)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-purple-300/80">Affiliated Country / Region</label>
                <select 
                  value={editCountry} 
                  onChange={(e) => setEditCountry(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 block"
                >
                  <option value="" className="bg-slate-950 text-white">Select Country Code</option>
                  <option value="United States (US)" className="bg-slate-950 text-white">🇺🇸 United States (US)</option>
                  <option value="South Korea (KR)" className="bg-slate-950 text-white">🇰🇷 South Korea (KR)</option>
                  <option value="Bangladesh (BD)" className="bg-slate-950 text-white">🇧🇩 Bangladesh (BD)</option>
                  <option value="United Kingdom (UK)" className="bg-slate-950 text-white">🇬🇧 United Kingdom (UK)</option>
                  <option value="Germany (DE)" className="bg-slate-950 text-white">🇩🇪 Germany (DE)</option>
                  <option value="Brazil (BR)" className="bg-slate-950 text-white">🇧🇷 Brazil (BR)</option>
                  <option value="Global ARMY" className="bg-slate-950 text-white">🌐 Global ARMY</option>
                </select>
              </div>

            </div>

            {/* BIO */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-purple-300/80">Personal ARMY Bio (Biography)</label>
              <textarea 
                rows={3}
                placeholder="Share your love for BTS, your favorite tracks, albums, or personal goals..."
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                maxLength={400}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none"
              />
            </div>

            {/* SOCIAL LINKS (Twitter, Instagram, YouTube, TikTok) */}
            <div className="p-4 rounded-xl border border-white/5 bg-black/30 space-y-3.5">
              <label className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wide block">
                🌐 AMBIENT CONNECTIVITY LINKS
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-400">X (Twitter) Username</label>
                  <input 
                    type="text"
                    placeholder="e.g. bts_fan"
                    value={editTwitter}
                    onChange={(e) => setEditTwitter(e.target.value)}
                    className="w-full bg-black/30 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-400">Instagram Handle</label>
                  <input 
                    type="text"
                    placeholder="e.g. rm_enthusiast"
                    value={editInstagram}
                    onChange={(e) => setEditInstagram(e.target.value)}
                    className="w-full bg-black/30 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-400">YouTube Channel Handle</label>
                  <input 
                    type="text"
                    placeholder="e.g. @armymusic"
                    value={editYoutube}
                    onChange={(e) => setEditYoutube(e.target.value)}
                    className="w-full bg-black/30 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-400">TikTok Identifier</label>
                  <input 
                    type="text"
                    placeholder="e.g. @jungkookfans"
                    value={editTiktok}
                    onChange={(e) => setEditTiktok(e.target.value)}
                    className="w-full bg-black/30 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>
              </div>
            </div>

            {/* EMAIL AND PASSWORD VERIFICATION & SYSTEM CHANGE */}
            <div className="p-4 rounded-xl border border-white/5 bg-black/30 space-y-3.5">
              <label className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wide block">
                🔐 SECURITY & SYSTEM CREDENTIALS
              </label>
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-purple-300/80">Account Email Address</label>
                <input 
                  type="email"
                  required
                  placeholder="verify_email@armydomain.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
              </div>

              <div className="space-y-4 pt-2 border-t border-white/5">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-purple-300/85">Current Password (Required for Password Change)</label>
                  <input 
                    type="password"
                    placeholder="Enter current password to set a new one"
                    value={editCurrentPassword}
                    onChange={(e) => setEditCurrentPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-purple-300/85">New Password (Optional)</label>
                    <input 
                      type="password"
                      placeholder="Leave empty to keep current"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-purple-300/85">Confirm New Password</label>
                    <input 
                      type="password"
                      placeholder="Confirm new password"
                      value={editConfirmPassword}
                      onChange={(e) => setEditConfirmPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* PRIVACY toggles */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white">ARMY Card Privacy visibility</h5>
                  <p className="text-[10px] text-gray-400">If Private: only level, username, and avatar render publicly</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsPublic(!editIsPublic)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border shrink-0 cursor-pointer ${
                    editIsPublic 
                      ? 'bg-purple-950/50 border-purple-500 text-purple-300' 
                      : 'bg-rose-950/50 border-rose-500 text-rose-300'
                  }`}
                >
                  {editIsPublic ? "Public Profile" : "Private Profile"}
                </button>
              </div>

            </div>

            {/* FORM FOOTER BUTTONS */}
            <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => { setActiveScreen('dashboard'); setProfileEditSuccess(''); setProfileEditError(''); }}
                className="px-4 py-2 border border-white/10 bg-black/35 hover:bg-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer text-gray-300"
              >
                Cancel Changes
              </button>
              <button
                type="submit"
                disabled={profileSaving}
                className="px-5 py-2 bg-gradient-to-r from-purple-650 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {profileSaving ? "Saving portal settings..." : "Save My Portal Changes"}
              </button>
            </div>

          </form>
        </div>
      )}


      {/* ─────────────────────────────────────────────────────────────
          SCREEN: GUEST STATIC PROFILE VISUAL VIEW (statically loaded via URL)
          ───────────────────────────────────────────────────────────── */}
      {activeScreen === 'guest_profile_view' && (
        <div className="w-full max-w-lg p-6 rounded-2xl border border-purple-500/20 bg-slate-950/75 backdrop-blur-xl space-y-6 shadow-2xl relative text-center">
          <div className="absolute top-0 right-0 p-8 w-40 h-40 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-between items-center border-b border-white/5 pb-3 text-left">
            <span className="text-xs font-mono text-purple-400">🌐 GLOBAL ARMY DIRECTORY // profile-card</span>
            <button
              onClick={() => {
                if (userProfile) {
                  setActiveScreen('dashboard');
                } else {
                  setActiveScreen('auth');
                }
                setGuestProfile(null);
                window.history.pushState({}, '', '/game'); // clean URL
              }}
              className="px-2 py-0.5 bg-black/40 hover:bg-slate-900 text-gray-400 hover:text-white border border-white/10 rounded font-mono text-[10px] cursor-pointer"
            >
              Exit Viewer
            </button>
          </div>

          {guestLoading ? (
            <div className="py-12 space-y-3">
              <RefreshCw className="w-8 h-8 text-fuchsia-500 animate-spin mx-auto" />
              <p className="text-xs text-purple-300 animate-pulse font-mono">Synchronizing BTS Trading Card database...</p>
            </div>
          ) : guestError ? (
            <div className="py-12 space-y-4">
              <span className="text-4xl text-gray-500">🚫</span>
              <h3 className="text-base font-bold text-white">Trading Card Directory Error</h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">{guestError}</p>
              <button
                type="button"
                onClick={() => {
                  if (userProfile) {
                    setActiveScreen('dashboard');
                  } else {
                    setActiveScreen('auth');
                  }
                  window.history.pushState({}, '', '/game');
                }}
                className="px-4 py-2 bg-purple-650 hover:bg-purple-600 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
              >
                Go to Portal Landing
              </button>
            </div>
          ) : guestProfile ? (
            <div className="space-y-6">
              
              {/* Profile Card Render */}
              <div className="relative p-5 rounded-2xl border border-white/10 bg-gradient-to-b from-purple-900/10 via-slate-900/30 to-black/30 space-y-4 shadow-lg">
                
                {/* Avatar */}
                <div className="relative inline-block">
                  {guestProfile.avatarUrl ? (
                    <img 
                      src={guestProfile.avatarUrl} 
                      alt={guestProfile.username} 
                      className="w-20 h-20 rounded-full object-cover border-2 border-purple-500 mx-auto shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-650 to-fuchsia-500 border-2 border-purple-400/30 flex items-center justify-center text-3xl font-mono font-bold text-white uppercase mx-auto select-none shadow-md">
                      {guestProfile.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 bg-black text-fuchsia-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-purple-500/40">
                    Lvl {guestProfile.currentLevel}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold font-sans text-white">
                    {guestProfile.isPublic !== false ? (guestProfile.displayName || `@${guestProfile.username}`) : `@${guestProfile.username}`}
                  </h3>
                  <p className="text-[11px] text-purple-400 font-mono">@{guestProfile.username}</p>
                  {guestProfile.isPublic !== false && guestProfile.country && (
                    <p className="text-[11px] text-gray-400 font-sans flex items-center justify-center gap-1">
                      <Globe className="w-3 h-3 text-purple-400" /> Affiliation: <b className="text-gray-200">{guestProfile.country}</b>
                    </p>
                  )}
                </div>

                {/* Private card block */}
                {guestProfile.isPublic === false ? (
                  <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 text-center space-y-1">
                    <p className="text-xs font-bold text-rose-300 flex items-center justify-center gap-1.5">
                      <EyeOff className="w-4 h-4 text-rose-400" /> Private ARMY Card
                    </p>
                    <p className="text-[10px] text-gray-400">Social connectivity logs, accomplishments, and bios are hidden by request.</p>
                  </div>
                ) : (
                  <>
                    {guestProfile.bio && (
                      <p className="text-xs text-gray-300 italic px-4 leading-relaxed max-w-sm mx-auto">"{guestProfile.bio}"</p>
                    )}

                    {/* Stats table */}
                    <div className="grid grid-cols-2 gap-3.5 pt-2">
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.03]">
                        <span className="text-[9px] font-mono text-gray-400 block uppercase">ARMY Score</span>
                        <span className="text-sm font-mono font-bold text-fuchsia-300 flex items-center justify-center gap-0.5">
                          <Trophy className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" /> {guestProfile.armyPoints}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.03]">
                        <span className="text-[9px] font-mono text-gray-400 block uppercase">Experience XP</span>
                        <span className="text-sm font-mono font-bold text-indigo-300">
                          {guestProfile.xp} XP
                        </span>
                      </div>
                    </div>

                    {guestProfile.favoriteMember && guestProfile.favoriteMember !== 'None' && (
                      <div className="p-2 rounded-xl bg-rose-950/20 border border-rose-500/10 text-xs font-semibold text-rose-300 inline-block px-4">
                        💖 Favorite Bias: {guestProfile.favoriteMember}
                      </div>
                    )}
                    
                    {/* Badges list */}
                    {guestProfile.badges && guestProfile.badges.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] text-gray-400 block font-mono uppercase tracking-wider text-left pl-1">Earned MILITARY medals ({guestProfile.badges.length})</span>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {guestProfile.badges.map((badge, idx) => (
                            <span 
                              key={badge + idx} 
                              className="p-1 px-2.5 rounded-full bg-purple-950/50 border border-purple-500/20 text-[10px] font-mono font-bold text-purple-300"
                            >
                              🎖️ {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Join info */}
                    <p className="text-[10px] font-mono text-purple-400/60 pt-2">Join Date: {new Date(guestProfile.joinDate).toLocaleDateString()}</p>
                  </>
                )}

              </div>

            </div>
          ) : (
            <p className="text-xs text-gray-500 animate-pulse font-sans">Awaiting connection...</p>
          )}

        </div>
      )}


      {/* ─────────────────────────────────────────────────────────────
          MODAL: PUBLIC TRADING CARD HOVER (Leaderboard and Admin profile clicks)
          ───────────────────────────────────────────────────────────── */}
      {selectedPublicUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-purple-500/20 bg-slate-950/90 relative overflow-hidden p-6 space-y-6 shadow-2xl">
            <div className="absolute top-0 right-0 p-8 w-40 h-40 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
            
            {/* Modal header details */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <span className="text-xs font-mono text-purple-400 flex items-center gap-1">
                🎖️ ARMY GLOBAL DIRECTORY CARD
              </span>
              <button
                onClick={() => setSelectedPublicUser(null)}
                className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer rounded-full bg-white/5 hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile contents */}
            <div className="space-y-4 text-center">
              
              <div className="relative inline-block">
                {selectedPublicUser.avatarUrl ? (
                  <img 
                    src={selectedPublicUser.avatarUrl} 
                    alt={selectedPublicUser.username} 
                    className="w-20 h-20 rounded-full object-cover border-2 border-purple-500 mx-auto shadow-md"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-650 to-indigo-600 border-2 border-purple-400/20 flex items-center justify-center text-3xl font-mono font-bold text-white uppercase mx-auto select-none shadow-md">
                    {selectedPublicUser.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 bg-black text-fuchsia-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-purple-500/40">
                  Lvl {selectedPublicUser.currentLevel}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold font-sans text-white">
                  {selectedPublicUser.isPublic !== false ? (selectedPublicUser.displayName || `@${selectedPublicUser.username}`) : `@${selectedPublicUser.username}`}
                </h3>
                <p className="text-[10px] text-purple-400 font-mono">@{selectedPublicUser.username}</p>
                {selectedPublicUser.isPublic !== false && selectedPublicUser.country && (
                  <p className="text-[10px] text-gray-400 font-sans flex items-center justify-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-purple-400" /> Affiliation: <b className="text-gray-200">{selectedPublicUser.country}</b>
                  </p>
                )}
              </div>

              {selectedPublicUser.isPublic === false ? (
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 text-center space-y-1">
                  <p className="text-xs font-bold text-rose-300 flex items-center justify-center gap-1.5">
                    <EyeOff className="w-4 h-4 text-rose-400" /> Private ARMY Card
                  </p>
                  <p className="text-[10px] text-gray-400">Social connectivity logs, accomplishments, and bios are hidden by request.</p>
                </div>
              ) : (
                <>
                  {selectedPublicUser.bio && (
                    <p className="text-xs text-gray-300 italic px-4 leading-relaxed max-w-sm mx-auto">"{selectedPublicUser.bio}"</p>
                  )}

                  {/* Stats table */}
                  <div className="grid grid-cols-2 gap-3.5 pt-2">
                    <div className="p-2 rounded-xl bg-black/40 border border-white/[0.03]">
                      <span className="text-[9px] font-mono text-gray-400 block uppercase">ARMY Score</span>
                      <span className="text-xs font-mono font-bold text-fuchsia-300 flex items-center justify-center gap-0.5">
                        <Trophy className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" /> {selectedPublicUser.armyPoints}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/40 border border-white/[0.03]">
                      <span className="text-[9px] font-mono text-gray-400 block uppercase">Experience XP</span>
                      <span className="text-xs font-mono font-bold text-indigo-300">
                        {selectedPublicUser.xp} XP
                      </span>
                    </div>
                  </div>

                  {selectedPublicUser.favoriteMember && selectedPublicUser.favoriteMember !== 'None' && (
                    <div className="p-1.5 rounded-xl bg-rose-950/20 border border-rose-500/10 text-[11px] font-semibold text-rose-300 inline-block px-3">
                      💖 Favorite Bias: {selectedPublicUser.favoriteMember}
                    </div>
                  )}

                  {/* Badges list */}
                  {selectedPublicUser.badges && selectedPublicUser.badges.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[9px] text-gray-400 block font-mono uppercase tracking-wider text-left pl-1">Earned MILITARY medals ({selectedPublicUser.badges.length})</span>
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {selectedPublicUser.badges.map((badge, idx) => (
                          <span 
                            key={badge + idx} 
                            className="p-0.5 px-2 rounded-full bg-purple-950/50 border border-purple-500/20 text-[9px] font-mono font-bold text-purple-300"
                          >
                            🎖️ {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Joined info */}
                  <div className="pt-2 text-left space-y-1 border-t border-white/5 text-[10px] font-mono text-gray-400">
                    <p className="flex justify-between"><span>Join Date:</span> <span className="text-purple-300">{new Date(selectedPublicUser.joinDate).toLocaleDateString()}</span></p>
                    <p className="flex justify-between"><span>Missions Completed:</span> <span className="text-indigo-300">{selectedPublicUser.completedMissions?.length || 0} tasks</span></p>
                  </div>
                </>
              )}

            </div>

            {/* Modal footer action */}
            <div className="pt-3 border-t border-white/5 flex gap-2">
              <button
                onClick={() => {
                  window.history.pushState({}, '', `/profile/${selectedPublicUser.username}`); // dynamic URL simulation!
                  navigator.clipboard.writeText(`${window.location.origin}/profile/${selectedPublicUser.username}`);
                  setAuthSuccess(`Public profile link copied! Path: /profile/${selectedPublicUser.username} 💜`);
                  setSelectedPublicUser(null);
                }}
                className="flex-1 py-2 bg-purple-950/50 hover:bg-purple-900 border border-purple-500/30 text-[10px] font-mono text-purple-200 uppercase font-bold text-center rounded-xl cursor-pointer"
              >
                Copy Link Path
              </button>
              <button
                onClick={() => setSelectedPublicUser(null)}
                className="flex-1 py-1.5 bg-black/40 border border-white/10 text-[10px] font-mono text-gray-300 uppercase font-bold text-center rounded-xl cursor-pointer hover:bg-slate-900"
              >
                Dismiss Card
              </button>
            </div>

          </div>
        </div>
      )}


      {/* ─────────────────────────────────────────────────────────────
          SCREEN: GAME #1 (QUIZ TRIVIA PANEL)
          ───────────────────────────────────────────────────────────── */}
      {activeScreen === 'game_quiz' && userProfile && (
        <div className="w-full max-w-xl p-6 rounded-2xl border border-white/10 bg-slate-950/65 backdrop-blur-xl relative overflow-hidden space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-xs font-mono text-purple-400">🤖 ARCHID MACHINE // trivia-quiz.exe</span>
            <button
              onClick={() => { setActiveScreen('dashboard'); if (quizTimerRef.current) clearInterval(quizTimerRef.current); }}
              className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer text-xs uppercase font-mono"
            >
              Close Frame [x]
            </button>
          </div>

          {!quizStarted ? (
            <div className="text-center py-8 space-y-4">
              <span className="text-4xl">🧠</span>
              <h3 className="text-lg font-bold font-sans">BTS Ultimate Trivia Arena</h3>
              <p className="text-xs text-gray-400 px-6 max-w-sm mx-auto">
                Answer {quizQuestions.length} intense randomized questions on BTS history. Every correct response brings bonus ARMY points and level-up XP.
              </p>
              <button
                onClick={handleStartQuiz}
                className="px-6 py-2.5 bg-purple-650 hover:bg-purple-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                Launch Quest
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex justify-between items-center text-xs font-mono text-purple-200">
                <span>QUESTION {currentQuizIndex + 1} OF {quizQuestions.length}</span>
                <span className="px-2 py-0.5 rounded bg-amber-950/30 border border-amber-500/20 text-amber-400 font-bold animate-pulse">
                  ⏱️ {quizTimer}s left
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-500 h-full transition-all duration-300"
                  style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-black/40">
                <p className="text-sm font-semibold font-sans text-white leading-relaxed">
                  {quizQuestions[currentQuizIndex].question}
                </p>
              </div>

              <div className="space-y-2.5">
                {quizQuestions[currentQuizIndex].options.map((option) => {
                  const isSelected = selectedQuizOption === option;
                  const isCorrect = option === quizQuestions[currentQuizIndex].answer;
                  
                  let optStyle = "bg-black/20 border-white/5 hover:border-purple-500/30 text-slate-300";
                  if (isQuizAnswered) {
                    if (isCorrect) optStyle = "bg-emerald-950/40 border-emerald-500/40 text-emerald-200";
                    else if (isSelected) optStyle = "bg-rose-950/40 border-rose-500/40 text-rose-200";
                  }

                  return (
                    <button
                      key={option}
                      disabled={isQuizAnswered}
                      onClick={() => handleQuizAnswerSubmit(option)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${optStyle}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {isQuizAnswered && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextQuiz}
                    className="px-6 py-2.5 bg-purple-650 hover:bg-purple-600 rounded-xl text-xs font-bold transition-all text-white font-mono cursor-pointer flex items-center gap-1"
                  >
                    <span>{currentQuizIndex === quizQuestions.length - 1 ? 'Finish & Claim' : 'Next Step'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}


      {/* ─────────────────────────────────────────────────────────────
          SCREEN: GAME #2 (MEMORY CANDY CARD GRID)
          ───────────────────────────────────────────────────────────── */}
      {activeScreen === 'game_memory' && userProfile && (
        <div className="w-full max-w-xl p-6 rounded-2xl border border-white/10 bg-slate-950/65 backdrop-blur-xl relative overflow-hidden space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-xs font-mono text-purple-400">🃏 COGNITIVE PORTAL // memory-match.exe</span>
            <button
              onClick={() => setActiveScreen('dashboard')}
              className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer text-xs uppercase font-mono"
            >
              Close Frame [x]
            </button>
          </div>

          <div className="flex justify-between items-center text-xs font-mono px-1">
            <span className="text-gray-400">Moves: <span className="text-white font-bold">{memoryMoves}</span></span>
            <button
              onClick={initMemoryGame}
              className="text-purple-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Scramble cards
            </button>
          </div>

          {memoryGameOver ? (
            <div className="text-center py-8 space-y-4">
              <span className="text-4xl">👑</span>
              <h3 className="text-lg font-bold">Phenomenal Memory, ARMY!</h3>
              <p className="text-xs text-gray-400">You matched all cards successfully in {memoryMoves} moves!</p>
              <button
                onClick={initMemoryGame}
                className="px-6 py-2.5 bg-purple-650 hover:bg-purple-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                Play Repeat Round
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3.5 max-w-md mx-auto">
              {memoryCards.map((card, index) => {
                const showFace = card.isFlipped || card.isMatched;
                return (
                  <div
                    key={card.id}
                    onClick={() => handleMemoryCardClick(index)}
                    className={`aspect-square rounded-xl border border-purple-500/10 cursor-pointer transition-all flex items-center justify-center transform active:scale-95 select-none text-2xl ${
                      showFace 
                        ? 'bg-purple-950/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] border-purple-400' 
                        : 'bg-slate-900/40 hover:bg-slate-800 border-white/5 shadow-md hover:scale-[1.03]'
                    }`}
                  >
                    {showFace ? card.emoji : '💜'}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}


      {/* ─────────────────────────────────────────────────────────────
          SCREEN: GAME #3 (PUZZLE CHALLENGE BOX)
          ───────────────────────────────────────────────────────────── */}
      {activeScreen === 'game_puzzle' && userProfile && (
        <div className="w-full max-w-xl p-6 rounded-2xl border border-white/10 bg-slate-950/65 backdrop-blur-xl relative overflow-hidden space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-xs font-mono text-purple-400">🧩 MULTI-GRID ARTIFACT // sliding-puzzle.exe</span>
            <button
              onClick={() => setActiveScreen('dashboard')}
              className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer text-xs uppercase font-mono"
            >
              Close Frame [x]
            </button>
          </div>

          <div className="flex justify-between items-center text-xs font-mono px-1">
            <div className="flex gap-2">
              <button
                onClick={() => setPuzzleDiff('easy')}
                className={`px-2 py-0.5 rounded ${puzzleDiff === 'easy' ? 'bg-purple-950 border border-purple-500 text-white' : 'text-gray-500'}`}
              >
                Easy
              </button>
              <button
                onClick={() => setPuzzleDiff('medium')}
                className={`px-2 py-0.5 rounded ${puzzleDiff === 'medium' ? 'bg-purple-950 border border-purple-500 text-white' : 'text-gray-500'}`}
              >
                Medium
              </button>
              <button
                onClick={() => setPuzzleDiff('hard')}
                className={`px-2 py-0.5 rounded ${puzzleDiff === 'hard' ? 'bg-purple-950 border border-purple-500 text-white' : 'text-gray-500'}`}
              >
                Hard
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-400">Moves: <span className="text-white font-bold">{puzzleMoves}</span></span>
              <button
                onClick={initPuzzleGame}
                className="text-purple-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" /> Shuffle grid
              </button>
            </div>
          </div>

          {puzzleWon ? (
            <div className="text-center py-8 space-y-4">
              <span className="text-4xl">👑</span>
              <h3 className="text-lg font-bold">Solvable King, Borahae!</h3>
              <p className="text-xs text-gray-400">You rearranged the BTS grid in {puzzleMoves} slides!</p>
              <button
                onClick={initPuzzleGame}
                className="px-6 py-2.5 bg-purple-650 hover:bg-purple-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                Restart Puzzle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto aspect-square p-2 bg-black/40 rounded-xl border border-white/5">
              {puzzleGrid.map((val, index) => {
                const isBlank = val === 8;
                return (
                  <div
                    key={index}
                    onClick={() => handlePuzzleTileClick(index)}
                    className={`rounded-lg transition-all flex flex-col items-center justify-center select-none text-center cursor-pointer ${
                      isBlank 
                        ? 'bg-transparent border border-dashed border-white/5' 
                        : 'bg-purple-950/65 hover:bg-purple-900/60 border border-purple-500/30 text-white shadow-xl transform active:scale-95'
                    }`}
                  >
                    {!isBlank && (
                      <div className="p-1">
                        <span className="font-mono text-[10px] font-bold text-fuchsia-300 block">{val + 1}</span>
                        <span className="text-[9px] font-sans text-purple-200 block truncate leading-[1.2]">{puzzleImgPieces[val]}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}


      {/* ─────────────────────────────────────────────────────────────
          SCREEN: GAME #4 (GUESS blurred MEMBER)
          ───────────────────────────────────────────────────────────── */}
      {activeScreen === 'game_guess_member' && userProfile && (
        <div className="w-full max-w-xl p-6 rounded-2xl border border-white/10 bg-slate-950/65 backdrop-blur-xl relative overflow-hidden space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-xs font-mono text-purple-400">👤 EYE SENSING // blurred-member.exe</span>
            <button
              onClick={() => setActiveScreen('dashboard')}
              className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer text-xs uppercase font-mono"
            >
              Close Frame [x]
            </button>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase">IDENTIFY THE HIDDEN REVELATION</span>
            </div>

            {/* Blurred viewport */}
            <div className="w-40 h-40 mx-auto rounded-2xl bg-gradient-to-tr from-purple-950 via-slate-950 to-indigo-950 flex items-center justify-center border border-purple-500/25 relative overflow-hidden shadow-2xl">
              <div 
                className="text-7xl transition-all duration-700 ease-out select-none cursor-default"
                style={{ filter: `blur(${guessBlur}px)` }}
              >
                💜
              </div>
              
              {guessStatus === 'winner' && (
                <div className="absolute inset-0 bg-emerald-950/60 flex flex-col items-center justify-center text-emerald-200 text-xs font-bold font-mono">
                  <Check className="w-8 h-8 text-emerald-400 animate-bounce mb-1" />
                  <span>CORRECT ANSWER!</span>
                </div>
              )}

              {guessStatus === 'loser' && (
                <div className="absolute inset-0 bg-rose-950/60 flex flex-col items-center justify-center text-rose-200 text-xs font-bold font-mono">
                  <X className="w-8 h-8 text-rose-400 animate-bounce mb-1" />
                  <span>OUT OF TRIES!</span>
                </div>
              )}
            </div>

            <div className="text-center font-mono text-[11px] text-gray-400">
              {guessStatus === 'playing' ? (
                <span>Attempts: <span className="text-white">{guessAttempts}/3</span></span>
              ) : (
                <span className="text-fuchsia-300 font-bold">Hidden Member was: {guessMemberId}!</span>
              )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              {memberOptions.map((opt) => (
                <button
                  key={opt}
                  disabled={guessStatus !== 'playing'}
                  onClick={() => submitMemberGuess(opt)}
                  className="p-3 bg-black/40 border border-white/5 hover:border-purple-500 rounded-xl text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-40"
                >
                  {opt}
                </button>
              ))}
            </div>

            {guessStatus !== 'playing' && (
              <div className="text-center">
                <button
                  onClick={initGuessMemberGame}
                  className="px-5 py-2 bg-purple-650 hover:bg-purple-600 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Generate Next Challenger
                </button>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ─────────────────────────────────────────────────────────────
          SCREEN: GAME #5 (GUESS SONG SYNTH LEAD)
          ───────────────────────────────────────────────────────────── */}
      {activeScreen === 'game_guess_song' && userProfile && (
        <div className="w-full max-w-xl p-6 rounded-2xl border border-white/10 bg-slate-950/65 backdrop-blur-xl relative overflow-hidden space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-xs font-mono text-purple-400">🎹 ACOUSTIC FREQUENCY // retro-synth.exe</span>
            <button
              onClick={() => setActiveScreen('dashboard')}
              className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer text-xs uppercase font-mono"
            >
              Close Frame [x]
            </button>
          </div>

          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">HEAR THE SONG CHORDS</span>
              <button
                onClick={() => playSongSynthCue(songCorrectName)}
                className="p-4 rounded-full bg-purple-650/20 hover:bg-purple-600 border border-purple-500/30 text-purple-300 hover:text-white transition-all transform active:scale-95 cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-xl hover:scale-110"
              >
                <Volume2 className="w-6 h-6 animate-pulse" />
              </button>
              <p className="text-[10px] text-gray-400">Click the button to play retro electronic synthesized chords of the BTS melody!</p>
            </div>

            <div className="space-y-2 max-w-sm mx-auto">
              {songOptions.map((opt) => (
                <button
                  key={opt}
                  disabled={songStatus !== 'playing'}
                  onClick={() => submitSongGuess(opt)}
                  className={`w-full p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    songStatus === 'correct' && opt === songCorrectName
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                      : songStatus === 'wrong' && opt === songCorrectName
                      ? 'bg-rose-950/30 border-rose-500 text-rose-300'
                      : 'bg-black/40 border-white/5 hover:border-purple-500 text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {songStatus !== 'playing' && (
              <div className="text-center pt-2">
                <button
                  onClick={initGuessSongGame}
                  className="px-5 py-2 bg-purple-650 hover:bg-purple-600 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Generate Next Level
                </button>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ─────────────────────────────────────────────────────────────
          SCREEN: GAME #6 (BTS LYRICS LINE-UP)
          ───────────────────────────────────────────────────────────── */}
      {activeScreen === 'game_lyric' && userProfile && (
        <div className="w-full max-w-xl p-6 rounded-2xl border border-white/10 bg-slate-950/65 backdrop-blur-xl relative overflow-hidden space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-xs font-mono text-purple-400">📝 VERBAL ENFORMENT // lyric-challenge.exe</span>
            <button
              onClick={() => setActiveScreen('dashboard')}
              className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer text-xs uppercase font-mono"
            >
              Close Frame [x]
            </button>
          </div>

          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest block mb-2">COMPLETE THE LYRIC PROMPT</span>
              <p className="text-sm italic font-sans text-gray-200 leading-relaxed">
                "{lyricPrompt}"
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Type missing word here..."
                disabled={lyricFeedback !== 'playing'}
                value={lyricInput}
                onChange={(e) => setLyricInput(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
              />

              {lyricFeedback === 'correct' && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs font-mono">
                  🎉 Fantastic! Answer is correct. You gained points!
                </div>
              )}

              {lyricFeedback === 'wrong' && (
                <div className="p-3 bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl text-xs font-mono">
                  ❌ Incorrect guess. Correct word was: "{lyricCorrectWord}"
                </div>
              )}

              {lyricFeedback === 'playing' ? (
                <button
                  onClick={submitLyricAnswer}
                  className="w-full py-2.5 bg-purple-650 hover:bg-purple-600 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                >
                  Verify Lyric Alignment
                </button>
              ) : (
                <button
                  onClick={initLyricChallenge}
                  className="w-full py-2.5 bg-black/40 hover:bg-black/65 border border-white/5 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Fetch Next Lyric Lineup
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
