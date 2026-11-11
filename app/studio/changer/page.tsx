"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { PREMADE_VOICES } from "@/lib/mock-data";
import { WaveformPlayer } from "@/components/waveform-player";
import { synthesizeTTSVoice } from "@/lib/audio-synth";
import { AudioRecorder } from "@/components/audio-recorder";
import { Radio, Mic, Sparkles, Sliders, ArrowRight, UploadCloud } from "lucide-react";

export default function VoiceChangerStudio() {
  const { voices, deductCredits } = useAppStore();
  const [targetVoice, setTargetVoice] = useState(voices[0] || PREMADE_VOICES[0]);
  const [pitchShift, setPitchShift] = useState(1.1);
  const [timbrePreserve, setTimbrePreserve] = useState(0.8);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedAudioUrl, setConvertedAudioUrl] = useState<string | null>(null);
  const [hasInputAudio, setHasInputAudio] = useState(false);

  const cost = 150;

  const handleConvert = async () => {
    const deducted = await deductCredits(cost);
    if (!deducted) return;

    setIsProcessing(true);
    setTimeout(() => {
      const { audioUrl } = synthesizeTTSVoice(
        "Voice Changer Conversion Complete: Vocal identity transposed to target neural signature.",
        { voicePitch: pitchShift, tone: targetVoice.tone }
      );
      setConvertedAudioUrl(audioUrl);
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2.5">
          <Radio className="w-6 h-6 text-brand-pink" />
          <span>Speech-to-Speech Voice Changer</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Transform your speech into another person's voice while keeping authentic pacing, emotional cadence, and inflection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Input Audio */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            1. Provide Source Voice
          </h3>
          <AudioRecorder
            onRecordingComplete={() => setHasInputAudio(true)}
            onDeleteSample={() => setHasInputAudio(false)}
          />
        </div>

        {/* Step 2: Target Voice & Conversion */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            2. Target Voice Identity
          </h3>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Target Persona</label>
            <select
              value={targetVoice.id}
              onChange={(e) => {
                const found = voices.find((v) => v.id === e.target.value);
                if (found) setTargetVoice(found);
              }}
              className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none"
            >
              {voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.accent} • {v.gender})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300">Pitch Shift</span>
              <span className="font-mono text-zinc-400">{(pitchShift * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0.7}
              max={1.4}
              step={0.05}
              value={pitchShift}
              onChange={(e) => setPitchShift(parseFloat(e.target.value))}
              className="w-full h-1 accent-brand-pink"
            />
          </div>

          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full py-3 rounded-xl bg-white text-black text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isProcessing ? "Transposing Voice Identity..." : `Change Voice (${cost} cr)`}
          </button>
        </div>
      </div>

      {convertedAudioUrl && (
        <div className="pt-2 animate-in fade-in">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
            Transposed Output:
          </h3>
          <WaveformPlayer
            audioUrl={convertedAudioUrl}
            duration={4.8}
            title={`Voice Transposed to ${targetVoice.name}`}
            subtitle="Original cadence & intonations preserved"
            autoPlay={true}
          />
        </div>
      )}
    </div>
  );
}
