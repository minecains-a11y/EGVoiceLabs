"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { Lock, Mail, User } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!agree) {
      setError("Please accept the Terms of Service and Acceptable Use Policy.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      if (result.error) {
        setError("We couldn't create your account with those details. Check them and try again.");
        return;
      }
      router.push("/studio/tts");
      router.refresh();
    } catch {
      setError("Account creation is temporarily unavailable. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md p-8 rounded-3xl bg-[#141414] border border-zinc-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Logo size="lg" className="justify-center mb-2" />
          <h2 className="text-xl font-bold font-heading text-white">Create your EGVL Account</h2>
          <p className="text-xs text-zinc-400">Create an account to save your private studio work.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label htmlFor="signup-name" className="block text-zinc-300 font-medium mb-1">Full Name</label>
            <div className="relative">
              <User aria-hidden="true" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                required
                maxLength={100}
                placeholder="Jane Doe"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand-violet"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-zinc-300 font-medium mb-1">Email address</label>
            <div className="relative">
              <Mail aria-hidden="true" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder="jane@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand-violet"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-zinc-300 font-medium mb-1">Password</label>
            <div className="relative">
              <Lock aria-hidden="true" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand-violet"
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5 text-[11px] text-zinc-400 cursor-pointer pt-1">
            <input
              type="checkbox"
              required
              checked={agree}
              onChange={(event) => setAgree(event.target.checked)}
              className="mt-0.5 accent-brand-cyan"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="text-brand-cyan hover:underline">Terms of Service</Link>{" "}
              and{" "}
              <Link href="/acceptable-use" className="text-brand-cyan hover:underline">Acceptable Use Policy</Link>.
            </span>
          </label>

          {error && <p role="alert" className="text-xs text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-white text-black font-bold shadow-lg shadow-brand-violet/25 hover:shadow-brand-cyan/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-cyan hover:underline font-semibold">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
