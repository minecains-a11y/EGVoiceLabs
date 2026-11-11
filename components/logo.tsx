import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withText?: boolean;
}

export function Logo({ className = "", size = "md", withText = true }: LogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      <div
        className={`${iconSizes[size]} relative rounded-xl bg-white p-0.5 shadow-lg shadow-white/10 group-hover:shadow-white/20 transition-all duration-300`}
      >
        <div className="w-full h-full bg-[#0A0A0A] rounded-[10px] flex items-center justify-center p-1.5">
          {/* Stylized soundwave E & G SVG mark */}
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* 'E' Sound Bars */}
            <rect x="4" y="6" width="4.5" height="28" rx="2.25" fill="#FFFFFF" />
            <rect x="11.5" y="6" width="9" height="4.5" rx="2.25" fill="#FFFFFF" />
            <rect x="11.5" y="18" width="7" height="4" rx="2" fill="#A1A1AA" />
            <rect x="11.5" y="29.5" width="9" height="4.5" rx="2.25" fill="#FFFFFF" />
            {/* 'G' Sound Wave Curve */}
            <path
              d="M 35 12 C 32 7 24 7 22 14 C 20 21 21 27 26 31 C 31 34 36 30 36 24 L 28 24"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Center audio pulse indicator dot */}
            <circle cx="28" cy="18" r="2" fill="#FFFFFF" className="animate-pulse" />
          </svg>
        </div>
      </div>
      {withText && (
        <div className="flex flex-col">
          <span className={`font-heading font-extrabold tracking-tight ${textSizes[size]} text-white transition-colors`}>
            EG<span className="text-zinc-400">Voice</span>Labs
          </span>
          <span className="text-[10px] tracking-wider uppercase text-zinc-400 font-medium -mt-1 hidden sm:block">
            Your Voice • Your Sound • Your Lab
          </span>
        </div>
      )}
    </Link>
  );
}
