import React from "react";
import { ShieldAlert, AlertTriangle } from "lucide-react";

export default function AcceptableUsePolicy() {
  return (
    <div className="p-6 max-w-4xl mx-auto py-12 text-zinc-300 space-y-6 text-xs sm:text-sm leading-relaxed">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-bold font-heading text-white flex items-center gap-2.5">
          <ShieldAlert className="w-8 h-8 text-zinc-500" />
          <span>Acceptable Use & Anti-Abuse Policy</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1">Zero-tolerance guidelines for AI audio generation.</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-zinc-400">1. Prohibited Vocal Cloning Targets</h2>
        <ul className="list-disc pl-5 space-y-1 text-zinc-300">
          <li>Heads of state, political candidates, elected representatives, or public election officials.</li>
          <li>Celebrities, musical artists, actors, or public figures without explicit written agency contracts.</li>
          <li>Non-consenting family members, colleagues, or private individuals.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-zinc-400">2. Prohibited Content Categories</h2>
        <ul className="list-disc pl-5 space-y-1 text-zinc-300">
          <li>Impersonation intended to defraud banks, credit institutions, or emergency services (voice phishing).</li>
          <li>Child sexual exploitation and abuse material (CSAM).</li>
          <li>Generation of non-consensual sexually explicit vocal content.</li>
          <li>Incitement to violence, terrorism, or targeted hate harassment.</li>
          <li>Imitating specific copyrighted song recordings or protected artist signatures for fraud.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">3. Enforcement & Reporting</h2>
        <p>
          Violations result in permanent hardware fingerprint bans, revocation of API keys, and notification to relevant
          regulatory and judicial authorities.
        </p>
      </section>
    </div>
  );
}
