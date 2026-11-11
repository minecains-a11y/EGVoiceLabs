"use client";

import { useMemo, useState } from "react";
import type { Voice } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { VoicePreviewButton } from "@/components/voice-preview-button";
import {
  Search,
  Check,
  ChevronDown,
  UserCheck,
  Wand2,
} from "lucide-react";

interface VoicePickerProps {
  selectedVoiceId: string;
  onSelectVoice: (voice: Voice) => void;
}

export function VoicePicker({ selectedVoiceId, onSelectVoice }: VoicePickerProps) {
  const { voices } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [ageFilter, setAgeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [useCaseFilter, setUseCaseFilter] = useState<string>("all");

  const selectedVoice = useMemo(() => {
    return voices.find((v) => v.id === selectedVoiceId) || voices[0];
  }, [voices, selectedVoiceId]);

  // Unique use cases from voice list
  const useCases = useMemo(() => {
    const set = new Set<string>();
    voices.forEach((v) => {
      if (v.useCase) set.add(v.useCase);
    });
    return Array.from(set);
  }, [voices]);

  const filteredVoices = useMemo(() => {
    return voices.filter((v) => {
      const matchSearch =
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.description.toLowerCase().includes(search.toLowerCase()) ||
        v.accent.toLowerCase().includes(search.toLowerCase()) ||
        v.labels.some((l) => l.toLowerCase().includes(search.toLowerCase()));

      const matchGender = genderFilter === "all" || v.gender === genderFilter;
      const matchAge = ageFilter === "all" || v.age === ageFilter;
      const matchCat = categoryFilter === "all" || v.category === categoryFilter;
      const matchUseCase = useCaseFilter === "all" || v.useCase === useCaseFilter;

      return matchSearch && matchGender && matchAge && matchCat && matchUseCase;
    });
  }, [voices, search, genderFilter, ageFilter, categoryFilter, useCaseFilter]);

  return (
    <div className="relative">
      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-300">
        <span>Selected Voice</span>
        <span className="text-[11px] font-normal lowercase text-zinc-400">
          {voices.length} voices available
        </span>
      </div>

      {/* Selected Voice Trigger Button */}
      <div className="w-full flex items-center justify-between gap-2 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-brand-violet/50 transition-all shadow-sm group">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="voice-picker-options"
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-brand-violet/40 flex items-center justify-center text-white font-bold text-sm shadow-inner">
            {selectedVoice.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white group-hover:text-brand-cyan transition-colors">
                {selectedVoice.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                {selectedVoice.accent}
              </span>
              {selectedVoice.category === "cloned" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 flex items-center gap-0.5">
                  <UserCheck className="w-2.5 h-2.5" /> Cloned
                </span>
              )}
              {selectedVoice.category === "designed" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-pink/20 text-brand-pink border border-brand-pink/30 flex items-center gap-0.5">
                  <Wand2 className="w-2.5 h-2.5" /> Designed
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 line-clamp-1 max-w-sm sm:max-w-md">
              {selectedVoice.description}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <VoicePreviewButton
            voice={selectedVoice}
            className="rounded-lg bg-zinc-800 p-2 text-zinc-300 hover:bg-zinc-700 aria-pressed:bg-white aria-pressed:text-black"
          />
          <ChevronDown
            className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Voice Picker Dropdown Modal */}
      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close voice selector"
            onClick={() => setIsOpen(false)}
          />
            <div id="voice-picker-options" role="region" aria-label="Voice choices" className="absolute left-0 right-0 top-full mt-2 z-50 p-4 rounded-2xl bg-[#141414] border border-zinc-800 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by voice name, accent, or use-case..."
                aria-label="Search voices"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-violet"
                autoFocus
              />
            </div>

            {/* Filter Pills */}
            <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
              {/* Category Filter */}
              <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800">
                {["all", "premade", "cloned", "designed"].map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      aria-pressed={categoryFilter === cat}
                      onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                      categoryFilter === cat
                        ? "bg-white text-black font-medium"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Gender Filter */}
              <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800">
                {["all", "female", "male"].map((g) => (
                    <button
                      type="button"
                      key={g}
                      aria-pressed={genderFilter === g}
                      onClick={() => setGenderFilter(g)}
                    className={`px-2 py-1 rounded-md capitalize transition-colors ${
                      genderFilter === g
                        ? "bg-white text-black font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <select
                aria-label="Filter by age"
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] focus:outline-none"
              >
                <option value="all">All Ages</option>
                {['young', 'middle-aged', 'old'].map((age) => (
                  <option key={age} value={age}>{age.replace('-', ' ')}</option>
                ))}
              </select>

              {/* Use Case Filter */}
              <select
                aria-label="Filter by use case"
                value={useCaseFilter}
                onChange={(e) => setUseCaseFilter(e.target.value)}
                className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] focus:outline-none"
              >
                <option value="all">All Use Cases</option>
                {useCases.map((uc) => (
                  <option key={uc} value={uc}>
                    {uc}
                  </option>
                ))}
              </select>
            </div>

            {/* Voices List */}
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
              {filteredVoices.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  No voices match your filters.
                </div>
              ) : (
                filteredVoices.map((voice) => {
                  const isSelected = voice.id === selectedVoice.id;

                  return (
                    <div
                      key={voice.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-white border-white text-black"
                          : "bg-zinc-900/50 border-zinc-800/80 hover:bg-zinc-800/60 hover:border-zinc-700 text-zinc-300"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelectVoice(voice);
                          setIsOpen(false);
                        }}
                        className="flex min-w-0 flex-1 items-center gap-2.5 pr-2 text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0">
                          {voice.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-xs text-white">
                              {voice.name}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              • {voice.accent}
                            </span>
                            <span className="text-[10px] text-zinc-400 capitalize">
                              • {voice.gender}
                            </span>
                            <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400">
                              {voice.useCase}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {voice.description}
                          </p>
                        </div>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <VoicePreviewButton
                          voice={voice}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-700 hover:text-white aria-pressed:bg-white aria-pressed:text-black"
                        />
                        {isSelected && <Check className="w-4 h-4 text-brand-cyan ml-1" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
