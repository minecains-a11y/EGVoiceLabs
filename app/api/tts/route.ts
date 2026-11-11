import { generateSpeech } from "ai";
import { and, eq, gte, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appUserData } from "@/lib/db/schema";
import { moderateText } from "@/lib/moderation";
import { PREMADE_VOICES } from "@/lib/mock-data";
import type { Voice } from "@/lib/types";

const MODEL_ID = "google/gemini-3.8-flash-tts";
const previewRequests = new Map<string, { startedAt: number; count: number }>();
const speakerByVoiceId: Record<string, string> = {
  v_rachel: "Kore",
  v_adam: "Charon",
  v_bella: "Aoede",
  v_antoni: "Puck",
  v_nicole: "Zephyr",
  v_liam: "Fenrir",
  v_charlotte: "Leda",
  v_marcus: "Algieba",
  v_freya: "Callirrhoe",
  v_domi: "Laomedeia",
};
const toneDirections: Record<string, string> = {
  warm: "warm and conversational",
  deep: "grounded and resonant",
  bright: "bright and energetic",
  raspy: "soft and intimate",
};

function isPreviewRateLimited(request: NextRequest) {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const window = previewRequests.get(address);

  if (!window || now - window.startedAt >= 60_000) {
    previewRequests.set(address, { startedAt: now, count: 1 });
    return false;
  }

  if (window.count >= 20) return true;
  window.count += 1;
  return false;
}

function getSpeaker(voice: Voice) {
  return speakerByVoiceId[voice.id] ?? (voice.gender === "male" ? "Charon" : "Kore");
}

function getInstructions(voice: Voice, expressiveness: number, cues: string[]) {
  const accent = ["American", "British", "Australian", "Scandinavian"].includes(voice.accent)
    ? `${voice.accent} English`
    : "natural English";
  const tone = toneDirections[voice.tone ?? ""] ?? "clear and natural";
  const delivery = expressiveness < 0.34
    ? "Keep the delivery calm and restrained."
    : expressiveness > 0.67
      ? "Use expressive emphasis and dynamic variation."
      : "Keep the delivery expressive but balanced.";

  return [`Speak in a ${accent} accent with a ${tone} tone.`, delivery, ...cues].join(" ");
}

function parseDeliveryCues(text: string) {
  const cues: string[] = [];
  const spokenText = text
    .replace(/\[pause(?:\s+(\d+(?:\.\d+)?)\s*s?)?\]/gi, (_match, seconds?: string) => {
      const duration = seconds ? ` for about ${seconds} ${Number(seconds) === 1 ? "second" : "seconds"}` : "";
      cues.push(`Pause briefly${duration} between phrases.`);
      return " … ";
    })
    .replace(/\[whisper\]/gi, () => {
      cues.push("Use a soft, whisper-like delivery.");
      return "";
    })
    .replace(/\[excited\]/gi, () => {
      cues.push("Use an excited, upbeat delivery.");
      return "";
    })
    .replace(/\[emphasis\]/gi, () => {
      cues.push("Emphasize the key phrases naturally.");
      return "";
    })
    .replace(/\[sigh\]/gi, () => {
      cues.push("Begin with a gentle sigh.");
      return "";
    })
    .replace(/\s+/g, " ")
    .trim();

  return { spokenText, cues: [...new Set(cues)] };
}

function getSpeechDuration(text: string, speed: number) {
  const wordCount = Math.max(1, text.trim().split(/\s+/).length);
  return Math.max(1, Math.round((wordCount * 0.38) / speed));
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
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

  const input = body as Record<string, unknown>;
  const isPreview = input.preview === true;
  const voiceId = typeof input.voiceId === "string" ? input.voiceId : "";
  const speed = typeof input.speed === "number" ? input.speed : 1;
  const expressiveness = typeof input.expressiveness === "number" ? input.expressiveness : 0.5;
  const language = typeof input.language === "string" ? input.language : "auto";

  if (!voiceId || speed < 0.7 || speed > 1.5 || expressiveness < 0 || expressiveness > 1) {
    return NextResponse.json({ error: "Choose a voice and valid speech settings." }, { status: 400 });
  }

  if (!/^(auto|[a-z]{2}(-[A-Z]{2})?)$/i.test(language)) {
    return NextResponse.json({ error: "Choose a supported language." }, { status: 400 });
  }

  let userId: string | undefined;
  let voice = PREMADE_VOICES.find((item) => item.id === voiceId);
  let creditsRemaining: number | null = null;

  if (!isPreview || !voice) {
    const session = await auth.api.getSession({ headers: request.headers });
    userId = session?.user.id;
    if (!isPreview && !userId) {
      return NextResponse.json({ error: "Sign in to generate speech." }, { status: 401 });
    }
  }

  if (!voice && userId) {
    const [userData] = await db
      .select({ voices: appUserData.voices })
      .from(appUserData)
      .where(eq(appUserData.userId, userId))
      .limit(1);
    voice = userData?.voices.find((item) => item.id === voiceId);
  }

  if (!voice) {
    return NextResponse.json({ error: "This voice is not available for speech generation." }, { status: 404 });
  }

  if (isPreview && isPreviewRateLimited(request)) {
    return NextResponse.json({ error: "Too many voice previews. Please wait a moment." }, { status: 429 });
  }

  const text = isPreview
    ? (typeof input.text === "string" ? input.text.trim() : `Hello, I am ${voice.name}. This is a live voice preview.`)
    : (typeof input.text === "string" ? input.text.trim() : "");
  const maxCharacters = isPreview ? 500 : 5000;

  if (!text || text.length > maxCharacters) {
    return NextResponse.json({ error: `Enter between 1 and ${maxCharacters} characters.` }, { status: 400 });
  }

  const moderation = moderateText(text, "tts");
  if (!moderation.passed) {
    return NextResponse.json({ error: moderation.reason || "This text cannot be synthesized." }, { status: 403 });
  }

  const { spokenText, cues } = parseDeliveryCues(text);
  if (!spokenText) {
    return NextResponse.json({ error: "Add words to speak between the delivery cues." }, { status: 400 });
  }

  const costCredits = isPreview ? 0 : Math.max(10, Math.ceil(text.length / 25));
  if (!isPreview && userId) {
    await db.insert(appUserData).values({ userId }).onConflictDoNothing();
    const [updated] = await db
      .update(appUserData)
      .set({ credits: sql`${appUserData.credits} - ${costCredits}`, updatedAt: new Date() })
      .where(and(eq(appUserData.userId, userId), gte(appUserData.credits, costCredits)))
      .returning({ credits: appUserData.credits });

    if (!updated) {
      return NextResponse.json({ error: "Not enough credits for this generation." }, { status: 409 });
    }
    creditsRemaining = updated.credits;
  }

  try {
    const result = await generateSpeech({
      model: MODEL_ID,
      text: spokenText,
      voice: getSpeaker(voice),
      instructions: getInstructions(voice, expressiveness, cues),
      speed,
      ...(language !== "auto" ? { language: language.slice(0, 2).toLowerCase() } : {}),
      outputFormat: "wav",
      maxRetries: 0,
    });
    const audio = Buffer.from(result.audio.uint8Array);
    const duration = getSpeechDuration(spokenText, speed);

    return new NextResponse(audio, {
      headers: {
        "Content-Type": result.audio.format === "mp3" ? "audio/mpeg" : "audio/wav",
        "Content-Length": String(audio.byteLength),
        "Cache-Control": "private, no-store",
        "X-Audio-Duration": String(duration),
        "X-Credit-Cost": String(costCredits),
        ...(creditsRemaining === null ? {} : { "X-Credit-Balance": String(creditsRemaining) }),
      },
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    const safeReason = reason.replace(/Bearer\s+\S+/gi, "Bearer [redacted]").replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]");
    if (!isPreview && userId && costCredits > 0) {
      const [refunded] = await db
        .update(appUserData)
        .set({ credits: sql`${appUserData.credits} + ${costCredits}`, updatedAt: new Date() })
        .where(eq(appUserData.userId, userId))
        .returning({ credits: appUserData.credits });
      creditsRemaining = refunded?.credits ?? creditsRemaining;
    }

    return NextResponse.json(
      {
        error: process.env.NODE_ENV === "development"
          ? `Speech generation failed: ${safeReason}`
          : "Speech generation failed. No credits were charged. Please try again.",
      },
      { status: 502 },
    );
  }
}
