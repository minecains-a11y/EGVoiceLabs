"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { WaveformPlayer } from "@/components/waveform-player";
import { synthesizeTTSVoice } from "@/lib/audio-synth";
import {
  Layers,
  Mic2,
  Music2,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Trash2,
  Volume2,
  Copy,
  Wand2,
  Search,
  Filter,
} from "lucide-react";
import Link from "next/link";

export default function MyLibraryPage() {
  const {
    voices,
    generations,
    deleteVoice,
    toggleFavoriteVoice,
    deleteGeneration,
    toggleFavoriteGeneration,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<"voices" | "generations" | "favorites">("voices");
  const [genFilter, setGenFilter] = useState<"all" | "tts" | "music" | "sfx">("all");
  const [search, setSearch] = useState("");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Filtered Voices
  const filteredVoices = voices.filter((v) => {
    const matchSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase()) ||
      v.accent.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  // Filtered Generations
  const filteredGenerations = generations.filter((g) => {
    const matchType = genFilter === "all" || g.type === genFilter;
    const matchSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.prompt.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  // Favorites
  const favoriteVoices = voices.filter((v) => v.isFavorite);
  const favoriteGens = generations.filter((g) => g.isFavorite);

  const handlePreviewVoice = (v: any) => {
    if (playingVoiceId === v.id) {
      setPlayingVoiceId(null);
      return;
    }
    setPlayingVoiceId(v.id);
    const { audioUrl, duration } = synthesizeTTSVoice(
      `Hello! I am ${v.name}, recorded and synthesized in EGVoiceLabs.`,
      { voicePitch: v.pitch, speed: v.speed, tone: v.tone }
    );
    const audio = new Audio(audioUrl);
    audio.play().catch(console.error);
    setTimeout(() => setPlayingVoiceId(null), duration * 1000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-brand-cyan" />
            <span>My Library & Audio Vault</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Organize and manage your custom voices, cloned models, and audio generations.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab("voices")}
            className={`px-4 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "voices"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            My Voices ({voices.length})
          </button>
          <button
            onClick={() => setActiveTab("generations")}
            className={`px-4 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "generations"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Generations ({generations.length})
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-4 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "favorites"
                ? "bg-zinc-400 text-black font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Favorites ({favoriteVoices.length + favoriteGens.length})
          </button>
        </div>
      </div>

      {/* Search & Sub-Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search audio, prompts, or voices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-cyan"
          />
        </div>

        {activeTab === "generations" && (
          <div className="flex items-center gap-1.5 text-xs bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            {(["all", "tts", "music", "sfx"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setGenFilter(t)}
                className={`px-3 py-1 rounded-lg uppercase tracking-wider text-[10px] font-semibold transition-colors ${
                  genFilter === t ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: VOICES */}
      {activeTab === "voices" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVoices.map((voice) => {
            const isPlaying = playingVoiceId === voice.id;
            return (
              <div
                key={voice.id}
                className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-brand-violet/30 flex items-center justify-center font-bold text-white text-sm">
                        {voice.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-white">{voice.name}</h4>
                        <span className="text-[10px] text-zinc-400">
                          {voice.accent} • {voice.gender}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavoriteVoice(voice.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-400 transition-colors"
                        title="Favorite"
                      >
                        {voice.isFavorite ? (
                          <BookmarkCheck className="w-4 h-4 text-zinc-400" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>

                      {voice.category !== "premade" && (
                        <button
                          onClick={() => deleteVoice(voice.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-400 transition-colors"
                          title="Delete voice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
                    {voice.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-950 text-brand-cyan border border-zinc-800 font-medium">
                      {voice.useCase}
                    </span>
                    {voice.category === "cloned" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 flex items-center gap-1">
                        <Copy className="w-2.5 h-2.5" /> Cloned
                      </span>
                    )}
                    {voice.category === "designed" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-brand-pink/20 text-brand-pink border border-brand-pink/30 flex items-center gap-1">
                        <Wand2 className="w-2.5 h-2.5" /> Designed
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-zinc-800/80">
                  <button
                    onClick={() => handlePreviewVoice(voice)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                      isPlaying
                        ? "bg-white text-black"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPlaying ? "Playing..." : "Preview Voice"}</span>
                  </button>

                  <Link
                    href={`/studio/tts`}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-white text-white hover:text-black text-xs font-semibold transition-colors"
                    title="Use in Studio"
                  >
                    <Mic2 className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: GENERATIONS */}
      {activeTab === "generations" && (
        <div className="space-y-4">
          {filteredGenerations.length === 0 ? (
            <div className="p-16 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 text-zinc-400 text-xs">
              No generations found matching your search. Create audio clips in the Studio!
            </div>
          ) : (
            filteredGenerations.map((gen) => (
              <div
                key={gen.id}
                className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {gen.type === "tts" ? (
                      <Mic2 className="w-4 h-4 text-brand-violet" />
                    ) : gen.type === "music" ? (
                      <Music2 className="w-4 h-4 text-brand-cyan" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-zinc-400" />
                    )}
                    <h4 className="font-semibold text-xs text-white">{gen.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 uppercase font-mono">
                      {gen.model}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleFavoriteGeneration(gen.id)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-400 transition-colors"
                      title="Favorite"
                    >
                      {gen.isFavorite ? (
                        <BookmarkCheck className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteGeneration(gen.id)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 font-sans italic">"{gen.prompt}"</p>

                <WaveformPlayer
                  audioUrl={gen.audioUrl}
                  duration={gen.duration}
                  title={gen.title}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: FAVORITES */}
      {activeTab === "favorites" && (
        <div className="space-y-6">
          {favoriteVoices.length === 0 && favoriteGens.length === 0 ? (
            <div className="p-16 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 text-zinc-400 text-xs">
              No favorites saved yet. Click the bookmark icon on any voice or generation!
            </div>
          ) : (
            <>
              {favoriteVoices.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-heading font-bold text-sm text-white">Favorite Voices:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {favoriteVoices.map((v) => (
                      <div
                        key={v.id}
                        className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-xs text-white">{v.name}</div>
                          <div className="text-[10px] text-zinc-400">{v.accent} • {v.useCase}</div>
                        </div>
                        <button
                          onClick={() => toggleFavoriteVoice(v.id)}
                          className="text-zinc-400 p-1"
                        >
                          <BookmarkCheck className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {favoriteGens.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-heading font-bold text-sm text-white">Favorite Audio Clips:</h3>
                  {favoriteGens.map((gen) => (
                    <WaveformPlayer
                      key={gen.id}
                      audioUrl={gen.audioUrl}
                      duration={gen.duration}
                      title={gen.title}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
