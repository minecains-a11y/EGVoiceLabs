"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { synthesizeSFX } from "@/lib/audio-synth";
import { moderateText } from "@/lib/moderation";
import { SFX_PROMPT_EXAMPLES } from "@/lib/mock-data";
import { WaveformPlayer } from "@/components/waveform-player";
import {
  Sparkles,
  Sliders,
  Repeat,
  RotateCcw,
  Volume2,
  Download,
  AlertCircle,
  Play,
  Grid,
} from "lucide-react";

interface SFXVariation {
  id: string;
  label: string;
  audioUrl: string;
  duration: number;
}

export default function SoundEffectsStudio() {
  const { deductCredits, addGeneration } = useAppStore();

  const [prompt, setPrompt] = useState(
    "Heavy rain on a tin roof with distant rolling thunder and light wind gusts"
  );
  const [duration, setDuration] = useState(5.0); // 0.5 to 22s
  const [loop, setLoop] = useState(false);
  const [promptInfluence, setPromptInfluence] = useState(0.85); // 0.1 to 1.0

  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState<SFXVariation[]>([]);
  const [moderationError, setModerationError] = useState<string | null>(null);

  const sfxCost = 80;

  const handleGenerateSFX = () => {
    if (!prompt.trim()) return;
    setModerationError(null);

    // 1. Moderation check
    const modResult = moderateText(prompt, "sfx");
    if (!modResult.passed) {
      setModerationError(modResult.reason || "Content policy violation detected.");
      return;
    }

    // 2. Deduct credits
    const deducted = deductCredits(sfxCost);
    if (!deducted) return;

    setIsGenerating(true);
    setVariations([]);

    setTimeout(() => {
      // Generate 4 procedural variations
      const vars: SFXVariation[] = [];
      for (let i = 1; i <= 4; i++) {
        const { audioUrl, duration: dur } = synthesizeSFX(prompt, {
          duration: duration * (0.9 + i * 0.05),
          loop,
          promptInfluence,
        });
        vars.push({
          id: `sfx_var_${i}_${Date.now()}`,
          label: `Variation ${i}`,
          audioUrl,
          duration: dur,
        });
      }

      setVariations(vars);

      // Save into global generation store
      addGeneration({
        type: "sfx",
        title: `SFX: ${prompt.substring(0, 32)}...`,
        prompt: prompt,
        model: "EGVL SoundGen v1",
        audioUrl: vars[0].audioUrl,
        duration: vars[0].duration,
        costCredits: sfxCost,
        status: "completed",
        params: { duration, loop, promptInfluence },
        watermarked: true,
      });

      setIsGenerating(false);
    }, 750);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-zinc-400" />
            <span>Sound Effects Generator</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Turn descriptive text into cinematic sound effects, Foley art, interface chimes, and natural ambiance.
          </p>
        </div>
      </div>

      {/* Moderation Error Alert */}
      {moderationError && (
        <div className="p-4 rounded-xl bg-zinc-500/10 border border-zinc-500/30 text-zinc-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-zinc-400" />
          <div>
            <span className="font-semibold block">Policy Alert:</span>
            <span>{moderationError}</span>
          </div>
        </div>
      )}

      {/* Trending Prompt Inspiration Pills */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
          Trending Sound Effects Inspiration:
        </span>
        <div className="flex flex-wrap gap-2">
          {SFX_PROMPT_EXAMPLES.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(ex)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-500 text-zinc-300 hover:text-white text-xs transition-colors"
            >
              {ex.substring(0, 48)}...
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Prompt & Sliders (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Sound Effect Description
            </h3>

            {/* Prompt Editor */}
            <div>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your sound effect: e.g. laser blast, footsteps on gravel, gentle campfire..."
                className="w-full p-3.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 resize-none leading-relaxed"
              />
              <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-1">
                <span>EGVL SoundGen Neural Pipeline</span>
                <span>Cost: {sfxCost} credits</span>
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Duration Slider (0.5s to 22s) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Duration</span>
                  <span className="text-zinc-400 font-mono font-bold">{duration.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={22}
                  step={0.5}
                  value={duration}
                  onChange={(e) => setDuration(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-400"
                />
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>0.5s (Micro)</span>
                  <span>10s</span>
                  <span>22s (Full Ambiance)</span>
                </div>
              </div>

              {/* Prompt Influence Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Prompt Influence / Guidance</span>
                  <span className="text-zinc-400 font-mono">{Math.round(promptInfluence * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={promptInfluence}
                  onChange={(e) => setPromptInfluence(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
                />
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Subtle / Creative</span>
                  <span>Strict prompt adhere</span>
                </div>
              </div>
            </div>

            {/* Loop Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-zinc-400" />
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block">
                    Seamless Loopable Audio
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    Cross-fades endpoints for game loops & background atmospheres
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLoop(!loop)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  loop ? "bg-zinc-500" : "bg-zinc-800"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black absolute top-0.5 transition-transform ${
                    loop ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Generate Action */}
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Generate 4 Variations
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every generation creates 4 distinct acoustic takes with varied dynamic envelopes and spectral frequencies.
            </p>

            <button
              onClick={handleGenerateSFX}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3.5 rounded-xl bg-white text-black font-extrabold text-xs shadow-lg shadow-zinc-600/25 hover:shadow-brand-cyan/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-white" /> Synthesizing 4 Takes...
                </span>
              ) : (
                `Generate 4 Sound Effects (${sfxCost} cr)`
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4 Variations Preview Grid */}
      {variations.length > 0 && (
        <div className="space-y-3 pt-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Generated Sound Effect Variations (4 Takes)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {variations.map((v) => (
              <WaveformPlayer
                key={v.id}
                audioUrl={v.audioUrl}
                duration={v.duration}
                title={`${prompt.substring(0, 36)}...`}
                subtitle={v.label}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
