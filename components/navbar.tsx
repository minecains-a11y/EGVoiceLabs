"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./logo";
import { CreditBadge } from "./credit-badge";
import { useTheme } from "./theme-provider";
import { useAppStore } from "@/lib/store";
import { authClient } from "@/lib/auth-client";
import {
  Sun,
  Moon,
  Layers,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAppStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = user
    ? [
        { href: "/studio/tts", label: "Studio" },
        { href: "/voices", label: "Voice Library" },
        { href: "/library", label: "My Library" },
        { href: "/projects", label: "Projects" },
        { href: "/classifier", label: "AI Classifier" },
        { href: "/pricing", label: "Pricing" },
        { href: "/docs", label: "API Docs" },
      ]
    : [
        { href: "/pricing", label: "Pricing" },
        { href: "/docs", label: "API Docs" },
      ];

  const handleSignOut = async () => {
    await authClient.signOut();
    setProfileOpen(false);
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#0A0A0A]/85 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Logo size="md" />
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "text-white bg-zinc-800/80 font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user && <CreditBadge />}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all text-left"
              >
                <div aria-hidden="true" className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-black text-xs font-bold shadow-sm">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-white hidden sm:inline max-w-[80px] truncate">
                  {user.name}
                </span>
                <ChevronDown aria-hidden="true" className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {profileOpen && (
                <>
                  <button
                    aria-label="Close profile menu"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div role="menu" className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#141414] border border-zinc-800 shadow-2xl p-2 z-50 text-xs text-zinc-300">
                    <div className="p-2.5 border-b border-zinc-800/80 mb-1">
                      <p className="font-semibold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-zinc-700 font-semibold uppercase">
                        {user.plan} Tier
                      </span>
                    </div>
                    <Link href="/dashboard" role="menuitem" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-800 hover:text-white transition-colors">
                      <Layers className="w-4 h-4 text-white" />
                      <span>Dashboard & Usage</span>
                    </Link>
                    <Link href="/settings" role="menuitem" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-800 hover:text-white transition-colors">
                      <Settings className="w-4 h-4 text-zinc-400" />
                      <span>Account Settings</span>
                    </Link>
                    <div className="border-t border-zinc-800/80 my-1 pt-1">
                      <button onClick={handleSignOut} role="menuitem" className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login" className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white transition-colors">Sign In</Link>
              <Link href="/signup" className="px-3 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors">Create Account</Link>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 lg:hidden"
            aria-label={mobileMenuOpen ? "Close mobile navigation" : "Open mobile navigation"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800 bg-[#0A0A0A] p-4 space-y-2">
          <nav aria-label="Mobile navigation" className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {!user && (
            <div className="flex gap-2 border-t border-zinc-800 pt-3">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center px-3 py-2 rounded-xl text-sm text-zinc-300">Sign In</Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center px-3 py-2 rounded-xl bg-white text-sm font-semibold text-black">Create Account</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
