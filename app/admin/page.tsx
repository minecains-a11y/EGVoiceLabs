"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Users,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  XCircle,
  Ban,
  Check,
  Search,
} from "lucide-react";

interface FlaggedItem {
  id: string;
  type: "prompt" | "voice_clone" | "music_copyright";
  user: string;
  content: string;
  reason: string;
  flaggedAt: string;
  status: "pending" | "resolved" | "dismissed";
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  plan: string;
  credits: number;
  status: "active" | "suspended";
}

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState<"moderation" | "reports" | "users" | "analytics">("moderation");

  const [flaggedQueue, setFlaggedQueue] = useState<FlaggedItem[]>([
    {
      id: "mod_1",
      type: "voice_clone",
      user: "john_d_99",
      content: "Clone request for: 'Barack Obama Presidential Speech'",
      reason: "Automated trigger: Protected political figure detected.",
      flaggedAt: "10 mins ago",
      status: "pending",
    },
    {
      id: "mod_2",
      type: "music_copyright",
      user: "beat_producer_x",
      content: "Music prompt: 'Drake style beat with hotline vocal chops'",
      reason: "Automated trigger: Protected copyrighted artist name 'Drake'.",
      flaggedAt: "25 mins ago",
      status: "pending",
    },
    {
      id: "mod_3",
      type: "prompt",
      user: "anon_user_44",
      content: "TTS Prompt: 'High-frequency harassment script for telemarketing spam'",
      reason: "Keyword heuristic: Telemarketing fraud pattern.",
      flaggedAt: "1 hour ago",
      status: "pending",
    },
  ]);

  const [users, setUsers] = useState<UserRecord[]>([
    { id: "u_1", name: "Alex Sterling", email: "alex@egvoicelabs.com", plan: "Creator", credits: 8450, status: "active" },
    { id: "u_2", name: "Sarah Connor", email: "sarah@cyberdyne.io", plan: "Pro", credits: 420000, status: "active" },
    { id: "u_3", name: "SpamBot 3000", email: "bot99@throwaway.net", plan: "Free", credits: 50, status: "suspended" },
    { id: "u_4", name: "Liam Miller", email: "liam@gameaudio.uk", plan: "Creator", credits: 54100, status: "active" },
  ]);

  const resolveItem = (id: string, action: "resolved" | "dismissed") => {
    setFlaggedQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: action } : item))
    );
  };

  const toggleUserBan = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u
      )
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-zinc-400" />
            <span>Trust, Safety & Moderation Admin</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Supervise content moderation queues, abuse incident reports, user bans, and platform telemetry.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab("moderation")}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "moderation" ? "bg-zinc-400 text-black font-semibold" : "text-zinc-400 hover:text-white"
            }`}
          >
            Moderation Queue ({flaggedQueue.filter((q) => q.status === "pending").length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "users" ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "analytics" ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"
            }`}
          >
            Safety Analytics
          </button>
        </div>
      </div>

      {/* TAB 1: MODERATION QUEUE */}
      {activeTab === "moderation" && (
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-sm text-white">Flagged Content Incidents</h3>
          <div className="space-y-3">
            {flaggedQueue.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#141414] border border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white capitalize">{item.type.replace("_", " ")}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">• User: {item.user}</span>
                    <span className="text-[10px] text-zinc-500">• {item.flaggedAt}</span>
                    <span
                      className={`text-[9px] px-2 py-0.2 rounded font-bold uppercase ${
                        item.status === "pending"
                          ? "bg-zinc-400/20 text-zinc-400 border border-zinc-400/30"
                          : item.status === "resolved"
                          ? "bg-zinc-500/20 text-zinc-400"
                          : "bg-zinc-500/20 text-zinc-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="text-zinc-200 font-mono text-[11px] bg-zinc-950 p-2 rounded-lg border border-zinc-800/80">
                    "{item.content}"
                  </div>
                  <div className="text-zinc-400 text-[11px] font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{item.reason}</span>
                  </div>
                </div>

                {item.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => resolveItem(item.id, "resolved")}
                      className="px-3 py-1.5 rounded-lg bg-zinc-600 hover:bg-zinc-700 text-white font-semibold transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Block & Penalize</span>
                    </button>
                    <button
                      onClick={() => resolveItem(item.id, "dismissed")}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Dismiss / False Positive</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === "users" && (
        <div className="p-6 rounded-2xl bg-[#141414] border border-zinc-800 space-y-4">
          <h3 className="font-heading font-bold text-sm text-white">Registered User Directory</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Plan</th>
                  <th className="pb-3">Credits Balance</th>
                  <th className="pb-3">Account Status</th>
                  <th className="pb-3 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-950/40">
                    <td className="py-3">
                      <div className="font-sans font-semibold text-white">{u.name}</div>
                      <div className="text-[11px] text-zinc-500">{u.email}</div>
                    </td>
                    <td className="py-3 font-sans text-brand-cyan">{u.plan}</td>
                    <td className="py-3">{u.credits.toLocaleString()}</td>
                    <td className="py-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.status === "active"
                            ? "bg-zinc-500/20 text-zinc-400"
                            : "bg-zinc-500/20 text-zinc-400"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => toggleUserBan(u.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-sans font-medium transition-colors ${
                          u.status === "active"
                            ? "bg-zinc-800 hover:bg-zinc-900/40 hover:text-zinc-400 text-zinc-300"
                            : "bg-zinc-500/20 text-zinc-400 hover:bg-zinc-500/30"
                        }`}
                      >
                        {u.status === "active" ? "Suspend Account" : "Unban Account"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SAFETY ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-[#141414] border border-zinc-800 space-y-1">
            <span className="text-xs text-zinc-400">Total Filtered Toxic Prompts</span>
            <div className="text-3xl font-extrabold font-heading text-zinc-400">142</div>
            <span className="text-[10px] text-zinc-500">Auto-blocked before GPU inference</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#141414] border border-zinc-800 space-y-1">
            <span className="text-xs text-zinc-400">Public Figure Blocks</span>
            <div className="text-3xl font-extrabold font-heading text-zinc-400">29</div>
            <span className="text-[10px] text-zinc-500">Prevented impersonation attempts</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#141414] border border-zinc-800 space-y-1">
            <span className="text-xs text-zinc-400">Acoustic Watermark Injections</span>
            <div className="text-3xl font-extrabold font-heading text-brand-cyan">100%</div>
            <span className="text-[10px] text-zinc-500">RIFF ultrasonic headers verified</span>
          </div>
        </div>
      )}
    </div>
  );
}
