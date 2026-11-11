"use client";

import React, { use } from "react";
import { useAppStore } from "@/lib/store";
import { MultiTrackEditor } from "@/components/multi-track-editor";
import Link from "next/link";
import { ArrowLeft, FolderKanban } from "lucide-react";

export default function ProjectDetailView({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const { projects } = useAppStore();
  const project = projects.find((p) => p.id === unwrappedParams.id) || projects[0];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/projects"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {project ? (
        <MultiTrackEditor project={project} />
      ) : (
        <div className="p-16 text-center text-zinc-400 text-xs">
          Project not found.
        </div>
      )}
    </div>
  );
}
