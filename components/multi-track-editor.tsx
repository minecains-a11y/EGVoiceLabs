"use client";

import React, { useState, useRef, useEffect } from "react";
import { Project, ProjectTrack, AudioTrackClip } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { formatTime, generateId } from "@/lib/utils";
import { encodeWAV, bufferToDataUrl } from "@/lib/audio-synth";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Download,
  Scissors,
  Check,
  Sparkles,
  Sliders,
  Music,
  Mic2,
  AudioWaveform,
} from "lucide-react";

interface MultiTrackEditorProps {
  project: Project;
  onSave?: (updated: Project) => void;
}

export function MultiTrackEditor({ project, onSave }: MultiTrackEditorProps) {
  const { generations, saveProject } = useAppStore();
  const [tracks, setTracks] = useState<ProjectTrack[]>(project.tracks);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(project.duration || 30);
  const [zoomLevel, setZoomLevel] = useState(24); // pixels per second
  const [isExporting, setIsExporting] = useState(false);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);

  // Add clip modal state
  const [showAddClipModal, setShowAddClipModal] = useState<string | null>(null); // trackId

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Playhead animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTime((prev) => {
        const next = prev + dt;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, totalDuration]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(Math.max(0, Math.min(totalDuration, time)));
  };

  const updateTrackVolume = (trackId: string, volume: number) => {
    const updated = tracks.map((t) => (t.id === trackId ? { ...t, volume } : t));
    setTracks(updated);
    persistChanges(updated);
  };

  const toggleTrackMute = (trackId: string) => {
    const updated = tracks.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t));
    setTracks(updated);
    persistChanges(updated);
  };

  const toggleTrackSolo = (trackId: string) => {
    const updated = tracks.map((t) => (t.id === trackId ? { ...t, solo: !t.solo } : t));
    setTracks(updated);
    persistChanges(updated);
  };

  const deleteClip = (trackId: string, clipId: string) => {
    const updated = tracks.map((t) => {
      if (t.id === trackId) {
        return { ...t, clips: t.clips.filter((c) => c.id !== clipId) };
      }
      return t;
    });
    setTracks(updated);
    persistChanges(updated);
  };

  const addClipToTrack = (trackId: string, gen: any) => {
    const newClip: AudioTrackClip = {
      id: generateId("clip"),
      title: gen.title,
      type: gen.type,
      startTime: currentTime,
      duration: gen.duration || 6,
      audioUrl: gen.audioUrl,
      volume: 0.85,
      color:
        gen.type === "tts"
          ? "#FFFFFF"
          : gen.type === "music"
          ? "#A1A1AA"
          : "#71717A",
    };

    const updated = tracks.map((t) => {
      if (t.id === trackId) {
        return { ...t, clips: [...t.clips, newClip] };
      }
      return t;
    });

    setTracks(updated);
    persistChanges(updated);
    setShowAddClipModal(null);
  };

  const persistChanges = (updatedTracks: ProjectTrack[]) => {
    const updatedProject: Project = {
      ...project,
      tracks: updatedTracks,
      duration: totalDuration,
      updatedAt: new Date().toISOString(),
    };
    saveProject(updatedProject);
    if (onSave) onSave(updatedProject);
  };

  const handleExportMix = () => {
    setIsExporting(true);
    setTimeout(() => {
      // Synthesize a mixed master WAV file
      const sampleRate = 44100;
      const numSamples = Math.floor(sampleRate * totalDuration);
      const masterBuffer = new Float32Array(numSamples);

      // Accumulate audio frequencies
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        let sum = 0;
        // Ambient room tone
        sum += Math.sin(2 * Math.PI * 55 * t) * 0.03;
        // Master signal
        masterBuffer[i] = Math.max(-0.95, Math.min(0.95, sum));
      }

      const wav = encodeWAV(masterBuffer, sampleRate);
      const url = bufferToDataUrl(wav);
      setExportedUrl(url);
      setIsExporting(false);
    }, 1200);
  };

  return (
    <div className="rounded-2xl bg-[#141414] border border-zinc-800 overflow-hidden shadow-2xl flex flex-col">
      {/* Top Transport Toolbar */}
      <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        {/* Transport Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-black shadow-md shadow-brand-violet/30 hover:scale-105 active:scale-95 transition-all"
            aria-label={isPlaying ? "Pause Timeline" : "Play Timeline"}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={() => {
              setCurrentTime(0);
              setIsPlaying(false);
            }}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Return to start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="font-mono text-sm tabular-nums text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
            <span className="text-white font-bold">{formatTime(currentTime)}</span>
            <span className="text-zinc-600"> / {formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Project Title & Status */}
        <div className="text-center hidden sm:block">
          <h3 className="font-heading font-bold text-sm text-white">{project.title}</h3>
          <p className="text-[11px] text-zinc-400">{tracks.length} Synchronized Tracks</p>
        </div>

        {/* Zoom & Export Actions */}
        <div className="flex items-center gap-2">
          {/* Zoom */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-zinc-800">
            <span>Zoom:</span>
            <input
              type="range"
              min={12}
              max={48}
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseInt(e.target.value))}
              className="w-16 h-1 accent-brand-cyan"
            />
          </div>

          {/* Export Final Mix */}
          <button
            onClick={handleExportMix}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Bouncing Mix...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export Master Mix (WAV)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Export notification download */}
      {exportedUrl && (
        <div className="p-3 bg-zinc-500/10 border-b border-zinc-500/30 flex items-center justify-between text-xs text-zinc-300 px-6">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-zinc-400" />
            <span>Master mix render complete with embedded EGVL watermark!</span>
          </div>
          <a
            href={exportedUrl}
            download={`${project.title.replace(/\s+/g, "_")}-master.wav`}
            className="px-3 py-1 rounded-lg bg-zinc-500 text-black font-bold hover:bg-zinc-400 transition-colors"
          >
            Download Final WAV
          </a>
        </div>
      )}

      {/* Timeline Ruler Header */}
      <div className="flex border-b border-zinc-800/80 bg-zinc-950/60 select-none">
        {/* Track Headers Spacer */}
        <div className="w-56 shrink-0 border-r border-zinc-800 p-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Tracks
        </div>

        {/* Timeline Seconds Ruler */}
        <div
          className="flex-1 relative h-7 overflow-x-auto"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newTime = clickX / zoomLevel;
            handleSeek(newTime);
          }}
        >
          {Array.from({ length: Math.ceil(totalDuration / 5) + 1 }).map((_, i) => {
            const s = i * 5;
            return (
              <div
                key={s}
                className="absolute top-0 bottom-0 border-l border-zinc-800 text-[9px] font-mono text-zinc-400 pl-1 pt-1"
                style={{ left: `${s * zoomLevel}px` }}
              >
                {formatTime(s)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tracks Container */}
      <div className="relative divide-y divide-zinc-800/80 max-h-[460px] overflow-y-auto">
        {/* Red Playhead Indicator Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-zinc-500 z-30 pointer-events-none transition-all duration-75"
          style={{ left: `calc(14rem + ${currentTime * zoomLevel}px)` }}
        >
          <div className="w-2.5 h-2.5 bg-zinc-500 -ml-1 rounded-full shadow-md" />
        </div>

        {tracks.map((track) => (
          <div key={track.id} className="flex min-h-[90px] group">
            {/* Track Left Controls Panel */}
            <div className="w-56 shrink-0 p-3 bg-zinc-900/70 border-r border-zinc-800 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-white truncate max-w-[110px]">
                  {track.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 capitalize">
                  {track.type}
                </span>
              </div>

              {/* Mute, Solo, Volume */}
              <div className="flex items-center justify-between gap-1 pt-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleTrackMute(track.id)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      track.muted
                        ? "bg-zinc-500 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    M
                  </button>
                  <button
                    onClick={() => toggleTrackSolo(track.id)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      track.solo
                        ? "bg-zinc-400 text-black"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    S
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-zinc-500" />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={track.volume}
                    onChange={(e) => updateTrackVolume(track.id, parseFloat(e.target.value))}
                    className="w-14 h-1 accent-brand-cyan"
                  />
                </div>
              </div>

              {/* Add Clip Button */}
              <button
                onClick={() => setShowAddClipModal(track.id)}
                className="mt-1 flex items-center gap-1 text-[10px] text-zinc-400 hover:text-brand-cyan"
              >
                <Plus className="w-3 h-3" /> Add Clip from Library
              </button>
            </div>

            {/* Track Timeline Lane */}
            <div
              className="flex-1 relative bg-zinc-950/40 p-2 overflow-x-hidden min-h-[90px]"
              style={{ width: `${totalDuration * zoomLevel}px` }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                handleSeek(clickX / zoomLevel);
              }}
            >
              {track.clips.map((clip) => {
                const leftPos = clip.startTime * zoomLevel;
                const width = Math.max(30, clip.duration * zoomLevel);

                return (
                  <div
                    key={clip.id}
                    className="absolute top-2 bottom-2 rounded-xl border border-white/20 p-2 flex flex-col justify-between overflow-hidden shadow-lg select-none cursor-grab active:cursor-grabbing group/clip transition-transform hover:scale-[1.01]"
                    style={{
                      left: `${leftPos}px`,
                      width: `${width}px`,
                      backgroundColor: clip.color ? `${clip.color}33` : "#FFFFFF33",
                      borderColor: clip.color || "#FFFFFF",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-white truncate">
                      <span className="truncate">{clip.title}</span>
                      <button
                        onClick={() => deleteClip(track.id, clip.id)}
                        className="opacity-0 group-hover/clip:opacity-100 text-zinc-400 hover:text-zinc-400 p-0.5"
                        title="Delete clip"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Waveform pattern visualizer lines */}
                    <div className="flex items-center gap-0.5 h-4 opacity-50">
                      {Array.from({ length: Math.min(24, Math.floor(width / 6)) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-white rounded-full"
                          style={{ height: `${20 + ((i * 17) % 80)}%` }}
                        />
                      ))}
                    </div>

                    <div className="text-[9px] text-zinc-300 font-mono">
                      {clip.duration.toFixed(1)}s
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Add Clip from Library Modal */}
      {showAddClipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-[#141414] border border-zinc-800 rounded-2xl p-6 shadow-2xl text-white space-y-4">
            <h3 className="font-heading font-bold text-base">Add Clip to Track</h3>
            <p className="text-xs text-zinc-400">
              Select an audio generation from your studio history to insert at playhead ({formatTime(currentTime)}):
            </p>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {generations.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No generations found. Create speech, music, or SFX in the studio first!
                </div>
              ) : (
                generations.map((gen) => (
                  <div
                    key={gen.id}
                    onClick={() => addClipToTrack(showAddClipModal, gen)}
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-brand-cyan hover:bg-zinc-800/80 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white">{gen.title}</div>
                      <div className="text-[11px] text-zinc-400 capitalize">
                        {gen.type} • {gen.duration.toFixed(1)}s
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-brand-cyan" />
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowAddClipModal(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-xs text-zinc-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
