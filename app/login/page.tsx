"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) {
        setError("We couldn't sign you in with those details. Check them and try again.");
        return;
      }
      router.push("/studio/tts");
      router.refresh();
    } catch {
      setError("Sign-in is temporarily unavailable. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md p-8 rounded-3xl bg-[#141414] border border-zinc-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Logo size="lg" className="justify-center mb-2" />
          <h2 className="text-xl font-bold font-heading text-white">Welcome back to EGVL</h2>
          <p className="text-xs text-zinc-400">Sign in to access your private audio workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label htmlFor="login-email" className="block text-zinc-300 font-medium mb-1">Email address</label>
            <div className="relative">
              <Mail aria-hidden="true" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand-violet"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-zinc-300 font-medium mb-1">Password</label>
            <div className="relative">
              <Lock aria-hidden="true" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand-violet"
              />
            </div>
          </div>

          {error && <p role="alert" className="text-xs text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-white text-black font-bold shadow-lg shadow-brand-violet/25 hover:shadow-brand-cyan/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing in…" : "Sign In to Studio"}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-brand-cyan hover:underline font-semibold">
            Create account free <ArrowRight className="inline w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
