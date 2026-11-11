import React from "react";

export default function DmcaPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto py-12 text-zinc-300 space-y-6 text-xs sm:text-sm leading-relaxed">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-bold font-heading text-white">DMCA & Copyright Takedown Procedure</h1>
        <p className="text-xs text-zinc-500 mt-1">Designated Copyright Agent Notice</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">Notice & Takedown</h2>
        <p>
          EGVoiceLabs respects intellectual property rights. If you believe your voice, performance, or copyrighted
          musical work is being infringed or imitated without authorization on our platform, please submit a written
          notice to our designated agent:
        </p>
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 space-y-1">
          <div>Attn: Copyright & DMCA Compliance Officer</div>
          <div>EGVoiceLabs Inc.</div>
          <div>Email: legal@egvoicelabs.com</div>
          <div>Response turnaround: within 24 business hours</div>
        </div>
      </section>
    </div>
  );
}
