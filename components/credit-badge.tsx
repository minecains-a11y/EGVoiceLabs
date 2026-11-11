"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import { Zap, X } from "lucide-react";

export function CreditBadge() {
  const { user } = useAppStore();
  const [showModal, setShowModal] = useState(false);

  if (!user) return null;

  const percentage = Math.min(100, Math.round((user.credits / user.maxCredits) * 100));

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 hover:border-white/40 hover:bg-zinc-800/60 transition-all text-xs font-medium text-zinc-200 shadow-inner"
        title="View credit balance"
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-black shadow-sm shadow-white/20">
          <Zap aria-hidden="true" className="w-3 h-3 fill-current" />
        </span>
        <span className="font-semibold text-white tracking-wide">{formatNumber(user.credits)}</span>
        <span className="text-zinc-400 text-[11px]">credits</span>
        <span className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden hidden sm:block" aria-label={`${percentage}% of monthly credits remaining`}>
          <span className="block h-full bg-white rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 border border-zinc-700 font-semibold uppercase hidden md:inline">
          {user.plan}
        </span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <section role="dialog" aria-modal="true" aria-labelledby="credit-dialog-title" className="relative w-full max-w-lg bg-[#141414] border border-zinc-800 rounded-2xl p-6 shadow-2xl text-white">
            <button
              onClick={() => setShowModal(false)}
              aria-label="Close credit balance dialog"
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X aria-hidden="true" className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-xl bg-white/10 border border-zinc-700 text-white"><Zap aria-hidden="true" className="w-6 h-6" /></div>
              <div>
                <h2 id="credit-dialog-title" className="font-heading text-lg font-bold">Credit balance</h2>
                <p className="text-xs text-zinc-400">Current plan: <span className="text-white font-semibold">{user.plan}</span></p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80 mb-4">
              <div className="flex justify-between items-end mb-2">
                <p><span className="text-2xl font-bold font-heading text-white">{formatNumber(user.credits)}</span><span className="text-xs text-zinc-400 ml-1.5">/ {formatNumber(user.maxCredits)} credits</span></p>
                <span className="text-xs font-semibold text-brand-cyan">{percentage}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full" style={{ width: `${percentage}%` }} /></div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Studio usage is checked and deducted on the server. Credit purchases and paid plan changes are not enabled yet.
            </p>
            <Link href="/pricing" onClick={() => setShowModal(false)} className="inline-flex mt-4 text-xs text-brand-cyan hover:underline font-semibold">
              View plan details
            </Link>
          </section>
        </div>
      )}
    </>
  );
}
