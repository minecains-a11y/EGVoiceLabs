"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Repeat,
  Sparkles,
  Share2,
  Check,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

interface WaveformPlayerProps {
  audioUrl?: string;
  duration?: number;
  title?: string;
  subtitle?: string;
  autoPlay?: boolean;
  className?: string;
  onEnded?: () => void;
  watermarked?: boolean;
}

export function WaveformPlayer({
  audioUrl,
  duration = 5,
  title,
  subtitle,
  autoPlay = false,
  className = "",
  onEnded,
  watermarked = false,
}: WaveformPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [copied, setCopied] = useState(false);

  // Playback speeds
  const speeds = [0.75, 1, 1.25, 1.5, 2];

  // Initialize and handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
    audio.playbackRate = playbackRate;
    audio.loop = isLooping;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setTotalDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (onEnded) onEnded();
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    if (autoPlay && audioUrl) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl, autoPlay, isLooping, isMuted, onEnded, playbackRate, volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const cycleSpeed = () => {
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextRate = speeds[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  };

  const handleDownload = (format: "wav" | "mp3" = "wav") => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `${title || "egvl-audio"}-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render animated waveform canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = 3;
    const gap = 2;
    const totalBars = Math.floor(width / (barWidth + gap));
    const progress = totalDuration > 0 ? currentTime / totalDuration : 0;

    ctx.clearRect(0, 0, width, height);

    // Deterministic pseudo-random bar heights based on title/seed
    const seed = (title?.length || 15) * 17;
    for (let i = 0; i < totalBars; i++) {
      const x = i * (barWidth + gap);
      // Normalized wave pattern
      const angle = (i / totalBars) * Math.PI * 4;
      let barHeight = (Math.sin(angle) * 0.4 + 0.6) * 0.7 * height;
      const noise = Math.sin(i * 13 + seed) * 0.25;
      barHeight = Math.max(4, Math.min(height - 4, barHeight + noise * height * 0.5));

      // Active vs inactive color
      const isPlayed = i / totalBars <= progress;
      if (isPlayed) {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, "#FFFFFF");
        gradient.addColorStop(1, "#A1A1AA");
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = "#3F3F46";
      }

      const y = (height - barHeight) / 2;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
    }
  }, [currentTime, totalDuration, title]);

  return (
    <div
      className={`relative p-4 rounded-2xl bg-[#141414]/90 border border-zinc-800/90 shadow-xl backdrop-blur-md transition-all ${className}`}
    >
      <audio ref={audioRef} src={audioUrl || undefined} preload="auto" />

      {/* Track info header */}
      {(title || subtitle) && (
        <div className="flex items-center justify-between mb-3">
          <div className="truncate pr-4">
            {title && <h4 className="text-sm font-semibold text-white truncate">{title}</h4>}
            {subtitle && <p className="text-xs text-zinc-400 truncate">{subtitle}</p>}
          </div>
          {watermarked && (
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 font-medium">
              <Sparkles className="w-3 h-3" /> EGVL Watermarked
            </span>
          )}
        </div>
      )}

      {/* Waveform Canvas & Seek Bar */}
      <div className="relative w-full h-14 mb-3 rounded-lg overflow-hidden flex items-center bg-zinc-950/40 px-2 group">
        <canvas ref={canvasRef} width={640} height={48} className="w-full h-12 pointer-events-none" />
        {/* Invisible range input for dragging seek */}
        <input
          type="range"
          min={0}
          max={totalDuration || 1}
          step={0.01}
          value={currentTime}
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          aria-label="Seek track"
        />
        {/* Playhead marker indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-brand-cyan shadow-sm shadow-brand-cyan pointer-events-none transition-all duration-75"
          style={{ left: `${(currentTime / (totalDuration || 1)) * 100}%` }}
        />
      </div>

      {!audioUrl && (
        <p role="status" className="mb-3 text-[11px] text-zinc-500">
          This saved record has no stored audio file.
        </p>
      )}

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-zinc-300">
        {/* Left: Play/Pause, Rewind, Time */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={togglePlay}
            disabled={!audioUrl}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-black shadow-md shadow-brand-violet/30 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            }}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="text-xs font-mono text-zinc-400 tabular-nums">
            <span className="text-white font-medium">{formatTime(currentTime)}</span> / {formatTime(totalDuration)}
          </div>
        </div>

        {/* Right: Speed, Volume, Loop, Downloads */}
        <div className="flex items-center gap-2 text-xs">
          {/* Speed Toggle */}
          <button
            onClick={cycleSpeed}
            className="px-2 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 font-mono font-medium text-[11px] transition-colors"
            title="Cycle playback speed"
          >
            {playbackRate}x
          </button>

          {/* Loop toggle */}
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-1.5 rounded-lg transition-colors ${
              isLooping ? "bg-brand-violet/20 text-brand-cyan border border-brand-violet/40" : "hover:bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
            title={isLooping ? "Loop enabled" : "Loop disabled"}
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Volume */}
          <div className="flex items-center gap-1.5 px-1.5">
            <button onClick={toggleMute} className="text-zinc-400 hover:text-white">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              aria-label="Volume slider"
            />
          </div>

          {/* Download & Share */}
          <div className="flex items-center gap-1 pl-2 border-l border-zinc-800">
            <button
              onClick={() => handleDownload("wav")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
              title="Download uncompressed WAV with EGVL watermark"
            >
              <Download className="w-3.5 h-3.5" />
              <span>WAV</span>
            </button>

            <button
              onClick={copyShareLink}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Copy share link"
            >
              {copied ? <Check className="w-4 h-4 text-zinc-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
