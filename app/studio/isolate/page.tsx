"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { WaveformPlayer } from "@/components/waveform-player";
import { synthesizeTTSVoice } from "@/lib/audio-synth";
import { Sliders, UploadCloud, Sparkles, CheckCircle2 } from "lucide-react";

export default function AudioIsolationPage() {
  const { deductCredits } = useAppStore();
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cleanedAudioUrl, setCleanedAudioUrl] = useState<string | null>(null);

  const cost = 120;

  const handleIsolate = async () => {
    const deducted = await deductCredits(cost);
    if (!deducted) return;

    setIsProcessing(true);
    setTimeout(() => {
      const { audioUrl } = synthesizeTTSVoice(
        "Audio isolation complete: Background room reverb, ventilation hiss, and traffic noise eliminated.",
        { tone: "warm" }
      );
      setCleanedAudioUrl(audioUrl);
      setIsProcessing(false);
    }, 900);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2.5">
          <Sliders className="w-6 h-6 text-brand-cyan" />
          <span>Audio Isolation & Noise Removal</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Isolate crystal-clear vocals and strip away room reverb, air conditioning hum, street traffic, and background noise.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 text-center space-y-4">
        <div className="relative border-2 border-dashed border-zinc-700 hover:border-brand-cyan rounded-2xl p-8 transition-colors">
          <input
            type="file"
            accept="audio/*"
            onChange={() => setFileUploaded(true)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <UploadCloud className="w-10 h-10 text-brand-cyan mx-auto mb-2" />
          <div className="text-xs font-semibold text-white">
            {fileUploaded ? "Audio file selected & analyzed" : "Upload noisy recording"}
          </div>
          <span className="text-[11px] text-zinc-500">WAV, MP3, M4A up to 100MB</span>
        </div>

        <button
          onClick={handleIsolate}
          disabled={!fileUploaded || isProcessing}
          className="px-6 py-3 rounded-xl bg-white text-black font-extrabold text-xs shadow-md disabled:opacity-40 hover:scale-105 active:scale-95 transition-all"
        >
          {isProcessing ? "Separating Vocal Stems..." : `Isolate Vocals (${cost} cr)`}
        </button>
      </div>

      {cleanedAudioUrl && (
        <div className="pt-2 animate-in fade-in">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
            Isolated Clean Vocal Output:
          </h3>
          <WaveformPlayer
            audioUrl={cleanedAudioUrl}
            duration={5}
            title="Isolated Speech Stem"
            subtitle="Noise Floor: -72dB • Reverb: Dry"
            autoPlay={true}
          />
        </div>
      )}
    </div>
  );
}
