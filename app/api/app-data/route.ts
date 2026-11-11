import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appUserData } from "@/lib/db/schema";
import type { Generation, Project, Voice } from "@/lib/types";

const sections = ["voices", "generations", "projects"] as const;
type Section = (typeof sections)[number];

function isSection(value: unknown): value is Section {
  return typeof value === "string" && sections.includes(value as Section);
}

function isInlineMediaUrl(value: unknown): boolean {
  return typeof value === "string" && /^(data:|blob:)/i.test(value);
}

function removeInlineMedia(section: Section, items: Record<string, unknown>[]) {
  if (section === "voices") {
    return items.map((item) => {
      if (!isInlineMediaUrl(item.previewAudioUrl)) return item;
      const { previewAudioUrl: _previewAudioUrl, ...voice } = item;
      return voice;
    });
  }

  if (section === "generations") {
    return items.map((item) =>
      isInlineMediaUrl(item.audioUrl) ? { ...item, audioUrl: "" } : item,
    );
  }

  return items.map((item) => ({
    ...item,
    tracks: Array.isArray(item.tracks)
      ? item.tracks.map((track) => {
          if (!track || typeof track !== "object" || Array.isArray(track)) return track;
          const typedTrack = track as Record<string, unknown>;
          return {
            ...typedTrack,
            clips: Array.isArray(typedTrack.clips)
              ? typedTrack.clips.map((clip) => {
                  if (!clip || typeof clip !== "object" || Array.isArray(clip)) return clip;
                  const typedClip = clip as Record<string, unknown>;
                  return isInlineMediaUrl(typedClip.audioUrl)
                    ? { ...typedClip, audioUrl: "" }
                    : typedClip;
                })
              : typedTrack.clips,
          };
        })
      : item.tracks,
  }));
}

export async function PATCH(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to save your data." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { section, data } = body as { section?: unknown; data?: unknown };
  if (!isSection(section) || !Array.isArray(data)) {
    return NextResponse.json({ error: "Invalid app-data section." }, { status: 400 });
  }
  if (data.length > 2_000 || new TextEncoder().encode(JSON.stringify(data)).byteLength > 1_000_000) {
    return NextResponse.json({ error: "App data exceeds the allowed size." }, { status: 413 });
  }
  if (data.some((item) => !item || typeof item !== "object" || Array.isArray(item))) {
    return NextResponse.json({ error: "App data contains an invalid item." }, { status: 400 });
  }

  const persistedData = removeInlineMedia(
    section,
    data as Record<string, unknown>[],
  );
  const userId = session.user.id;
  await db.insert(appUserData).values({ userId }).onConflictDoNothing();
  const updatedAt = new Date();

  switch (section) {
    case "voices": {
      const voices = persistedData as unknown as Voice[];
      await db
        .insert(appUserData)
        .values({ userId, voices, updatedAt })
        .onConflictDoUpdate({ target: appUserData.userId, set: { voices, updatedAt } });
      break;
    }
    case "generations": {
      const generations = persistedData as unknown as Generation[];
      await db
        .insert(appUserData)
        .values({ userId, generations, updatedAt })
        .onConflictDoUpdate({ target: appUserData.userId, set: { generations, updatedAt } });
      break;
    }
    case "projects": {
      const projects = persistedData as unknown as Project[];
      await db
        .insert(appUserData)
        .values({ userId, projects, updatedAt })
        .onConflictDoUpdate({ target: appUserData.userId, set: { projects, updatedAt } });
      break;
    }
  }

  return NextResponse.json({ saved: true });
}
