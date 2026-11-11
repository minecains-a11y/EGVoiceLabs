"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Voice, Generation, Project, UserProfile } from "./types";
import { PREMADE_VOICES } from "./mock-data";
import { generateId } from "./utils";

interface AppContextType {
  user: UserProfile;
  voices: Voice[];
  generations: Generation[];
  projects: Project[];
  activeProject: Project | null;
  addVoice: (voice: Omit<Voice, "id" | "createdAt">) => Voice;
  deleteVoice: (id: string) => void;
  toggleFavoriteVoice: (id: string) => void;
  addGeneration: (gen: Omit<Generation, "id" | "createdAt">) => Generation;
  deleteGeneration: (id: string) => void;
  toggleFavoriteGeneration: (id: string) => void;
  deductCredits: (amount: number) => boolean;
  addCredits: (amount: number) => void;
  saveProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (project: Project | null) => void;
  updateUserPlan: (plan: UserProfile["plan"]) => void;
}

const DEFAULT_USER: UserProfile = {
  id: "usr_egvl_dev",
  name: "Alex Sterling",
  email: "alex@egvoicelabs.com",
  plan: "Creator",
  credits: 8450,
  maxCredits: 100000,
  apiKey: "egvl_live_98a7fbc2041289ee0a1734b",
  createdAt: "2026-01-01T00:00:00.000Z",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
};

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "proj_demo_podcast",
    title: "Sci-Fi Audio Drama - Episode 1",
    description: "Multitrack mix combining Rachel narrator, lo-fi ambiance, and laser sound effects.",
    duration: 35,
    createdAt: "2026-02-10T10:00:00.000Z",
    updatedAt: "2026-02-11T12:00:00.000Z",
    tracks: [
      {
        id: "tr_1",
        name: "Voiceover (Rachel)",
        type: "speech",
        muted: false,
        solo: false,
        volume: 0.9,
        clips: [
          {
            id: "clip_speech_1",
            title: "Intro Monologue",
            type: "tts",
            startTime: 0,
            duration: 8.5,
            audioUrl: "",
            volume: 0.9,
            color: "#FFFFFF",
          },
        ],
      },
      {
        id: "tr_2",
        name: "Background Music",
        type: "music",
        muted: false,
        solo: false,
        volume: 0.6,
        clips: [
          {
            id: "clip_music_1",
            title: "Cyberpunk Ambient",
            type: "music",
            startTime: 2,
            duration: 20,
            audioUrl: "",
            volume: 0.6,
            color: "#A1A1AA",
          },
        ],
      },
      {
        id: "tr_3",
        name: "SFX Layer",
        type: "sfx",
        muted: false,
        solo: false,
        volume: 0.8,
        clips: [
          {
            id: "clip_sfx_1",
            title: "Distant Thunder",
            type: "sfx",
            startTime: 5,
            duration: 4.5,
            audioUrl: "",
            volume: 0.8,
            color: "#71717A",
          },
        ],
      },
    ],
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [voices, setVoices] = useState<Voice[]>(PREMADE_VOICES);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [activeProject, setActiveProject] = useState<Project | null>(DEFAULT_PROJECTS[0]);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("egvl_user");
      if (savedUser) setUser(JSON.parse(savedUser));

      const savedVoices = localStorage.getItem("egvl_custom_voices");
      if (savedVoices) {
        const parsed = JSON.parse(savedVoices);
        setVoices([...PREMADE_VOICES, ...parsed]);
      }

      const savedGens = localStorage.getItem("egvl_generations");
      if (savedGens) setGenerations(JSON.parse(savedGens));

      const savedProjs = localStorage.getItem("egvl_projects");
      if (savedProjs) setProjects(JSON.parse(savedProjs));
    } catch (e) {
      console.warn("Could not load persisted EGVL state:", e);
    }
  }, []);

  // Save changes helper
  const persistUser = (u: UserProfile) => {
    setUser(u);
    localStorage.setItem("egvl_user", JSON.stringify(u));
  };

  const deductCredits = (amount: number): boolean => {
    if (user.credits < amount) {
      alert(`Insufficient credits! You need ${amount} credits, but have ${user.credits}. Please upgrade or top up.`);
      return false;
    }
    const updated = { ...user, credits: user.credits - amount };
    persistUser(updated);
    return true;
  };

  const addCredits = (amount: number) => {
    const updated = { ...user, credits: user.credits + amount };
    persistUser(updated);
  };

  const updateUserPlan = (plan: UserProfile["plan"]) => {
    const limits: Record<UserProfile["plan"], number> = {
      Free: 10000,
      Starter: 30000,
      Creator: 100000,
      Pro: 500000,
    };
    const updated: UserProfile = {
      ...user,
      plan,
      maxCredits: limits[plan],
      credits: Math.max(user.credits, limits[plan] / 2),
    };
    persistUser(updated);
  };

  const addVoice = (voiceData: Omit<Voice, "id" | "createdAt">): Voice => {
    const newVoice: Voice = {
      ...voiceData,
      id: generateId("v_custom"),
      createdAt: new Date().toISOString(),
    };
    const updated = [newVoice, ...voices];
    setVoices(updated);
    // Persist custom voices only
    const customVoices = updated.filter((v) => v.category !== "premade");
    localStorage.setItem("egvl_custom_voices", JSON.stringify(customVoices));
    return newVoice;
  };

  const deleteVoice = (id: string) => {
    const updated = voices.filter((v) => v.id !== id);
    setVoices(updated);
    const customVoices = updated.filter((v) => v.category !== "premade");
    localStorage.setItem("egvl_custom_voices", JSON.stringify(customVoices));
  };

  const toggleFavoriteVoice = (id: string) => {
    const updated = voices.map((v) => (v.id === id ? { ...v, isFavorite: !v.isFavorite } : v));
    setVoices(updated);
  };

  const addGeneration = (genData: Omit<Generation, "id" | "createdAt">): Generation => {
    const newGen: Generation = {
      ...genData,
      id: generateId("gen"),
      createdAt: new Date().toISOString(),
    };
    const updated = [newGen, ...generations];
    setGenerations(updated);
    localStorage.setItem("egvl_generations", JSON.stringify(updated));
    return newGen;
  };

  const deleteGeneration = (id: string) => {
    const updated = generations.filter((g) => g.id !== id);
    setGenerations(updated);
    localStorage.setItem("egvl_generations", JSON.stringify(updated));
  };

  const toggleFavoriteGeneration = (id: string) => {
    const updated = generations.map((g) => (g.id === id ? { ...g, isFavorite: !g.isFavorite } : g));
    setGenerations(updated);
    localStorage.setItem("egvl_generations", JSON.stringify(updated));
  };

  const saveProject = (project: Project) => {
    const exists = projects.some((p) => p.id === project.id);
    let updated: Project[];
    if (exists) {
      updated = projects.map((p) => (p.id === project.id ? { ...project, updatedAt: new Date().toISOString() } : p));
    } else {
      updated = [{ ...project, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...projects];
    }
    setProjects(updated);
    localStorage.setItem("egvl_projects", JSON.stringify(updated));
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    localStorage.setItem("egvl_projects", JSON.stringify(updated));
    if (activeProject?.id === id) {
      setActiveProject(updated[0] || null);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        voices,
        generations,
        projects,
        activeProject,
        addVoice,
        deleteVoice,
        toggleFavoriteVoice,
        addGeneration,
        deleteGeneration,
        toggleFavoriteGeneration,
        deductCredits,
        addCredits,
        saveProject,
        deleteProject,
        setActiveProject,
        updateUserPlan,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppStore must be used within an AppProvider");
  }
  return context;
}
