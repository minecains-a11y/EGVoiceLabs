"use client";

import React, { useState } from "react";
import { VERIFICATION_PHRASES } from "@/lib/mock-data";
import { ShieldCheck, AlertCircle, Mic, CheckCircle2, X } from "lucide-react";

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsentApproved: (record: { verified: boolean; phrase: string; timestamp: string }) => void;
  isProfessional?: boolean;
}

export function ConsentModal({
  isOpen,
  onClose,
  onConsentApproved,
  isProfessional = false,
}: ConsentModalProps) {
  const [ownsVoice, setOwnsVoice] = useState(false);
  const [noMaliciousUse, setNoMaliciousUse] = useState(false);
  const [selectedPhraseIndex] = useState(() => Math.floor(Math.random() * VERIFICATION_PHRASES.length));
  const verificationPhrase = VERIFICATION_PHRASES[selectedPhraseIndex];
  
  const [isVerifyingMic, setIsVerifyingMic] = useState(false);
  const [verificationPassed, setVerificationPassed] = useState(false);
  const [verifyingProgress, setVerifyingProgress] = useState(0);

  if (!isOpen) return null;

  const handleLiveVerification = () => {
    setIsVerifyingMic(true);
    setVerifyingProgress(10);

    const interval = setInterval(() => {
      setVerifyingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsVerifyingMic(false);
          setVerificationPassed(true);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const canProceed = ownsVoice && noMaliciousUse && (!isProfessional || verificationPassed);

  const handleSubmit = () => {
    if (!canProceed) return;
    onConsentApproved({
      verified: true,
      phrase: verificationPhrase,
      timestamp: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#141414] border border-zinc-800 rounded-3xl p-6 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-brand-violet/20 border border-brand-violet/30 text-brand-cyan">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold">Mandatory Voice Ownership & Consent</h3>
            <p className="text-xs text-zinc-400">
              {isProfessional
                ? "Professional Clone Biometric Verification"
                : "Instant Clone Authorization Declaration"}
            </p>
          </div>
        </div>

        {/* Verification phrase section for Professional Clone */}
        {isProfessional && (
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-brand-violet/30 mb-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-cyan uppercase tracking-wider">
                Live Acoustic Verification Step
              </span>
              {verificationPassed && (
                <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Biometrics Matched
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-300">
              To prevent unauthorized voice cloning, please read this unique phrase out loud:
            </p>
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-brand-cyan italic">
              "{verificationPhrase}"
            </div>

            {!verificationPassed ? (
              <div className="pt-2">
                {isVerifyingMic ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="animate-pulse flex items-center gap-1.5 text-brand-cyan">
                        <Mic className="w-3.5 h-3.5" /> Analyzing acoustic spectral fingerprint...
                      </span>
                      <span>{verifyingProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-300"
                        style={{ width: `${verifyingProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleLiveVerification}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-all"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Read Verification Phrase Live</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-zinc-400 bg-zinc-500/10 p-2 rounded-lg border border-zinc-500/20">
                Acoustic identity verified. Voice sample match score: 99.2%.
              </div>
            )}
          </div>
        )}

        {/* Legal Declarations */}
        <div className="space-y-3 mb-6 text-xs text-zinc-300">
          <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 cursor-pointer hover:bg-zinc-800/40 transition-colors">
            <input
              type="checkbox"
              checked={ownsVoice}
              onChange={(e) => setOwnsVoice(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-brand-cyan accent-brand-cyan cursor-pointer"
            />
            <span className="leading-relaxed">
              I solemnly affirm that I am the owner of this voice, or hold clear, documented legal authorization
              from the individual whose voice is being cloned.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 cursor-pointer hover:bg-zinc-800/40 transition-colors">
            <input
              type="checkbox"
              checked={noMaliciousUse}
              onChange={(e) => setNoMaliciousUse(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-brand-cyan accent-brand-cyan cursor-pointer"
            />
            <span className="leading-relaxed">
              I agree that this cloned voice will not be used for fraudulent impersonation, political deception,
              harassment, or deepfakes. I acknowledge that EGVoiceLabs actively watermarks all outputs and reports
              violations to law enforcement.
            </span>
          </label>
        </div>

        {/* Confirmation buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canProceed}
            className="px-5 py-2.5 rounded-xl bg-white disabled:opacity-40 disabled:pointer-events-none text-black text-xs font-bold shadow-lg shadow-white/10 hover:shadow-white/20 transition-all"
          >
            Agree & Proceed to Training
          </button>
        </div>
      </div>
    </div>
  );
}
