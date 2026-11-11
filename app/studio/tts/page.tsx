"use client";

import React, { useState, useMemo } from "react";
import { VoicePicker } from "@/components/voice-picker";
import { WaveformPlayer } from "@/components/waveform-player";
import { PREMADE_VOICES, SUPPORTED_LANGUAGES } from "@/lib/mock-data";
import { Voice, Generation } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { synthesizeTTSVoice } from "@/lib/audio-synth";
import { moderateText } from "@/lib/moderation";
import {
  Sparkles,
  Sliders,
  Play,
  RotateCcw,
  History,
  Trash2,
  Bookmark,
  BookmarkCheck,
  AlertCircle,
  Clock,
  Layers,
  Zap,
} from "lucide-react";

export default function TextToSpeechStudio() {
  const { voices, generations, addGeneration, deleteGeneration, toggleFavoriteGeneration, deductCredits } = useAppStore();

  // Voice Selection
  const [selectedVoice, setSelectedVoice] = useState<Voice>(voices[0] || PREMADE_VOICES[0]);

  // Text Prompt
  const [text, setText] = useState(
    "In the quiet corners of the laboratory, the neural synthesizer began humming with electric resonance. Every frequency was calibrated to perfection."
  );

  // Model & Language
  const [model, setModel] = useState<"EGVL Turbo" | "EGVL Multilingual">("EGVL Multilingual");
  const [language, setLanguage] = useState<string>("auto");

  // Advanced Voice Settings Sliders
  const [stability, setStability] = useState<number>(0.75); // 0 to 1
  const [similarity, setSimilarity] = useState<number>(0.85); // 0 to 1
  const [styleExaggeration, setStyleExaggeration] = useState<number>(0.15); // 0 to 1
  const [speed, setSpeed] = useState<number>(1.0); // 0.7 to 1.5
  const [speakerBoost, setSpeakerBoost] = useState<boolean>(true);

  // Studio State
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeGeneration, setActiveGeneration] = useState<Generation | null>(null);
  const [moderationError, setModerationError] = useState<string | null>(null);

  // Credit calculation
  const charCount = text.length;
  const maxChars = 5000;
  // Cost: ~1 credit per 25 chars (minimum 10 credits)
  const estimatedCost = Math.max(10, Math.ceil(charCount / 25));

  // Filter history to TTS
  const ttsHistory = useMemo(() => {
    return generations.filter((g) => g.type === "tts");
  }, [generations]);

  // Insert SSML helper
  const insertTag = (tag: string) => {
    setText((prev) => `${prev} ${tag} `);
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setModerationError(null);

    // 1. Content Moderation Check
    const modResult = moderateText(text, "tts");
    if (!modResult.passed) {
      setModerationError(modResult.reason || "Content policy violation detected.");
      return;
    }

    // 2. Credit check and deduction
    const deducted = await deductCredits(estimatedCost);
    if (!deducted) return;

    setIsGenerating(true);

    setTimeout(() => {
      // 3. Procedural Synthesis
      const { audioUrl, duration } = synthesizeTTSVoice(text, {
        voicePitch: selectedVoice.pitch,
        speed: speed,
        stability: stability,
        similarity: similarity,
        styleExaggeration: styleExaggeration,
        tone: selectedVoice.tone,
      });

      const newGen = addGeneration({
        type: "tts",
        title: `${selectedVoice.name} — ${text.substring(0, 32)}...`,
        prompt: text,
        voiceId: selectedVoice.id,
        voiceName: selectedVoice.name,
        model: model,
        audioUrl: audioUrl,
        duration: duration,
        costCredits: estimatedCost,
        status: "completed",
        params: {
          stability,
          similarity,
          styleExaggeration,
          speed,
          speakerBoost,
          language,
        },
        watermarked: true,
      });

      setActiveGeneration(newGen);
      setIsGenerating(false);
    }, 700);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2.5">
            <span>Text to Speech Studio</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-violet/20 text-brand-cyan border border-brand-violet/30 font-mono">
              EGVL 2.4
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Transform text into natural, expressive speech with millisecond latency and custom voice styles.
          </p>
        </div>

        {/* Model & Language Quick Toggles */}
        <div className="flex items-center gap-3 text-xs">
          {/* Model Selector */}
          <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800">
            <button
              onClick={() => setModel("EGVL Turbo")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                model === "EGVL Turbo"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Turbo (Low Latency)
            </button>
            <button
              onClick={() => setModel("EGVL Multilingual")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                model === "EGVL Multilingual"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Multilingual (Hi-Fi)
            </button>
          </div>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-brand-violet"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Moderation Error Alert */}
      {moderationError && (
        <div className="p-4 rounded-xl bg-zinc-500/10 border border-zinc-500/30 text-zinc-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-zinc-400" />
          <div>
            <span className="font-semibold block">Safety & Moderation Alert:</span>
            <span>{moderationError}</span>
          </div>
        </div>
      )}

      {/* Main Studio Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Editor & Voice Picker (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Voice Picker Dropdown */}
          <VoicePicker
            selectedVoiceId={selectedVoice.id}
            onSelectVoice={(v) => setSelectedVoice(v)}
          />

          {/* SSML Tag Shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              SSML Tags:
            </span>
            {[
              { label: "[pause 1s]", tag: "[pause 1s]" },
              { label: "[whisper]", tag: "[whisper]" },
              { label: "[excited]", tag: "[excited]" },
              { label: "[emphasis]", tag: "[emphasis]" },
              { label: "[sigh]", tag: "[sigh]" },
            ].map((item) => (
              <button
                key={item.tag}
                onClick={() => insertTag(item.tag)}
                className="px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-brand-violet/20 border border-zinc-800 hover:border-brand-violet/40 text-[11px] font-mono text-brand-cyan transition-colors"
              >
                + {item.label}
              </button>
            ))}
          </div>

          {/* Large Text Editor with Live Character Counter */}
          <div className="relative rounded-2xl bg-zinc-900/70 border border-zinc-800 focus-within:border-brand-violet/60 transition-all p-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              maxLength={maxChars}
              placeholder="Type or paste your text here to synthesize speech... (Up to 5,000 characters)"
              className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
            />

            {/* Bottom Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/80 text-xs">
              <div className="flex items-center gap-3 text-zinc-400 font-mono">
                <span className={charCount > 4800 ? "text-zinc-400" : ""}>
                  {charCount.toLocaleString()} / {maxChars.toLocaleString()} chars
                </span>
                <span>•</span>
                <span>~{Math.round(charCount / 5)} words</span>
                <span>•</span>
                <span className="text-brand-cyan flex items-center gap-1 font-semibold">
                  <Zap className="w-3 h-3" /> Cost: {estimatedCost} credits
                </span>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black text-xs font-bold shadow-lg shadow-brand-violet/25 hover:shadow-brand-cyan/30 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-brand-cyan" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Generate Speech ({estimatedCost} cr)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Waveform Player Display */}
          {activeGeneration && (
            <div className="pt-2 animate-in fade-in duration-200">
              <WaveformPlayer
                audioUrl={activeGeneration.audioUrl}
                duration={activeGeneration.duration}
                title={activeGeneration.title}
                subtitle={`Voice: ${activeGeneration.voiceName} • Model: ${activeGeneration.model}`}
                autoPlay={true}
              />
            </div>
          )}
        </div>

        {/* Right Column: Voice Sliders & History */}
        <div className="space-y-4">
          {/* Settings Sliders Card */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-cyan" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Voice Controls
                </h3>
              </div>
              <button
                onClick={() => {
                  setStability(0.75);
                  setSimilarity(0.85);
                  setStyleExaggeration(0.15);
                  setSpeed(1.0);
                  setSpeakerBoost(true);
                }}
                className="text-[11px] text-zinc-500 hover:text-white flex items-center gap-1"
                title="Reset sliders"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Stability */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Stability</span>
                <span className="text-zinc-400 font-mono">{Math.round(stability * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={stability}
                onChange={(e) => setStability(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-violet"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>More expressive</span>
                <span>More stable</span>
              </div>
            </div>

            {/* Similarity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Clarity & Similarity</span>
                <span className="text-zinc-400 font-mono">{Math.round(similarity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={similarity}
                onChange={(e) => setSimilarity(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>Low</span>
                <span>High resemblance</span>
              </div>
            </div>

            {/* Style Exaggeration */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Style Exaggeration</span>
                <span className="text-zinc-400 font-mono">{Math.round(styleExaggeration * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={styleExaggeration}
                onChange={(e) => setStyleExaggeration(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-400"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>Neutral</span>
                <span>Dramatic energy</span>
              </div>
            </div>

            {/* Speed */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Pacing / Speed</span>
                <span className="text-zinc-400 font-mono">{speed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min={0.7}
                max={1.5}
                step={0.05}
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-pink"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>0.7x (Slow)</span>
                <span>1.0x</span>
                <span>1.5x (Fast)</span>
              </div>
            </div>

            {/* Speaker Boost Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">Speaker Boost</span>
                <span className="text-[10px] text-zinc-400">Boost vocal presence & harmonics</span>
              </div>
              <button
                type="button"
                onClick={() => setSpeakerBoost(!speakerBoost)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  speakerBoost ? "bg-brand-cyan" : "bg-zinc-800"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black absolute top-0.5 transition-transform ${
                    speakerBoost ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Past Generations History Card */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-zinc-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Generation History
                </h3>
              </div>
              <span className="text-[11px] text-zinc-500">{ttsHistory.length} items</span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {ttsHistory.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No generations yet. Synthesize your first audio clip above!
                </div>
              ) : (
                ttsHistory.map((gen) => (
                  <div
                    key={gen.id}
                    onClick={() => setActiveGeneration(gen)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      activeGeneration?.id === gen.id
                        ? "bg-white border-white text-black"
                        : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-white truncate max-w-[140px]">
                        {gen.voiceName || "Custom Voice"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteGeneration(gen.id);
                          }}
                          className="p-1 text-zinc-400 hover:text-zinc-400"
                          title="Favorite"
                        >
                          {gen.isFavorite ? (
                            <BookmarkCheck className="w-3.5 h-3.5 text-zinc-400" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteGeneration(gen.id);
                            if (activeGeneration?.id === gen.id) setActiveGeneration(null);
                          }}
                          className="p-1 text-zinc-400 hover:text-zinc-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mb-1">
                      {gen.prompt}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                      <span>{Math.round(gen.duration)}s</span>
                      <span>{gen.costCredits} cr</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
