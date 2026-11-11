"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Code2 } from "lucide-react";

export default function ApiDocsPage() {
  const { user } = useAppStore();
  const [selectedLang, setSelectedLang] = useState<"curl" | "python" | "typescript">("curl");
  const curlSnippet = `curl -X POST "https://api.egvoicelabs.com/v1/text-to-speech" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Hello from EGVoiceLabs API!",
    "voice_id": "v_rachel",
    "model": "egvl-multilingual-v2",
    "stability": 0.75,
    "speed": 1.0
  }' --output speech.wav`;

  const pythonSnippet = `import requests

url = "https://api.egvoicelabs.com/v1/text-to-speech"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "text": "Hello from EGVoiceLabs API!",
    "voice_id": "v_rachel",
    "model": "egvl-multilingual-v2",
    "stability": 0.75
}

response = requests.post(url, json=payload, headers=headers)
with open("speech.wav", "wb") as f:
    f.write(response.content)`;

  const tsSnippet = `import { EGVLClient } from "@egvl/sdk";

const egvl = new EGVLClient({
  apiKey: "YOUR_API_KEY"
});

const audio = await egvl.tts.generate({
  text: "Hello from EGVoiceLabs API!",
  voiceId: "v_rachel",
  model: "egvl-multilingual-v2"
});

await audio.save("./speech.wav");`;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10 py-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-violet/20 text-brand-cyan border border-brand-violet/30 text-xs font-semibold">
          <Code2 className="w-4 h-4" />
          <span>EGVL REST API v1.0</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
          Developer API & Integration Guide
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
          Example integration patterns for a future EGVL API. These endpoints are not currently connected to a production synthesis service.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-[#141414] border border-zinc-800 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">API access</span>
          <span className="text-[11px] text-brand-cyan font-mono">Tier: {user?.plan ?? "Free"}</span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          API credentials and public API endpoints are not enabled yet. The examples below are illustrative and use the placeholder <code className="text-zinc-200">YOUR_API_KEY</code>.
        </p>
      </div>

      {/* Code Examples Section */}
      <div className="rounded-2xl bg-[#141414] border border-zinc-800 overflow-hidden shadow-2xl space-y-4">
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <span className="font-heading font-bold text-xs uppercase tracking-wider text-white">
            POST /v1/text-to-speech
          </span>

          <div className="flex rounded-lg bg-zinc-950 p-1 border border-zinc-800 text-[11px]">
            {(["curl", "python", "typescript"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-3 py-1 rounded-md uppercase tracking-wider font-semibold transition-colors ${
                  selectedLang === lang ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-zinc-950 overflow-x-auto text-xs font-mono text-zinc-300 leading-relaxed">
          <pre>
            {selectedLang === "curl" && curlSnippet}
            {selectedLang === "python" && pythonSnippet}
            {selectedLang === "typescript" && tsSnippet}
          </pre>
        </div>
      </div>

      {/* Endpoints Reference */}
      <div className="space-y-4">
        <h3 className="font-heading font-bold text-lg text-white">Available Endpoints</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-zinc-500/20 text-zinc-400 font-mono font-bold">
                POST
              </span>
              <span className="font-mono text-white">/v1/text-to-speech</span>
            </div>
            <p className="text-zinc-400">Synthesize text into raw audio stream or WAV file.</p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-zinc-500/20 text-zinc-400 font-mono font-bold">
                POST
              </span>
              <span className="font-mono text-white">/v1/voices/clone</span>
            </div>
            <p className="text-zinc-400">Upload audio samples and trigger instant or queued cloning.</p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-zinc-500/20 text-zinc-400 font-mono font-bold">
                POST
              </span>
              <span className="font-mono text-white">/v1/music/generate</span>
            </div>
            <p className="text-zinc-400">Generate instrumental or vocal music from text prompts.</p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan font-mono font-bold">
                GET
              </span>
              <span className="font-mono text-white">/v1/voices</span>
            </div>
            <p className="text-zinc-400">List all available premade, cloned, and shared voices.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
