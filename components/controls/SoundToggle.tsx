"use client";

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { audioEngine } from '@/lib/audioEngine';

export const SoundToggle: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50); // 0 to 100

  useEffect(() => {
    // Synchronize initial state with audioEngine
    setIsMuted(audioEngine.getMuted());
    setVolume(Math.round(audioEngine.getVolume() * 100));
  }, []);

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioEngine.setMuted(nextMuted);
    
    // Play a soft test tone on unmute to indicate sound is working
    if (!nextMuted) {
      audioEngine.playComparison();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVol = Number(e.target.value);
    setVolume(nextVol);
    audioEngine.setVolume(nextVol / 100);
    if (isMuted && nextVol > 0) {
      setIsMuted(false);
      audioEngine.setMuted(false);
    }
  };

  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-surface border border-border">
      {/* Mute/Unmute Trigger */}
      <button
        onClick={handleMuteToggle}
        className="text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
        title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
      >
        {isMuted || volume === 0 ? (
          <VolumeX className="w-4 h-4 text-red-500" />
        ) : (
          <Volume2 className="w-4 h-4 text-accent" />
        )}
      </button>

      {/* Volume Slider */}
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={handleVolumeChange}
        className="w-16 sm:w-20 h-1 bg-background rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
        style={{
          background: `linear-gradient(to right, var(--accent) ${volume}%, var(--border) ${volume}%)`
        }}
      />
    </div>
  );
};

export default SoundToggle;
