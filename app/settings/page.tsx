"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  User,
  CreditCard,
  Key,
  ShieldCheck,
  Trash2,
  Download,
  Check,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user, voices, generations } = useAppStore();

  const [activeTab, setActiveTab] = useState<"profile" | "billing" | "apikeys" | "privacy">("profile");
  const [apiKey, setApiKey] = useState(user.apiKey);
  const [copiedKey, setCopiedKey] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [savedProfile, setSavedProfile] = useState(false);

  const rotateKey = () => {
    const newKey = `egvl_live_${Math.random().toString(36).substring(2, 14)}_${Date.now().toString(36)}`;
    setApiKey(newKey);
    alert("New API key generated successfully! Update your client applications.");
  };

  const handleExportData = () => {
    const exportObject = {
      user,
      voices: voices.filter((v) => v.category !== "premade"),
      generations,
      exportedAt: new Date().toISOString(),
      gdprCompliance: "Standard Data Subject Export Protocol",
    };
    const jsonStr = JSON.stringify(exportObject, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `egvl-user-data-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDeleteAllVoiceData = () => {
    const confirmText = prompt("Type 'DELETE' to confirm permanent erasure of all custom voices and training recordings:");
    if (confirmText === "DELETE") {
      localStorage.removeItem("egvl_custom_voices");
      localStorage.removeItem("egvl_generations");
      alert("All custom voice models and recordings have been permanently erased from EGVL storage.");
      window.location.reload();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 py-10">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-3xl font-bold font-heading text-white">Settings & Account Control</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Manage your personal profile, subscription billing, API credentials, and GDPR privacy settings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs w-fit">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "profile" ? "bg-zinc-800 text-white font-semibold" : "text-zinc-400 hover:text-white"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "billing" ? "bg-zinc-800 text-white font-semibold" : "text-zinc-400 hover:text-white"
          }`}
        >
          Billing & Subscription
        </button>
        <button
          onClick={() => setActiveTab("apikeys")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "apikeys" ? "bg-zinc-800 text-white font-semibold" : "text-zinc-400 hover:text-white"
          }`}
        >
          API Keys
        </button>
        <button
          onClick={() => setActiveTab("privacy")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "privacy" ? "bg-zinc-800 text-white font-semibold" : "text-zinc-400 hover:text-white"
          }`}
        >
          Data & Privacy (GDPR)
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === "profile" && (
        <div className="p-6 rounded-2xl bg-[#141414] border border-zinc-800 space-y-4 max-w-xl">
          <h3 className="font-heading font-bold text-sm text-white">Personal Information</h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand-violet"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand-violet"
              />
            </div>
          </div>

          <button
            onClick={() => {
              setSavedProfile(true);
              setTimeout(() => setSavedProfile(false), 2000);
            }}
            className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors"
          >
            {savedProfile ? "Saved Successfully!" : "Save Changes"}
          </button>
        </div>
      )}

      {/* TAB 2: BILLING */}
      {activeTab === "billing" && (
        <div className="p-6 rounded-2xl bg-[#141414] border border-zinc-800 space-y-4 max-w-xl">
          <h3 className="font-heading font-bold text-sm text-white">Active Subscription</h3>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">{user.plan} Plan</span>
              <span className="text-[11px] text-zinc-400">Renews on the 1st of each month</span>
            </div>
            <Link
              href="/pricing"
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-white font-medium transition-colors"
            >
              Change Plan
            </Link>
          </div>

          <div className="pt-2">
            <span className="text-xs font-semibold text-zinc-300 block mb-2">Payment Method</span>
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs text-zinc-300">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-brand-cyan" />
                <span>Mastercard ending in •••• 4242</span>
              </div>
              <span className="text-[11px] text-zinc-500">Exp 08/28</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: API KEYS */}
      {activeTab === "apikeys" && (
        <div className="p-6 rounded-2xl bg-[#141414] border border-zinc-800 space-y-4 max-w-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-white">Production API Key</h3>
            <button
              onClick={rotateKey}
              className="flex items-center gap-1 text-[11px] text-brand-cyan hover:underline"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Rotate Secret Key</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono">
            <span className="text-zinc-200 truncate">{apiKey}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(apiKey);
                setCopiedKey(true);
                setTimeout(() => setCopiedKey(false), 2000);
              }}
              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white shrink-0 text-[11px]"
            >
              {copiedKey ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-[11px] text-zinc-500">
            Never expose this key in client-side code or public GitHub repositories.
          </p>
        </div>
      )}

      {/* TAB 4: GDPR & PRIVACY */}
      {activeTab === "privacy" && (
        <div className="p-6 rounded-2xl bg-[#141414] border border-zinc-800 space-y-5 max-w-2xl">
          <div>
            <h3 className="font-heading font-bold text-sm text-white">GDPR & Data Ownership</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              You own all intellectual property rights to your generated content and uploaded voice recordings.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">Export Complete Data Archive</span>
              <span className="text-[11px] text-zinc-500">Download a JSON archive of all voices, history, and metadata.</span>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-zinc-500/10 border border-zinc-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-300 block">Permanently Erase All Voice Data</span>
              <span className="text-[11px] text-zinc-400/80">Immediately purges all custom cloned weights, voice samples, and history.</span>
            </div>
            <button
              onClick={handleDeleteAllVoiceData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-600 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Erase Voice Data</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
