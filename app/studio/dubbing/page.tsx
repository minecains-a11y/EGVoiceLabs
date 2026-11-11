"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { SUPPORTED_LANGUAGES } from "@/lib/mock-data";
import { WaveformPlayer } from "@/components/waveform-player";
import { synthesizeTTSVoice } from "@/lib/audio-synth";
import { Languages, Video, Sparkles, CheckCircle2 } from "lucide-react";

export default function VideoDubbingStudio() {
  const { deductCredits } = useAppStore();
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("es-ES");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dubbedAudioUrl, setDubbedAudioUrl] = useState<string | null>(null);

  const cost = 300;

  const handleDubVideo = async () => {
    const deducted = await deductCredits(cost);
    if (!deducted) return;

    setIsProcessing(true);
    setTimeout(() => {
      const { audioUrl } = synthesizeTTSVoice(
        "Bienvenidos a EGVoiceLabs. Este video ha sido doblado automáticamente conservando la voz original.",
        { tone: "warm" }
      );
      setDubbedAudioUrl(audioUrl);
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2.5">
          <Languages className="w-6 h-6 text-brand-cyan" />
          <span>AI Video Dubbing Studio</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Translate and re-voice video content into 29+ languages while preserving original vocal tone, emotion, and lip-sync timing.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">Original Video Language</label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Target Dubbed Language</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200"
            >
              {SUPPORTED_LANGUAGES.filter((l) => l.code !== "auto").map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative border-2 border-dashed border-zinc-700 hover:border-brand-cyan rounded-2xl p-8 text-center transition-colors">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Video className="w-10 h-10 text-brand-cyan mx-auto mb-2" />
          <div className="text-xs font-semibold text-white">
            {videoFile ? videoFile.name : "Select or drag & drop MP4/MOV video file"}
          </div>
          <span className="text-[11px] text-zinc-500">Supports up to 500MB</span>
        </div>

        <button
          onClick={handleDubVideo}
          disabled={!videoFile || isProcessing}
          className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-xs shadow-md disabled:opacity-40 hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          {isProcessing ? "Transcribing & Synthesizing Cross-Lingual Dub..." : `Dub Video into Spanish (${cost} cr)`}
        </button>
      </div>

      {dubbedAudioUrl && (
        <div className="pt-2 animate-in fade-in">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
            Translated & Dubbed Audio Track:
          </h3>
          <WaveformPlayer
            audioUrl={dubbedAudioUrl}
            duration={5.2}
            title="Spanish (Castilian) Neural Dub"
            subtitle="Vocal timbre matched to source speaker"
            autoPlay={true}
          />
        </div>
      )}
    </div>
  );
}
