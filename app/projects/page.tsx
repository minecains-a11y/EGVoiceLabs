"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { MultiTrackEditor } from "@/components/multi-track-editor";
import { Project } from "@/lib/types";
import { generateId } from "@/lib/utils";
import {
  FolderKanban,
  Plus,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function ProjectsPage() {
  const { projects, activeProject, setActiveProject, saveProject, deleteProject } = useAppStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleCreateProject = () => {
    if (!newTitle.trim()) return;
    const newProj: Project = {
      id: generateId("proj"),
      title: newTitle,
      description: newDesc,
      duration: 40,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tracks: [
        {
          id: generateId("tr_speech"),
          name: "Voiceover Lead",
          type: "speech",
          muted: false,
          solo: false,
          volume: 0.9,
          clips: [],
        },
        {
          id: generateId("tr_music"),
          name: "Background Music",
          type: "music",
          muted: false,
          solo: false,
          volume: 0.65,
          clips: [],
        },
        {
          id: generateId("tr_sfx"),
          name: "Sound Effects & Foley",
          type: "sfx",
          muted: false,
          solo: false,
          volume: 0.8,
          clips: [],
        },
      ],
    };

    saveProject(newProj);
    setActiveProject(newProj);
    setShowCreateModal(false);
    setNewTitle("");
    setNewDesc("");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2.5">
            <FolderKanban className="w-6 h-6 text-zinc-400" />
            <span>Projects Studio & Multitrack Timeline</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Assemble, mix, and synchronize speech, music, and sound effects along a professional multi-track DAW timeline.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Multitrack Project</span>
        </button>
      </div>

      {/* Project Selector Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 shrink-0">
          Projects:
        </span>
        {projects.map((p) => {
          const isActive = activeProject?.id === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setActiveProject(p)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all shrink-0 ${
                isActive
                  ? "bg-zinc-500/15 border-zinc-500 text-white font-semibold"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5 text-zinc-400" />
              <span>{p.title}</span>
              {projects.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(p.id);
                  }}
                  className="text-zinc-500 hover:text-zinc-400 p-0.5 ml-1"
                  title="Delete project"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Project Editor */}
      {activeProject ? (
        <MultiTrackEditor project={activeProject} onSave={(p) => setActiveProject(p)} />
      ) : (
        <div className="p-16 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 text-zinc-400 text-xs">
          Select or create a project to open the multitrack timeline editor.
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#141414] border border-zinc-800 rounded-2xl p-6 shadow-2xl text-white space-y-4">
            <h3 className="font-heading font-bold text-base">Create Multitrack Audio Project</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Project Title *</label>
                <input
                  type="text"
                  placeholder="e.g. YouTube Explainer Voiceover Mix"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Description (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Episode notes, target channels, or mix references..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-zinc-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-xs text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newTitle.trim()}
                className="px-4 py-2 rounded-xl bg-zinc-500 text-black text-xs font-bold disabled:opacity-40"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
