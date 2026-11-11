"use client";

import React, { useEffect, useMemo, useState } from "react";
import { VoicePicker } from "@/components/voice-picker";
import { WaveformPlayer } from "@/components/waveform-player";
import { PREMADE_VOICES, SUPPORTED_LANGUAGES } from "@/lib/mock-data";
import { Voice, Generation } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { requestSpeech, SpeechRequestError, TTS_MODEL_NAME } from "@/lib/tts-client";
import { VoicePreviewButton } from "@/components/voice-preview-button";
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
  const { voices, generations, addGeneration, deleteGeneration, toggleFavoriteGeneration, syncCreditBalance } = useAppStore();

  // Voice Selection
  const [selectedVoice, setSelectedVoice] = useState<Voice>(voices[0] || PREMADE_VOICES[0]);

  // Text Prompt
  const [text, setText] = useState(
    "In the quiet corners of the laboratory, the neural synthesizer began humming with electric resonance. Every frequency was calibrated to perfection."
  );

  const [language, setLanguage] = useState<string>("auto");
  const [expressiveness, setExpressiveness] = useState<number>(0.5);
  const [speed, setSpeed] = useState<number>(1.0);

  // Studio State
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeGeneration, setActiveGeneration] = useState<Generation | null>(null);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [deviceFallbackAvailable, setDeviceFallbackAvailable] = useState(false);

  // Credit calculation
  const charCount = text.length;
  const maxChars = 5000;
  // Cost: ~1 credit per 25 chars (minimum 10 credits)
  const estimatedCost = Math.max(10, Math.ceil(charCount / 25));

  // Filter history to TTS
  const ttsHistory = useMemo(() => {
    return generations.filter((g) => g.type === "tts");
  }, [generations]);

  useEffect(() => {
    const voiceId = new URLSearchParams(window.location.search).get("voice");
    const linkedVoice = voices.find((voice) => voice.id === voiceId);
    if (linkedVoice) setSelectedVoice(linkedVoice);
  }, [voices]);

  // Insert SSML helper
  const insertTag = (tag: string) => {
    setText((prev) => `${prev} ${tag} `);
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setModerationError(null);
    setGenerationError(null);
    setDeviceFallbackAvailable(false);

    const modResult = moderateText(text, "tts");
    if (!modResult.passed) {
      setModerationError(modResult.reason || "Content policy violation detected.");
      return;
    }

    setIsGenerating(true);
    try {
      const speech = await requestSpeech({
        text,
        voiceId: selectedVoice.id,
        speed,
        language,
        expressiveness,
      });
      if (speech.creditsRemaining !== null) syncCreditBalance(speech.creditsRemaining);

      const newGen = addGeneration({
        type: "tts",
        title: `${selectedVoice.name} — ${text.substring(0, 32)}${text.length > 32 ? "…" : ""}`,
        prompt: text,
        voiceId: selectedVoice.id,
        voiceName: selectedVoice.name,
        model: TTS_MODEL_NAME,
        audioUrl: speech.audioUrl,
        duration: speech.duration,
        costCredits: speech.costCredits || estimatedCost,
        status: "completed",
        params: { expressiveness, speed, language },
        watermarked: false,
      });

      setActiveGeneration(newGen);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Speech generation failed. Please try again.");
      setDeviceFallbackAvailable(error instanceof SpeechRequestError && error.status === 502);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2.5">
            <span>Text to Speech Studio</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-violet/20 text-brand-cyan border border-brand-violet/30 font-mono">
              Live TTS
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Turn your script into real speech, then tune the delivery and pacing for each voice.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-2 rounded-xl border border-brand-cyan/20 bg-brand-cyan/10 px-3 py-2 font-medium text-brand-cyan">
            <Sparkles className="h-3.5 w-3.5" /> {TTS_MODEL_NAME}
          </span>
          <label className="sr-only" htmlFor="tts-language">Output language</label>
          <select
            id="tts-language"
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

      {generationError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">
          <span>{generationError}</span>
          {deviceFallbackAvailable && (
            <VoicePreviewButton
              voice={selectedVoice}
              sampleText={text}
              speed={speed}
              language={language}
              browserOnly
              label="Speak on this device"
              playingLabel="Speaking"
              className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-zinc-950"
            />
          )}
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

          {/* Delivery cue shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Delivery cues:
            </span>
            {[
              { label: "[pause 1s]", tag: "[pause 1s]" },
              { label: "[whisper]", tag: "[whisper]" },
              { label: "[excited]", tag: "[excited]" },
              { label: "[emphasis]", tag: "[emphasis]" },
              { label: "[sigh]", tag: "[sigh]" },
            ].map((item) => (
              <button
                type="button"
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
              aria-label="Text to synthesize"
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
              <div className="pt-2 voice-result-enter">
                <WaveformPlayer
                  audioUrl={activeGeneration.audioUrl}
                  duration={activeGeneration.duration}
                  title={activeGeneration.title}
                  subtitle={`Voice: ${activeGeneration.voiceName} • ${activeGeneration.model} • Download to keep`}
                  autoPlay={true}
                  watermarked={activeGeneration.watermarked}
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
                  setExpressiveness(0.5);
                  setSpeed(1.0);
                }}
                className="text-[11px] text-zinc-500 hover:text-white flex items-center gap-1"
                title="Reset sliders"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>


            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label htmlFor="voice-expressiveness" className="text-zinc-300 font-medium">Expression</label>
                <span className="text-zinc-400 font-mono">{Math.round(expressiveness * 100)}%</span>
              </div>
              <input
                id="voice-expressiveness"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={expressiveness}
                onChange={(e) => setExpressiveness(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>Understated</span>
                <span>Dynamic</span>
              </div>
            </div>

            {/* Speed */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label htmlFor="voice-speed" className="text-zinc-300 font-medium">Pacing / Speed</label>
                <span className="text-zinc-400 font-mono">{speed.toFixed(2)}x</span>
              </div>
              <input
                id="voice-speed"
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
