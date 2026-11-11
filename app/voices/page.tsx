"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { VoicePreviewButton } from "@/components/voice-preview-button";
import {
  Users2,
  Search,
  Bookmark,
  BookmarkCheck,
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
            <span>Voice Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Preview each speaker live, then bring that preset into your studio. Device speech is available when AI audio is offline.
          </p>
        </div>

        <Link
          href="/studio/design"
          className="px-4 py-2.5 rounded-xl bg-white text-black text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
        >
          + Create Voice Profile
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
        <span className="rounded-full border border-brand-cyan/20 bg-brand-cyan/10 px-3 py-1 text-brand-cyan">{voices.length} voice presets</span>
        <span>Custom profiles are approximations, not source-voice clones. Audio is rendered on demand.</span>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, accent, or style..."
            aria-label="Search voices"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-cyan"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* Gender */}
          <select
            aria-label="Filter by gender"
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
            aria-label="Filter by accent"
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
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredVoices.map((voice, index) => (
          <article
            key={voice.id}
            id={voice.id}
            style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}
            className="voice-card-enter group flex flex-col justify-between rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-brand-cyan/40 hover:shadow-brand-cyan/5"
          >
            <div>
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-violet/30 bg-zinc-800 font-heading text-base font-extrabold text-white shadow-inner">
                    {voice.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-heading text-base font-bold text-white transition-colors group-hover:text-brand-cyan">
                      {voice.name}
                    </h2>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span>{voice.accent}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{voice.gender}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-zinc-400">
                  <button
                    type="button"
                    onClick={() => toggleFavoriteVoice(voice.id)}
                    className="rounded-lg p-1.5 transition-colors hover:text-zinc-200"
                    title={voice.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    aria-label={voice.isFavorite ? `Remove ${voice.name} from favorites` : `Add ${voice.name} to favorites`}
                    aria-pressed={Boolean(voice.isFavorite)}
                  >
                    {voice.isFavorite ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(voice.id)}
                    className="rounded-lg p-1.5 transition-colors hover:text-white"
                    title="Share link"
                    aria-label={`Copy a link to ${voice.name}`}
                  >
                    {copiedId === voice.id ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-zinc-400">{voice.description}</p>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                {voice.labels.slice(0, 2).map((label) => (
                  <span key={label} className="rounded-full border border-zinc-800 bg-zinc-950/70 px-2.5 py-1 text-[10px] text-zinc-300">
                    {label}
                  </span>
                ))}
                <span className="rounded-full border border-brand-cyan/20 bg-brand-cyan/10 px-2.5 py-1 text-[10px] font-medium text-brand-cyan">
                  {voice.useCase}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-zinc-800/80 pt-3">
              <VoicePreviewButton
                voice={voice}
                label="Play preview"
                playingLabel="Playing sample"
                className="flex-1 rounded-xl bg-zinc-800 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 aria-pressed:bg-brand-cyan aria-pressed:text-zinc-950"
              />
              <Link
                href={`/studio/tts?voice=${encodeURIComponent(voice.id)}`}
                className="flex items-center gap-1 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black transition-all hover:scale-105 active:scale-95"
              >
                <Mic2 className="h-3.5 w-3.5" />
                <span>Use Voice</span>
              </Link>
            </div>
          </article>
        ))}
        {filteredVoices.length === 0 && (
          <div className="col-span-full rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center text-sm text-zinc-400">
            No voices match those filters. Try a different accent or search term.
          </div>
        )}
      </div>
    </div>
  );
}
