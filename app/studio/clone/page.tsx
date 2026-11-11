"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { AudioRecorder } from "@/components/audio-recorder";
import { QualityChecker } from "@/components/quality-checker";
import { ConsentModal } from "@/components/consent-modal";
import { CLONING_SCRIPTS } from "@/lib/mock-data";
import { AudioQualityCheck } from "@/lib/types";
import { moderateVoiceCloneName } from "@/lib/moderation";
import {
  Copy,
  Zap,
  Sparkles,
  UploadCloud,
  FileAudio,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Lock,
  Globe2,
  Trash2,
  Check,
} from "lucide-react";
import Link from "next/link";

export default function VoiceCloningStudio() {
  const { addVoice, deductCredits, user } = useAppStore();

  const [cloneType, setCloneType] = useState<"instant" | "professional">("instant");
  const [voiceName, setVoiceName] = useState("");
  const [description, setDescription] = useState("");
  const [accent, setAccent] = useState("American");
  const [gender, setGender] = useState<"female" | "male" | "non-binary">("female");
  const [labels, setLabels] = useState("Narrative, Custom");
  const [visibility, setVisibility] = useState<"private" | "shared">("private");

  // Sample files & recording
  const [audioSamples, setAudioSamples] = useState<{ name: string; size: string; quality?: AudioQualityCheck }[]>([]);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [qualityCheck, setQualityCheck] = useState<AudioQualityCheck | null>(null);
  const [activeScriptIndex, setActiveScriptIndex] = useState(0);

  // Consent & Training Flow
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentRecord, setConsentRecord] = useState<{ verified: boolean; phrase: string; timestamp: string } | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [clonedSuccess, setClonedSuccess] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);

  const cloneCost = cloneType === "instant" ? 500 : 2500;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newItems = files.map((f) => ({
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
    }));
    setAudioSamples([...audioSamples, ...newItems]);

    // Simulate quality check on upload
    setQualityCheck({
      noiseLevel: "low",
      clippingDetected: false,
      durationSeconds: cloneType === "instant" ? 75 : 1850,
      isAcceptable: true,
      sampleRate: 48000,
      score: 94,
      issues: [],
      recommendations: ["Acoustic dynamic range is excellent for neural training."],
    });
  };

  const removeSample = (index: number) => {
    setAudioSamples(audioSamples.filter((_, i) => i !== index));
    if (audioSamples.length <= 1 && !recordedBlob) {
      setQualityCheck(null);
    }
  };

  const handleRecordingComplete = (blob: Blob, quality: AudioQualityCheck) => {
    setRecordedBlob(blob);
    setQualityCheck(quality);
    setAudioSamples((prev) => [
      ...prev,
      {
        name: `In-Browser Live Recording (${quality.durationSeconds}s)`,
        size: `${(blob.size / 1024).toFixed(1)} KB`,
        quality,
      },
    ]);
  };

  const handleStartCloneFlow = () => {
    setModerationError(null);

    if (!voiceName.trim()) {
      alert("Please provide a name for your cloned voice.");
      return;
    }

    // Check public figure / celebrity protection
    const modResult = moderateVoiceCloneName(voiceName, description);
    if (!modResult.passed) {
      setModerationError(modResult.reason || "Public figure impersonation is prohibited.");
      return;
    }

    if (audioSamples.length === 0 && !recordedBlob) {
      alert("Please upload or record at least one voice sample first.");
      return;
    }

    // Require consent
    if (!consentRecord) {
      setShowConsentModal(true);
      return;
    }

    // Deduct credits and begin training
    const deducted = deductCredits(cloneCost);
    if (!deducted) return;

    setIsTraining(true);
    setTrainingProgress(0);

    const stepDuration = cloneType === "instant" ? 150 : 350;
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          setClonedSuccess(true);

          // Save voice to library
          addVoice({
            name: voiceName,
            description: description || `Custom ${cloneType} cloned neural voice.`,
            category: "cloned",
            gender: gender,
            age: "young",
            accent: accent,
            language: "English (US)",
            useCase: "Custom Narration",
            labels: labels.split(",").map((l) => l.trim()),
            isCloned: true,
            isShared: visibility === "shared",
            pitch: 1.0,
            speed: 1.0,
            qualityRating: cloneType === "professional" ? 4.98 : 4.88,
          });

          return 100;
        }
        return prev + (cloneType === "instant" ? 15 : 6);
      });
    }, stepDuration);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2.5">
            <Copy className="w-6 h-6 text-brand-cyan" />
            <span>Voice Cloning Studio</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Create high-fidelity digital replicas of authentic voices with strict consent verification.
          </p>
        </div>

        {/* Instant vs Professional Switcher */}
        <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs">
          <button
            onClick={() => setCloneType("instant")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              cloneType === "instant"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Instant Clone (1-5 min)</span>
          </button>
          <button
            onClick={() => setCloneType("professional")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              cloneType === "professional"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Professional Clone (30+ min)</span>
          </button>
        </div>
      </div>

      {/* Moderation Error Alert */}
      {moderationError && (
        <div className="p-4 rounded-xl bg-zinc-500/10 border border-zinc-500/30 text-zinc-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-zinc-400" />
          <div>
            <span className="font-semibold block">Safety & Policy Violation:</span>
            <span>{moderationError}</span>
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {clonedSuccess && (
        <div className="p-4 rounded-2xl bg-zinc-500/10 border border-zinc-500/30 text-zinc-300 text-xs flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-zinc-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">
                "{voiceName}" has been successfully cloned and added to your voice library!
              </span>
              <span>It is now ready for use across the Text-to-Speech Studio and Projects.</span>
            </div>
          </div>
          <Link
            href="/studio/tts"
            className="px-4 py-2 rounded-xl bg-zinc-500 text-black font-bold hover:bg-zinc-400 transition-colors whitespace-nowrap"
          >
            Open in TTS Studio &rarr;
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Voice Details & Audio Upload / Record (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Voice Metadata Form */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Voice Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Voice Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maya Narrator"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Accent
                </label>
                <select
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-brand-violet"
                >
                  <option value="American">American</option>
                  <option value="British">British</option>
                  <option value="Australian">Australian</option>
                  <option value="Canadian">Canadian</option>
                  <option value="Irish">Irish</option>
                  <option value="Indian">Indian</option>
                  <option value="Scandinavian">Scandinavian</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-brand-violet"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Labels / Tags
                </label>
                <input
                  type="text"
                  placeholder="e.g. Audiobook, Calm, Warm"
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-violet"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Description & Vocal Characteristics
              </label>
              <textarea
                rows={2}
                placeholder="Describe pacing, emotion, and recommended usage..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-violet resize-none"
              />
            </div>

            {/* Visibility Settings */}
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === "private"}
                  onChange={() => setVisibility("private")}
                  className="accent-brand-violet"
                />
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Private (Only you can use this voice)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === "shared"}
                  onChange={() => setVisibility("shared")}
                  className="accent-brand-cyan"
                />
                <Globe2 className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Share to EGVL Voice Marketplace</span>
              </label>
            </div>
          </div>

          {/* Audio Input: Record Live OR Upload Audio Files */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Voice Samples ({cloneType === "instant" ? "1-5 minutes" : "30+ minutes"})
              </h3>
              <span className="text-[11px] text-zinc-400">
                WAV, MP3, FLAC, or In-Browser Recording
              </span>
            </div>

            {/* In-Browser Live Recorder */}
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              onDeleteSample={() => {
                setRecordedBlob(null);
                setQualityCheck(null);
              }}
              minDurationSeconds={cloneType === "instant" ? 15 : 60}
            />

            {/* Drag & Drop File Upload Area */}
            <div className="relative border-2 border-dashed border-zinc-800 hover:border-brand-violet/50 rounded-2xl p-6 text-center transition-colors">
              <input
                type="file"
                multiple
                accept="audio/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-8 h-8 text-brand-cyan mx-auto mb-2" />
              <p className="text-xs font-semibold text-white mb-1">
                Drop audio files here or click to browse
              </p>
              <p className="text-[11px] text-zinc-500">
                Clean, echo-free recordings with consistent volume give the best results.
              </p>
            </div>

            {/* Uploaded Samples List */}
            {audioSamples.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-zinc-400">
                  Uploaded Vocal Samples ({audioSamples.length}):
                </div>
                {audioSamples.map((sample, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileAudio className="w-4 h-4 text-brand-cyan" />
                      <span className="font-medium text-white">{sample.name}</span>
                      <span className="text-zinc-500 font-mono text-[11px]">({sample.size})</span>
                    </div>
                    <button
                      onClick={() => removeSample(idx)}
                      className="text-zinc-500 hover:text-zinc-400 transition-colors p-1"
                      title="Delete sample"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scripts, Quality Checker & Training Action */}
        <div className="space-y-5">
          {/* Recommended Calibration Scripts */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <BookOpen className="w-4 h-4 text-brand-cyan" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Reading Calibration Scripts
              </h3>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {CLONING_SCRIPTS.map((script, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveScriptIndex(idx)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors ${
                    activeScriptIndex === idx
                      ? "bg-white text-black"
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  Script {idx + 1}
                </button>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed font-sans">
              <p className="font-semibold text-brand-cyan mb-1 text-[11px]">
                {CLONING_SCRIPTS[activeScriptIndex].title}:
              </p>
              "{CLONING_SCRIPTS[activeScriptIndex].text}"
            </div>
          </div>

          {/* Quality Diagnostics Card */}
          <QualityChecker quality={qualityCheck} />

          {/* Consent Status Card */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300">Mandatory Consent Record:</span>
              {consentRecord ? (
                <span className="text-zinc-400 font-semibold flex items-center gap-1 text-[11px]">
                  <Check className="w-3.5 h-3.5" /> Approved
                </span>
              ) : (
                <span className="text-zinc-400 text-[11px]">Required</span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500">
              {consentRecord
                ? `Authorized on ${new Date(consentRecord.timestamp).toLocaleTimeString()}`
                : "You must review and sign the legal consent declaration before cloning."}
            </p>
            {!consentRecord && (
              <button
                onClick={() => setShowConsentModal(true)}
                className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors mt-1"
              >
                Sign Consent & Verify Identity
              </button>
            )}
          </div>

          {/* Start Clone Button & Progress */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-brand-violet/30 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">Clone Cost:</span>
              <span className="font-bold text-white text-sm">{cloneCost} credits</span>
            </div>

            {isTraining ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5 text-brand-cyan font-medium animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" /> Training neural model...
                  </span>
                  <span className="font-mono">{trainingProgress}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-300"
                    style={{ width: `${trainingProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={handleStartCloneFlow}
                disabled={audioSamples.length === 0 && !recordedBlob}
                className="w-full py-3 rounded-xl bg-white disabled:opacity-40 disabled:pointer-events-none text-black text-xs font-bold shadow-lg shadow-white/10 hover:shadow-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {cloneType === "instant"
                  ? "Train Instant Voice Clone (Seconds)"
                  : "Queue Professional Training Job"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onConsentApproved={(rec) => setConsentRecord(rec)}
        isProfessional={cloneType === "professional"}
      />
    </div>
  );
}
