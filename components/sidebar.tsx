"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Mic2,
  Copy,
  Wand2,
  Music2,
  Sparkles,
  Layers,
  FolderKanban,
  Users2,
  ShieldAlert,
  Radio,
  Sliders,
  AudioWaveform,
  Languages,
} from "lucide-react";

export function StudioSidebar() {
  const pathname = usePathname();

  const primaryStudioItems = [
    {
      href: "/studio/tts",
      label: "Text to Speech",
      icon: Mic2,
      badge: "Core",
    },
    {
      href: "/studio/clone",
      label: "Voice Cloning",
      icon: Copy,
      badge: "Instant & Pro",
    },
    {
      href: "/studio/design",
      label: "Voice Designer",
      icon: Wand2,
    },
    {
      href: "/studio/music",
      label: "Music Generator",
      icon: Music2,
    },
    {
      href: "/studio/sfx",
      label: "Sound Effects",
      icon: Sparkles,
    },
  ];

  const toolsItems = [
    {
      href: "/studio/changer",
      label: "Voice Changer",
      icon: Radio,
      badge: "New",
    },
    {
      href: "/studio/isolate",
      label: "Audio Isolation",
      icon: Sliders,
    },
    {
      href: "/studio/dubbing",
      label: "AI Video Dubbing",
      icon: Languages,
    },
  ];

  const libraryItems = [
    {
      href: "/projects",
      label: "Project Timeline",
      icon: FolderKanban,
    },
    {
      href: "/library",
      label: "My Library",
      icon: Layers,
    },
    {
      href: "/voices",
      label: "Voice Marketplace",
      icon: Users2,
    },
    {
      href: "/classifier",
      label: "AI Speech Classifier",
      icon: ShieldAlert,
      badge: "Trust",
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-zinc-800/80 bg-[#0A0A0A]/60 p-4 space-y-6">
      {/* Studio Creation Suite */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-3 mb-2">
          Creation Studio
        </div>
        <nav className="space-y-1">
          {primaryStudioItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-zinc-800 text-white border border-brand-violet/40 shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-brand-cyan" : "text-zinc-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                      isActive
                        ? "bg-brand-cyan/20 text-brand-cyan"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Audio Tools & Labs */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-3 mb-2">
          Audio Labs & Extras
        </div>
        <nav className="space-y-1">
          {toolsItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-brand-violet/20 text-white border border-brand-violet/40"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-brand-cyan" : "text-zinc-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-pink/20 text-brand-pink font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Library, Projects & Trust */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-3 mb-2">
          Workspace & Safety
        </div>
        <nav className="space-y-1">
          {libraryItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-zinc-800 text-white font-semibold"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-brand-cyan" : "text-zinc-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-brand-cyan font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Banner */}
      <div className="mt-auto p-3 rounded-2xl bg-zinc-900 border border-brand-violet/20">
        <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1">
          <AudioWaveform className="w-4 h-4 text-brand-cyan animate-pulse" />
          <span>Live speech engine</span>
        </div>
        <p className="text-[11px] text-zinc-400 leading-tight">
          Gemini TTS with a device-voice fallback for previews.
        </p>
      </div>
    </aside>
  );
}
