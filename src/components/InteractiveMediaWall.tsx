import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Play, Image, Music, Flame } from 'lucide-react';

interface MediaTile {
  id: string;
  url: string;
  title: string;
  category: 'Music' | 'YouTube' | 'Gallery' | 'Members';
  icon: React.ReactNode;
}

interface InteractiveMediaWallProps {
  config?: Array<{
    id: string;
    url: string;
    title: string;
    category: 'Music' | 'YouTube' | 'Gallery' | 'Members';
  }>;
  onTileClick: (tab: string, payload?: any) => void;
}

export default function InteractiveMediaWall({ config, onTileClick }: InteractiveMediaWallProps) {
  // Diverse premium collection of BTS concert, stages, albums & aesthetic visual tiles
  const row1Tiles: MediaTile[] = [
    {
      id: 'tile-1',
      url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=400&q=80',
      title: 'Dynamite Live Stage',
      category: 'Gallery',
      icon: <Image className="w-3.5 h-3.5" />
    },
    {
      id: 'tile-2',
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
      title: 'Proof Anthology MV',
      category: 'YouTube',
      icon: <Play className="w-3.5 h-3.5" />
    },
    {
      id: 'tile-3',
      url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
      title: 'Borahae Concert Ocean',
      category: 'Gallery',
      icon: <Image className="w-3.5 h-3.5" />
    },
    {
      id: 'tile-4',
      url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=400&q=80',
      title: 'Be Album Launch',
      category: 'Music',
      icon: <Music className="w-3.5 h-3.5" />
    },
    {
      id: 'tile-5',
      url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
      title: 'Mic Drop Electronic Reprise',
      category: 'YouTube',
      icon: <Play className="w-3.5 h-3.5" />
    },
    {
      id: 'tile-6',
      url: 'https://images.unsplash.com/photo-1487180142328-054b783fc471?auto=format&fit=crop&w=400&q=80',
      title: 'Yet To Come in Busan',
      category: 'Gallery',
      icon: <Image className="w-3.5 h-3.5" />
    }
  ];

  const row2Tiles: MediaTile[] = [
    {
      id: 'tile-7',
      url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80',
      title: 'Wembley Purple Lightshow',
      category: 'Gallery',
      icon: <Image className="w-3.5 h-3.5" />
    },
    {
      id: 'tile-8',
      url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=400&q=80',
      title: 'Golden - JK Solo Debut',
      category: 'Music',
      icon: <Music className="w-3.5 h-3.5" />
    },
    {
      id: 'tile-9',
      url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=400&q=80',
      title: 'Life Goes On Acoustic',
      category: 'YouTube',
      icon: <Play className="w-3.5 h-3.5" />
    },
    {
      id: 'tile-10',
      url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=400&q=80',
      title: 'Blood Sweat & Tears MV',
      category: 'YouTube',
      icon: <Play className="w-3.5 h-3.5" />
    },
    {
      id: 'tile-11',
      url: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=400&q=80',
      title: 'Love Yourself Stadium Tour',
      category: 'Gallery',
      icon: <Image className="w-3.5 h-3.5" />
    },
    {
      id: 'tile-12',
      url: 'https://images.unsplash.com/photo-1453090927415-5f45085b65c0?auto=format&fit=crop&w=400&q=80',
      title: 'Astronaut - Jin Solo Studio',
      category: 'Music',
      icon: <Music className="w-3.5 h-3.5" />
    }
  ];

  const row3Tiles: MediaTile[] = [
    {
      id: 'tile-13',
      url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=400&q=80',
      title: 'Boy With Luv Live',
      category: 'YouTube',
      icon: <Play className="w-3.5 h-3.5" />
    },
    {
      id: 'tile-14',
      url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80',
      title: 'Festa Neon Anniversary lights',
      category: 'Gallery',
      icon: <Image className="w-3.5 h-3.5" />
    },
    {
      id: 'tile-15',
      url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=400&q=80',
      title: 'Indigo - RM Masterpiece',
      category: 'Music',
      icon: <Music className="w-3.5 h-3.5" />
    },
    {
      id: 'tile-16',
      url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=400&q=80',
      title: 'Butter Billboard Stage',
      category: 'Gallery',
      icon: <Image className="w-3.5 h-3.5" />
    },
    {
      id: 'tile-17',
      url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=400&q=80',
      title: 'Black Swan Orchestral video',
      category: 'YouTube',
      icon: <Play className="w-3.5 h-3.5" />
    },
    {
      id: 'tile-18',
      url: 'https://images.unsplash.com/photo-1496302661278-53cf51ee67b7?auto=format&fit=crop&w=400&q=80',
      title: 'Suga Agust D Tour',
      category: 'Members',
      icon: <Sparkles className="w-3.5 h-3.5" />
    }
  ];

  const getIcon = (cat: string) => {
    switch(cat) {
      case 'YouTube': return <Play className="w-3.5 h-3.5" />;
      case 'Music': return <Music className="w-3.5 h-3.5" />;
      case 'Gallery': return <Image className="w-3.5 h-3.5" />;
      default: return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  const activeTiles: MediaTile[] = (config && config.length > 0)
    ? config.map((c, idx) => ({
        id: c.id || `showcase-${idx}`,
        url: c.url,
        title: c.title,
        category: c.category || 'Gallery',
        icon: getIcon(c.category || 'Gallery')
      }))
    : [];

  let row1 = row1Tiles;
  let row2 = row2Tiles;
  let row3 = row3Tiles;

  if (activeTiles.length >= 3) {
    const segment = Math.ceil(activeTiles.length / 3);
    row1 = activeTiles.slice(0, segment);
    row2 = activeTiles.slice(segment, segment * 2);
    row3 = activeTiles.slice(segment * 2);
  }

  // Helper to render horizontal moving rows with seamless mirroring
  const renderRow = (tiles: MediaTile[], direction: 'left' | 'right', speed: number) => {
    if (!tiles || tiles.length === 0) return null;
    // Duplicate twice for absolute seamless loop
    const tripleTiles = [...tiles, ...tiles, ...tiles, ...tiles];

    return (
      <div className="relative flex overflow-hidden py-4 w-full cursor-grab active:cursor-grabbing group">
        <motion.div
          animate={{
            x: direction === 'left' ? [0, -1000] : [-1000, 0]
          }}
          transition={{
            ease: 'linear',
            duration: speed,
            repeat: Infinity
          }}
          className="flex gap-6 shrink-0"
        >
          {tripleTiles.map((tile, i) => {
            // Apply unique gentle floating micro-animations to each tile to simulate 3D drift
            const driftY = [0, Math.sin(i) * 12, 0];
            const driftRotate = [0, Math.cos(i) * 3, 0];

            return (
              <motion.div
                key={`${tile.id}-${i}`}
                style={{ y: 0, rotateZ: 0 }}
                animate={{
                  y: driftY,
                  rotateZ: driftRotate
                }}
                transition={{
                  duration: 6 + (i % 3) * 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                whileHover={{
                  scale: 1.15,
                  y: -15,
                  z: 50,
                  rotateY: direction === 'left' ? 8 : -8,
                  transition: { duration: 0.3, ease: 'easeOut' }
                }}
                onClick={() => onTileClick(tile.category)}
                className="w-44 h-28 md:w-56 md:h-36 rounded-xl overflow-hidden relative cursor-pointer select-none group/tile shrink-0 border border-white/5 bg-black/60 shadow-lg shadow-black/40 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:border-purple-400/40 transition-shadow duration-300"
              >
                <img
                  src={tile.url}
                  alt={tile.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/tile:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay card details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-between p-3">
                  <div className="self-end bg-purple-900/80 border border-purple-500/30 backdrop-blur-md text-[9px] px-2 py-0.5 rounded-full font-mono text-purple-200 flex items-center gap-1">
                    {tile.icon}
                    <span>{tile.category}</span>
                  </div>
                  
                  <div>
                    <h5 className="text-white font-sans font-bold text-[10px] md:text-xs tracking-tight line-clamp-1 group-hover/tile:text-purple-300 transition-colors">
                      {tile.title}
                    </h5>
                    <span className="text-[8px] font-mono text-gray-400 block mt-0.5 uppercase tracking-widest">
                      Jump into detail &bull; &rarr;
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    );
  };

  return (
    <section className="relative overflow-hidden py-14 border border-white/10 rounded-3xl bg-gradient-to-b from-[#0a0014]/60 to-black/80 backdrop-blur-md ">
      {/* Visual floating neon bubbles around the showcase */}
      <div className="absolute top-1/4 -left-12 w-48 h-48 rounded-full bg-purple-600/10 blur-[60px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-12 w-48 h-48 rounded-full bg-rose-600/10 blur-[60px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-purple-400 font-bold block mb-1">
            🎞️ Cinematic Experience
          </span>
          <h2 className="text-2xl md:text-3xl font-sans font-black text-white uppercase tracking-wider flex items-center gap-2">
            Interactive 3D Media Showcase <Flame className="w-5 h-5 text-red-500 animate-pulse" />
          </h2>
          <p className="text-gray-400 text-xs mt-1 md:max-w-xl">
            A real-time reactive 3D floating gallery containing dozens of concert lights, stage performance snapshots and album sleeves arranged in curved streams.
          </p>
        </div>
        
        <div className="text-right hidden md:block">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Curved Deck Mode</span>
          <span className="text-xs text-purple-400 font-bold flex items-center gap-1.5 mt-0.5 justify-end">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" /> GPU-Accelerated 60 FPS
          </span>
        </div>
      </div>

      {/* 3D Perspective Container with slight angle curving layout */}
      <div 
        className="w-full relative overflow-hidden"
        style={{
          perspective: '1200px',
          transformStyle: 'preserve-3d'
        }}
      >
        <div 
          className="w-full space-y-4"
          style={{
            transform: 'rotateX(8deg) rotateY(-3deg) scale(0.98)',
            transformStyle: 'preserve-3d'
          }}
        >
          {renderRow(row1, 'left', 40)}
          {renderRow(row2, 'right', 46)}
          {renderRow(row3, 'left', 44)}
        </div>
      </div>

      <div className="text-center mt-6 relative z-10">
        <span className="text-[9px] font-mono text-purple-400 py-1 px-3 border border-purple-500/20 bg-purple-950/20 rounded-full tracking-wider uppercase">
          💡 Pro-tip: Hover any tile to pause & drag to peek 🌌
        </span>
      </div>
    </section>
  );
}
