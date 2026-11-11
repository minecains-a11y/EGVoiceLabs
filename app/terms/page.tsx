import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="p-6 max-w-4xl mx-auto py-12 text-zinc-300 space-y-6 text-xs sm:text-sm leading-relaxed">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-bold font-heading text-white">Terms of Service</h1>
        <p className="text-xs text-zinc-500 mt-1">Last Updated: February 2026</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">1. Acceptance of Terms</h2>
        <p>
          By accessing or using EGVoiceLabs ("EGVL", "Platform", or "Service"), you agree to be bound by these
          Terms of Service, our Privacy Policy, and our Acceptable Use Policy.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">2. Voice Cloning Authorization & Declarations</h2>
        <p>
          Users may only clone vocal profiles for which they possess sole ownership or documented, explicit legal
          authorization from the vocal owner. Creating synthetic clones of individuals without their consent constitutes
          grounds for immediate account termination and legal escalation.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">3. Intellectual Property & Commercial Rights</h2>
        <p>
          Subscribers on Starter, Creator, and Pro tiers retain full commercial exploitation rights to synthesized
          outputs. Audio generated under Free tier accounts is limited to non-commercial personal usage and includes
          imperceptible watermarks.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">4. Audio Watermarking & Authenticity</h2>
        <p>
          To protect against misuse, misinformation, and fraudulent deception, all synthesized audios include an
          embedded cryptographic ultrasonic watermark. Tampering with or stripping watermark signatures violates our
          acceptable use standards.
        </p>
      </section>
    </div>
  );
}
