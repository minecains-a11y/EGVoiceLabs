"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { synthesizeMusicTrack } from "@/lib/audio-synth";
import { moderateText } from "@/lib/moderation";
import { MUSIC_PROMPT_EXAMPLES } from "@/lib/mock-data";
import { WaveformPlayer } from "@/components/waveform-player";
import {
  Music2,
  Sparkles,
  Sliders,
  RotateCcw,
  FastForward,
  Bookmark,
  BookmarkCheck,
  AlertCircle,
  Mic,
  Disc3,
  Layers,
  ArrowRight,
} from "lucide-react";

interface MusicVariation {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  bpm: number;
  genre: string;
  isFavorite?: boolean;
}

export default function MusicGeneratorStudio() {
  const { deductCredits, addGeneration } = useAppStore();

  const [prompt, setPrompt] = useState(
    "Upbeat lo-fi hip hop with soft electric piano and gentle vinyl crackle, 80 BPM"
  );
  const [genre, setGenre] = useState("Lo-Fi");
  const [mood, setMood] = useState("Chill");
  const [bpm, setBpm] = useState(84);
  const [musicalKey, setMusicalKey] = useState("C minor");
  const [duration, setDuration] = useState(15);
  const [isInstrumental, setIsInstrumental] = useState(true);
  const [lyrics, setLyrics] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState<MusicVariation[]>([]);
  const [moderationError, setModerationError] = useState<string | null>(null);

  const musicCost = 200;

  const handleGenerateMusic = async () => {
    if (!prompt.trim()) return;
    setModerationError(null);

    // 1. Check Copyright Artist Moderation
    const modResult = moderateText(prompt, "music");
    if (!modResult.passed) {
      setModerationError(modResult.reason || "Copyrighted artist imitation is restricted.");
      return;
    }

    // 2. Deduct credits
    const deducted = await deductCredits(musicCost);
    if (!deducted) return;

    setIsGenerating(true);
    setVariations([]);

    setTimeout(() => {
      // Generate 2 variations with slightly different BPMs / textures
      const track1 = synthesizeMusicTrack(prompt, {
        genre,
        mood,
        bpm,
        duration,
      });

      const track2 = synthesizeMusicTrack(prompt, {
        genre,
        mood,
        bpm: bpm + 4,
        duration,
      });

      const results: MusicVariation[] = [
        {
          id: `mus_var_1_${Date.now()}`,
          title: `Variation A — ${prompt.substring(0, 36)}...`,
          audioUrl: track1.audioUrl,
          duration: track1.duration,
          bpm: bpm,
          genre: genre,
        },
        {
          id: `mus_var_2_${Date.now()}`,
          title: `Variation B (Up-Tempo) — ${prompt.substring(0, 36)}...`,
          audioUrl: track2.audioUrl,
          duration: track2.duration,
          bpm: bpm + 4,
          genre: genre,
        },
      ];

      setVariations(results);

      // Save into global generation store
      addGeneration({
        type: "music",
        title: `Music: ${prompt.substring(0, 32)}...`,
        prompt: prompt,
        model: "EGVL BeatSync v2",
        audioUrl: track1.audioUrl,
        duration: track1.duration,
        costCredits: musicCost,
        status: "completed",
        params: { genre, mood, bpm, musicalKey, duration, isInstrumental },
        watermarked: true,
      });

      setIsGenerating(false);
    }, 850);
  };

  const handleExtendTrack = (index: number) => {
    const target = variations[index];
    if (!target) return;
    const newDuration = target.duration + 15;
    const extended = synthesizeMusicTrack(prompt, {
      genre,
      mood,
      bpm: target.bpm,
      duration: newDuration,
    });

    const updated = [...variations];
    updated[index] = {
      ...target,
      audioUrl: extended.audioUrl,
      duration: newDuration,
      title: `${target.title} (Extended to ${newDuration}s)`,
    };
    setVariations(updated);
  };

  const toggleFavoriteVar = (index: number) => {
    const updated = [...variations];
    updated[index].isFavorite = !updated[index].isFavorite;
    setVariations(updated);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2.5">
            <Music2 className="w-6 h-6 text-brand-cyan" />
            <span>AI Music Generator</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Generate royalty-free songs, background beats, and ambient soundscapes from text prompts.
          </p>
        </div>
      </div>

      {/* Moderation Error Alert */}
      {moderationError && (
        <div className="p-4 rounded-xl bg-zinc-500/10 border border-zinc-500/30 text-zinc-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-zinc-400" />
          <div>
            <span className="font-semibold block">Copyright & Content Policy Notice:</span>
            <span>{moderationError}</span>
          </div>
        </div>
      )}

      {/* Inspiration Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
        <span className="text-zinc-500 shrink-0 uppercase tracking-wider font-semibold">
          Try Inspiration:
        </span>
        {MUSIC_PROMPT_EXAMPLES.slice(0, 4).map((ex, idx) => (
          <button
            key={idx}
            onClick={() => setPrompt(ex)}
            className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-brand-cyan text-zinc-300 hover:text-white shrink-0 transition-colors"
          >
            {ex.substring(0, 40)}...
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Prompt & Musical Parameters (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Music Prompt & Structure
            </h3>

            {/* Prompt Textarea */}
            <div>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your song: genre, instrumentation, tempo, mood (e.g. upbeat synthwave with 80s drums)..."
                className="w-full p-3.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-cyan resize-none leading-relaxed"
              />
              <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-1">
                <span>Avoid named recording artists to comply with copyright protections.</span>
                <span>Cost: {musicCost} credits</span>
              </div>
            </div>

            {/* Controls Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Genre */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Genre</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-brand-cyan"
                >
                  <option value="Lo-Fi">Lo-Fi Hip Hop</option>
                  <option value="Synthwave">Synthwave / Retro</option>
                  <option value="Cinematic">Cinematic Orchestral</option>
                  <option value="Ambient">Ambient / Drone</option>
                  <option value="Electronic">Deep House / EDM</option>
                  <option value="Acoustic">Acoustic / Folk</option>
                  <option value="Rock">Indie Rock</option>
                  <option value="Jazz">Smooth Jazz</option>
                </select>
              </div>

              {/* Mood */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Mood</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-brand-cyan"
                >
                  <option value="Chill">Chill / Relaxed</option>
                  <option value="Energetic">Energetic / Driving</option>
                  <option value="Dark">Dark / Melancholy</option>
                  <option value="Uplifting">Uplifting / Happy</option>
                  <option value="Heroic">Heroic / Epic</option>
                  <option value="Dreamy">Dreamy / Hypnotic</option>
                </select>
              </div>

              {/* Musical Key */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Key</label>
                <select
                  value={musicalKey}
                  onChange={(e) => setMusicalKey(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-brand-cyan"
                >
                  <option value="C minor">C Minor</option>
                  <option value="D minor">D Minor</option>
                  <option value="A minor">A Minor</option>
                  <option value="E minor">E Minor</option>
                  <option value="G major">G Major</option>
                  <option value="F major">F Major</option>
                  <option value="Bb major">Bb Major</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Duration: {duration}s
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full p-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-brand-cyan"
                >
                  <option value="15">15 seconds (Preview)</option>
                  <option value="30">30 seconds (Short Track)</option>
                  <option value="60">60 seconds (Standard)</option>
                  <option value="120">2 minutes (Full Song)</option>
                </select>
              </div>
            </div>

            {/* Instrumental vs Vocals Toggle & Optional Lyrics */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block">
                    Instrumental Only
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    Exclude synthesized neural vocals
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInstrumental(!isInstrumental)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    isInstrumental ? "bg-brand-cyan" : "bg-zinc-800"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-black absolute top-0.5 transition-transform ${
                      isInstrumental ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {!isInstrumental && (
                <div className="pt-2 animate-in fade-in">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Optional Lyrics (Verses & Chorus)
                  </label>
                  <textarea
                    rows={3}
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    placeholder="[Verse] In the neon rain, the circuits sing...&#10;[Chorus] Echoes of the night, shining through the dark..."
                    className="w-full p-3 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-cyan resize-none font-mono"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: BPM Slider & Generate Trigger */}
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Tempo & Cadence
            </h3>

            {/* BPM Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">Tempo (BPM)</span>
                <span className="text-brand-cyan font-mono font-bold">{bpm} BPM</span>
              </div>
              <input
                type="range"
                min={60}
                max={180}
                step={2}
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>60 (Slow)</span>
                <span>120 (Dance)</span>
                <span>180 (Fast)</span>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateMusic}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3.5 rounded-xl bg-white text-black font-extrabold text-xs shadow-lg shadow-brand-cyan/25 hover:shadow-brand-violet/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2 text-white">
                  <Sparkles className="w-4 h-4 animate-spin text-brand-cyan" /> Composing 2 Tracks...
                </span>
              ) : (
                `Generate 2 Variations (${musicCost} cr)`
              )}
            </button>
          </div>

          {/* Variations Output */}
          {variations.length > 0 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-xs font-bold uppercase tracking-wider text-white">
                Generated Tracks:
              </div>

              {variations.map((v, idx) => (
                <div
                  key={v.id}
                  className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{v.title}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleFavoriteVar(idx)}
                        className="p-1 text-zinc-400 hover:text-zinc-400"
                        title="Favorite"
                      >
                        {v.isFavorite ? (
                          <BookmarkCheck className="w-4 h-4 text-zinc-400" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleExtendTrack(idx)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[10px] text-brand-cyan font-semibold"
                        title="Extend duration by +15 seconds"
                      >
                        <FastForward className="w-3 h-3" />
                        <span>+15s</span>
                      </button>
                    </div>
                  </div>

                  <WaveformPlayer
                    audioUrl={v.audioUrl}
                    duration={v.duration}
                    title={v.title}
                    subtitle={`${v.genre} • ${v.bpm} BPM`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
