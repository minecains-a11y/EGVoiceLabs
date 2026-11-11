"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { authClient } from "@/lib/auth-client";
import { Key, Trash2, Download } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const { user, voices, generations, projects, clearUserContent } = useAppStore();
  const [activeTab, setActiveTab] = useState<"profile" | "billing" | "apikeys" | "privacy">("profile");
  const [name, setName] = useState(user?.name ?? "");
  const [savedProfile, setSavedProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user?.id, user?.name]);

  const handleSaveProfile = async () => {
    const cleanName = name.trim();
    if (!cleanName || cleanName.length > 100) return;
    setIsSaving(true);
    const result = await authClient.updateUser({ name: cleanName });
    setIsSaving(false);
    if (result.error) {
      window.alert("Your profile could not be updated. Please try again.");
      return;
    }
    setSavedProfile(true);
    router.refresh();
    window.setTimeout(() => setSavedProfile(false), 2000);
  };

  const handleExportData = () => {
    if (!user) return;
    const exportObject = {
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
      voices: voices.filter((voice) => voice.category !== "premade"),
      generations,
      projects,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `egvl-user-data-${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAllVoiceData = () => {
    if (window.confirm("Delete your custom voices and generation history from this account?")) {
      clearUserContent();
    }
  };

  if (!user) {
    return (
      <div className="p-6 max-w-5xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold font-heading text-white">Account settings</h1>
        <p className="mt-2 text-sm text-zinc-400">Sign in to manage your account and saved data.</p>
        <Link href="/login" className="inline-flex mt-5 px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 py-10">
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-3xl font-bold font-heading text-white">Settings & Account Control</h1>
        <p className="text-xs text-zinc-400 mt-1">Manage your profile, account access, and saved studio data.</p>
      </div>

      <div className="flex flex-wrap rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs w-fit" role="tablist" aria-label="Account settings">
        {([
          ["profile", "Profile"],
          ["billing", "Billing & Subscription"],
          ["apikeys", "API Keys"],
          ["privacy", "Data & Privacy"],
        ] as const).map(([tab, label]) => (
          <button key={tab} role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab ? "bg-zinc-800 text-white font-semibold" : "text-zinc-400 hover:text-white"}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <section className="p-6 rounded-2xl bg-[#141414] border border-zinc-800 space-y-4 max-w-xl" role="tabpanel">
          <h2 className="font-heading font-bold text-sm text-white">Personal Information</h2>
          <div className="space-y-3 text-xs">
            <div>
              <label htmlFor="profile-name" className="block text-zinc-400 mb-1">Full Name</label>
              <input id="profile-name" type="text" maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand-violet" />
            </div>
            <div>
              <label htmlFor="profile-email" className="block text-zinc-400 mb-1">Email Address</label>
              <input id="profile-email" type="email" value={user.email} readOnly className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400" />
              <p className="mt-1 text-[11px] text-zinc-500">Email changes require a separate verification flow.</p>
            </div>
          </div>
          <button onClick={handleSaveProfile} disabled={isSaving || !name.trim()} className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 disabled:opacity-50">
            {isSaving ? "Saving…" : savedProfile ? "Saved" : "Save Changes"}
          </button>
        </section>
      )}

      {activeTab === "billing" && (
        <section className="p-6 rounded-2xl bg-[#141414] border border-zinc-800 space-y-4 max-w-xl" role="tabpanel">
          <h2 className="font-heading font-bold text-sm text-white">Subscription</h2>
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-white block">{user.plan} Plan</span>
              <span className="text-[11px] text-zinc-400">Your current account tier and credit balance are stored in Neon.</span>
            </div>
            <Link href="/pricing" className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-white font-medium">View Plans</Link>
          </div>
          <p className="text-xs text-zinc-500">Paid subscriptions and payment methods are not connected yet.</p>
        </section>
      )}

      {activeTab === "apikeys" && (
        <section className="p-6 rounded-2xl bg-[#141414] border border-zinc-800 space-y-3 max-w-xl" role="tabpanel">
          <h2 className="font-heading font-bold text-sm text-white">API Access</h2>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <Key className="w-4 h-4 text-zinc-400 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-zinc-400 leading-relaxed">API keys are not enabled for this account yet. Your sign-in session is never used as an API key.</p>
          </div>
        </section>
      )}

      {activeTab === "privacy" && (
        <section className="p-6 rounded-2xl bg-[#141414] border border-zinc-800 space-y-5 max-w-2xl" role="tabpanel">
          <div>
            <h2 className="font-heading font-bold text-sm text-white">Data & Privacy</h2>
            <p className="text-xs text-zinc-400 mt-1">Your account&apos;s studio records are scoped to your authenticated user ID. Generated audio previews remain in the current browser session.</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-white block">Export account data</span>
              <span className="text-[11px] text-zinc-500">Download your profile, custom voices, history, and projects. Audio media itself is not stored yet.</span>
            </div>
            <button onClick={handleExportData} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold shrink-0">
              <Download className="w-3.5 h-3.5" aria-hidden="true" /><span>Export JSON</span>
            </button>
          </div>
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-white block">Delete custom voices and generation history</span>
              <span className="text-[11px] text-zinc-400">This removes these records from your Neon account data.</span>
            </div>
            <button onClick={handleDeleteAllVoiceData} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-200 text-xs font-semibold shrink-0">
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" /><span>Delete data</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
