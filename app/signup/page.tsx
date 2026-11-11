"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { Lock, Mail, User, ShieldCheck } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      alert("Please accept the Terms of Service and Acceptable Use Policy.");
      return;
    }
    router.push("/studio/tts");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md p-8 rounded-3xl bg-[#141414] border border-zinc-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Logo size="lg" className="justify-center mb-2" />
          <h2 className="text-xl font-bold font-heading text-white">Create your EGVL Account</h2>
          <p className="text-xs text-zinc-400">Get 10,000 free monthly credits instantly.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-300 font-medium mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand-violet"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                required
                placeholder="jane@example.com"
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
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand-violet"
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5 text-[11px] text-zinc-400 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 accent-brand-cyan"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="text-brand-cyan hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/acceptable-use" className="text-brand-cyan hover:underline">
                Acceptable Use Policy
              </Link>
              .
            </span>
          </label>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-white text-black font-bold shadow-lg shadow-brand-violet/25 hover:shadow-brand-cyan/30 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
          >
            Create Account & Claim Credits
          </button>
        </form>

        <div className="text-center text-xs text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-cyan hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
