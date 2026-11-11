"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("alex@egvoicelabs.com");
  const [password, setPassword] = useState("password123");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/studio/tts");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md p-8 rounded-3xl bg-[#141414] border border-zinc-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Logo size="lg" className="justify-center mb-2" />
          <h2 className="text-xl font-bold font-heading text-white">Welcome back to EGVL</h2>
          <p className="text-xs text-zinc-400">Sign in to access your neural audio workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-300 font-medium mb-1">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand-violet"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand-violet"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-white text-black font-bold shadow-lg shadow-brand-violet/25 hover:shadow-brand-cyan/30 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
          >
            Sign In to Studio
          </button>
        </form>

        <div className="text-center text-xs text-zinc-400">
          Don't have an account?{" "}
          <Link href="/signup" className="text-brand-cyan hover:underline font-semibold">
            Create account free
          </Link>
        </div>
      </div>
    </div>
  );
}
