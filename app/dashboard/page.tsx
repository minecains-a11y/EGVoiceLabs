"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import {
  Layers,
  Zap,
  Mic2,
  Music2,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, generations, voices } = useAppStore();

  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold font-heading text-white">Your workspace awaits</h1>
        <p className="mt-2 text-sm text-zinc-400">Sign in to see your saved usage and studio history.</p>
        <Link href="/login" className="inline-flex mt-5 px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold">Sign in</Link>
      </div>
    );
  }

  const ttsCount = generations.filter((g) => g.type === "tts").length;
  const musicCount = generations.filter((g) => g.type === "music").length;
  const sfxCount = generations.filter((g) => g.type === "sfx").length;
  const totalDuration = generations.reduce((acc, curr) => acc + (curr.duration || 0), 0);

  const percentage = Math.round((user.credits / user.maxCredits) * 100);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
            Workspace Dashboard & Usage
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time analytics, credit quota metrics, and audio generation records.
          </p>
        </div>

        <Link
          href="/pricing"
          className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
        >
          Manage Plan & Credits
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Credits Remaining */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Remaining Credits</span>
            <Zap className="w-4 h-4 text-brand-cyan" />
          </div>
          <div className="text-2xl font-extrabold font-heading text-white">
            {formatNumber(user.credits)}
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            {percentage}% of {formatNumber(user.maxCredits)} ({user.plan} plan)
          </span>
        </div>

        {/* Total Audio Synthesized */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Synthesized Audio</span>
            <Clock className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-extrabold font-heading text-white">
            {Math.round(totalDuration)} <span className="text-sm font-normal text-zinc-400">sec</span>
          </div>
          <span className="text-[10px] text-zinc-500 block">
            Across {generations.length} total audio renders
          </span>
        </div>

        {/* Voices in Library */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Active Voices</span>
            <Mic2 className="w-4 h-4 text-brand-pink" />
          </div>
          <div className="text-2xl font-extrabold font-heading text-white">
            {voices.length}
          </div>
          <span className="text-[10px] text-zinc-500 block">
            {voices.filter((v) => v.category === "cloned").length} Cloned • {voices.filter((v) => v.category === "designed").length} Designed
          </span>
        </div>

        {/* Security & Watermarks */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Watermark Status</span>
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-heading text-zinc-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" /> 100% Protected
          </div>
          <span className="text-[10px] text-zinc-500 block">
            Ultrasonic-V2 embedded on all files
          </span>
        </div>
      </div>

      {/* Feature Generation Breakdown */}
      <div className="p-6 rounded-2xl bg-[#141414] border border-zinc-800 space-y-4">
        <h3 className="font-heading font-bold text-sm text-white">Generations by Feature</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-white/20 text-white">
                <Mic2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Text to Speech</span>
                <span className="text-[11px] text-zinc-500">Neural Synthesized</span>
              </div>
            </div>
            <span className="font-heading font-bold text-lg text-white">{ttsCount}</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-brand-cyan/20 text-brand-cyan">
                <Music2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Music Generation</span>
                <span className="text-[11px] text-zinc-500">BeatSync Engine</span>
              </div>
            </div>
            <span className="font-heading font-bold text-lg text-white">{musicCount}</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-zinc-500/20 text-zinc-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Sound Effects</span>
                <span className="text-[11px] text-zinc-500">SoundGen Foley</span>
              </div>
            </div>
            <span className="font-heading font-bold text-lg text-white">{sfxCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
