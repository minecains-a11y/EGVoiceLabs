"use client";

import React from "react";
import { AudioQualityCheck } from "@/lib/types";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Activity } from "lucide-react";

interface QualityCheckerProps {
  quality: AudioQualityCheck | null;
}

export function QualityChecker({ quality }: QualityCheckerProps) {
  if (!quality) {
    return (
      <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-500 text-center">
        Upload or record an audio file to view automated acoustic quality diagnostics.
      </div>
    );
  }

  const scoreColor =
    quality.score >= 80
      ? "text-zinc-400"
      : quality.score >= 60
      ? "text-zinc-400"
      : "text-zinc-400";

  return (
    <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-cyan" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Acoustic Quality Analysis
          </h4>
        </div>
        <div className="flex items-center gap-1.5 font-heading">
          <span className="text-xs text-zinc-400">Score:</span>
          <span className={`text-sm font-bold ${scoreColor}`}>{quality.score}/100</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
          <span className="text-[10px] text-zinc-500 block mb-0.5">Background Noise</span>
          <span
            className={`font-semibold capitalize ${
              quality.noiseLevel === "low"
                ? "text-zinc-400"
                : quality.noiseLevel === "moderate"
                ? "text-zinc-400"
                : "text-zinc-400"
            }`}
          >
            {quality.noiseLevel}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
          <span className="text-[10px] text-zinc-500 block mb-0.5">Clipping / Distortion</span>
          <span className={`font-semibold ${quality.clippingDetected ? "text-zinc-400" : "text-zinc-400"}`}>
            {quality.clippingDetected ? "Detected (Bad)" : "Clean (No Clip)"}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
          <span className="text-[10px] text-zinc-500 block mb-0.5">Sample Duration</span>
          <span className="font-semibold text-white">{quality.durationSeconds}s</span>
        </div>
      </div>

      {/* Issues or Ready Checklist */}
      {quality.issues.length > 0 ? (
        <div className="space-y-1.5 pt-1">
          {quality.issues.map((issue, idx) => (
            <div key={idx} className="flex items-start gap-2 text-[11px] text-zinc-300">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-400" />
              <span>{issue}</span>
            </div>
          ))}
          {quality.recommendations.map((rec, idx) => (
            <div key={idx} className="text-[11px] text-zinc-400 italic pl-5">
              Tip: {rec}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-zinc-400 text-xs pt-1">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Acoustic sample meets professional high-fidelity voice cloning standards.</span>
        </div>
      )}
    </div>
  );
}
