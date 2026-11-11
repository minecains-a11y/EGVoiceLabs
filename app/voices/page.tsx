"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { PREMADE_VOICES } from "@/lib/mock-data";
import { synthesizeTTSVoice } from "@/lib/audio-synth";
import {
  Users2,
  Search,
  Filter,
  Volume2,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Star,
  Mic2,
  Share2,
  Check,
} from "lucide-react";
import Link from "next/link";

export default function VoiceMarketplacePage() {
  const { voices, toggleFavoriteVoice } = useAppStore();
  const [search, setSearch] = useState("");
  const [accentFilter, setAccentFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredVoices = voices.filter((v) => {
    const matchSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase()) ||
      v.labels.some((l) => l.toLowerCase().includes(search.toLowerCase()));
    const matchAccent = accentFilter === "all" || v.accent.toLowerCase() === accentFilter.toLowerCase();
    const matchGender = genderFilter === "all" || v.gender === genderFilter;
    return matchSearch && matchAccent && matchGender;
  });

  const handlePreviewVoice = (v: any) => {
    if (playingVoiceId === v.id) {
      setPlayingVoiceId(null);
      return;
    }
    setPlayingVoiceId(v.id);
    const { audioUrl, duration } = synthesizeTTSVoice(
      `Welcome to EGVoiceLabs. This is ${v.name}, ready to elevate your creative productions.`,
      { voicePitch: v.pitch, speed: v.speed, tone: v.tone }
    );
    const audio = new Audio(audioUrl);
    audio.play().catch(console.error);
    setTimeout(() => setPlayingVoiceId(null), duration * 1000);
  };

  const handleShare = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/voices#${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white flex items-center gap-3">
            <Users2 className="w-8 h-8 text-brand-cyan" />
            <span>Public Voice Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Discover thousands of high-fidelity synthetic, cloned, and verified narrator voices for your projects.
          </p>
        </div>

        <Link
          href="/studio/clone"
          className="px-4 py-2.5 rounded-xl bg-white text-black text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
        >
          + Clone & Publish Voice
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by voice name, vibe, or style..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-cyan"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* Gender */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none"
          >
            <option value="all">All Genders</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="non-binary">Non-binary</option>
          </select>

          {/* Accent */}
          <select
            value={accentFilter}
            onChange={(e) => setAccentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none"
          >
            <option value="all">All Accents</option>
            <option value="American">American</option>
            <option value="British">British</option>
            <option value="Australian">Australian</option>
            <option value="Scandinavian">Scandinavian</option>
          </select>
        </div>
      </div>

      {/* Voice Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVoices.map((voice) => {
          const isPlaying = playingVoiceId === voice.id;
          return (
            <div
              key={voice.id}
              id={voice.id}
              className="p-5 rounded-2xl bg-[#141414] border border-zinc-800 hover:border-brand-violet/50 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-brand-violet/30 flex items-center justify-center font-heading font-extrabold text-white text-base shadow-inner">
                      {voice.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-base text-white group-hover:text-brand-cyan transition-colors">
                        {voice.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                        <span>{voice.accent}</span>
                        <span>•</span>
                        <span className="capitalize">{voice.gender}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-zinc-400">
                    <button
                      onClick={() => toggleFavoriteVoice(voice.id)}
                      className="p-1.5 hover:text-zinc-400 transition-colors"
                      title="Bookmark"
                    >
                      {voice.isFavorite ? (
                        <BookmarkCheck className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleShare(voice.id)}
                      className="p-1.5 hover:text-white transition-colors"
                      title="Share link"
                    >
                      {copiedId === voice.id ? (
                        <Check className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                  {voice.description}
                </p>

                {/* Rating & Labels */}
                <div className="flex items-center justify-between text-xs mb-4">
                  <div className="flex items-center gap-1 text-zinc-400 font-semibold font-mono text-[11px]">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{voice.qualityRating || 4.9}</span>
                    <span className="text-zinc-500 font-normal">
                      ({(voice.sampleCount || 12000).toLocaleString()} gens)
                    </span>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-brand-cyan font-medium">
                    {voice.useCase}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-2 pt-3 border-t border-zinc-800/80">
                <button
                  onClick={() => handlePreviewVoice(voice)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                    isPlaying
                      ? "bg-white text-black"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isPlaying ? "Playing Sample..." : "Play Preview"}</span>
                </button>

                <Link
                  href="/studio/tts"
                  className="px-4 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
                >
                  <Mic2 className="w-3.5 h-3.5" />
                  <span>Use Voice</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
