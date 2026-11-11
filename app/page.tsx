"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mic2,
  Copy,
  Wand2,
  Music2,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Play,
  Pause,
  CheckCircle2,
  Sliders,
  AudioWaveform,
  Globe2,
  Headphones,
  Check,
  Volume2,
} from "lucide-react";
import { PREMADE_VOICES } from "@/lib/mock-data";
import { WaveformPlayer } from "@/components/waveform-player";
import { synthesizeTTSVoice } from "@/lib/audio-synth";

export default function LandingPage() {
  // Live Demo Box State
  const [demoText, setDemoText] = useState(
    "Welcome to EGVoiceLabs. Experience ultra-realistic neural speech synthesis, instant voice cloning, and AI soundscapes—all powered by our next-generation audio engine."
  );
  const [selectedVoice, setSelectedVoice] = useState(PREMADE_VOICES[0]);
  const [demoAudioUrl, setDemoAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const handleDemoGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const { audioUrl } = synthesizeTTSVoice(demoText, {
        voicePitch: selectedVoice.pitch,
        speed: selectedVoice.speed,
        tone: selectedVoice.tone,
      });
      setDemoAudioUrl(audioUrl);
      setIsGenerating(false);
    }, 600);
  };

  const faqs = [
    {
      q: "How does EGVoiceLabs ensure ethical and legal voice cloning?",
      a: "Every single voice clone on EGVL requires explicit legal consent and digital verification. For Professional Clones, users must read a live verification phrase that is acoustic-fingerprint matched. Additionally, our automated moderation engine proactively blocks cloning of all public figures, politicians, and protected celebrities.",
    },
    {
      q: "What is the difference between Instant and Professional Voice Cloning?",
      a: "Instant Cloning takes 1 to 5 minutes of clean audio and creates a synthetic neural voice replica in seconds, ideal for podcasts and videos. Professional Cloning requires 30+ minutes of studio-grade vocal recordings and trains a customized deep neural model capturing subtle intonations, emotional range, and whisper cadences.",
    },
    {
      q: "Are the generated audios watermarked?",
      a: "Yes. All audio synthesized through EGVL includes an invisible, tamper-resistant ultrasonic and metadata watermark. Anyone can verify authentic EGVL audio using our public AI Speech Classifier tool.",
    },
    {
      q: "Can I use generated voices and music commercially?",
      a: "Yes! All Starter, Creator, and Pro subscriptions include full commercial rights for YouTube, podcasts, audiobooks, advertising, video games, and film production.",
    },
    {
      q: "What languages are supported?",
      a: "EGVL supports over 29 languages with automatic language detection, native accent preservation, and cross-lingual voice transfer.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700 text-xs font-medium text-zinc-300">
            <span className="flex h-2 w-2 rounded-full bg-white animate-ping" />
            <span className="text-white font-semibold">EGVL 2.4 Engine Live:</span>
            <span>Zero-latency Multilingual Synthesis & MusicGen</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-heading leading-tight sm:leading-none">
            Your voice. Your sound. <br />
            <span className="text-zinc-500">
              Your lab.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed font-sans">
            The complete AI audio generation suite. Create lifelike text-to-speech, clone any voice with ethical consent,
            design synthetic voices, and compose original music and sound effects in seconds.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/studio/tts"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-black text-sm font-bold shadow-xl shadow-white/10 hover:shadow-white/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Mic2 className="w-4 h-4" />
              <span>Launch Studio for Free</span>
            </Link>

            <Link
              href="/voices"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-sm font-semibold hover:bg-zinc-800/80 transition-all"
            >
              <Headphones className="w-4 h-4 text-white" />
              <span>Explore Voice Library</span>
            </Link>
          </div>
        </div>

        {/* Live Interactive Demo Box */}
        <div className="max-w-4xl mx-auto mt-16 rounded-3xl bg-[#141414] border border-zinc-800 shadow-2xl">
          <div className="rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-zinc-400" />
                <h3 className="font-heading font-bold text-base sm:text-lg text-white">
                  Live Interactive Studio Preview
                </h3>
              </div>
              <span className="text-xs text-zinc-400 font-mono">Model: EGVL Multilingual-v2</span>
            </div>

            {/* Voice Quick Selectors */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                Select a Voice:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {PREMADE_VOICES.slice(0, 5).map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVoice(v)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedVoice.id === v.id
                        ? "bg-white border-white text-black shadow-md shadow-white/10"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                    }`}
                  >
                    <div className={`font-semibold text-xs ${selectedVoice.id === v.id ? "text-black" : "text-white"}`}>{v.name}</div>
                    <div className="text-[10px] text-zinc-500">{v.accent} • {v.gender}</div>
                    <div className={`text-[10px] truncate mt-1 ${selectedVoice.id === v.id ? "text-zinc-600" : "text-zinc-400"}`}>{v.labels[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Editor */}
            <div className="relative">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                Enter Text to Synthesize:
              </label>
              <textarea
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white transition-colors resize-none"
              />
              <div className="flex justify-between items-center text-xs text-zinc-500 mt-1">
                <span>{demoText.length} / 500 characters in live preview</span>
                <span>Watermark: EGVL-Secure</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                onClick={handleDemoGenerate}
                disabled={isGenerating || !demoText.trim()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-xs font-bold shadow-lg shadow-white/10 hover:shadow-white/20 disabled:opacity-50 transition-all"
              >
                {isGenerating ? (
                  <>
                    <AudioWaveform className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Voice...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Generate Speech Sample</span>
                  </>
                )}
              </button>

              <Link
                href="/studio/tts"
                className="text-xs font-semibold text-white hover:underline flex items-center gap-1"
              >
                <span>Open Full Studio with 5,000 char capacity & SSML tags</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Player */}
            {demoAudioUrl && (
              <div className="pt-2">
                <WaveformPlayer
                  audioUrl={demoAudioUrl}
                  title={`${selectedVoice.name} — Preview Sample`}
                  subtitle={`${selectedVoice.accent} • ${selectedVoice.useCase}`}
                  autoPlay={true}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-zinc-900 bg-zinc-950/50">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              All-In-One Sound Architecture
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
              Built for Storytellers, Developers, and Musicians
            </h3>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto">
              From individual voiceover clips to full-scale cinematic sound design, EGVL powers the entire audio pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: TTS Studio */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-zinc-800/80 hover:border-white/30 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-zinc-700 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Mic2 className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-bold text-lg text-white mb-2">Text-to-Speech Studio</h4>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Generate up to 5,000 characters per run. Control stability, similarity, style exaggeration, and insert
                  SSML tags like <code className="text-white">[whisper]</code> and <code className="text-white">[pause 1s]</code>.
                </p>
              </div>
              <Link href="/studio/tts" className="text-xs font-semibold text-white hover:underline flex items-center gap-1">
                Enter TTS Studio &rarr;
              </Link>
            </div>

            {/* Card 2: Voice Cloning */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-zinc-800/80 hover:border-white/30 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-zinc-700 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Copy className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-bold text-lg text-white mb-2">Instant & Pro Cloning</h4>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Clone voices in seconds or train deep 30+ minute neural models. Features built-in live acoustic verification
                  and strict anti-deepfake safeguards.
                </p>
              </div>
              <Link href="/studio/clone" className="text-xs font-semibold text-white hover:underline flex items-center gap-1">
                Explore Voice Cloning &rarr;
              </Link>
            </div>

            {/* Card 3: Voice Designer */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-zinc-800/80 hover:border-white/30 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-zinc-700 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Wand2 className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-bold text-lg text-white mb-2">Synthetic Voice Designer</h4>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Craft novel voices from pure attributes: gender, age, accent, pitch, raspy or warm timbre, and natural language prompts.
                </p>
              </div>
              <Link href="/studio/design" className="text-xs font-semibold text-white hover:underline flex items-center gap-1">
                Design New Voices &rarr;
              </Link>
            </div>

            {/* Card 4: Music Generator */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-zinc-800/80 hover:border-white/30 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-zinc-500/20 border border-zinc-500/40 text-zinc-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Music2 className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-bold text-lg text-white mb-2">AI Music Generator</h4>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Compose royalty-free songs, background lo-fi, synthwave, or epic scores with genre, BPM, key, and lyrics controls.
                </p>
              </div>
              <Link href="/studio/music" className="text-xs font-semibold text-white hover:underline flex items-center gap-1">
                Compose Music &rarr;
              </Link>
            </div>

            {/* Card 5: Sound Effects */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-zinc-800/80 hover:border-white/30 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-zinc-500/20 border border-zinc-500/40 text-zinc-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-bold text-lg text-white mb-2">Sound Effects Generator</h4>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Turn text descriptions into hyper-realistic sound effects, Foley textures, UI chimes, and ambient atmospheres.
                </p>
              </div>
              <Link href="/studio/sfx" className="text-xs font-semibold text-white hover:underline flex items-center gap-1">
                Generate SFX &rarr;
              </Link>
            </div>

            {/* Card 6: Project Timeline */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-zinc-800/80 hover:border-white/30 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-zinc-500/20 border border-zinc-500/40 text-zinc-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sliders className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-bold text-lg text-white mb-2">Multitrack Timeline</h4>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Arrange speech, music, and SFX clips along a synchronized multitrack DAW timeline. Adjust track levels, mute/solo, and export final mixes.
                </p>
              </div>
              <Link href="/projects" className="text-xs font-semibold text-white hover:underline flex items-center gap-1">
                Open Project Studio &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust, Legal & Safety Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-zinc-900 bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto rounded-3xl p-8 bg-zinc-900/60 border border-zinc-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/10 border border-zinc-700 text-white">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl text-white">Trust, Safety & Verification First</h3>
                <p className="text-xs text-zinc-400">Industry-leading anti-abuse and biometric security architecture.</p>
              </div>
            </div>
            <Link
              href="/classifier"
              className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-all"
            >
              Verify with AI Speech Classifier &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <h5 className="font-bold text-white mb-1">Protected Public Figures</h5>
              <p className="text-zinc-400">
                Automated name and voice matching prevents impersonation of political figures, celebrities, and unauthorized persons.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <h5 className="font-bold text-white mb-1">Invisible Ultrasonic Watermark</h5>
              <p className="text-zinc-400">
                All generated WAV and MP3 files encode an invisible cryptographic watermark identifying authentic EGVL neural synthesis.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <h5 className="font-bold text-white mb-1">GDPR & Sample Erasure</h5>
              <p className="text-zinc-400">
                Voice samples are completely under your control. Delete audio recordings and export your neural weights at any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-extrabold font-heading text-white">Transparent, Credit-Based Pricing</h3>
            <p className="text-xs text-zinc-400">Scale seamlessly from casual experimentation to enterprise APIs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Free */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
              <div>
                <h4 className="font-heading font-bold text-base text-white">Free</h4>
                <div className="text-3xl font-extrabold text-white mt-2 mb-1">$0</div>
                <p className="text-[11px] text-zinc-400 mb-4">Non-commercial experimentation</p>
                <ul className="space-y-2 text-xs text-zinc-300">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-white" /> 10,000 credits / month</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-white" /> Standard EGVL Turbo model</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-white" /> Watermarked audio</li>
                </ul>
              </div>
              <Link href="/studio/tts" className="mt-6 w-full py-2.5 rounded-xl bg-zinc-800 text-center text-xs font-semibold text-white hover:bg-zinc-700 transition-colors">
                Start Free
              </Link>
            </div>

            {/* Starter */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
              <div>
                <h4 className="font-heading font-bold text-base text-white">Starter</h4>
                <div className="text-3xl font-extrabold text-white mt-2 mb-1">$5 <span className="text-xs font-normal text-zinc-400">/ mo</span></div>
                <p className="text-[11px] text-zinc-400 mb-4">Content creators & podcasters</p>
                <ul className="space-y-2 text-xs text-zinc-300">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-white" /> 30,000 credits / month</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-white" /> Instant Voice Cloning (up to 3)</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-white" /> Commercial license included</li>
                </ul>
              </div>
              <Link href="/pricing" className="mt-6 w-full py-2.5 rounded-xl bg-zinc-800 text-center text-xs font-semibold text-white hover:bg-zinc-700 transition-colors">
                Upgrade to Starter
              </Link>
            </div>

            {/* Creator - Popular */}
            <div className="p-6 rounded-2xl bg-[#141414] border-2 border-white flex flex-col justify-between relative shadow-xl shadow-white/10">
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-white text-black font-extrabold text-[10px] uppercase tracking-wider">
                Most Popular
              </span>
              <div>
                <h4 className="font-heading font-bold text-base text-white">Creator</h4>
                <div className="text-3xl font-extrabold text-white mt-2 mb-1">$22 <span className="text-xs font-normal text-zinc-400">/ mo</span></div>
                <p className="text-[11px] text-zinc-400 mb-4">Professional studios & agencies</p>
                <ul className="space-y-2 text-xs text-zinc-200">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-white" /> 100,000 credits / month</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-white" /> Professional Cloning (30+ min train)</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-white" /> Full Voice Designer access</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-white" /> High-fidelity 192kbps exports</li>
                </ul>
              </div>
              <Link href="/pricing" className="mt-6 w-full py-2.5 rounded-xl bg-white text-center text-xs font-bold text-black shadow-md transition-all">
                Get Creator Plan
              </Link>
            </div>

            {/* Pro */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
              <div>
                <h4 className="font-heading font-bold text-base text-white">Pro</h4>
                <div className="text-3xl font-extrabold text-white mt-2 mb-1">$99 <span className="text-xs font-normal text-zinc-400">/ mo</span></div>
                <p className="text-[11px] text-zinc-400 mb-4">High-throughput teams & APIs</p>
                <ul className="space-y-2 text-xs text-zinc-300">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-white" /> 500,000 credits / month</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-white" /> Full Public API access & keys</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-white" /> Dedicated priority GPU worker queue</li>
                </ul>
              </div>
              <Link href="/pricing" className="mt-6 w-full py-2.5 rounded-xl bg-zinc-800 text-center text-xs font-semibold text-white hover:bg-zinc-700 transition-colors">
                Get Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-zinc-900">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold font-heading text-white">Frequently Asked Questions</h3>
            <p className="text-xs text-zinc-400">Everything you need to know about EGVoiceLabs.</p>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl bg-zinc-900/50 border border-zinc-800/80 overflow-hidden"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                  className="w-full p-4 text-left flex justify-between items-center text-sm font-semibold text-white hover:text-white transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-zinc-500 font-mono text-base ml-2">
                    {faqOpen === index ? "−" : "+"}
                  </span>
                </button>
                {faqOpen === index && (
                  <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#0A0A0A] py-12 px-4 sm:px-6 lg:px-8 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          <div className="col-span-2 space-y-3">
            <div className="font-heading font-extrabold text-lg text-white">
              EG<span className="text-white">Voice</span>Labs
            </div>
            <p className="text-xs text-zinc-400 max-w-sm">
              "Your voice. Your sound. Your lab." — Ultra-realistic text-to-speech, ethical voice cloning,
              synthetic voice design, and AI soundscapes.
            </p>
            <div className="text-[11px] text-zinc-500">
              © {new Date().getFullYear()} EGVoiceLabs Inc. All rights reserved.
            </div>
          </div>

          <div>
            <div className="font-semibold text-white mb-2">Studio Suite</div>
            <ul className="space-y-1.5">
              <li><Link href="/studio/tts" className="hover:text-white">Text to Speech</Link></li>
              <li><Link href="/studio/clone" className="hover:text-white">Voice Cloning</Link></li>
              <li><Link href="/studio/design" className="hover:text-white">Voice Designer</Link></li>
              <li><Link href="/studio/music" className="hover:text-white">Music Generator</Link></li>
              <li><Link href="/studio/sfx" className="hover:text-white">Sound Effects</Link></li>
              <li><Link href="/projects" className="hover:text-white">Projects Timeline</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-2">Trust & Safety</div>
            <ul className="space-y-1.5">
              <li><Link href="/classifier" className="hover:text-white">AI Speech Classifier</Link></li>
              <li><Link href="/acceptable-use" className="hover:text-white">Acceptable Use Policy</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy & GDPR</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/dmca" className="hover:text-white">DMCA & Copyright</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-2">Developers & Tools</div>
            <ul className="space-y-1.5">
              <li><Link href="/docs" className="hover:text-white">REST API Documentation</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Credit Packages</Link></li>
              <li><Link href="/voices" className="hover:text-white">Public Voice Library</Link></li>
              <li><Link href="/dashboard" className="hover:text-white">Usage Analytics</Link></li>
              <li><Link href="/admin" className="hover:text-white">Admin Portal</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
