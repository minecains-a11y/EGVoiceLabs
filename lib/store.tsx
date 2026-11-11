"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Generation, Project, UserProfile, Voice } from "./types";
import type { InitialAppData } from "./app-data";
import { PREMADE_VOICES } from "./mock-data";
import { generateId } from "./utils";

interface AppContextType extends InitialAppData {
  activeProject: Project | null;
  addVoice: (voice: Omit<Voice, "id" | "createdAt">) => Voice;
  deleteVoice: (id: string) => void;
  toggleFavoriteVoice: (id: string) => void;
  addGeneration: (gen: Omit<Generation, "id" | "createdAt">) => Generation;
  deleteGeneration: (id: string) => void;
  toggleFavoriteGeneration: (id: string) => void;
  deductCredits: (amount: number) => Promise<boolean>;
  syncCreditBalance: (credits: number) => void;
  saveProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (project: Project | null) => void;
  clearUserContent: () => void;
}

function stripInlineMedia(section: "voices" | "generations" | "projects", data: unknown) {
  if (!Array.isArray(data)) return data;
  const hasInlineUrl = (value: unknown) => typeof value === "string" && /^(data:|blob:)/i.test(value);

  if (section === "voices") {
    return data.map((item) => {
      if (!item || typeof item !== "object" || !hasInlineUrl((item as Voice).previewAudioUrl)) return item;
      const { previewAudioUrl: _previewAudioUrl, ...voice } = item as Voice;
      return voice;
    });
  }

  if (section === "generations") {
    return data.map((item) => {
      if (!item || typeof item !== "object") return item;
      const generation = item as Generation;
      return hasInlineUrl(generation.audioUrl) ? { ...generation, audioUrl: "" } : generation;
    });
  }

  return data.map((item) => {
    if (!item || typeof item !== "object") return item;
    const project = item as Project;
    return {
      ...project,
      tracks: project.tracks?.map((track) => ({
        ...track,
        clips: track.clips.map((clip) =>
          hasInlineUrl(clip.audioUrl) ? { ...clip, audioUrl: "" } : clip,
        ),
      })),
    };
  });
}

async function persistSection(section: "voices" | "generations" | "projects", data: unknown) {
  const response = await fetch("/api/app-data", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ section, data: stripInlineMedia(section, data) }),
  });
  if (!response.ok) {
    throw new Error("Your changes could not be saved. Please sign in again and retry.");
  }
}

export function AppProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: InitialAppData;
}) {
  const [user, setUser] = useState<UserProfile | null>(initialData.user);
  const [voices, setVoices] = useState<Voice[]>(initialData.voices);
  const [generations, setGenerations] = useState<Generation[]>(initialData.generations);
  const [projects, setProjects] = useState<Project[]>(initialData.projects);
  const [activeProject, setCurrentActiveProject] = useState<Project | null>(initialData.projects[0] ?? null);
  const userIdRef = useRef(initialData.user?.id ?? null);

  useEffect(() => {
    const nextUserId = initialData.user?.id ?? null;
    setUser(initialData.user);
    if (userIdRef.current !== nextUserId) {
      userIdRef.current = nextUserId;
      setVoices(initialData.voices);
      setGenerations(initialData.generations);
      setProjects(initialData.projects);
      setCurrentActiveProject(initialData.projects[0] ?? null);
    }
  }, [initialData]);

  const save = (section: "voices" | "generations" | "projects", data: unknown) => {
    if (!user) return;
    void persistSection(section, data).catch(() => {
      window.alert("Your changes could not be saved. Please sign in again and retry.");
    });
  };

  const addVoice = (voiceData: Omit<Voice, "id" | "createdAt">): Voice => {
    const newVoice: Voice = {
      ...voiceData,
      ...(user ? { ownerId: user.id } : {}),
      id: generateId("v_custom"),
      createdAt: new Date().toISOString(),
    };
    const updated = [newVoice, ...voices];
    setVoices(updated);
    save("voices", updated);
    return newVoice;
  };

  const deleteVoice = (id: string) => {
    const updated = voices.filter((voice) => voice.id !== id);
    setVoices(updated);
    save("voices", updated);
  };

  const toggleFavoriteVoice = (id: string) => {
    const updated = voices.map((voice) =>
      voice.id === id ? { ...voice, isFavorite: !voice.isFavorite } : voice,
    );
    setVoices(updated);
    save("voices", updated);
  };

  const addGeneration = (generationData: Omit<Generation, "id" | "createdAt">): Generation => {
    const newGeneration: Generation = {
      ...generationData,
      id: generateId("gen"),
      createdAt: new Date().toISOString(),
    };
    const updated = [newGeneration, ...generations];
    setGenerations(updated);
    save("generations", updated);
    return newGeneration;
  };

  const deleteGeneration = (id: string) => {
    const updated = generations.filter((generation) => generation.id !== id);
    setGenerations(updated);
    save("generations", updated);
  };

  const toggleFavoriteGeneration = (id: string) => {
    const updated = generations.map((generation) =>
      generation.id === id ? { ...generation, isFavorite: !generation.isFavorite } : generation,
    );
    setGenerations(updated);
    save("generations", updated);
  };

  const syncCreditBalance = (credits: number) => {
    if (!Number.isSafeInteger(credits) || credits < 0) return;
    setUser((current) => (current ? { ...current, credits } : current));
  };

  const deductCredits = async (amount: number) => {
    if (!user) {
      window.location.assign("/login");
      return false;
    }
    if (!Number.isSafeInteger(amount) || amount <= 0) return false;

    let response: Response;
    try {
      response = await fetch("/api/app-data/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
    } catch {
      window.alert("Credits could not be verified. Please try again.");
      return false;
    }

    const result = (await response.json().catch(() => null)) as
      | { credits?: number; error?: string }
      | null;
    if (!response.ok || typeof result?.credits !== "number") {
      window.alert(result?.error ?? "Credits could not be verified. Please try again.");
      return false;
    }

    setUser((current) => (current ? { ...current, credits: result.credits! } : current));
    return true;
  };

  const saveProject = (project: Project) => {
    if (!user) {
      window.location.assign("/login");
      return;
    }
    const exists = projects.some((item) => item.id === project.id);
    const now = new Date().toISOString();
    const updated = exists
      ? projects.map((item) =>
          item.id === project.id ? { ...project, updatedAt: now } : item,
        )
      : [{ ...project, createdAt: now, updatedAt: now }, ...projects];
    setProjects(updated);
    save("projects", updated);
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter((project) => project.id !== id);
    setProjects(updated);
    save("projects", updated);
    if (activeProject?.id === id) setCurrentActiveProject(updated[0] ?? null);
  };

  const clearUserContent = () => {
    const customVoices = voices.filter((voice) => voice.category === "premade");
    setVoices(customVoices);
    setGenerations([]);
    save("voices", customVoices);
    save("generations", []);
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
        syncCreditBalance,
        saveProject,
        deleteProject,
        setActiveProject: setCurrentActiveProject,
        clearUserContent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppStore must be used within an AppProvider");
  return context;
}
