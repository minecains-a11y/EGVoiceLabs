import "server-only";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appUserData } from "@/lib/db/schema";
import { PREMADE_VOICES } from "@/lib/mock-data";
import type { Generation, Project, UserProfile, Voice } from "@/lib/types";

export interface InitialAppData {
  user: UserProfile | null;
  voices: Voice[];
  generations: Generation[];
  projects: Project[];
}

const planCreditLimits: Record<UserProfile["plan"], number> = {
  Free: 10_000,
  Starter: 30_000,
  Creator: 100_000,
  Pro: 500_000,
};

const knownPlans = Object.keys(planCreditLimits) as UserProfile["plan"][];

export async function getInitialAppData(): Promise<InitialAppData> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { user: null, voices: PREMADE_VOICES, generations: [], projects: [] };
  }

  const userId = session.user.id;
  await db.insert(appUserData).values({ userId }).onConflictDoNothing();
  const [data] = await db
    .select()
    .from(appUserData)
    .where(eq(appUserData.userId, userId))
    .limit(1);

  if (!data) {
    throw new Error("Could not load account data.");
  }

  const plan = knownPlans.includes(data.plan as UserProfile["plan"])
    ? (data.plan as UserProfile["plan"])
    : "Free";
  const savedVoices = data.voices ?? [];
  const savedById = new Map(savedVoices.map((voice) => [voice.id, voice]));
  const generations = (data.generations ?? []).map((generation) => ({
    ...generation,
    audioUrl: /^(data:|blob:)/i.test(generation.audioUrl ?? "") ? "" : generation.audioUrl,
  }));
  const projects = (data.projects ?? []).map((project) => ({
    ...project,
    tracks: project.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) => ({
        ...clip,
        audioUrl: /^(data:|blob:)/i.test(clip.audioUrl ?? "") ? "" : clip.audioUrl,
      })),
    })),
  }));
  const voices = [
    ...PREMADE_VOICES.map((voice) => ({
      ...voice,
      isFavorite: savedById.get(voice.id)?.isFavorite ?? voice.isFavorite,
    })),
    ...savedVoices.filter((voice) => voice.category !== "premade"),
  ];

  return {
    user: {
      id: userId,
      name: session.user.name || "Member",
      email: session.user.email,
      plan,
      credits: data.credits,
      maxCredits: planCreditLimits[plan],
      createdAt: session.user.createdAt.toISOString(),
      ...(session.user.image ? { avatar: session.user.image } : {}),
    },
    voices,
    generations,
    projects,
  };
}
