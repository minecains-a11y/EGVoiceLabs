"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { synthesizeTTSVoice } from "@/lib/audio-synth";
import { WaveformPlayer } from "@/components/waveform-player";
import {
  Wand2,
  Sparkles,
  Sliders,
  Check,
  BookmarkPlus,
  Play,
  CheckCircle2,
  Volume2,
} from "lucide-react";

interface Variation {
  id: string;
  label: string;
  audioUrl: string;
  duration: number;
  pitch: number;
  speed: number;
  tone: string;
}

function VoiceDesignerStudio() {
  const { addVoice, deductCredits } = useAppStore();

  const [voiceName, setVoiceName] = useState("Aetheris");
  const [gender, setGender] = useState<"female" | "male" | "non-binary">("male");
  const [age, setAge] = useState<"young" | "middle-aged" | "old">("middle-aged");
  const [accent, setAccent] = useState("British");
  const [tone, setTone] = useState<"warm" | "raspy" | "bright" | "deep">("deep");
  const [pitch, setPitch] = useState(0.9);
  const [pace, setPace] = useState(1.0);
  const [promptDescription, setPromptDescription] = useState(
    "A calm British narrator with a deep, resonant voice, suited for historical documentaries."
  );
  const [sampleSentence, setSampleSentence] = useState(
    "Beyond the horizon of human knowledge lies a realm where sound and thought converge."
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const designCost = 100;

  const handleGenerateVariations = async () => {
    const deducted = await deductCredits(designCost);
    if (!deducted) return;

    setIsGenerating(true);
    setVariations([]);
    setSelectedVariation(null);
    setSavedSuccess(false);

    setTimeout(() => {
      // Generate 3 variations with subtle nuances in pitch and speed
      const v1 = synthesizeTTSVoice(sampleSentence, {
        voicePitch: pitch,
        speed: pace,
        tone: tone,
        stability: 0.8,
      });

      const v2 = synthesizeTTSVoice(sampleSentence, {
        voicePitch: pitch * 1.08,
        speed: pace * 0.96,
        tone: tone,
        stability: 0.7,
      });

      const v3 = synthesizeTTSVoice(sampleSentence, {
        voicePitch: pitch * 0.92,
        speed: pace * 1.04,
        tone: tone,
        stability: 0.85,
      });

      const results: Variation[] = [
        {
          id: "var_1",
          label: "Variation 1 (Balanced)",
          audioUrl: v1.audioUrl,
          duration: v1.duration,
          pitch: pitch,
          speed: pace,
          tone: tone,
        },
        {
          id: "var_2",
          label: "Variation 2 (Higher Resonance)",
          audioUrl: v2.audioUrl,
          duration: v2.duration,
          pitch: pitch * 1.08,
          speed: pace * 0.96,
          tone: tone,
        },
        {
          id: "var_3",
          label: "Variation 3 (Deeper Gravitas)",
          audioUrl: v3.audioUrl,
          duration: v3.duration,
          pitch: pitch * 0.92,
          speed: pace * 1.04,
          tone: tone,
        },
      ];

      setVariations(results);
      setSelectedVariation("var_1");
      setIsGenerating(false);
    }, 700);
  };

  const handleSaveVoice = () => {
    const activeVar = variations.find((v) => v.id === selectedVariation) || variations[0];
    if (!activeVar) return;

    addVoice({
      name: voiceName,
      description: promptDescription,
      category: "designed",
      gender: gender,
      age: age,
      accent: accent,
      language: "English",
      useCase: "Designed Persona",
      labels: ["Synthetic", tone, accent],
      pitch: activeVar.pitch,
      speed: activeVar.speed,
      tone: activeVar.tone,
      isDesigned: true,
      qualityRating: 4.93,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2.5">
            <Wand2 className="w-6 h-6 text-brand-pink" />
            <span>Voice Designer</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Generate novel synthetic voices from pure demographic and acoustic attributes without any source audio.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-zinc-500/10 border border-zinc-500/30 text-zinc-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-zinc-400 shrink-0" />
          <span>"{voiceName}" has been saved to My Voices! Available across all studios.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Attributes & Prompt (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Voice Architecture & Personality
            </h3>

            {/* Voice Name & Prompt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Synthetic Voice Name
                </label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand-pink"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Accent
                </label>
                <select
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-brand-pink"
                >
                  <option value="American">American</option>
                  <option value="British">British (RP)</option>
                  <option value="Australian">Australian</option>
                  <option value="Scottish">Scottish</option>
                  <option value="Irish">Irish</option>
                  <option value="French">French Accent</option>
                  <option value="Spanish">Spanish Accent</option>
                  <option value="Japanese">Japanese Accent</option>
                  <option value="Indian">Indian Accent</option>
                </select>
              </div>
            </div>

            {/* Demographic Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gender */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Gender
                </label>
                <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800">
                  {(["female", "male", "non-binary"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`flex-1 py-1.5 rounded-lg text-xs capitalize transition-colors ${
                        gender === g
                          ? "bg-white text-black font-semibold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Age Group
                </label>
                <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800">
                  {(["young", "middle-aged", "old"] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAge(a)}
                      className={`flex-1 py-1.5 rounded-lg text-xs capitalize transition-colors ${
                        age === a
                          ? "bg-white text-black font-semibold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Timbre / Tone Selector */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Vocal Timbre / Tone
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "warm", label: "Warm", desc: "Velvety & soothing" },
                  { id: "deep", label: "Deep", desc: "Authoritative bass" },
                  { id: "raspy", label: "Raspy", desc: "Textured & breathy" },
                  { id: "bright", label: "Bright", desc: "Crisp & punchy" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTone(item.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      tone === item.id
                        ? "bg-white border-white text-black font-semibold"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <div className="text-xs text-white">{item.label}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Description */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Natural Language Description Prompt
              </label>
              <textarea
                rows={2}
                value={promptDescription}
                onChange={(e) => setPromptDescription(e.target.value)}
                placeholder="e.g. A calm British narrator with a deep voice and subtle whisper cadence..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand-pink resize-none"
              />
            </div>

            {/* Sample Calibration Sentence */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Calibration Sentence for Previews
              </label>
              <input
                type="text"
                value={sampleSentence}
                onChange={(e) => setSampleSentence(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-brand-pink"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Sliders & 3 Variations Grid */}
        <div className="space-y-5">
          {/* Pitch & Pace Sliders Card */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Fine-Tuning Controls
            </h3>

            {/* Pitch Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">Pitch Shift</span>
                <span className="text-zinc-400 font-mono">{(pitch * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.6}
                max={1.4}
                step={0.05}
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-pink"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>Lower / Bass</span>
                <span>Higher</span>
              </div>
            </div>

            {/* Pace Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">Speaking Pace</span>
                <span className="text-zinc-400 font-mono">{pace.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min={0.8}
                max={1.3}
                step={0.05}
                value={pace}
                onChange={(e) => setPace(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-violet"
              />
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerateVariations}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-white text-black text-xs font-bold shadow-lg shadow-brand-pink/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" /> Synthesizing 3 Variations...
                </span>
              ) : (
                `Generate 3 Preview Variations (${designCost} cr)`
              )}
            </button>
          </div>

          {/* Generated 3 Variations Card */}
          {variations.length > 0 && (
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3 animate-in fade-in">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Select Your Favorite Variation:
              </h3>

              <div className="space-y-2">
                {variations.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVariation(v.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedVariation === v.id
                        ? "bg-white border-white text-black"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-xs text-white">{v.label}</span>
                      {selectedVariation === v.id && (
                        <Check className="w-4 h-4 text-brand-pink" />
                      )}
                    </div>
                    <WaveformPlayer
                      audioUrl={v.audioUrl}
                      duration={v.duration}
                      title={v.label}
                    />
                  </div>
                ))}
              </div>

              {/* Save Voice Button */}
              <button
                onClick={handleSaveVoice}
                className="w-full py-2.5 rounded-xl bg-zinc-500 hover:bg-zinc-400 text-black text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>Save Selected Voice to My Library</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VoiceDesignerStudio;
