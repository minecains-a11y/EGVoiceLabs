"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import { Zap, Sparkles, X, PlusCircle, Check } from "lucide-react";
import Link from "next/link";

export function CreditBadge() {
  const { user, addCredits, updateUserPlan } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  const percentage = Math.min(100, Math.round((user.credits / user.maxCredits) * 100));

  const handleTopUp = (amount: number) => {
    addCredits(amount);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 hover:border-white/40 hover:bg-zinc-800/60 transition-all text-xs font-medium text-zinc-200 group shadow-inner"
        title="Manage credits and plan"
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-black shadow-sm shadow-white/20">
          <Zap className="w-3 h-3 fill-current" />
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-white tracking-wide">{formatNumber(user.credits)}</span>
          <span className="text-zinc-400 text-[11px]">credits</span>
        </div>
        <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden hidden sm:block">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 border border-zinc-700 font-semibold uppercase hidden md:inline">
          {user.plan}
        </span>
      </button>

      {/* Credit & Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#141414] border border-zinc-800 rounded-2xl p-6 shadow-2xl text-white">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-white/10 border border-zinc-700 text-white">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold">Credit Balance & Top-Up</h3>
                <p className="text-xs text-zinc-400">Current Plan: <span className="text-white font-semibold">{user.plan}</span></p>
              </div>
            </div>

            {/* Current Balance Bar */}
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80 mb-5">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-2xl font-bold font-heading text-white">{formatNumber(user.credits)}</span>
                  <span className="text-xs text-zinc-400 ml-1.5">/ {formatNumber(user.maxCredits)} credits remaining</span>
                </div>
                <span className="text-xs font-semibold text-brand-cyan">{percentage}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {addedNotice && (
              <div className="mb-4 p-2.5 bg-zinc-500/10 border border-zinc-500/30 rounded-xl flex items-center gap-2 text-zinc-400 text-xs">
                <Check className="w-4 h-4" /> Credits added to your balance successfully!
              </div>
            )}

            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
              Instant Credit Top-Up (Simulation)
            </h4>
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              <button
                onClick={() => handleTopUp(5000)}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-brand-violet hover:bg-zinc-800/70 transition-all text-center group"
              >
                <div className="text-sm font-bold text-white group-hover:text-brand-cyan">+5,000</div>
                <div className="text-[11px] text-zinc-400">$3.00</div>
              </button>
              <button
                onClick={() => handleTopUp(20000)}
                className="p-3 rounded-xl bg-zinc-800 border border-brand-violet/40 hover:border-brand-cyan transition-all text-center group"
              >
                <div className="text-sm font-bold text-white group-hover:text-brand-cyan">+20,000</div>
                <div className="text-[11px] text-brand-cyan font-medium">Popular • $10.00</div>
              </button>
              <button
                onClick={() => handleTopUp(50000)}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-brand-violet hover:bg-zinc-800/70 transition-all text-center group"
              >
                <div className="text-sm font-bold text-white group-hover:text-brand-cyan">+50,000</div>
                <div className="text-[11px] text-zinc-400">$22.00</div>
              </button>
            </div>

            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
              Change Subscription Plan
            </h4>
            <div className="grid grid-cols-2 gap-2 mb-5 text-xs">
              {(["Free", "Starter", "Creator", "Pro"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => updateUserPlan(p)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    user.plan === p
                      ? "bg-white border-white text-black"
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                  }`}
                >
                  <span className="font-semibold">{p}</span>
                  {user.plan === p ? (
                    <span className="text-[10px] text-brand-cyan flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400">Switch</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs text-zinc-400">
              <span>Need high volume enterprise quota?</span>
              <Link
                href="/pricing"
                onClick={() => setShowModal(false)}
                className="text-brand-cyan hover:underline font-semibold"
              >
                View Plans & Features &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
