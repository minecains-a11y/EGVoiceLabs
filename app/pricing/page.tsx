"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { Check, Zap, Sparkles, ShieldCheck, ArrowRight, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const { user } = useAppStore();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "For hobbyists, experimentation, and non-commercial testing.",
      credits: "10,000 credits/mo",
      features: [
        "EGVL Turbo model (ultra-low latency)",
        "SSML tag syntax support",
        "Watermarked audio output",
        "Non-commercial personal license",
        "Community support forum",
      ],
      notIncluded: [
        "Voice Cloning (Instant or Pro)",
        "Synthetic Voice Designer",
        "Commercial usage rights",
        "REST API access",
      ],
      buttonText: "Current Plan",
      tier: "Free" as const,
    },
    {
      name: "Starter",
      price: "$5",
      period: "per month",
      description: "For solo YouTubers, podcasters, and independent creators.",
      credits: "30,000 credits/mo",
      features: [
        "Preset-speaker TTS previews",
        "Multiple supported TTS languages",
        "Full commercial rights & monetization",
        "Downloadable WAV speech output",
        "Music & Sound Effects generation",
        "Standard queue priority",
      ],
      notIncluded: [
        "Voice cloning (not available yet)",
        "REST API keys & SDK access",
      ],
      buttonText: "Upgrade to Starter",
      tier: "Starter" as const,
    },
    {
      name: "Creator",
      price: "$22",
      period: "per month",
      popular: true,
      description: "For game developers, audio publishers, and production studios.",
      credits: "100,000 credits/mo",
      features: [
        "Expanded TTS generation credits",
        "Expressive speech controls",
        "WAV audio downloads",
        "Multitrack Project Studio export",
        "Voice Changer & Speech Isolation",
        "Priority GPU worker queue",
        "Dedicated creator email support",
      ],
      notIncluded: ["High-throughput API endpoints"],
      buttonText: "Upgrade to Creator",
      tier: "Creator" as const,
    },
    {
      name: "Pro",
      price: "$99",
      period: "per month",
      description: "For high-volume production teams, SaaS applications, and enterprise APIs.",
      credits: "500,000 credits/mo",
      features: [
        "Full REST API access & SDK keys",
        "Real-time WebSocket audio streaming",
        "Zero-concurrency limits (burst scaling)",
        "Unlimited Instant & Professional Clones",
        "Custom watermark tagging & verification",
        "SLA 99.9% uptime guarantee",
        "Dedicated account manager",
      ],
      notIncluded: [],
      buttonText: "Upgrade to Pro",
      tier: "Pro" as const,
    },
  ];

  const creditBreakdown = [
    { feature: "Text to Speech (EGVL Turbo)", cost: "1 credit per 25 characters" },
    { feature: "Text to Speech (EGVL Multilingual)", cost: "1 credit per 20 characters" },
    { feature: "Instant Voice Clone", cost: "500 credits per clone" },
    { feature: "Professional Voice Clone", cost: "2,500 credits per training run" },
    { feature: "Voice Designer Generation", cost: "100 credits per 3 variations" },
    { feature: "AI Music Generation", cost: "200 credits per track" },
    { feature: "Sound Effects Generation", cost: "80 credits per 4 takes" },
    { feature: "Voice Changer (Speech to Speech)", cost: "150 credits per run" },
    { feature: "Audio Isolation / Denoise", cost: "120 credits per minute" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-16 py-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-white">
          Predictable, Credit-Based Plans
        </h1>
        <p className="text-sm text-zinc-400">
          Compare credit tiers for your workflow. Paid plan checkout is not enabled yet.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => {
          const isCurrent = user?.plan === p.tier;
          return (
            <div
              key={p.name}
              className={`p-6 rounded-3xl flex flex-col justify-between transition-all relative ${
                p.popular
                  ? "bg-[#141414] border-2 border-white shadow-2xl"
                  : "bg-[#141414] border border-zinc-800"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-white text-black font-extrabold text-[10px] uppercase tracking-wider shadow-sm">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="font-heading font-bold text-lg text-white">{p.name}</h3>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-extrabold text-white">{p.price}</span>
                  <span className="text-xs text-zinc-400">/{p.period}</span>
                </div>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">{p.description}</p>

                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-brand-cyan font-mono text-xs font-semibold mb-6 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>{p.credits}</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-zinc-200">
                      <Check className="w-3.5 h-3.5 text-brand-cyan shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                  {p.notIncluded.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-zinc-600">
                      <span className="text-zinc-600 shrink-0 font-mono">✕</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {user ? (
                <button
                  disabled
                  aria-label={isCurrent ? `${p.name} is your active plan` : "Billing is not enabled"}
                  className={`w-full py-3 rounded-xl font-bold text-xs mt-8 transition-all ${
                    isCurrent ? "bg-zinc-800 text-zinc-400 cursor-default" : "bg-zinc-900 text-zinc-500 cursor-not-allowed"
                  }`}
                >
                  {isCurrent ? "Active Plan" : "Billing setup required"}
                </button>
              ) : (
                <Link href="/signup" className="block w-full py-3 rounded-xl font-bold text-xs mt-8 text-center bg-white text-black hover:bg-zinc-200 transition-colors">
                  Create a free account
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Credit Consumption Breakdown Table */}
      <div className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-6">
        <div>
          <h3 className="font-heading font-bold text-xl text-white">Credit Consumption Transparency</h3>
          <p className="text-xs text-zinc-400">
            See exactly how credits map to studio generations and long-running training jobs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {creditBreakdown.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between text-xs"
            >
              <span className="text-zinc-300 font-medium">{item.feature}</span>
              <span className="font-mono text-brand-cyan font-semibold">{item.cost}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
